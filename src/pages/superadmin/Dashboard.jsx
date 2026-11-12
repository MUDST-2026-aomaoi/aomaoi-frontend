import { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useFarmStore } from '../../store/useFarmStore';
import { useAdminStore } from '../../store/useAdminStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useAuthStore } from '../../controller/authController';
import { monthShort } from '../../lib/format';
import { getLocale, periodOptions, useT } from '../../i18n';

const RADIAN = Math.PI / 180;
const FARM_LINE_COLORS = ['#3b82f6', '#ef4444', '#22c55e'];
const FARM_DONUT_COLORS = ['#1F3C28', '#6A9E48', '#B4D355'];

function formatNumber(n) {
  return Number(n).toLocaleString(getLocale(), { maximumFractionDigits: 0 });
}

function formatCompactBaht(n) {
  if (n >= 1e6) return `฿ ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `฿ ${Math.round(n / 1e3)}K`;
  return `฿ ${n}`;
}

const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function PeriodSelect({ value, onChange }) {
  const t = useT();
  return <Dropdown value={value} onChange={onChange} options={periodOptions(t)} className="w-32" />;
}

function farmValueForPeriod(farm, period) {
  if (period === 'day') return Math.round(farm.monthlyWages / 30);
  if (period === 'year') return farm.totalWages;
  return farm.monthlyWages;
}

export default function SuperAdminDashboard() {
  const t = useT();
  const allFarms = useFarmStore((s) => s.farms);
  const fetchFarms = useFarmStore((s) => s.fetchFarms);
  const allAdmins = useAdminStore((s) => s.admins);
  const fetchAdmins = useAdminStore((s) => s.fetchAdmins);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);

  useEffect(() => {
    fetchFarms();
    fetchAdmins();
    fetchEntries();
    fetchWorkers();
  }, [fetchFarms, fetchAdmins, fetchEntries, fetchWorkers]);

  const [trendPeriod, setTrendPeriod] = useState('month');
  const [trendFarmFilter, setTrendFarmFilter] = useState('all');
  const [breakdownPeriod, setBreakdownPeriod] = useState('month');

  const farms = useMemo(() => allFarms.filter((f) => f.status !== 'inactive'), [allFarms]);
  const admins = useMemo(() => allAdmins.filter((a) => a.status !== 'inactive'), [allAdmins]);

  const allEntries = useWorkLogStore((s) => s.entries);
  const allWorkers = useWorkerStore((s) => s.workers);

  const totalAllTime = useMemo(() => allEntries.reduce((sum, e) => sum + e.total, 0), [allEntries]);
  
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return allEntries.filter(e => {
      if (!e.date) return false;
      const [y, m] = e.date.split('-');
      return Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1;
    }).reduce((sum, e) => sum + e.total, 0);
  }, [allEntries]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const point = { name: monthShort(month) };
      
      farms.forEach((f) => {
        point[f.id] = 0;
      });

      allEntries.forEach(entry => {
        if (!entry.date) return;
        const [y, m] = entry.date.split('-');
        if (Number(y) === year && Number(m) - 1 === month) {
          const worker = allWorkers.find(w => String(w.id) === String(entry.workerId));
          if (worker && worker.farmId) {
            point[worker.farmId] = (point[worker.farmId] || 0) + entry.total;
          }
        }
      });
      return point;
    });
  }, [farms, allEntries, allWorkers, t]);

  const breakdown = useMemo(() => {
    return farms.map((f, idx) => {
      let value = 0;
      const now = new Date();
      allEntries.forEach(entry => {
        const worker = allWorkers.find(w => String(w.id) === String(entry.workerId));
        if (worker && String(worker.farmId) === String(f.id)) {
          if (!entry.date) return;
          const [y, m, d] = entry.date.split('-');
          const entryYear = Number(y);
          const entryMonth = Number(m) - 1;
          const entryDate = Number(d);

          if (breakdownPeriod === 'day') {
            if (entryYear === now.getFullYear() && entryMonth === now.getMonth() && entryDate === now.getDate()) value += entry.total;
          } else if (breakdownPeriod === 'month') {
            if (entryYear === now.getFullYear() && entryMonth === now.getMonth()) value += entry.total;
          } else if (breakdownPeriod === '6M') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            if (new Date(entryYear, entryMonth, entryDate) >= sixMonthsAgo) value += entry.total;
          } else if (breakdownPeriod === 'year') {
            if (entryYear === now.getFullYear()) value += entry.total;
          }
        }
      });
      return {
        key: f.id,
        name: f.name,
        color: FARM_DONUT_COLORS[idx % FARM_DONUT_COLORS.length],
        value: value,
      };
    });
  }, [farms, breakdownPeriod, allEntries, allWorkers]);

  const breakdownTotal = useMemo(() => breakdown.reduce((sum, e) => sum + e.value, 0), [breakdown]);

  const visibleTrendFarms = useMemo(
    () => farms.filter((f) => trendFarmFilter === 'all' || f.id === trendFarmFilter),
    [farms, trendFarmFilter]
  );

  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <div>
      <PageHeader title={t('nav.dashboard')} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('dash.totalPaid')}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-[#205e2e]">{formatNumber(totalAllTime)}</h3>
            <span className="font-medium text-gray-400">{t('common.baht')}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('dash.paidThisMonth')}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-gray-700">{formatNumber(totalThisMonth)}</h3>
            <span className="font-medium text-gray-400">{t('common.baht')}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('nav.farms')}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-gray-700">{farms.length}</h3>
            <span className="font-medium text-gray-400">{t('farm.unit')}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('farm.allAdmins')}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-gray-700">{admins.length}</h3>
            <span className="font-medium text-gray-400">{t('common.people')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
            <h3 className="min-w-0 text-base font-bold text-gray-900 sm:text-lg">{t('dash.payrollOverview')}</h3>
            <div className="flex w-full min-w-0 gap-2 sm:w-auto">
              <PeriodSelect value={trendPeriod} onChange={setTrendPeriod} />
              <Dropdown
                value={trendFarmFilter}
                onChange={setTrendFarmFilter}
                className="min-w-0 flex-1 sm:w-44 sm:flex-none"
                options={[{ value: 'all', label: t('adm.allFarms') }, ...farms.map((f) => ({ value: f.id, label: f.name }))]}
              />
            </div>
          </div>

          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={formatCompactBaht} width={64} />
                <Tooltip formatter={(value, key) => [`${formatNumber(value)} ${t('common.baht')}`, farms.find((f) => f.id === key)?.name ?? key]} />
                {visibleTrendFarms.map((f) => {
                  const color = FARM_LINE_COLORS[farms.indexOf(f) % FARM_LINE_COLORS.length];
                  return (
                    <Area
                      key={f.id}
                      type="monotone"
                      dataKey={f.id}
                      name={f.name}
                      stroke={color}
                      strokeWidth={2}
                      fill={color}
                      fillOpacity={0.15}
                      dot={{ r: 3, fill: color }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            {visibleTrendFarms.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: FARM_LINE_COLORS[farms.indexOf(f) % FARM_LINE_COLORS.length] }}
                />
                {f.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="min-w-0 text-base font-bold text-gray-900 sm:text-lg">{t('dash.breakdownByFarms')}</h3>
            <PeriodSelect value={breakdownPeriod} onChange={setBreakdownPeriod} />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 min-[1400px]:flex-row min-[1400px]:gap-8">
            <div className="relative h-50 w-50 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={2}
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
                <p className="text-xs text-gray-600">{t('common.total')}</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(breakdownTotal)}</p>
                <p className="text-xs text-gray-600">{t('common.baht')}</p>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 min-[1400px]:w-auto min-[1400px]:min-w-56">
              {breakdown.map((entry) => (
                <div key={entry.key} className="flex min-w-0 items-stretch overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: entry.color }} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">{entry.name}</p>
                      <p className="truncate text-xs text-gray-500">{formatNumber(entry.value)} {t('common.baht')}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-gray-800">
                      {breakdownTotal > 0 ? Math.round((entry.value / breakdownTotal) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
