import { auditLogRepository } from '../repository/auditLogRepository';

export const auditLogService = {
  getAllAuditLogs: async () => {
    return await auditLogRepository.getAll();
  }
};
