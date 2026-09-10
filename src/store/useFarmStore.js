import { create } from 'zustand';
import api from '../service/api';

export const useFarmStore = create((set, get) => ({
  farms: [],

  fetchFarms: async () => {
    try {
      const response = await api.get('/farms');
      set({ farms: response.data });
    } catch (error) {
      console.error("Failed to fetch farms", error);
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

  getFarmName: (id) => get().farms.find((f) => f.id === id)?.name ?? 'ไม่ทราบฟาร์ม',
}));
