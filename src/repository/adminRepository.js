import api from '../service/api';

export const adminRepository = {
  getAll: async () => {
    const response = await api.get('/admins');
    return response.data;
  },

  add: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  update: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  }
};
