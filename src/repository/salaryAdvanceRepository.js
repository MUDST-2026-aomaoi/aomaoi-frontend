import api from '../service/api';

export const salaryAdvanceRepository = {
  getAll: async () => {
    const response = await api.get('/salary-advances', { params: { page: 0, size: 100 } });
    return response.data;
  },

  add: async (advanceData) => {
    const response = await api.post('/salary-advances', advanceData);
    return response.data;
  },
};
