import { create } from 'zustand';
import api from '../service/api';

export const useAdminStore = create((set, get) => ({
  admins: [],

  fetchAdmins: async () => {
    try {
      const response = await api.get('/admins');
      set({ admins: response.data });
    } catch (error) {
      console.error("Failed to fetch admins", error);
    }
  },

  nextUsername: () => `admin${String(get().admins.length + 1).padStart(3, '0')}`,

  addAdmin: (data) => {
    // Rely on fetching fresh data or just appending locally
    set((state) => ({
      admins: [...state.admins, data],
    }));
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
