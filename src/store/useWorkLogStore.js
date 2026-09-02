import { create } from 'zustand';
import { WORK_LOG_TYPES } from '../config/workLogTypes';

// Seed dates are placed within the current calendar month (cycling 1..today)
// so dashboard "this month" stats are always meaningful regardless of when
// the app happens to be run, even on the 1st of a month.
function dateInCurrentMonth(offset) {
  const now = new Date();
  const maxDay = now.getDate();
  const day = (offset % maxDay) + 1;
  return new Date(now.getFullYear(), now.getMonth(), day).toISOString().slice(0, 10);
}

const workerIds = ['1', '2', '3', '4', '5', '6'];

let nextId = 1;
function makeEntry(type, dayOffset, workerId, values) {
  const total = WORK_LOG_TYPES[type].calcTotal(values);
  return { id: String(nextId++), type, date: dateInCurrentMonth(dayOffset), workerId, ...values, total };
}

const seedEntries = [
  ...Array.from({ length: 9 }, (_, i) =>
    makeEntry('cutting', i, workerIds[i % workerIds.length], { rows: 3 + (i % 4), waPerRow: 100 })
  ),
  ...Array.from({ length: 8 }, (_, i) =>
    makeEntry('planting', i + 1, workerIds[(i + 2) % workerIds.length], {
      furrows: 4 + (i % 3),
      waPerFurrow: 18 + (i % 3) * 2,
    })
  ),
  ...Array.from({ length: 9 }, (_, i) =>
    makeEntry('watering', i, workerIds[(i + 4) % workerIds.length], {
      days: 1 + (i % 3),
      dailyRate: 300 + (i % 2) * 50,
    })
  ),
  ...Array.from({ length: 8 }, (_, i) =>
    makeEntry('spraying', i + 2, workerIds[(i + 1) % workerIds.length], { tanks: 1 + (i % 4) })
  ),
];

export const useWorkLogStore = create((set, get) => ({
  entries: seedEntries,

  addEntry: (type, values) => {
    const total = WORK_LOG_TYPES[type].calcTotal(values);
    const entry = { id: String(nextId++), type, total, ...values };
    set((state) => ({ entries: [entry, ...state.entries] }));
    return entry;
  },

  getEntriesByType: (type) => get().entries.filter((e) => e.type === type),

  getAllEntries: () => get().entries,
}));
