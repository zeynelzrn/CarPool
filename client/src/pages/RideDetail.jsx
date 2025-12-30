import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import RatingDisplay from '../components/RatingDisplay';
import ChatModal from '../components/ChatModal';
import { MapIcon, LocationIcon, CalendarIcon, MoneyIcon, UserIcon, CarSolidIcon } from '../components/Icons';
import 'leaflet/dist/leaflet.css';

const RideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPassenger } = useAuth();

  const [ride, setRide] = useState(null);
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
    } catch (error) {
      console.error('Yolculuk detayı yüklenemedi:', error);
      setMessage({ type: 'error', text: 'Yolculuk bulunamadı' });
    } finally {
      setLoading(false);
    }
  };

  const checkBooking = async () => {
    try {
      const bookings = await bookingService.getMyBookings();
      const booking = bookings.find(b => b.ride._id === id && b.status === 'approved');
      setHasBooking(!!booking);
    } catch (error) {
      console.error('Rezervasyon kontrolü yapılamadı:', error);
    }
  };

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      await bookingService.createBooking(id);
      setMessage({ type: 'success', text: 'Rezervasyon isteği gönderildi!' });
      fetchRideDetail();
      checkBooking();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Rezervasyon başarısız',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Yolculuk bulunamadı</p>
      </div>
    );
  }

  const startPos = [ride.coordinates.startLat, ride.coordinates.startLng];
  const endPos = [ride.coordinates.endLat, ride.coordinates.endLng];
  const centerPos = [
    (ride.coordinates.startLat + ride.coordinates.endLat) / 2,
    (ride.coordinates.startLng + ride.coordinates.endLng) / 2,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            ← Geri
          </button>
          <div className="flex items-center gap-3">
            <MapIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              Yolculuk Detayı
            </h1>
          </div>
        </div>

        {message.text && (
          <div
            className={`px-6 py-4 rounded-xl mb-6 shadow-lg ${
              message.type === 'success'
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                : 'bg-red-50 border-l-4 border-red-500 text-red-700'
            }`}
          >
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Yolculuk Bilgileri
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-center gap-3">
                    <LocationIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Güzergah</p>
                      <p className="font-bold text-lg">{ride.origin} → {ride.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tarih</p>
                      <p className="font-semibold">{new Date(ride.date).toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoneyIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Fiyat</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {ride.price} ₺
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Müsait Koltuk</p>
                      <p className="font-semibold">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          {ride.availableSeats} / {ride.totalSeats}
                        </span>
                      </p>
                    </div>
                  </div>
                  {ride.carInfo && (ride.carInfo.brand || ride.carInfo.model) && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-blue-200">
                      <CarSolidIcon className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Araç</p>
                        <p className="font-semibold">
                          {ride.carInfo.brand} {ride.carInfo.model}
                          {ride.carInfo.year && ` (${ride.carInfo.year})`}
                          {ride.carInfo.color && ` - ${ride.carInfo.color}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <UserIcon className="w-6 h-6 text-purple-600" />
                  Sürücü Bilgileri
                </h3>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">İsim</p>
                      <Link
                        to={`/profile/${ride.driver._id}`}
                        className="font-semibold text-lg hover:text-blue-600 transition-colors"
                      >
                        {ride.driver.username}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold">{ride.driver.email}</p>
                    </div>
                  </div>
                </div>

                {/* Sürücü Değerlendirmeleri */}
                <div className="mt-6">
                  <RatingDisplay
                    userId={ride.driver._id}
                    userName={ride.driver.username}
                    compact={false}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {isPassenger && ride.availableSeats > 0 && (
                    <button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                    >
                      {bookingLoading ? 'Gönderiliyor...' : 'Rezervasyon İsteği Gönder'}
                    </button>
                  )}
                  
                  {/* Yolcu için mesajlaş butonu - onaylanmış rezervasyon varsa */}
                  {isPassenger && hasBooking && ride.driver && (
                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold text-lg"
                    >
                      Mesajlaş
                    </button>
                  )}
                  
                  {/* Sürücü için mesajları gör butonu */}
                  {user && user.role === 'driver' && ride.driver._id === user._id && (
                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold text-lg"
                    >
                      Mesajları Gör
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-blue-600" />
                Rota Haritası
              </h3>
              <div className="h-96 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <MapContainer
                  center={centerPos}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={startPos}>
                    <Popup>{ride.origin}</Popup>
                  </Marker>
                  <Marker position={endPos}>
                    <Popup>{ride.destination}</Popup>
                  </Marker>
                  <Polyline positions={[startPos, endPos]} color="blue" weight={4} />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {chatOpen && ride && (
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          ride={ride}
          otherUser={user?.role === 'passenger' ? ride.driver : null}
        />
      )}
    </div>
  );
};

export default RideDetail;
