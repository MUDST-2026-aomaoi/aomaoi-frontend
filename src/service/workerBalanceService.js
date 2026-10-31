import { workerBalanceRepository } from '../repository/workerBalanceRepository';

export const workerBalanceService = {
  getAllBalances: async () => {
    return await workerBalanceRepository.getAll();
  },
};
