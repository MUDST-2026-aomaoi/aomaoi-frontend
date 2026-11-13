import { create } from 'zustand';
import { farmService } from '../service/farmService';
import { t } from '../i18n';

export const useFarmStore = create((set, get) => ({
  farms: [],
  loaded: false, // first fetch settled (success or failure)

  fetchFarms: async () => {
    try {
      const data = await farmService.getAllFarms();
      set({ farms: data, loaded: true });
    } catch (error) {
      console.error("Failed to fetch farms", error);
      set({ loaded: true });
    }
  },

  addFarm: (data) => {
    set((state) => ({
      farms: [
        ...state.farms,
        data
      ],
    }));
  },

  updateFarm: (id, data) =>
    set((state) => ({
      farms: state.farms.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  setFarmStatus: (id, status) =>
    set((state) => ({
      farms: state.farms.map((f) => (f.id === id ? { ...f, status } : f)),
    })),

  getFarmName: (id) => get().farms.find((f) => String(f.id) === String(id))?.name ?? t('common.unknownFarm'),
}));
