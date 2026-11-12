import { create } from 'zustand';
import { workerBalanceService } from '../service/workerBalanceService';
import { t } from '../i18n';
import { tError } from '../i18n/backendMessages';

export const useWorkerBalanceStore = create((set) => ({
  balances: [],
  loaded: false,
  error: '',

  fetchBalances: async () => {
    try {
      const data = await workerBalanceService.getAllBalances();
      set({ balances: data, loaded: true, error: '' });
    } catch (error) {
      console.error('Failed to fetch worker balances:', error);
      set({ error: tError(error, t('err.loadFailed')), loaded: true });
    }
  },
}));
