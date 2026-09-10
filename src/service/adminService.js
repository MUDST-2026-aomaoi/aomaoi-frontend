import api from './api';

export const adminService = {
  getAllAdmins: async () => {
    const response = await api.get('/admins');
    return response.data;
  },

  addAdmin: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  updateAdmin: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  deleteAdmin: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  }
};
