import axios from 'axios';
import { useAuthStore } from '../controller/authController';

// Create a shared Axios instance that ALL services should use
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// REQUEST Interceptor: Automatically attach the JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE Interceptor: If the backend returns 401 (expired/invalid token),
// silently log the user out and bounce them to the login page. No error shown.
api.interceptors.response.use(
  (response) => response, // If successful, just pass it through
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're already on the login page
      const isLoginRequest = error.config.url?.includes('/auth/login');
      if (!isLoginRequest) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
