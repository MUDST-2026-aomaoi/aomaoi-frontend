import { create } from 'zustand';

export const useAuditLogStore = create((set) => ({
  auditLogs: [],
  isLoading: false,
  loaded: false, // first fetch settled (success or failure)
  error: null,

  setAuditLogs: (auditLogs) => set({ auditLogs }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
