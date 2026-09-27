import api from './api';

export const registrationService = {
  getMyRegistrations: async (status = 'all') => {
    const response = await api.get(`/registrations/my?status=${status}`);
    return response.data;
  },

  updateStatus: async (registrationId, status, notes = '') => {
    const response = await api.put(`/registrations/${registrationId}/status`, { status, notes });
    return response.data;
  },

  markAttendance: async (registrationId, attended, customHours) => {
    const response = await api.post(`/registrations/${registrationId}/attendance`, {
      attended,
      customHours,
    });
    return response.data;
  },
};
