import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock password database (ในอนาคตข้อมูลนี้จะมาจาก Backend)
// username ตรงกับ useWorkerStore
const MOCK_PASSWORDS = {
  w001: { password: 'admin123', isFirstLogin: true },
  w002: { password: 'admin123', isFirstLogin: true },
  w003: { password: 'admin123', isFirstLogin: true },
  w004: { password: 'admin123', isFirstLogin: true },
  w005: { password: 'admin123', isFirstLogin: true },
  w006: { password: 'admin123', isFirstLogin: true },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      // เก็บ passwords แยกจาก currentUser เพื่อให้แก้ไขได้
      passwords: { ...MOCK_PASSWORDS },

      login: (username, password, workersList) => {
        // หา worker จาก useWorkerStore ที่ส่งเข้ามา
        const worker = workersList.find((w) => w.username === username);
        if (!worker) return { success: false, error: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' };
        if (worker.status !== 'active') return { success: false, error: 'บัญชีนี้ถูกระงับการใช้งาน' };

        const authData = get().passwords[username];
        if (!authData) return { success: false, error: 'ไม่พบข้อมูลรหัสผ่าน' };
        if (authData.password !== password) return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };

        set({
          isAuthenticated: true,
          currentUser: {
            id: worker.id,
            username: worker.username,
            fullName: worker.fullName,
            nickname: worker.nickname,
            avatar: worker.avatar,
            role: 'worker',
            isFirstLogin: authData.isFirstLogin,
          },
        });
        return { success: true, isFirstLogin: authData.isFirstLogin };
      },

      logout: () => {
        set({ isAuthenticated: false, currentUser: null });
      },

      updatePassword: (newPassword) => {
        const user = get().currentUser;
        if (!user) return;
        set((state) => ({
          passwords: {
            ...state.passwords,
            [user.username]: { password: newPassword, isFirstLogin: false },
          },
          currentUser: { ...state.currentUser, isFirstLogin: false },
        }));
      },
    }),
    {
      name: 'auth-storage', // เก็บลง localStorage ให้ Login ค้างไว้แม้รีเฟรช
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        passwords: state.passwords,
      }),
    }
  )
);
