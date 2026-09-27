import api from './api';

export const certificateService = {
  getMyCertificates: async () => {
    const response = await api.get('/certificates/my');
    return response.data;
  },

  verifyCertificate: async (code) => {
    const response = await api.get(`/certificates/verify/${code}`);
    return response.data;
  },

  getCertificateById: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },
};
