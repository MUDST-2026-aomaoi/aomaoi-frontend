import api from '../service/api';

export const workerRepository = {
  getAll: async () => {
    const response = await api.get('/workers');
    return response.data;
  },

  add: async (workerData) => {
    const response = await api.post('/workers', workerData);
    return response.data;
  },

  update: async (id, workerData) => {
    const response = await api.put(`/workers/${id}`, workerData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/workers/${id}`);
    return response.data;
  },

  resetPassword: async (id, newPassword) => {
    const response = await api.post(`/workers/${id}/reset-password`, { newPassword });
    return response.data;
  }
};
