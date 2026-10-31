import { create } from 'zustand';
import { workerBalanceService } from '../service/workerBalanceService';

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
      set({ error: error.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', loaded: true });
    }
  },
}));
