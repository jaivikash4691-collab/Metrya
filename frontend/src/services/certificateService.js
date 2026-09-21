import api from './api';

export const certificateService = {
  getCertificates: async (params) => {
    return await api.get('/certificates', { params });
  },

  getCertificateById: async (id) => {
    return await api.get(`/certificates/${id}`);
  },

  generateCertificate: async (applicationId) => {
    return await api.post(`/certificates/generate/${applicationId}`);
  },

  revokeCertificate: async (id, reason) => {
    return await api.post(`/certificates/${id}/revoke`, { reason });
  },

  downloadPDFUrl: (id) => {
    const baseURL = import.meta.env.VITE_API_URL || '/api';
    return `${baseURL}/certificates/${id}/download`;
  }
};
