import { create } from 'zustand';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../config/workLogTypes';

const MONTHS_BACK = 6;
const workerIds = ['1', '2', '3', '4', '5', '6'];

// dayIndex is cycled into a valid day for that month so seed dates never spill
// into a neighboring month, and the current month never lands in the future.
function dateForMonthOffset(monthsBack, dayIndex) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const maxDay = monthsBack === 0 ? now.getDate() : new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const day = (dayIndex % maxDay) + 1;
  return new Date(target.getFullYear(), target.getMonth(), day).toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

let nextId = 1;
function makeEntry(type, date, workerId, values) {
  const total = WORK_LOG_TYPES[type].calcTotal(values);
  return { id: String(nextId++), type, date, workerId, ...values, total };
}

const FIELD_GENERATORS = {
  cutting: (i) => ({ rows: 3 + (i % 4), waPerRow: 100 }),
  planting: (i) => ({ furrows: 4 + (i % 3), waPerFurrow: 18 + (i % 3) * 2 }),
  watering: (i) => ({ days: 1 + (i % 3), dailyRate: 300 + (i % 2) * 50 }),
  spraying: (i) => ({ tanks: 1 + (i % 4) }),
};

const seedEntries = [];
for (let monthsBack = MONTHS_BACK - 1; monthsBack >= 0; monthsBack--) {
  WORK_LOG_ORDER.forEach((type, typeIndex) => {
    const entriesThisMonth = 3 + ((MONTHS_BACK - monthsBack + typeIndex) % 3);
    for (let i = 0; i < entriesThisMonth; i++) {
      const dayIndex = i * 5 + typeIndex * 2;
      const workerId = workerIds[(i + typeIndex + monthsBack) % workerIds.length];
      seedEntries.push(makeEntry(type, dateForMonthOffset(monthsBack, dayIndex), workerId, FIELD_GENERATORS[type](i)));
    }
  });
}

// Guarantee a handful of entries dated exactly today so the "today" stats
// and the activity log preview aren't empty regardless of when this runs.
WORK_LOG_ORDER.forEach((type, i) => {
  seedEntries.push(makeEntry(type, todayISO(), workerIds[i % workerIds.length], FIELD_GENERATORS[type](i + 1)));
});

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
