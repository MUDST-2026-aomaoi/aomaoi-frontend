import { create } from 'zustand';
import { workerService } from '../service/workerService';
import { t } from '../i18n';

export const useWorkerStore = create((set, get) => ({
  workers: [],
  loaded: false, // first fetch settled (success or failure)

  fetchWorkers: async () => {
    try {
      const data = await workerService.getAllWorkers();
      set({ workers: data, loaded: true });
    } catch (error) {
      console.error("Failed to fetch workers", error);
      set({ loaded: true });
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

  getWorkerName: (id) => get().workers.find((w) => String(w.id) === String(id))?.fullName ?? t('common.unspecified'),
}));
