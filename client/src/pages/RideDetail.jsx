import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import RatingDisplay from '../components/RatingDisplay';
import ChatModal from '../components/ChatModal';
import { MapIcon, CalendarIcon, CarSolidIcon } from '../components/Icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- LEAFLET AYARLARI ---
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

// --- YARDIMCI FONKSİYONLAR ---

const calculateBearing = (startLat, startLng, destLat, destLng) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

// --- HAREKETLİ ARABA ---
const MovingCarMarker = ({ routeCoords, duration = 15000 }) => {
    const map = useMap();
    const markerRef = useRef(null);
    const reqRef = useRef(null);
    const startTimeRef = useRef(null);
    const lastAngleRef = useRef(0);

    const carIcon = L.divIcon({
        className: 'car-icon-container',
        html: `<div id="car-sprite" style="
            font-size: 40px; 
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.1s linear; 
            transform-origin: center center;
            will-change: transform;
            margin-top: -10px; 
            margin-left: -5px;
        ">🚗</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    useEffect(() => {
        if (!routeCoords || routeCoords.length < 2) return;

        if (!markerRef.current) {
            markerRef.current = L.marker(routeCoords[0], { icon: carIcon }).addTo(map);
        }

        const animate = (time) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const timeElapsed = time - startTimeRef.current;
            let progress = (timeElapsed % duration) / duration;

            if (progress >= 1) {
                startTimeRef.current = time;
                progress = 0;
            }

            const totalPoints = routeCoords.length - 1;
            const currentStep = Math.floor(progress * totalPoints);
            const nextStep = (currentStep + 1) % routeCoords.length;

            const p1 = routeCoords[currentStep];
            const p2 = routeCoords[nextStep];

            if (p1 && p2 && markerRef.current) {
                // Pozisyon
                const segmentProgress = (progress * totalPoints) - currentStep;
                const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
                const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
                markerRef.current.setLatLng([lat, lng]);

                // Açı
                const targetBearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
                let delta = targetBearing - lastAngleRef.current;
                while (delta < -180) delta += 360;
                while (delta > 180) delta -= 360;
                const smoothAngle = lastAngleRef.current + delta;
                lastAngleRef.current = smoothAngle;

                // İkon Döndürme
                const iconElement = markerRef.current.getElement();
                if (iconElement) {
                    const carSprite = iconElement.querySelector('#car-sprite');
                    if (carSprite) {
                        // scaleX(-1) ile Y düzleminde ayna görüntüsü (ters çevirme)
                        // rotate(angle - 90) ile yön ayarlama
                        carSprite.style.transform = `rotate(${smoothAngle - 90}deg) scaleX(-1)`; 
                    }
                }
            }
            reqRef.current = requestAnimationFrame(animate);
        };

        reqRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(reqRef.current);
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
        };
    }, [routeCoords, duration, map]);

    return null;
};


// --- ANA COMPONENT ---
const RideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPassenger } = useAuth();
  const { addNotification } = useSocket();

  const [ride, setRide] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [chatOpen, setChatOpen] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);

  useEffect(() => {
    fetchRideDetail();
  }, [id]);

  useEffect(() => {
    if (user && isPassenger && id) {
      checkBooking();
    }
  }, [user, isPassenger, id]);

  const fetchRideDetail = async () => {
    try {
      const data = await rideService.getRideById(id);
      setRide(data);
      if (data && data.coordinates) {
          fetchRealRoute(data.coordinates);
      }
    } catch (error) {
      console.error('Hata:', error);
      setMessage({ type: 'error', text: 'Ride not found' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRealRoute = async (coords) => {
      try {
          const url = `https://router.project-osrm.org/route/v1/driving/${coords.startLng},${coords.startLat};${coords.endLng},${coords.endLat}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
              const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
              setRoutePath(coordinates);
          } else {
              setRoutePath([[coords.startLat, coords.startLng], [coords.endLat, coords.endLng]]);
          }
      } catch (error) {
          console.error("Rota hatası:", error);
          setRoutePath([[coords.startLat, coords.startLng], [coords.endLat, coords.endLng]]);
      }
  };

  const checkBooking = async () => {
    try {
      const bookings = await bookingService.getMyBookings();
      const booking = bookings.find(b => b.ride._id === id && b.status === 'approved');
      setHasBooking(!!booking);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      const response = await bookingService.createBooking(id);

      // Ekranda inline mesaj göster
      setMessage({ type: 'success', text: 'Request sent! Waiting for driver approval.' });

      // Yolcuya toast/popup bildirimi göster (success tipi - yeşil renk)
      if (addNotification) {
        addNotification({
          type: 'success',
          message: 'Request Sent! Waiting for driver approval.',
          link: '/my-bookings'
        });
        console.log('✅ Yolcu bildirimi tetiklendi');
      }

      fetchRideDetail();
      checkBooking();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Operation failed',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!ride) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Not Found</div>;

  const startPos = [ride.coordinates.startLat, ride.coordinates.startLng];
  const endPos = [ride.coordinates.endLat, ride.coordinates.endLng];
  const centerPos = [
    (ride.coordinates.startLat + ride.coordinates.endLat) / 2,
    (ride.coordinates.startLng + ride.coordinates.endLng) / 2,
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* HERO */}
      <div className="relative h-80 w-full bg-[#004225] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
    

        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md mb-2">
                {ride.origin} <span className="text-emerald-300">→</span> {ride.destination}
            </h1>
            <p className="text-emerald-100 text-lg font-medium">Ride Details</p>
        </div>
      </div>

      {/* İÇERİK */}
      <div className="container mx-auto px-4 relative z-20 -mt-24 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            
            {message.text && (
                <div className={`px-6 py-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid lg:grid-cols-3">
                <div className="lg:col-span-2 p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                  <div className="flex pb-4 md:left-8 z-10">
                    <button onClick={() => navigate(-1)} className="flex items-center bg-[#004225] gap-2 text-white/80 hover:text-white transition-colors font-medium bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                        ← Go Back
                    </button>
                  </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MapIcon className="w-6 h-6 text-[#004225]" /> Route Tracking
                    </h3>

                    <div className="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
                        <MapContainer
                            center={centerPos}
                            zoom={7}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; OpenStreetMap'
                            />
                            
                            <Marker position={startPos}><Popup>Origin</Popup></Marker>
                            <Marker position={endPos}><Popup>Destination</Popup></Marker>

                            {routePath.length > 0 && (
                                <>
                                    <Polyline positions={routePath} color="#004225" weight={5} opacity={0.6} />
                                    <MovingCarMarker routeCoords={routePath} duration={15000} />
                                </>
                            )}
                        </MapContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" /> Date
                            </div>
                            <div className="font-bold text-gray-900 text-lg">{new Date(ride.date).toLocaleDateString('en-US')}</div>
                        </div>
                        
                        {/* ARAÇ BİLGİSİ */}
                        {ride.carDetails && (ride.carDetails.brand || ride.carDetails.model) && (
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                                    <CarSolidIcon className="w-4 h-4" /> Vehicle
                                </div>
                                <div className="font-bold text-gray-900 text-lg capitalize">
                                    {ride.carDetails.brand} {ride.carDetails.model}
                                </div>
                                {(ride.carDetails.color || ride.carDetails.year) && (
                                    <div className="text-sm text-gray-500 mt-1 capitalize">
                                        {ride.carDetails.color} {ride.carDetails.year ? `• ${ride.carDetails.year}` : ''}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 my-auto bg-gray-50/50">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 text-center">
                        <p className="text-sm text-gray-500 font-medium mb-1">Per Person</p>
                        <div className="text-4xl font-bold text-[#004225]">{ride.price} ₺</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Driver</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#004225] font-bold text-lg">
                                {ride.driver.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <Link to={`/profile/${ride.driver._id}`} className="font-bold text-gray-900 hover:underline">
                                    {ride.driver.username}
                                </Link>
                                <div className="text-sm"><RatingDisplay userId={ride.driver._id} compact={true} /></div>
                            </div>
                        </div>
                    </div>

                    {/* ARAÇ BİLGİLERİ KARTI */}
                    {ride.carDetails && (ride.carDetails.brand || ride.carDetails.model) && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                <CarSolidIcon className="w-4 h-4" /> Vehicle Information
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Brand / Model</span>
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {ride.carDetails.brand} {ride.carDetails.model}
                                    </span>
                                </div>
                                {ride.carDetails.year && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">Year</span>
                                        <span className="font-semibold text-gray-900">{ride.carDetails.year}</span>
                                    </div>
                                )}
                                {ride.carDetails.color && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">Color</span>
                                        <span className="font-semibold text-gray-900 capitalize">{ride.carDetails.color}</span>
                                    </div>
                                )}
                                {ride.carDetails.plate && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">License Plate</span>
                                        <span className="font-semibold text-gray-900 uppercase bg-gray-100 px-2 py-1 rounded">
                                            {ride.carDetails.plate}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isPassenger && ride.availableSeats > 0 && (
                        <button
                            onClick={handleBooking}
                            disabled={bookingLoading}
                            className="w-full bg-[#004225] text-white py-4 rounded-xl hover:bg-[#00331b] shadow-lg transition-all font-bold"
                        >
                            {bookingLoading ? 'Processing...' : 'Make Booking'}
                        </button>
                    )}

                     {((isPassenger && hasBooking) || (user && user.role === 'driver' && ride.driver._id === user._id)) && (
                             <button
                                onClick={() => setChatOpen(true)}
                                className="w-full bg-white text-[#004225] border-2 border-[#004225] py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold mt-3"
                             >
                                {user.role === 'driver' ? 'View Messages' : 'Chat'}
                             </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {chatOpen && ride && (
        <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} ride={ride} otherUser={user?.role === 'passenger' ? ride.driver : null} />
      )}
    </div>
  );
};

export default RideDetail;