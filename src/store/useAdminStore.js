import { create } from 'zustand';

const seedAdmins = [
  {
    id: '1',
    fullName: 'วันดี ศรีสุข',
    username: 'somchai_j',
    phone: '081-234-5678',
    farmId: '1',
    status: 'active',
    joinedDate: '2026-01-10',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: '2',
    fullName: 'พิมพ์ชนก รัตนไพศาล',
    username: 'Pimchanok_r',
    phone: '089-234-5678',
    farmId: '2',
    status: 'pending',
    joinedDate: '2026-01-10',
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
  {
    id: '3',
    fullName: 'กานต์ธิดา วงศ์สว่าง',
    username: 'Kanthida_w',
    phone: '088-234-5678',
    farmId: '3',
    status: 'inactive',
    joinedDate: '2026-01-10',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
];

let nextId = seedAdmins.length + 1;

export const useAdminStore = create((set, get) => ({
  admins: seedAdmins,

  nextUsername: () => `admin${String(get().admins.length + 1).padStart(3, '0')}`,

  addAdmin: (data) => {
    const id = String(nextId++);
    set((state) => ({
      admins: [...state.admins, { id, status: 'pending', joinedDate: new Date().toISOString().slice(0, 10), ...data }],
    }));
    return id;
  },

  updateAdmin: (id, data) =>
    set((state) => ({
      admins: state.admins.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  setAdminStatus: (id, status) =>
    set((state) => ({
      admins: state.admins.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  getAdminName: (id) => get().admins.find((a) => a.id === id)?.fullName ?? 'ไม่ทราบชื่อ',
}));
