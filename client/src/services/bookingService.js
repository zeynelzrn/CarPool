import api from './api';

export const bookingService = {
  createBooking: async (rideId) => {
    const response = await api.post('/bookings', { rideId });
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  getBookingsByRide: async (rideId) => {
    const response = await api.get(`/bookings/ride/${rideId}`);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}`, { status });
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};
