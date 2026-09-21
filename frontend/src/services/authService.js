import api from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  getUsers: async (params) => {
    return await api.get('/auth/users', { params });
  },

  createUser: async (userData) => {
    return await api.post('/auth/users', userData);
  }
};
