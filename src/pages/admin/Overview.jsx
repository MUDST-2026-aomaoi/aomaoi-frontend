import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES } from '../../config/workLogTypes';
import { formatBaht, formatDate } from '../../lib/format';

export default function Overview() {
  const workers = useWorkerStore((s) => s.workers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const entries = useWorkLogStore((s) => s.entries);

  const [workerFilter, setWorkerFilter] = useState('all');

  const filtered = useMemo(() => {
    const list = workerFilter === 'all' ? entries : entries.filter((e) => e.workerId === workerFilter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, workerFilter]);

  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.total, 0), [filtered]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-farm-text">ภาพรวม</h1>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="w-56 rounded-lg border border-farm-secondary/50 bg-white px-3 py-2 text-sm text-farm-text outline-none focus:border-farm-primary focus:ring-1 focus:ring-farm-primary"
          >
            <option value="all">คนงานทั้งหมด</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName}
              </option>
            ))}
          </select>
          <p className="text-sm text-farm-text/70">
            รวมทั้งหมด: <span className="font-semibold text-farm-primary">{formatBaht(total)}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-farm-secondary/30 text-farm-text/60">
                <th className="py-2 pr-4 font-medium">วันที่</th>
                <th className="py-2 pr-4 font-medium">ประเภทงาน</th>
                <th className="py-2 pr-4 font-medium">คนงาน</th>
                <th className="py-2 pr-4 font-medium">รายละเอียด</th>
                <th className="py-2 pr-4 text-right font-medium">ค่าแรง</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-farm-secondary/15 last:border-0">
                  <td className="py-2 pr-4 text-farm-text/80">{formatDate(entry.date)}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{WORK_LOG_TYPES[entry.type].labelTh}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{getWorkerName(entry.workerId)}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{WORK_LOG_TYPES[entry.type].summaryText(entry)}</td>
                  <td className="py-2 pr-4 text-right font-medium text-farm-text">{formatBaht(entry.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-farm-text/50">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
