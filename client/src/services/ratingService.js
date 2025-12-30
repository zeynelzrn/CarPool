import api from './api';

export const ratingService = {
  createRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  getUserRatings: async (userId) => {
    const response = await api.get(`/ratings/user/${userId}`);
    return response.data;
  },

  getRideRatings: async (rideId) => {
    const response = await api.get(`/ratings/ride/${rideId}`);
    return response.data;
  },

  getMyRatings: async () => {
    const response = await api.get('/ratings/my-ratings');
    return response.data;
  },
};

