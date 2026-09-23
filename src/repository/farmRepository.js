import api from '../service/api';

export const farmRepository = {
  getAll: async () => {
    const response = await api.get('/farms');
    return response.data;
  },

  add: async (farmData) => {
    const response = await api.post('/farms', farmData);
    return response.data;
  },

  update: async (id, farmData) => {
    const response = await api.put(`/farms/${id}`, farmData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/farms/${id}`);
    return response.data;
  }
};
