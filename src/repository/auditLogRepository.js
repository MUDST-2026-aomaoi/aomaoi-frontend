import api from '../service/api';

export const auditLogRepository = {
  getAll: async () => {
    const response = await api.get('/superadmin/audit-logs');
    return response.data;
  }
};
