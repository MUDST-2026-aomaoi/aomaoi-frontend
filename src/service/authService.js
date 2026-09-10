import api from './api';

export const authService = {
  login: async (username, password) => {
    try {
      // Calling the Spring Boot backend
      const response = await api.post('/auth/login', { username, password });
      
      // The backend should return a token and user details
      return { 
        success: true, 
        user: response.data.user, 
        token: response.data.token 
      };
    } catch (error) {
      // Handle backend errors (e.g. 401 Unauthorized)
      return { 
        success: false, 
        error: error.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' 
      };
    }
  }
};
