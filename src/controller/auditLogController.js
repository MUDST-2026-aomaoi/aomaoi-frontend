import { auditLogService } from '../service/auditLogService';
import { useAuditLogStore } from '../store/useAuditLogStore';

export const auditLogController = {
  fetchAuditLogs: async () => {
    const { setLoading, setAuditLogs, setError } = useAuditLogStore.getState();
    setLoading(true);
    setError(null);
    try {
      const data = await auditLogService.getAllAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }
};
