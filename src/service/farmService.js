import { farmRepository } from '../repository/farmRepository';

export const farmService = {
  getAllFarms: async () => {
    return await farmRepository.getAll();
  },

  addFarm: async (farmData) => {
    return await farmRepository.add(farmData);
  },

  updateFarm: async (id, farmData) => {
    return await farmRepository.update(id, farmData);
  },

  deleteFarm: async (id) => {
    return await farmRepository.delete(id);
  }
};
