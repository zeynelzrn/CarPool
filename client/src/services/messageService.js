import api from './api';

export const messageService = {
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  getMessagesByRide: async (rideId, passengerId = null) => {
    const url = passengerId 
      ? `/messages/ride/${rideId}?passengerId=${passengerId}`
      : `/messages/ride/${rideId}`;
    const response = await api.get(url);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
};

