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
      console.error('Failed to load bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.deleteBooking(bookingId);
      fetchMyBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#004225]"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* --- 1. ÜST HERO ALANI --- */}
      <div className="relative h-80 w-full bg-[#004225] overflow-hidden">
        {/* Dekoratif Efektler */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

        {/* Başlık ve Buton Alanı */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md mb-2 flex items-center gap-3">
               <TicketIcon className="w-10 h-10 text-emerald-300" />
               My Bookings
            </h1>
            <p className="text-emerald-100 text-lg font-medium opacity-90 mb-6">
                All your planned trips are here.
            </p>
            
            <Link
                to="/rides"
                className="bg-white text-[#004225] px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-bold flex items-center gap-2"
            >
                <SearchIcon className="w-5 h-5" />
                Find New Ride
            </Link>
        </div>
      </div>

      {/* --- 2. ANA İÇERİK (Yüzen Liste) --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-24 pb-12 max-w-4xl">
        
        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You don't have any bookings yet.</h3>
            <p className="text-gray-500 mb-8">Great day to explore new places!</p>
            <Link
              to="/rides"
              className="text-[#004225] hover:text-[#00331b] font-bold text-lg hover:underline"
            >
              Start searching for rides →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              if (!booking.ride || !booking.ride._id) return null;

              return (
                <div
                  key={booking._id}
                  className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                    
                    {/* Sol: Rota ve Sürücü Bilgisi */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex flex-wrap items-center gap-2 group-hover:text-[#004225] transition-colors">
                        {booking.ride?.origin || 'N/A'} 
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        {booking.ride?.destination || 'N/A'}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        {/* Sürücü */}
                        {booking.ride?.driver && (
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="bg-emerald-100 p-2 rounded-full text-[#004225]">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{booking.ride.driver.username || 'Bilinmiyor'}</p>
                                <div className="text-xs">
                                    <RatingDisplay
                                        userId={booking.ride.driver._id}
                                        userName={booking.ride.driver.username || 'Driver'}
                                        compact={true}
                                    />
                                </div>
                            </div>
                          </div>
                        )}

                        {/* Tarih ve Fiyat */}
                        <div className="space-y-2">
                            {booking.ride?.date && (
                                <p className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">
                                    {new Date(booking.ride.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                </p>
                            )}
                            {booking.ride?.price !== undefined && (
                                <p className="flex items-center gap-2">
                                <MoneyIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-lg font-bold text-[#004225]">
                                    {booking.ride.price} ₺
                                </span>
                                </p>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Sağ: Durum Etiketi */}
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booking Status</span>
                        <span
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${
                            booking.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : booking.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                        >
                            {booking.status === 'approved' ? (
                            <> <CheckIcon className="w-4 h-4" /> Approved </>
                            ) : booking.status === 'rejected' ? (
                            <> <XIcon className="w-4 h-4" /> Rejected </>
                            ) : (
                            'Pending'
                            )}
                        </span>

                        {/* Yolculuk Durumu (Ekstra Bilgi) */}
                        {booking.ride?.status && (
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                booking.ride.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-200' 
                                : booking.ride.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100'
                                : 'bg-blue-50 text-blue-500 border-blue-100'
                            }`}>
                                {booking.ride.status === 'completed' ? 'Ride Completed' 
                                : booking.ride.status === 'cancelled' ? 'Ride Cancelled' 
                                : 'Ride Active'}
                            </span>
                        )}
                    </div>
                  </div>

                  {/* Alt Aksiyon Alanı */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                    
                    {/* Detay Butonu */}
                    {booking.ride?._id && (
                      <Link
                        to={`/rides/${booking.ride._id}`}
                        className="bg-[#004225] text-white px-5 py-2.5 rounded-xl hover:bg-[#00331b] transition-all shadow-sm hover:shadow-md font-bold text-sm flex items-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Details
                      </Link>
                    )}

                    {/* Değerlendirme Butonu */}
                    {booking.status === 'approved' && booking.ride?.status === 'completed' && booking.ride?.driver && (
                      <button
                        onClick={() => handleOpenRatingModal(booking.ride, booking.ride.driver)}
                        className="bg-yellow-400 text-yellow-900 px-5 py-2.5 rounded-xl hover:bg-yellow-500 transition-all shadow-sm hover:shadow-md font-bold text-sm flex items-center gap-2"
                      >
                        <StarIcon className="w-4 h-4" />
                        Rate Driver
                      </button>
                    )}

                    {/* İptal Butonu */}
                    {booking.status !== 'rejected' && booking.ride?.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-bold text-sm flex items-center gap-2 ml-auto"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Cancel
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