import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate } from '../../lib/format';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const RADIAN = Math.PI / 180;

function formatNumber(n) {
  return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function formatCompactBaht(n) {
  if (n >= 1e6) return `฿ ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `฿ ${Math.round(n / 1e3)}K`;
  return `฿ ${n}`;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-');
  const now = new Date();
  return now.getFullYear() === Number(y) && now.getMonth() + 1 === Number(m) && now.getDate() === Number(d);
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const [y, m] = dateStr.split('-');
  const now = new Date();
  return now.getFullYear() === Number(y) && now.getMonth() + 1 === Number(m);
}

function renderPercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.03) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

const PERIOD_OPTIONS = [
  { value: 'month', label: 'รายเดือน' },
  { value: 'day', label: 'รายวัน' },
  { value: 'year', label: 'รายปี' },
];

function PeriodSelect({ value, onChange }) {
  return <Dropdown value={value} onChange={onChange} options={PERIOD_OPTIONS} className="w-32" />;
}

export default function Dashboard() {
  const workers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const entries = useWorkLogStore((s) => s.entries);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);

  useEffect(() => {
    fetchWorkers();
    fetchEntries();
  }, [fetchWorkers, fetchEntries]);

  const [trendTypeFilter, setTrendTypeFilter] = useState('all');
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [breakdownPeriod, setBreakdownPeriod] = useState('month');

  const activeWorkers = useMemo(() => workers.filter((w) => w.status !== 'inactive'), [workers]);
  const entriesThisMonth = useMemo(() => entries.filter((e) => isThisMonth(e.date)), [entries]);
  const entriesToday = useMemo(() => entries.filter((e) => isToday(e.date)), [entries]);
  const workersToday = useMemo(() => new Set(entriesToday.map((e) => e.workerId)).size, [entriesToday]);

  const totalAllTime = useMemo(() => entries.reduce((sum, e) => sum + e.total, 0), [entries]);
  const totalThisMonth = useMemo(() => entriesThisMonth.reduce((sum, e) => sum + e.total, 0), [entriesThisMonth]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const typedEntries = entries.filter((e) => trendTypeFilter === 'all' || e.type === trendTypeFilter);

    if (trendPeriod === 'day') {
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (13 - i));
        const total = typedEntries
          .filter((e) => new Date(e.date).toDateString() === d.toDateString())
          .reduce((sum, e) => sum + e.total, 0);
        return { name: `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`, value: total };
      });
    }

    if (trendPeriod === 'year') {
      return Array.from({ length: 5 }, (_, i) => {
        const year = now.getFullYear() - (4 - i);
        const total = typedEntries
          .filter((e) => new Date(e.date).getFullYear() === year)
          .reduce((sum, e) => sum + e.total, 0);
        return { name: String(year + 543), value: total };
      });
    }

    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const total = typedEntries
        .filter((e) => {
          const ed = new Date(e.date);
          return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
        })
        .reduce((sum, e) => sum + e.total, 0);
      return { name: THAI_MONTHS_SHORT[d.getMonth()], value: total };
    });
  }, [entries, trendTypeFilter, trendPeriod]);

  const breakdownEntries = useMemo(() => {
    if (breakdownPeriod === 'day') return entriesToday;
    if (breakdownPeriod === 'year') return entries.filter((e) => e.date && Number(e.date.split('-')[0]) === new Date().getFullYear());
    return entriesThisMonth;
  }, [entries, entriesToday, entriesThisMonth, breakdownPeriod]);

  const breakdownTotal = useMemo(() => breakdownEntries.reduce((sum, e) => sum + e.total, 0), [breakdownEntries]);

  const breakdown = useMemo(
    () =>
      WORK_LOG_ORDER.map((key) => {
        const config = WORK_LOG_TYPES[key];
        const value = breakdownEntries.filter((e) => e.type === key).reduce((sum, e) => sum + e.total, 0);
        return { key, name: config.labelTh, color: config.chartColor, value };
      }).filter((d) => d.value > 0),
    [breakdownEntries]
  );

  const recentActivity = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id)).slice(0, 6),
    [entries]
  );

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-8">
        <div className="col-span-2 flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">ยอดชำระรวม</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-[#205e2e]">{formatNumber(totalAllTime)}</h3>
            <span className="font-medium text-gray-400">บาท</span>
          </div>
        </div>
        <div className="col-span-2 flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">ยอดชำระเดือนนี้</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-gray-700">{formatNumber(totalThisMonth)}</h3>
            <span className="font-medium text-gray-400">บาท</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-medium text-gray-600">คนงานทั้งหมด</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-gray-700">{activeWorkers.length}</h3>
            <span className="text-xs font-medium text-gray-400">คน</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-medium text-gray-600">คนงานวันนี้</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-[#568A3B]">{workersToday}</h3>
            <span className="text-xs font-medium text-gray-400">คน</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-medium text-gray-600">งานทั้งหมด</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-gray-700">{entries.length}</h3>
            <span className="text-xs font-medium text-gray-400">รายการ</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-medium text-gray-600">งานวันนี้</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-[#568A3B]">{entriesToday.length}</h3>
            <span className="text-xs font-medium text-gray-400">รายการ</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Payroll Overview</h3>
            <div className="flex gap-2">
              <PeriodSelect value={trendPeriod} onChange={setTrendPeriod} />
              <Dropdown
                value={trendTypeFilter}
                onChange={setTrendTypeFilter}
                className="w-44"
                options={[
                  { value: 'all', label: 'ประเภทงานทั้งหมด' },
                  ...WORK_LOG_ORDER.map((key) => ({ value: key, label: WORK_LOG_TYPES[key].labelTh })),
                ]}
              />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={formatCompactBaht} width={64} />
                <Tooltip formatter={(value) => [`${formatNumber(value)} บาท`, 'ยอดรวม']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Payroll Breakdown by Task</h3>
            <PeriodSelect value={breakdownPeriod} onChange={setBreakdownPeriod} />
          </div>

          <div className="flex flex-1 items-center justify-center gap-10">
            <div className="relative h-50 w-50">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={renderPercentLabel}
                  >
                    {breakdown.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-semibold text-gray-800">รวม</span>
                <span className="text-xl font-bold leading-none text-gray-900">{formatNumber(breakdownTotal)}</span>
                <span className="text-sm font-semibold text-gray-800">บาท</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {breakdown.map((entry) => (
                <div key={entry.key} className="flex items-start gap-2">
                  <div className="mt-1 h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
                    <p className="text-sm text-gray-500">{formatNumber(entry.value)} บาท</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-xl font-bold text-gray-900">Work Activity Log</h3>
          <Link to="/admin/work" className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900">
            More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <table className="w-full text-center text-sm">
          <thead className="bg-[#3F5C2B] text-white">
            <tr>
              <th className="px-4 py-3.5 pl-6 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Date</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Work Type</th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide">Qty</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Unit</th>
              <th className="px-4 py-3.5 pr-6 text-right text-xs font-semibold uppercase tracking-wide">Wages</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((entry, index) => {
              const config = WORK_LOG_TYPES[entry.type];
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-100/70 ${
                    index === recentActivity.length - 1 ? 'border-b-0' : ''
                  } ${index % 2 === 1 ? 'bg-gray-50/60' : ''}`}
                >
                  <td className="px-4 py-4 pl-6 text-left font-medium text-gray-800">{getWorkerName(entry.workerId)}</td>
                  <td className="px-4 py-4 text-gray-700">{formatDate(entry.date)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${config.badgeClass}`}>{config.labelTh}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-700">{formatNumber(config.primaryQty(entry))}</td>
                  <td className="px-4 py-4 text-gray-700">{config.primaryUnit}</td>
                  <td className="px-4 py-4 pr-6 text-right font-medium text-gray-800">{formatNumber(entry.total)} บาท</td>
                </tr>
              );
            })}
            {recentActivity.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-gray-400">
                  ยังไม่มีรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
