import api from '../service/api';

export const workerBalanceRepository = {
  getAll: async () => {
    const response = await api.get('/worker-balances', { params: { page: 0, size: 500 } });
    return response.data;
  },
};
