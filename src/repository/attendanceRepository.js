import api from '../service/api';

export const attendanceRepository = {
  /** Rows already recorded for a day: [{ workerId, date, status, note, autoRecorded, recordedBy }] */
  getForDate: async (date) => {
    const response = await api.get('/attendance', { params: { date } });
    return response.data;
  },

  /** status = 'PRESENT' | 'LEAVE' | 'ABSENT', or null to clear the day. */
  set: async ({ workerId, date, status, note }) => {
    const response = await api.put('/attendance', { workerId, date, status, note });
    return response.data;
  },

  bulkPresent: async (date) => {
    const response = await api.post('/attendance/bulk-present', { date });
    return response.data;
  },

  getWorkerMonth: async (workerId, month) => {
    const response = await api.get(`/attendance/worker/${workerId}`, { params: { month } });
    return response.data;
  },
};
