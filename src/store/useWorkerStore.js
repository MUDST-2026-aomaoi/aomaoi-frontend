import { create } from 'zustand';
import api from '../service/api';

export const useWorkerStore = create((set, get) => ({
  workers: [],

  fetchWorkers: async () => {
    try {
      const response = await api.get('/workers');
      set({ workers: response.data });
    } catch (error) {
      console.error("Failed to fetch workers", error);
    }
  },

  nextUsername: () => `w${String(get().workers.length + 1).padStart(3, '0')}`,

  addWorker: (data) => {
    set((state) => ({
      workers: [...state.workers, data],
    }));
  },

  updateWorker: (id, data) =>
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? { ...w, ...data } : w)),
    })),

  setWorkerStatus: (id, status) =>
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? { ...w, status } : w)),
    })),

  getWorkerName: (id) => get().workers.find((w) => String(w.id) === String(id))?.fullName ?? 'ไม่ระบุ',
}));
