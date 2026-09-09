import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock password database สำหรับทุก Role
// username ตรงกับ useWorkerStore / useAdminStore
const MOCK_PASSWORDS = {
  // Worker (username จาก useWorkerStore)
  w001: { password: 'admin123', isFirstLogin: true, role: 'worker' },
  w002: { password: 'admin123', isFirstLogin: true, role: 'worker' },
  w003: { password: 'admin123', isFirstLogin: true, role: 'worker' },
  w004: { password: 'admin123', isFirstLogin: true, role: 'worker' },
  w005: { password: 'admin123', isFirstLogin: true, role: 'worker' },
  w006: { password: 'admin123', isFirstLogin: true, role: 'worker' },

  // Admin (username จาก useAdminStore)
  somchai_j:   { password: 'admin123', isFirstLogin: true, role: 'admin' },
  Pimchanok_r: { password: 'admin123', isFirstLogin: true, role: 'admin' },
  Kanthida_w:  { password: 'admin123', isFirstLogin: true, role: 'admin' },

  // Superadmin (ไม่มี Store จาก Backend ยังเป็น Mock ไว้ก่อน)
  superadmin: { password: 'super1234', isFirstLogin: false, role: 'superadmin' },
};

// Redirect หลัง Login สำเร็จแยกตาม Role
export const ROLE_HOME = {
  worker:     '/worker/dashboard',
  admin:      '/admin/dashboard',
  superadmin: '/superadmin/dashboard',
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      passwords: { ...MOCK_PASSWORDS },

      // workersList = useWorkerStore workers, adminsList = useAdminStore admins
      login: (username, password, { workers = [], admins = [] }) => {
        const authData = get().passwords[username];
        if (!authData) return { success: false, error: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' };
        if (authData.password !== password) return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };

        let userInfo = null;

        if (authData.role === 'worker') {
          const worker = workers.find((w) => w.username === username);
          if (!worker) return { success: false, error: 'ไม่พบข้อมูลคนงาน' };
          if (worker.status !== 'active') return { success: false, error: 'บัญชีนี้ถูกระงับการใช้งาน' };
          userInfo = { id: worker.id, username: worker.username, fullName: worker.fullName, nickname: worker.nickname, avatar: worker.avatar };
        } else if (authData.role === 'admin') {
          const admin = admins.find((a) => a.username === username);
          if (!admin) return { success: false, error: 'ไม่พบข้อมูลแอดมิน' };
          if (admin.status !== 'active') return { success: false, error: 'บัญชีนี้ถูกระงับการใช้งาน' };
          userInfo = { id: admin.id, username: admin.username, fullName: admin.fullName, avatar: admin.avatar };
        } else if (authData.role === 'superadmin') {
          userInfo = { id: 'sa1', username: 'superadmin', fullName: 'Super Admin', avatar: '' };
        }

        set({
          isAuthenticated: true,
          currentUser: { ...userInfo, role: authData.role, isFirstLogin: authData.isFirstLogin },
        });
        return { success: true, isFirstLogin: authData.isFirstLogin, role: authData.role };
      },

      logout: () => set({ isAuthenticated: false, currentUser: null }),

      updatePassword: (newPassword) => {
        const user = get().currentUser;
        if (!user) return;
        set((state) => ({
          passwords: { ...state.passwords, [user.username]: { ...state.passwords[user.username], password: newPassword, isFirstLogin: false } },
          currentUser: { ...state.currentUser, isFirstLogin: false },
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        passwords: state.passwords,
      }),
    }
  )
);

