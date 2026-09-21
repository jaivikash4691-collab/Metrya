import api from './api';

export const inspectionService = {
  calculateLiveTolerance: async (calculationPayload) => {
    return await api.post('/inspections/calculate-tolerance', calculationPayload);
  },

  conductInspection: async (formData) => {
    return await api.post('/inspections', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getInspectionById: async (id) => {
    return await api.get(`/inspections/${id}`);
  },

  getInspectionByApplication: async (applicationId) => {
    return await api.get(`/inspections/application/${applicationId}`);
  }
};
