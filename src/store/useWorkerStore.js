import { create } from 'zustand';

const seedWorkers = [
  { id: '1', fullName: 'สมชาย ใจดี', nickname: 'ชาย', username: 'w001', isActive: true },
  { id: '2', fullName: 'สมหญิง รักงาน', nickname: 'หญิง', username: 'w002', isActive: true },
  { id: '3', fullName: 'ประเสริฐ แข็งขัน', nickname: 'เสริฐ', username: 'w003', isActive: true },
  { id: '4', fullName: 'มานะ พากเพียร', nickname: 'มานะ', username: 'w004', isActive: true },
  { id: '5', fullName: 'สายฝน ชื่นใจ', nickname: 'ฝน', username: 'w005', isActive: true },
  { id: '6', fullName: 'วิชัย บุญมี', nickname: 'ชัย', username: 'w006', isActive: false },
];

let nextId = seedWorkers.length + 1;

export const useWorkerStore = create((set, get) => ({
  workers: seedWorkers,

  nextUsername: () => `w${String(get().workers.length + 1).padStart(3, '0')}`,

  addWorker: (data) => {
    const id = String(nextId++);
    set((state) => ({ workers: [...state.workers, { id, isActive: true, ...data }] }));
    return id;
  },

  updateWorker: (id, data) =>
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? { ...w, ...data } : w)),
    })),

  deactivateWorker: (id) =>
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? { ...w, isActive: false } : w)),
    })),

  getWorkerName: (id) => get().workers.find((w) => w.id === id)?.fullName ?? 'ไม่ทราบชื่อ',
}));
