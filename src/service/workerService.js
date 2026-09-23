import { workerRepository } from '../repository/workerRepository';

export const workerService = {
  getAllWorkers: async () => {
    return await workerRepository.getAll();
  },

  addWorker: async (workerData) => {
    return await workerRepository.add(workerData);
  },

  updateWorker: async (id, workerData) => {
    return await workerRepository.update(id, workerData);
  },

  deleteWorker: async (id) => {
    return await workerRepository.delete(id);
  },

  resetWorkerPassword: async (id, newPassword) => {
    return await workerRepository.resetPassword(id, newPassword);
  }
};
