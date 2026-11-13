import { create } from 'zustand';

/** Number of API requests in flight. The axios interceptors in service/api.js keep it current; NetworkStatus reads it. */
export const useNetworkStore = create((set) => ({
  pending: 0,
  begin: () => set((s) => ({ pending: s.pending + 1 })),
  end: () => set((s) => ({ pending: Math.max(0, s.pending - 1) })),
}));
