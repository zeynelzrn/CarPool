import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import RatingModal from '../components/RatingModal';
import RatingDisplay from '../components/RatingDisplay';
import { TicketIcon, SearchIcon, CheckIcon, XIcon, StarIcon, TrashIcon, EyeIcon, UserIcon, CalendarIcon, MoneyIcon } from '../components/Icons';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, ride: null, driver: null });

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error('Rezervasyonlar yüklenemedi:', error);
      setBookings([]);
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

  const handleOpenRatingModal = (ride, driver) => {
    setRatingModal({ isOpen: true, ride, driver });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ isOpen: false, ride: null, driver: null });
  };

  const handleRatingSuccess = () => {
    fetchMyBookings();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative py-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <TicketIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              Rezervasyonlarım
            </h1>
          </div>
          <Link
            to="/rides"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
          >
            <SearchIcon className="w-5 h-5" />
            Yolculuk Ara
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600 mb-4 text-lg">Henüz rezervasyon yapmadınız.</p>
            <Link to="/rides" className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline">
              Yolculuk aramaya başlayın
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              // Skip if booking data is incomplete
              if (!booking.ride || !booking.ride._id) {
                return null;
              }
              return (
              <div
                key={booking._id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {booking.ride?.origin || 'N/A'} → {booking.ride?.destination || 'N/A'}
                    </h3>
                    <div className="text-gray-600 space-y-2 text-sm">
                      {booking.ride?.driver && (
                        <div className="flex items-center gap-2 mb-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">Sürücü:</span> 
                          <span>{booking.ride.driver.username || 'Bilinmiyor'}</span>
                        </div>
                      )}
                      {/* Sürücü Değerlendirmeleri - Lazy Load */}
                      {booking.ride?.driver?._id && (
                        <div className="mb-3">
                          <RatingDisplay
                            userId={booking.ride.driver._id}
                            userName={booking.ride.driver.username || 'Sürücü'}
                            compact={true}
                          />
                        </div>
                      )}
                      {booking.ride?.date && (
                        <p className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">Tarih:</span> {new Date(booking.ride.date).toLocaleString('tr-TR')}
                        </p>
                      )}
                      {booking.ride?.price !== undefined && (
                        <p className="flex items-center gap-2">
                          <MoneyIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">Fiyat:</span> 
                          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {booking.ride.price} ₺
                          </span>
                        </p>
                      )}
                      {booking.ride?.status && (
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">Yolculuk Durumu:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            booking.ride.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : booking.ride.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.ride.status === 'completed' ? (
                              <>
                                <CheckIcon className="w-3 h-3" />
                                Tamamlandı
                              </>
                            ) : booking.ride.status === 'cancelled' ? (
                              <>
                                <XIcon className="w-3 h-3" />
                                İptal Edildi
                              </>
                            ) : (
                              'Aktif'
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status === 'approved' ? (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          Onaylandı
                        </>
                      ) : booking.status === 'rejected' ? (
                        <>
                          <XIcon className="w-4 h-4" />
                          Reddedildi
                        </>
                      ) : (
                        'Bekliyor'
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  {booking.ride?._id && (
                    <Link
                      to={`/rides/${booking.ride._id}`}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                    >
                      <EyeIcon className="w-5 h-5" />
                      Detayları Gör
                    </Link>
                  )}

                  {booking.status === 'approved' && booking.ride?.status === 'completed' && booking.ride?.driver && (
                    <button
                      onClick={() => handleOpenRatingModal(booking.ride, booking.ride.driver)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                    >
                      <StarIcon className="w-5 h-5" />
                      {booking.ride.driver.username || 'Sürücü'} Değerlendir
                    </button>
                  )}

                  {booking.status !== 'rejected' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {ratingModal.isOpen && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          ride={ratingModal.ride}
          toUser={ratingModal.driver}
          role="passenger"
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default MyBookings;
