import api from './api';

export const applicationService = {
  getApplications: async (params) => {
    return await api.get('/applications', { params });
  },

  getApplicationById: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  createApplication: async (data) => {
    return await api.post('/applications', data);
  },

  assignOfficerOrGATC: async (id, data) => {
    return await api.post(`/applications/${id}/assign`, data);
  },

  scheduleInspection: async (id, scheduleData) => {
    return await api.post(`/applications/${id}/schedule`, scheduleData);
  },

  submitDecision: async (id, decisionData) => {
    return await api.post(`/applications/${id}/decision`, decisionData);
  },

  updateStatus: async (id, statusData) => {
    return await api.put(`/applications/${id}/status`, statusData);
  }
};
