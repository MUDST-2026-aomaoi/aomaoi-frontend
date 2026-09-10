import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../service/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const response = await authService.login(username, password);
        
        if (response.success) {
            // Save token and user data
            set({
                isAuthenticated: true,
                currentUser: response.user,
                token: response.token
            });
            // If we are storing token for Axios calls, we can set default headers here:
            // axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
            
            return { success: true, isFirstLogin: response.user.isFirstLogin, role: response.user.role };
        }
        
        return response; // returns error message
      },

      logout: () => {
          set({ isAuthenticated: false, currentUser: null, token: null });
          // delete axios.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
