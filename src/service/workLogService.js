import { workLogRepository } from '../repository/workLogRepository';

export const workLogService = {
  getAllLogs: async () => {
    return await workLogRepository.getAll();
  },

  addLog: async (logData) => {
    return await workLogRepository.add(logData);
  }
};
