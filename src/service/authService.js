import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const authService = {
  login: async (username, password) => {
    try {
      // Calling the Spring Boot backend
      const response = await axios.post(`${API_URL}/login`, { username, password });
      
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
