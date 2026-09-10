import api from './api';

export const workLogService = {
  getAllLogs: async () => {
    // Calls GET /api/work-logs
    const response = await api.get('/work-logs');
    return response.data;
  },

  addLog: async (logData) => {
    // Calls POST /api/work-logs
    const response = await api.post('/work-logs', logData);
    return response.data;
  }
};
