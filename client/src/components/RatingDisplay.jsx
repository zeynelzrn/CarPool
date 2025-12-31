import { useState, useEffect, useMemo, memo } from 'react';
import { ratingService } from '../services/ratingService';
import { Link } from 'react-router-dom';

// Cache for ratings to avoid duplicate API calls
const ratingsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const RatingDisplay = memo(({ userId, userName, compact = false }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchRatings();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchRatings = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // Check cache first
    const cached = ratingsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRatings(cached.data?.ratings || []);
      setAverageRating(cached.data?.averageRating || 0);
      setTotalRatings(cached.data?.totalRatings || 0);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await ratingService.getUserRatings(userId);
      const ratingData = {
        ratings: data?.ratings || [],
        averageRating: data?.averageRating || 0,
        totalRatings: data?.totalRatings || 0
      };
      
      // Cache the result
      ratingsCache.set(userId, {
        data: ratingData,
        timestamp: Date.now()
      });
      
      setRatings(ratingData.ratings);
      setAverageRating(ratingData.averageRating);
      setTotalRatings(ratingData.totalRatings);
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
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const displayedRatings = useMemo(() => {
    return showAll ? ratings : ratings.slice(0, 3);
  }, [ratings, showAll]);

  // --- COMPACT MODE LOADING & EMPTY ---
  if (loading && compact) {
    return (
      <div className="text-xs text-gray-400 animate-pulse">Yükleniyor...</div>
    );
  }

  if (totalRatings === 0 && !loading) {
    return (
      <div className="text-xs text-gray-400 italic opacity-70">
        Henüz değerlendirme yok
      </div>
    );
  }

  // --- FULL MODE LOADING ---
  if (loading && !compact) {
    return (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="text-sm text-gray-500 animate-pulse">Değerlendirmeler yükleniyor...</div>
      </div>
    );
  }

  // --- COMPACT VIEW (Liste Kartlarında Görünecek Hali) ---
  if (compact) {
    return (
      <div className="flex items-center gap-2 group">
        {/* Puan Rozeti */}
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100 shadow-sm">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="font-bold text-gray-800 text-xs">{averageRating.toFixed(1)}</span>
        </div>
        
        {/* Sayı ve Link */}
        <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">({totalRatings})</span>
        <Link
          to={`/profile/${userId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-[#004225] hover:text-emerald-700 hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          İncele
        </Link>
      </div>
    );
  }

  // --- FULL VIEW (Profil vb. yerlerde görünecek hali) ---
  return (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
      
      {/* Üst Başlık */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-1">
            {userName} Değerlendirmeleri
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
              <span className="text-lg font-bold text-[#004225]">{averageRating.toFixed(1)}</span>
              <div className="flex items-center -mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">({totalRatings} Yorum)</span>
          </div>
        </div>
        
        <Link
          to={`/profile/${userId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs bg-white text-[#004225] border border-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-all font-bold shadow-sm"
        >
          Profile Git →
        </Link>
      </div>

      {/* Yorumlar Listesi */}
      {ratings.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
          {displayedRatings.map((rating) => (
            <div
              key={rating._id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    {rating.fromUser?.username || 'Gizli Kullanıcı'}
                    <span className="text-[10px] font-normal text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {rating.createdAt && new Date(rating.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </p>
                </div>
                {renderStars(rating.rating || 0)}
              </div>
              
              {rating.comment && (
                <p className="text-sm text-gray-600 mt-2 italic bg-gray-50/50 p-2 rounded-lg border-l-2 border-emerald-200">
                  "{rating.comment}"
                </p>
              )}
              
              {rating.ride && (
                <div className="mt-3 flex items-center gap-1">
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md font-medium">
                        🚗 {rating.ride.origin || 'N/A'} → {rating.ride.destination || 'N/A'}
                    </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ratings.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-xs text-[#004225] hover:text-emerald-700 hover:underline font-bold w-full text-center py-2 bg-emerald-50/50 rounded-lg transition-colors"
        >
          {showAll ? 'Daha Az Göster' : `Tümünü Gör (${ratings.length})`}
        </button>
      )}
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

export default RatingDisplay;