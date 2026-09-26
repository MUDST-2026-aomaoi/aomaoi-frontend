import { useEffect, useState } from 'react';
import { useAuditLogStore } from '../../store/useAuditLogStore';
import { auditLogController } from '../../controller/auditLogController';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DateInput } from '../../components/ui/DateInput';
import { SearchInput } from '../../components/ui/SearchInput';
import { PageHeader } from '../../layouts/admin/PageHeader';

export default function AuditLogs() {
  const { auditLogs, isLoading, error } = useAuditLogStore();
  
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    auditLogController.fetchAuditLogs();
  }, []);

  const handleRefresh = () => {
    auditLogController.fetchAuditLogs();
  };

  // Helper to format date (e.g. 23 ก.ย. 2026)
  const formatDateLong = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter logs by search text and date
  const filtered = auditLogs.filter((log) => {
    const searchLower = search.toLowerCase();
    const matchSearch = 
      ((log.performedBy || log.actionBy) && (log.performedBy || log.actionBy).toLowerCase().includes(searchLower)) ||
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.targetUser && log.targetUser.toLowerCase().includes(searchLower)) ||
      (log.details && log.details.toLowerCase().includes(searchLower));

    let matchDate = true;
    if (dateFilter) {
      const dateStr = log.timestamp || log.createdAt;
      if (dateStr) {
        try {
          const logDate = new Date(dateStr).toISOString().split('T')[0];
          matchDate = logDate === dateFilter;
        } catch(e) {
          matchDate = false;
        }
      } else {
        matchDate = false;
      }
    }

    return matchSearch && matchDate;
  });

  return (
    <div>
      <PageHeader title="System Audit Logs" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by action, user, or details..." className="max-w-lg flex-1" />

        <div className="flex flex-wrap items-start gap-4">
          <DateInput value={dateFilter} onChange={setDateFilter} placeholder="กรองตามวันที่" className="w-48" />
          <Button variant="subtle" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading logs</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-center text-sm">
          <thead className="bg-[#3F5C2B] text-white">
            <tr>
              <th className="px-4 py-3.5 font-medium">Time</th>
              <th className="px-4 py-3.5 font-medium">Action By</th>
              <th className="px-4 py-3.5 font-medium">Action</th>
              <th className="px-4 py-3.5 font-medium">Target User</th>
              <th className="px-4 py-3.5 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-gray-400 text-center">Loading logs...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-gray-400 text-center">No logs found matching your criteria.</td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">
                    {formatDateLong(log.timestamp || log.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {log.performedBy || log.actionBy || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {log.targetUser || '-'}
                  </td>
                  <td className="px-4 py-3 text-left text-gray-600 max-w-xs truncate" title={log.details}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
