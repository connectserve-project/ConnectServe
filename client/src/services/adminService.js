import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, statusData) => {
    const response = await api.put(`/admin/users/${id}`, statusData);
    return response.data;
  },

  deleteUser: async (id, reason) => {
    const response = await api.delete(`/admin/users/${id}`, { data: { reason } });
    return response.data;
  },


  getOrganizations: async (status = 'all') => {
    const response = await api.get(`/admin/organizations?status=${status}`);
    return response.data;
  },

  verifyOrganization: async (id, isVerified) => {
    const response = await api.put(`/admin/organizations/${id}/verify`, { isVerified });
    return response.data;
  },

  getModerationQueue: async (status = 'pending') => {
    const response = await api.get(`/admin/reports?status=${status}`);
    return response.data;
  },

  resolveReport: async (id, action, resolutionNotes = '') => {
    const response = await api.put(`/admin/reports/${id}`, { action, resolutionNotes });
    return response.data;
  },
};
