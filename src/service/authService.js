import { authRepository } from '../repository/authRepository';

export const authService = {
  login: async (username, password) => {
    try {
      const data = await authRepository.login(username, password);
      return { 
        success: true, 
        user: data.user, 
        token: data.token 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' 
      };
    }
  }
};
