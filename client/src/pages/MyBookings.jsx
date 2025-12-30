import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Rezervasyonlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) return;

    try {
      await bookingService.deleteBooking(bookingId);
      fetchMyBookings();
    } catch (error) {
      console.error('Rezervasyon iptal edilemedi:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rezervasyonlarım</h1>
          <Link
            to="/rides"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Yolculuk Ara
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">Henüz rezervasyon yapmadınız.</p>
            <Link to="/rides" className="text-blue-600 hover:underline">
              Yolculuk aramaya başlayın
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {booking.ride.origin} → {booking.ride.destination}
                    </h3>
                    <div className="text-gray-600 space-y-1 text-sm">
                      <p>Sürücü: {booking.ride.driver.username}</p>
                      <p>Tarih: {new Date(booking.ride.date).toLocaleString('tr-TR')}</p>
                      <p>Fiyat: {booking.ride.price} ₺</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-4 py-2 rounded text-sm font-medium ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status === 'approved'
                        ? 'Onaylandı'
                        : booking.status === 'rejected'
                        ? 'Reddedildi'
                        : 'Bekliyor'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/rides/${booking.ride._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Detayları Gör
                  </Link>

                  {booking.status !== 'rejected' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
