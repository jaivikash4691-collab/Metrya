import api from './api';

export const publicService = {
  verifyCertificate: async (identifier) => {
    return await api.get(`/public/verify/${identifier}`);
  }
};
