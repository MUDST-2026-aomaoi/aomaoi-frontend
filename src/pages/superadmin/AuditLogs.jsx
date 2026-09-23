import { useEffect, useState } from 'react';
import { useAuditLogStore } from '../../store/useAuditLogStore';
import { auditLogController } from '../../controller/auditLogController';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
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
      (log.actionBy && log.actionBy.toLowerCase().includes(searchLower)) ||
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.targetUser && log.targetUser.toLowerCase().includes(searchLower)) ||
      (log.details && log.details.toLowerCase().includes(searchLower));

    let matchDate = true;
    if (dateFilter) {
      const logDate = new Date(log.createdAt).toISOString().split('T')[0];
      matchDate = logDate === dateFilter;
    }

    return matchSearch && matchDate;
  });

  return (
    <div>
      <PageHeader title="System Audit Logs" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-lg flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user, or details..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-farm-primary"
          />
          <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-4">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-farm-primary"
          />
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
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
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Time</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Action By</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Action</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Target User</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">IP Address</th>
              <th className="px-4 py-3.5 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && auditLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-gray-400 text-center">Loading logs...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-gray-400 text-center">No logs found matching your criteria.</td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50">
                  <td className="border-r border-gray-200 px-4 py-3 text-gray-800">
                    {formatDateLong(log.createdAt)}
                  </td>
                  <td className="border-r border-gray-200 px-4 py-3 font-semibold text-gray-800">
                    {log.actionBy || '-'}
                  </td>
                  <td className="border-r border-gray-200 px-4 py-3">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="border-r border-gray-200 px-4 py-3 text-gray-800">
                    {log.targetUser || '-'}
                  </td>
                  <td className="border-r border-gray-200 px-4 py-3 text-xs font-mono text-gray-600">
                    {log.ipAddress || 'unknown'}
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
