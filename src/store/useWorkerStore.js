import { create } from 'zustand';
import { workerService } from '../service/workerService';

export const useWorkerStore = create((set, get) => ({
  workers: [],
  loaded: false,

  fetchWorkers: async () => {
    try {
      const data = await workerService.getAllWorkers();
      set({ workers: data, loaded: true });
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  },

  nextUsername: () => `w${String(get().workers.length + 1).padStart(3, '0')}`,

  addWorker: async (data) => {
    try {
      const saved = await workerService.addWorker(data);
      set((state) => ({
        workers: [...state.workers, saved],
      }));
      return saved.id;
    } catch (error) {
      console.error('Failed to add worker:', error);
      throw error;
    }
  },

  updateWorker: async (id, data) => {
    try {
      const saved = await workerService.updateWorker(id, data);
      set((state) => ({
        workers: state.workers.map((w) => (w.id === id ? { ...w, ...saved } : w)),
      }));
    } catch (error) {
      console.error('Failed to update worker:', error);
      throw error;
    }
  },

  setWorkerStatus: async (id, status) => {
    try {
      if (status === 'inactive') {
        await workerService.deleteWorker(id);
      }
      set((state) => ({
        workers: state.workers.map((w) => (w.id === id ? { ...w, status } : w)),
      }));
    } catch (error) {
      console.error('Failed to update worker status:', error);
      throw error;
    }
  },

  getWorkerName: (id) => get().workers.find((w) => w.id === id)?.fullName ?? 'ไม่ทราบชื่อ',
}));
