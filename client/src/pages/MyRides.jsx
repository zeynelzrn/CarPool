import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { ratingService } from '../services/ratingService'; // Kullanılmıyorsa çıkarılabilir
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#004225]"></div>
          <p className="text-gray-500 mt-4 font-medium">İlanlarınız yükleniyor...</p>
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
        <div className="absolute mt-4 inset-0  flex flex-col items-center justify-center pb-16 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md mb-2 flex items-center gap-3">
               <ListIcon className="w-10 h-10 text-emerald-300" />
               İlanlarım
            </h1>
            <p className="text-emerald-100 text-lg font-medium opacity-90 mb-6">
                Yolculuklarını yönet, rezervasyonları kontrol et.
            </p>
        
        </div>
      </div>

      {/* --- 2. ANA İÇERİK (Yüzen Kartlar) --- */}
      <div className="container mt-4 mx-auto px-4 relative z-20 -mt-24 pb-12">
        
        {rides.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-100 max-w-2xl mx-auto">
           
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Henüz ilan oluşturmadınız.</h3>
            <p className="text-gray-500 mb-8">Hemen bir yolculuk planlayın ve yolcularla buluşun.</p>
            <Link
              to="/create-ride"
              className="text-[#004225] hover:text-[#00331b] font-bold text-lg hover:underline"
            >
              İlk ilanınızı oluşturun →
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* SOL SÜTUN: İlan Listesi */}
            <div className="space-y-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200 sticky top-4 z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CarSolidIcon className="w-6 h-6 text-[#004225]" />
                        Yolculuklarım
                    </h2>
                </div>

              {rides.map((ride) => (
                <div
                  key={ride._id}
                  onClick={() => fetchBookings(ride._id)}
                  className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 group
                    ${selectedRide === ride._id 
                        ? 'bg-white border-2 border-[#004225] shadow-xl ring-4 ring-emerald-50' 
                        : 'bg-white border border-gray-100 shadow-md hover:shadow-lg hover:border-emerald-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-xl font-bold transition-colors ${selectedRide === ride._id ? 'text-[#004225]' : 'text-gray-900'}`}>
                      {ride.origin} → {ride.destination}
                    </h3>
                    <span className="text-2xl font-bold text-[#004225]">{ride.price} ₺</span>
                  </div>
                  
                  <div className="text-gray-600 space-y-2 text-sm mb-4">
                    <p className="flex items-center gap-2">
                        <span className="opacity-50">📅</span> {new Date(ride.date).toLocaleString('tr-TR')}
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="opacity-50">💺</span> 
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-xs">
                            {ride.availableSeats} / {ride.totalSeats} Boş
                        </span>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="opacity-50">📊</span> 
                        Durum: 
                        <span className={`capitalize font-bold ${ride.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                            {ride.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                        </span>
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap border-t border-gray-100 pt-4">
                    {ride.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteRide(ride._id);
                        }}
                        className="text-xs bg-[#004225] text-white px-3 py-2 rounded-lg hover:bg-[#00331b] transition-all font-bold flex items-center gap-1 shadow-sm"
                      >
                        <CheckIcon className="w-3 h-3" />
                        Tamamla
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRide(ride._id);
                      }}
                      className="text-xs bg-white border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-bold flex items-center gap-1 ml-auto"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SAĞ SÜTUN: Rezervasyon Detayları */}
            <div className="relative">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200 sticky top-4 z-10 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TicketIcon className="w-6 h-6 text-[#004225]" />
                        Rezervasyon İstekleri
                    </h2>
                </div>

              {selectedRide ? (
                bookings.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
                 
                    <p className="text-gray-500 font-medium">Bu ilan için henüz rezervasyon isteği yok.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Link
                              to={`/profile/${booking.passenger._id}`}
                              className="font-bold text-lg text-gray-900 hover:text-[#004225] transition-colors flex items-center gap-2 mb-1"
                            >
                              <div className="bg-emerald-100 p-1.5 rounded-full text-[#004225]">
                                  <UserIcon className="w-4 h-4" />
                              </div>
                              {booking.passenger.username}
                            </Link>
                            
                            <p className="text-xs text-gray-400 ml-9 mb-2">
                              {booking.passenger.email}
                            </p>

                            <div className="ml-8">
                                <RatingDisplay
                                    userId={booking.passenger._id}
                                    userName={booking.passenger.username}
                                    compact={true}
                                />
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ml-4 flex items-center gap-1 border ${
                              booking.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : booking.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {booking.status === 'approved' ? (
                              <> <CheckIcon className="w-3 h-3" /> Onaylandı </>
                            ) : booking.status === 'rejected' ? (
                              <> <XIcon className="w-3 h-3" /> Reddedildi </>
                            ) : (
                              '⏳ Bekliyor'
                            )}
                          </span>
                        </div>

                        {/* AKSİYON BUTONLARI */}
                        {booking.status === 'pending' && (
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => handleBookingStatus(booking._id, 'approved')}
                              className="flex-1 bg-[#004225] text-white py-2.5 rounded-xl hover:bg-[#00331b] transition-all font-bold flex items-center justify-center gap-2 shadow-sm text-sm"
                            >
                              <CheckIcon className="w-4 h-4" />
                              Onayla
                            </button>
                            <button
                              onClick={() => handleBookingStatus(booking._id, 'rejected')}
                              className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-bold flex items-center justify-center gap-2 shadow-sm text-sm"
                            >
                              <XIcon className="w-4 h-4" />
                              Reddet
                            </button>
                          </div>
                        )}

                        {booking.status === 'approved' && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                            {(() => {
                              const currentRide = rides.find(r => r._id === selectedRide);
                              return currentRide && currentRide.status === 'completed' && (
                                <button
                                  onClick={() => handleOpenRatingModal(currentRide, booking.passenger)}
                                  className="flex-1 bg-yellow-400 text-yellow-900 py-2 rounded-xl hover:bg-yellow-500 transition-all font-bold flex items-center justify-center gap-2 text-xs"
                                >
                                  <StarIcon className="w-4 h-4" />
                                  Puan Ver
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
                              className="flex-1 border border-[#004225] text-[#004225] py-2 rounded-xl hover:bg-emerald-50 transition-all font-bold flex items-center justify-center gap-2 text-xs"
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
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-100 sticky top-20">
                  <div className="text-6xl mb-4 grayscale opacity-20">👈</div>
                  <h3 className="text-lg font-bold text-gray-900">Bir İlan Seçin</h3>
                  <p className="text-gray-500 mt-2">
                    Rezervasyonları ve detayları görmek için soldaki listeden bir yolculuğa tıklayın.
                  </p>
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