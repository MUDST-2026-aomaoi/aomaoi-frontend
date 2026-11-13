import { create } from 'zustand';

/**
 * Network activity shared by the loaders.
 * - pending: API requests in flight (kept current by the axios interceptors in service/api.js)
 * - slow: some request has been pending for a while (set by NetworkStatus)
 * - inlineLoaders: LoadingBlocks on screen; while any is shown the "slow" note appears inside it
 *   instead of as a separate floating pill, so the user never sees two loaders at once
 */
export const useNetworkStore = create((set) => ({
  pending: 0,
  slow: false,
  inlineLoaders: 0,
  begin: () => set((s) => ({ pending: s.pending + 1 })),
  end: () => set((s) => ({ pending: Math.max(0, s.pending - 1) })),
  setSlow: (slow) => set({ slow }),
  mountLoader: () => set((s) => ({ inlineLoaders: s.inlineLoaders + 1 })),
  unmountLoader: () => set((s) => ({ inlineLoaders: Math.max(0, s.inlineLoaders - 1) })),
}));
