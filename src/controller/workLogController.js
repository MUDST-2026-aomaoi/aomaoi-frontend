import { create } from 'zustand';
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
      const payload = { type, ...values };
      // Handle single-day tasks: for tasks completed in a single day (like cutting grass),
      // set both start date and end date to the same day to prevent nulls in database
      if (payload.date && (!payload.startDate || !payload.endDate)) {
        payload.startDate = payload.date;
        payload.endDate = payload.date;
      } else if (payload.startDate && !payload.endDate) {
        payload.endDate = payload.startDate;
      }
      const saved = await workLogService.addLog(payload);
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
