import { useState } from 'react';
import { ratingService } from '../services/ratingService';
import { StarIcon, XIcon } from './Icons'; // İkonları buradan çekiyoruz

const RatingModal = ({ isOpen, onClose, ride, toUser, role, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ratingService.createRating({
        rideId: ride._id,
        toUserId: toUser._id,
        rating,
        comment,
        role
      });
      onSuccess();
      onClose();
      setRating(5);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100 border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Leave a Review</h3>
            <p className="text-sm text-gray-500 mt-1">How was your ride?</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-100">
          <p className="text-emerald-900 text-sm mb-1">
            You are rating <span className="font-bold">{toUser.username}</span>
          </p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            {ride.origin} → {ride.destination}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Stars */}
          <div className="mb-6 text-center">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Your Rating
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                    star <= rating
                      ? 'text-yellow-400 drop-shadow-sm'
                      : 'text-gray-200 hover:text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-[#004225] mt-2">{rating} / 5</p>
          </div>

          {/* Comment Area */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all resize-none text-sm"
              placeholder="Share your experience with other users..."
            />
            <div className="flex justify-end mt-1">
               <p className="text-xs text-gray-400">{comment.length} / 500</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#004225] text-white py-3 px-4 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-sm flex justify-center items-center gap-2"
            >
              {loading ? (
                 <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                 </>
              ) : (
                 'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;