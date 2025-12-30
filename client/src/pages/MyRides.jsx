import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRides();
  }, []);

  const fetchMyRides = async () => {
    try {
      const data = await rideService.getMyRides();
      setRides(data);
    } catch (error) {
      console.error('İlanlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (rideId) => {
    try {
      const data = await bookingService.getBookingsByRide(rideId);
      setBookings(data);
      setSelectedRide(rideId);
    } catch (error) {
      console.error('Rezervasyonlar yüklenemedi:', error);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      fetchBookings(selectedRide);
      fetchMyRides();
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;

    try {
      await rideService.deleteRide(rideId);
      fetchMyRides();
      if (selectedRide === rideId) {
        setSelectedRide(null);
        setBookings([]);
      }
    } catch (error) {
      console.error('İlan silinemedi:', error);
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
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">İlanlarım</h1>
          <Link
            to="/create-ride"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Yeni İlan
          </Link>
        </div>

        {rides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">Henüz ilan oluşturmadınız.</p>
            <Link
              to="/create-ride"
              className="text-blue-600 hover:underline"
            >
              İlk ilanınızı oluşturun
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Yolculuklarım</h2>
              {rides.map((ride) => (
                <div
                  key={ride._id}
                  className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition ${
                    selectedRide === ride._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => fetchBookings(ride._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {ride.origin} → {ride.destination}
                    </h3>
                    <span className="text-xl font-bold text-blue-600">{ride.price} ₺</span>
                  </div>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <p>Tarih: {new Date(ride.date).toLocaleString('tr-TR')}</p>
                    <p>Koltuk: {ride.availableSeats} / {ride.totalSeats}</p>
                    <p>Durum: <span className="capitalize">{ride.status}</span></p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRide(ride._id);
                      }}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Rezervasyon İstekleri
              </h2>
              {selectedRide ? (
                bookings.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
                    Bu ilan için henüz rezervasyon isteği yok.
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
                            <p className="font-semibold text-gray-900">
                              {booking.passenger.username}
                            </p>
                            <p className="text-sm text-gray-600">{booking.passenger.email}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-sm ${
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

                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookingStatus(booking._id, 'approved')}
                              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleBookingStatus(booking._id, 'rejected')}
                              className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                            >
                              Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
                  Rezervasyonları görmek için bir yolculuk seçin
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;
