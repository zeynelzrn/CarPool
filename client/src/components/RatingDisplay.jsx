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

  if (loading && compact) {
    return (
      <div className="text-sm text-gray-400">Yükleniyor...</div>
    );
  }

  if (totalRatings === 0 && !loading) {
    return (
      <div className="text-sm text-gray-500">
        Henüz değerlendirme yok
      </div>
    );
  }

  if (loading && !compact) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
        <div className="text-sm text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (compact) {
    // Compact mode - only show if loaded, otherwise show minimal info
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Yükleniyor...</span>
        </div>
      );
    }
    
    if (totalRatings === 0) {
      return (
        <div className="text-xs text-gray-500">
          Henüz değerlendirme yok
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
        </div>
        <span className="text-xs text-gray-500">({totalRatings} değerlendirme)</span>
        <Link
          to={`/profile/${userId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          Tümünü Gör
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">
            {userName} Değerlendirmeleri
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{averageRating.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <span className="text-sm text-gray-600">({totalRatings} değerlendirme)</span>
          </div>
        </div>
        <Link
          to={`/profile/${userId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          Profil →
        </Link>
      </div>

      {ratings.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {displayedRatings.map((rating) => (
            <div
              key={rating._id}
              className="bg-white p-3 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {rating.fromUser?.username || 'Bilinmeyen Kullanıcı'}
                  </p>
                  {rating.createdAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
                {renderStars(rating.rating || 0)}
              </div>
              {rating.comment && (
                <p className="text-sm text-gray-700 mt-2 italic">
                  "{rating.comment}"
                </p>
              )}
              {rating.ride && (
                <p className="text-xs text-gray-500 mt-1">
                  {rating.ride.origin || 'N/A'} → {rating.ride.destination || 'N/A'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {ratings.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium w-full text-center"
        >
          {showAll ? 'Daha Az Göster' : `Tümünü Gör (${ratings.length})`}
        </button>
      )}
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

export default RatingDisplay;

