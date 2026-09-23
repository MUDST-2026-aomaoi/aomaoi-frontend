import api from '../service/api';

export const authRepository = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  }
};
