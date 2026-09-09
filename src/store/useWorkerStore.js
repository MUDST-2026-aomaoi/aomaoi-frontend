import { create } from 'zustand';

const seedWorkers = [
  { id: '1', fullName: 'สมชาย ใจดี', nickname: 'ชาย', username: 'w001', phone: '081-234-5678', status: 'active', joinedDate: '2026-01-10', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', fullName: 'สมหญิง รักงาน', nickname: 'หญิง', username: 'w002', phone: '089-234-5678', status: 'active', joinedDate: '2026-01-10', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '3', fullName: 'ประเสริฐ แข็งขัน', nickname: 'เสริฐ', username: 'w003', phone: '088-234-5678', status: 'active', joinedDate: '2026-02-15', avatar: 'https://i.pravatar.cc/150?img=13' },
  { id: '4', fullName: 'มานะ พากเพียร', nickname: 'มานะ', username: 'w004', phone: '087-234-5678', status: 'pending', joinedDate: '2026-08-20', avatar: 'https://i.pravatar.cc/150?img=14' },
  { id: '5', fullName: 'สายฝน ชื่นใจ', nickname: 'ฝน', username: 'w005', phone: '086-234-5678', status: 'active', joinedDate: '2026-03-05', avatar: 'https://i.pravatar.cc/150?img=48' },
  { id: '6', fullName: 'วิชัย บุญมี', nickname: 'ชัย', username: 'w006', phone: '085-234-5678', status: 'inactive', joinedDate: '2025-11-01', avatar: 'https://i.pravatar.cc/150?img=15' },
];

let nextId = seedWorkers.length + 1;

export const useWorkerStore = create((set, get) => ({
  workers: seedWorkers,

  nextUsername: () => `w${String(get().workers.length + 1).padStart(3, '0')}`,

  addWorker: (data) => {
    const id = String(nextId++);
    set((state) => ({
      workers: [...state.workers, { id, status: 'pending', joinedDate: new Date().toISOString().slice(0, 10), ...data }],
    }));
    return id;
  },

  updateWorker: (id, data) =>
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? { ...w, ...data } : w)),
    })),

  setWorkerStatus: (id, status) =>
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? { ...w, status } : w)),
    })),

  getWorkerName: (id) => get().workers.find((w) => w.id === id)?.fullName ?? 'ไม่ทราบชื่อ',
}));
