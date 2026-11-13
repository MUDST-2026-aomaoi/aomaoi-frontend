import { create } from 'zustand';
import { salaryAdvanceService } from '../service/salaryAdvanceService';

export const useSalaryAdvanceStore = create((set) => ({
  advances: [],
  myAdvances: [],
  // first fetch of each list settled (success or failure)
  loaded: false,
  myLoaded: false,

  fetchAdvances: async () => {
    try {
      const data = await salaryAdvanceService.getAllAdvances();
      set({ advances: data, loaded: true });
    } catch (error) {
      console.error('Failed to fetch salary advances:', error);
      set({ loaded: true });
    }
  },

  fetchMyAdvances: async () => {
    try {
      const data = await salaryAdvanceService.getMyAdvances();
      set({ myAdvances: data, myLoaded: true });
    } catch (error) {
      console.error('Failed to fetch my salary advances:', error);
      set({ myLoaded: true });
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
