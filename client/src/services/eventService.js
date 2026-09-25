import api from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (formData) => {
    const response = await api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateEvent: async (id, formData) => {
    const response = await api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  registerForEvent: async (id, notes = '') => {
    const response = await api.post(`/events/${id}/register`, { notes });
    return response.data;
  },

  getEventApplicants: async (id) => {
    const response = await api.get(`/events/${id}/applicants`);
    return response.data;
  },

  addReview: async (id, reviewData) => {
    const response = await api.post(`/events/${id}/reviews`, reviewData);
    return response.data;
  },

  getPublicStats: async () => {
    const response = await api.get('/events/stats');
    return response.data;
  },

  scanAttendance: async (eventId, qrToken) => {
    const response = await api.post(`/events/${eventId}/attendance/scan`, { qrToken });
    return response.data;
  },
};

