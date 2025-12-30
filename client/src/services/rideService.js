import api from './api';

export const rideService = {
  createRide: async (rideData) => {
    const response = await api.post('/rides', rideData);
    return response.data;
  },

  getRides: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.destination) params.append('destination', filters.destination);
    if (filters.date) params.append('date', filters.date);

    const response = await api.get(`/rides?${params.toString()}`);
    return response.data;
  },

  getRideById: async (id) => {
    const response = await api.get(`/rides/${id}`);
    return response.data;
  },

  getMyRides: async () => {
    const response = await api.get('/rides/my-rides');
    return response.data;
  },

  updateRide: async (id, rideData) => {
    const response = await api.put(`/rides/${id}`, rideData);
    return response.data;
  },

  deleteRide: async (id) => {
    const response = await api.delete(`/rides/${id}`);
    return response.data;
  },

  completeRide: async (id) => {
    const response = await api.patch(`/rides/${id}/complete`);
    return response.data;
  },
};
