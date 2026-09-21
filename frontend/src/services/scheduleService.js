import api from './api';

export const scheduleService = {
  getSchedules: async (params) => {
    return await api.get('/schedules', { params });
  },

  updateSchedule: async (id, data) => {
    return await api.put(`/schedules/${id}`, data);
  }
};
