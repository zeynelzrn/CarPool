import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { ratingService } from '../services/ratingService';
import RatingModal from '../components/RatingModal';
import RatingDisplay from '../components/RatingDisplay';
import ChatModal from '../components/ChatModal';
import { ListIcon, CarSolidIcon, TicketIcon, CheckIcon, XIcon, StarIcon, TrashIcon, PlusIcon, UserIcon } from '../components/Icons';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, ride: null, passenger: null });
  const [chatModal, setChatModal] = useState({ isOpen: false, ride: null, passenger: null });

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

  const handleCompleteRide = async (rideId) => {
    if (!confirm('Bu yolculuğu tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) return;

    try {
      await rideService.completeRide(rideId);
      fetchMyRides();
      if (selectedRide === rideId) {
        fetchBookings(rideId);
      }
    } catch (error) {
      console.error('Yolculuk tamamlanamadı:', error);
      alert(error.response?.data?.message || 'Yolculuk tamamlanamadı');
    }
  };

  const handleOpenRatingModal = (ride, passenger) => {
    setRatingModal({ isOpen: true, ride, passenger });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ isOpen: false, ride: null, passenger: null });
  };

  const handleRatingSuccess = () => {
    fetchMyRides();
    if (selectedRide) {
      fetchBookings(selectedRide);
    }
  };

  const handleOpenChatModal = (ride, passenger) => {
    setChatModal({ isOpen: true, ride, passenger });
  };

  const handleCloseChatModal = () => {
    setChatModal({ isOpen: false, ride: null, passenger: null });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <ListIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              İlanlarım
            </h1>
          </div>
          <Link
            to="/create-ride"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Yeni İlan
          </Link>
        </div>

        {rides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600 mb-4 text-lg">Henüz ilan oluşturmadınız.</p>
            <Link
              to="/create-ride"
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline"
            >
              İlk ilanınızı oluşturun
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CarSolidIcon className="w-6 h-6 text-blue-600" />
                Yolculuklarım
              </h2>
              {rides.map((ride) => (
                <div
                  key={ride._id}
                  className={`bg-white p-6 rounded-2xl shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 border-2 ${
                    selectedRide === ride._id ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-100'
                  }`}
                  onClick={() => fetchBookings(ride._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {ride.origin} → {ride.destination}
                    </h3>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{ride.price} ₺</span>
                  </div>
                  <div className="text-gray-600 space-y-2 text-sm mb-4">
                    <p className="flex items-center gap-2">📅 {new Date(ride.date).toLocaleString('tr-TR')}</p>
                    <p className="flex items-center gap-2">💺 <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">{ride.availableSeats} / {ride.totalSeats}</span></p>
                    <p className="flex items-center gap-2">📊 Durum: <span className="capitalize font-semibold">{ride.status}</span></p>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {ride.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteRide(ride._id);
                        }}
                        className="text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Tamamla
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRide(ride._id);
                      }}
                      className="text-sm bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TicketIcon className="w-6 h-6 text-blue-600" />
                Rezervasyon İstekleri
              </h2>
              {selectedRide ? (
                bookings.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl shadow-xl text-center text-gray-600 border border-gray-100">
                    <div className="text-5xl mb-4">😔</div>
                    <p>Bu ilan için henüz rezervasyon isteği yok.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Link
                              to={`/profile/${booking.passenger._id}`}
                              className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                            >
                              <UserIcon className="w-5 h-5" />
                              {booking.passenger.username}
                            </Link>
                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {booking.passenger.email}
                            </p>
                            {/* Yolcu Değerlendirmeleri */}
                            <RatingDisplay
                              userId={booking.passenger._id}
                              userName={booking.passenger.username}
                              compact={true}
                            />
                          </div>
                          <span
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ml-4 flex items-center gap-1 ${
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

                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookingStatus(booking._id, 'approved')}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
                            >
                              <CheckIcon className="w-5 h-5" />
                              Onayla
                            </button>
                            <button
                              onClick={() => handleBookingStatus(booking._id, 'rejected')}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
                            >
                              <XIcon className="w-5 h-5" />
                              Reddet
                            </button>
                          </div>
                        )}
                        {booking.status === 'approved' && (
                          <div className="flex gap-2 mt-2">
                            {(() => {
                              const currentRide = rides.find(r => r._id === selectedRide);
                              return currentRide && currentRide.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    handleOpenRatingModal(currentRide, booking.passenger);
                                  }}
                                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
                                >
                                  <StarIcon className="w-5 h-5" />
                                  Değerlendir
                                </button>
                              );
                            })()}
                            <button
                              onClick={() => {
                                const currentRide = rides.find(r => r._id === selectedRide);
                                if (currentRide) {
                                  handleOpenChatModal(currentRide, booking.passenger);
                                }
                              }}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
                            >
                              Mesajlaş
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center text-gray-600 border border-gray-100">
                  <div className="text-5xl mb-4">👆</div>
                  <p>Rezervasyonları görmek için bir yolculuk seçin</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {ratingModal.isOpen && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          ride={ratingModal.ride}
          toUser={ratingModal.passenger}
          role="driver"
          onSuccess={handleRatingSuccess}
        />
      )}

      {chatModal.isOpen && chatModal.ride && chatModal.passenger && (
        <ChatModal
          isOpen={chatModal.isOpen}
          onClose={handleCloseChatModal}
          ride={chatModal.ride}
          otherUser={chatModal.passenger}
        />
      )}
    </div>
  );
};

export default MyRides;
