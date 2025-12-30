import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

const RideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPassenger } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRideDetail();
  }, [id]);

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

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      await bookingService.createBooking(id);
      setMessage({ type: 'success', text: 'Rezervasyon isteği gönderildi!' });
      fetchRideDetail();
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Yolculuk Detayı
        </h1>

        {message.text && (
          <div
            className={`px-4 py-3 rounded mb-6 ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Yolculuk Bilgileri
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Güzergah:</span>{' '}
                    {ride.origin} → {ride.destination}
                  </p>
                  <p>
                    <span className="font-medium">Tarih:</span>{' '}
                    {new Date(ride.date).toLocaleString('tr-TR')}
                  </p>
                  <p>
                    <span className="font-medium">Fiyat:</span>{' '}
                    <span className="text-2xl font-bold text-blue-600">
                      {ride.price} ₺
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Müsait Koltuk:</span>{' '}
                    {ride.availableSeats} / {ride.totalSeats}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Sürücü Bilgileri
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">İsim:</span> {ride.driver.username}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {ride.driver.email}
                  </p>
                </div>

                {isPassenger && ride.availableSeats > 0 && (
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
                  >
                    {bookingLoading ? 'Gönderiliyor...' : 'Rezervasyon İsteği Gönder'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Rota Haritası
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
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
                  <Polyline positions={[startPos, endPos]} color="blue" />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-blue-600 hover:underline"
        >
          ← Geri Dön
        </button>
      </div>
    </div>
  );
};

export default RideDetail;
