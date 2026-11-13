import { create } from 'zustand';
import { attendanceService } from '../service/attendanceService';

/**
 * Attendance of ONE day for the whole farm, keyed by workerId. A worker without an entry is
 * "not checked yet". `loadedDate` guards against a slow response for an older date overwriting a newer one.
 */
export const useAttendanceStore = create((set, get) => ({
  date: null,
  records: {},
  loading: false,

  fetchForDate: async (date) => {
    set({ date, loading: true });
    try {
      const rows = await attendanceService.getForDate(date);
      if (get().date !== date) return;
      set({ records: Object.fromEntries(rows.map((r) => [String(r.workerId), r])), loading: false });
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      if (get().date === date) set({ records: {}, loading: false });
    }
  },

  /** Sets (or clears, with status null) one worker's day on the loaded date. Throws on failure. */
  setStatus: async ({ workerId, date, status, note }) => {
    const saved = await attendanceService.set({ workerId, date, status, note });
    if (get().date === date) {
      set((state) => {
        const records = { ...state.records };
        if (saved.status) records[String(workerId)] = saved;
        else delete records[String(workerId)];
        return { records };
      });
    }
    return saved;
  },

  markAllPresent: async (date) => {
    const result = await attendanceService.bulkPresent(date);
    await get().fetchForDate(date);
    return result;
  },
}));
