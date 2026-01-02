import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ratingService } from '../services/ratingService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { UserIcon, StarIcon } from '../components/Icons';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      // Her iki veriyi de paralel çek, ikisi de bitince loading'i kapat
      fetchAllData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchAllData = async () => {
    setLoading(true); // Garantiye al
    try {
      // Paralel çağrı - ikisi de tamamlanana kadar bekle
      const [userData, ratingsData] = await Promise.all([
        authService.getUserById(userId).catch(err => {
          console.error('Failed to load user information:', err);
          return null;
        }),
        ratingService.getUserRatings(userId).catch(err => {
          console.error('Failed to load ratings:', err);
          return null;
        })
      ]);

      // User data
      setProfileUser(userData);

      // Ratings data
      if (ratingsData) {
        setRatings(ratingsData.ratings || []);
        setAverageRating(ratingsData.averageRating || 0);
        setTotalRatings(ratingsData.totalRatings || 0);
      } else {
        setRatings([]);
        setAverageRating(0);
        setTotalRatings(0);
      }
    } finally {
      setLoading(false); // Her durumda loading'i kapat
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            viewBox="0 0 24 24"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        ))}
      </div>
    );
  };

  // Loading Ekranı - Yeşil Tema
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#004225]"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı Bulunamadı Ekranı
  if (!profileUser && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-500 mb-6">The profile you are looking for does not exist or has been removed.</p>
          <Link to="/" className="inline-block bg-[#004225] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00331b] transition-colors">
            Back to Home
          </Link>
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        
        {/* Başlık (Opsiyonel, profil sayfasında genelde boş bırakılabilir veya breadcrumb olabilir) */}
      
      </div>

      {/* --- 2. ANA İÇERİK (Floating Container) --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-32 pb-24">
        
        {/* PROFİL KARTI */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
            <div className="p-8 md:p-12 text-center">
                
                {/* Profil Resmi */}
                <div className="relative inline-block mb-6">
                    {profileUser?.profilePicture ? (
                        <img
                            src={profileUser.profilePicture}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-[#004225]/10"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-[#004225]/10">
                            <UserIcon className="w-16 h-16 text-[#004225]" />
                        </div>
                    )}
                    {/* Verified Badge (Opsiyonel) */}
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Account">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>

                {/* İsim ve Bio */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {profileUser?.username || 'User'}
                </h1>
                
                {profileUser?.bio ? (
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-4">{profileUser.bio}</p>
                ) : (
                    <p className="text-gray-400 italic mb-4">No biography added yet.</p>
                )}

                {/* İletişim Bilgisi (Sadece varsa) */}
                {profileUser?.phone && (
                    <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-gray-600 font-medium text-sm mb-6">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {profileUser.phone}
                    </div>
                )}

                {/* İstatistikler */}
                {totalRatings > 0 && (
                    <div className="flex justify-center items-center gap-8 md:gap-16 py-6 border-t border-gray-100 mt-2">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#004225]">{averageRating.toFixed(1)}</div>
                            <div className="flex items-center justify-center gap-1 mt-1 text-yellow-400">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Average Rating</div>
                        </div>
                        <div className="w-px h-16 bg-gray-200"></div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#004225]">{totalRatings}</div>
                            
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Ratings</div>
                        </div>
                    </div>
                )}

                {/* Düzenle Butonu (Sadece Kendi Profilimse) */}
                {currentUser && currentUser._id === userId && (
                    <div className="mt-8">
                        <Link
                            to="/edit-profile"
                            className="inline-flex items-center gap-2 bg-[#004225] text-white px-8 py-3 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all transform active:scale-95 font-bold"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>

        {/* YORUMLAR BÖLÜMÜ */}
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                    <StarIcon className="w-6 h-6 text-yellow-600" />
                </div>
                Ratings
            </h2>

            {ratings.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-lg">No ratings have been made for this user yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ratings.map((rating) => (
                        <div
                            key={rating._id}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                {/* Kullanıcı ve Tarih */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {rating.fromUser?.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {rating.fromUser?.username || 'Anonymous User'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Puan ve Rota */}
                                <div className="flex flex-col items-end">
                                    <div className="flex text-yellow-400 mb-1">
                                        {renderStars(rating.rating || 0)}
                                    </div>
                                    {rating.ride && (
                                        <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                            {rating.ride.origin} → {rating.ride.destination}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Yorum Metni */}
                            {rating.comment && (
                                <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-[#004225] text-gray-700 italic">
                                    "{rating.comment}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Profile;