import api from './api';

export const instrumentService = {
  getInstruments: async (params) => {
    return await api.get('/instruments', { params });
  },

  getInstrumentById: async (id) => {
    return await api.get(`/instruments/${id}`);
  },

  createInstrument: async (formData) => {
    return await api.post('/instruments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateInstrument: async (id, data) => {
    return await api.put(`/instruments/${id}`, data);
  },

  deleteInstrument: async (id) => {
    return await api.delete(`/instruments/${id}`);
  },

  getCategories: async () => {
    return await api.get('/instruments/categories');
  },

  createCategory: async (categoryData) => {
    return await api.post('/instruments/categories', categoryData);
  }
};
