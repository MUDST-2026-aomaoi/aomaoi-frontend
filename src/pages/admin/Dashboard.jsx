import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, Wallet, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatBaht, formatDate } from '../../lib/format';

function isToday(dateStr) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function Dashboard() {
  const workers = useWorkerStore((s) => s.workers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const entries = useWorkLogStore((s) => s.entries);

  const activeWorkers = useMemo(() => workers.filter((w) => w.isActive), [workers]);
  const entriesThisMonth = useMemo(() => entries.filter((e) => isThisMonth(e.date)), [entries]);
  const entriesToday = useMemo(() => entriesThisMonth.filter((e) => isToday(e.date)), [entriesThisMonth]);
  const totalWagesThisMonth = useMemo(
    () => entriesThisMonth.reduce((sum, e) => sum + e.total, 0),
    [entriesThisMonth]
  );
  const recent = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [entries]
  );

  const stats = [
    { label: 'คนงานทั้งหมด', value: activeWorkers.length, icon: Users },
    {
      label: 'รายการเดือนนี้',
      value: entriesThisMonth.length,
      hint: `+${entriesToday.length} วันนี้`,
      icon: ClipboardList,
    },
    { label: 'ค่าแรงรวมเดือนนี้', value: formatBaht(totalWagesThisMonth), icon: Wallet },
  ];

  const shortcuts = [
    { to: '/admin/workers', label: 'จัดการคนงาน', icon: Users },
    ...WORK_LOG_ORDER.map((key) => ({
      to: `/admin/work/${WORK_LOG_TYPES[key].path}`,
      label: WORK_LOG_TYPES[key].labelTh,
      icon: WORK_LOG_TYPES[key].icon,
    })),
    { to: '/admin/overview', label: 'ภาพรวม', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-farm-text">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-farm-primary/10 text-farm-primary">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-farm-text/60">{stat.label}</p>
              <p className="text-xl font-semibold text-farm-text">{stat.value}</p>
              {stat.hint && <p className="text-xs text-farm-accent">{stat.hint}</p>}
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-farm-text/80">ทางลัด</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {shortcuts.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-farm-secondary/40 bg-white p-4 text-center text-xs font-medium text-farm-text shadow-sm transition-colors hover:border-farm-primary hover:bg-farm-primary/5"
            >
              <s.icon size={20} className="text-farm-primary" />
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-farm-text/80">กิจกรรมล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-farm-secondary/30 text-farm-text/60">
                <th className="py-2 pr-4 font-medium">วันที่</th>
                <th className="py-2 pr-4 font-medium">ประเภทงาน</th>
                <th className="py-2 pr-4 font-medium">คนงาน</th>
                <th className="py-2 pr-4 text-right font-medium">ค่าแรง</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((entry) => (
                <tr key={entry.id} className="border-b border-farm-secondary/15 last:border-0">
                  <td className="py-2 pr-4 text-farm-text/80">{formatDate(entry.date)}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{WORK_LOG_TYPES[entry.type].labelTh}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{getWorkerName(entry.workerId)}</td>
                  <td className="py-2 pr-4 text-right font-medium text-farm-text">{formatBaht(entry.total)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-farm-text/50">
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
