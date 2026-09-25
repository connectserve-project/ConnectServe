import api from './api';

export const userService = {
  getProfile: async (idOrUsername) => {
    const response = await api.get(`/users/${idOrUsername}`);
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },

  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  getLeaderboard: async (timeframe = 'all') => {
    const response = await api.get(`/users/leaderboard?timeframe=${timeframe}`);
    return response.data;
  },

  searchUsers: async (params) => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  getMyQrCode: async () => {
    const response = await api.get('/users/me/qrcode');
    return response.data;
  },
};
