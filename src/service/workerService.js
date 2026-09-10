import api from './api';

export const workerService = {
  getAllWorkers: async () => {
    // Calls GET /api/workers
    const response = await api.get('/workers');
    return response.data;
  },

  addWorker: async (workerData) => {
    // Calls POST /api/workers
    const response = await api.post('/workers', workerData);
    return response.data;
  },

  updateWorker: async (id, workerData) => {
    // Calls PUT /api/workers/{id}
    const response = await api.put(`/workers/${id}`, workerData);
    return response.data;
  },

  deleteWorker: async (id) => {
    // Calls DELETE /api/workers/{id}
    const response = await api.delete(`/workers/${id}`);
    return response.data;
  }
};
