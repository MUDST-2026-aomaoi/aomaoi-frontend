import { create } from 'zustand';
import { salaryAdvanceService } from '../service/salaryAdvanceService';

export const useSalaryAdvanceStore = create((set) => ({
  advances: [],

  fetchAdvances: async () => {
    try {
      const data = await salaryAdvanceService.getAllAdvances();
      set({ advances: data });
    } catch (error) {
      console.error('Failed to fetch salary advances:', error);
    }
  },

  addAdvance: async (values) => {
    try {
      const saved = await salaryAdvanceService.addAdvance(values);
      set((state) => ({ advances: [saved, ...state.advances] }));
      return saved;
    } catch (error) {
      console.error('Failed to add salary advance:', error);
      throw error;
    }
  },
}));
