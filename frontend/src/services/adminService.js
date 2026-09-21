import api from './api';

export const adminService = {
  getAnalytics: async () => {
    return await api.get('/admin/analytics');
  },

  getAuditLogs: async (params) => {
    return await api.get('/admin/audit-logs', { params });
  },

  getRules: async () => {
    return await api.get('/admin/rules');
  },

  createRule: async (data) => {
    return await api.post('/admin/rules', data);
  },

  updateRule: async (id, data) => {
    return await api.put(`/admin/rules/${id}`, data);
  },

  exportReportUrl: (type = 'applications') => {
    const baseURL = import.meta.env.VITE_API_URL || '/api';
    return `${baseURL}/admin/export-report?type=${type}`;
  }
};
