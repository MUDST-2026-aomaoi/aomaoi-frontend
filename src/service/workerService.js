import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workers';

export const workerService = {
  getAllWorkers: async () => {
    // Calls GET /api/workers
    const response = await axios.get(API_URL);
    return response.data;
  },

  addWorker: async (workerData) => {
    // Calls POST /api/workers
    const response = await axios.post(API_URL, workerData);
    return response.data;
  },

  updateWorker: async (id, workerData) => {
    // Calls PUT /api/workers/{id}
    const response = await axios.put(`${API_URL}/${id}`, workerData);
    return response.data;
  },

  deleteWorker: async (id) => {
    // Calls DELETE /api/workers/{id}
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};
