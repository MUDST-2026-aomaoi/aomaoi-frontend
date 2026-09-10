import { create } from 'zustand';
import { WORK_LOG_TYPES } from '../config/workLogTypes';
import { workLogService } from '../service/workLogService';

export const useWorkLogStore = create((set, get) => ({
  entries: [],
  loaded: false,

  fetchEntries: async () => {
    try {
      const data = await workLogService.getAllLogs();
      set({ entries: data, loaded: true });
    } catch (error) {
      console.error('Failed to fetch work logs:', error);
    }
  },

  addEntry: async (type, values) => {
    try {
      const saved = await workLogService.addLog({ type, ...values });
      set((state) => ({ entries: [saved, ...state.entries] }));
      return saved;
    } catch (error) {
      console.error('Failed to add work log:', error);
      throw error;
    }
  },

  getEntriesByType: (type) => get().entries.filter((e) => e.type === type),

  getAllEntries: () => get().entries,
}));
