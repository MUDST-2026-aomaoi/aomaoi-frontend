import api from '../service/api';

export const workLogRepository = {
  getAll: async () => {
    const response = await api.get('/work-logs');
    return response.data;
  },

  add: async (logData) => {
    const response = await api.post('/work-logs', logData);
    return response.data;
  },

  getMyBalance: async () => {
    const response = await api.get('/worker-balances/me');
    return response.data;
  }
};
