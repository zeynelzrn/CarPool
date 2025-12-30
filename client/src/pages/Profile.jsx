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
      // Parallel fetch but don't block on userData
      fetchUserRatings();
      fetchUserData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const userData = await authService.getUserById(userId);
      setProfileUser(userData);
    } catch (error) {
      console.error('Kullanıcı bilgisi yüklenemedi:', error);
      setProfileUser(null);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const data = await ratingService.getUserRatings(userId);
      setRatings(data?.ratings || []);
      setAverageRating(data?.averageRating || 0);
      setTotalRatings(data?.totalRatings || 0);
    } catch (error) {
      console.error('Değerlendirmeler yüklenemedi:', error);
      setRatings([]);
      setAverageRating(0);
      setTotalRatings(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
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

  if (!profileUser && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Kullanıcı bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="text-center mb-8">
            {profileUser?.profilePicture ? (
              <img
                src={profileUser.profilePicture}
                alt="Profil"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-blue-200 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-800">
                {profileUser?.username || 'Kullanıcı'}
              </h1>
              {currentUser && currentUser._id === userId && (
                <Link
                  to="/edit-profile"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Düzenle
                </Link>
              )}
            </div>
            {profileUser?.bio && (
              <p className="text-gray-600 mb-4 max-w-2xl mx-auto">{profileUser.bio}</p>
            )}
            {profileUser?.phone && (
              <p className="text-gray-500 text-sm">Telefon: {profileUser.phone}</p>
            )}
            {totalRatings > 0 && (
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
                  <div className="text-gray-600">Ortalama Puan</div>
                </div>
                <div className="h-16 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-800">{totalRatings}</div>
                  <div className="text-gray-600">Toplam Değerlendirme</div>
                </div>
              </div>
            )}
            {averageRating > 0 && (
              <div className="mt-4 flex justify-center">
                {renderStars(Math.round(averageRating))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <StarIcon className="w-8 h-8 text-yellow-500" />
            Değerlendirmeler
          </h2>

          {ratings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Henüz değerlendirme yapılmamış.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {ratings.map((rating) => (
                <div
                  key={rating._id}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg text-gray-800">
                        {rating.fromUser?.username || 'Bilinmeyen Kullanıcı'}
                      </p>
                      {rating.createdAt && (
                        <p className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {renderStars(rating.rating || 0)}
                      {rating.ride && (
                        <p className="text-sm text-gray-600 mt-1">
                          {rating.ride.origin || 'N/A'} → {rating.ride.destination || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-700 bg-white p-4 rounded-lg border-l-4 border-blue-500">
                      "{rating.comment}"
                    </p>
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

