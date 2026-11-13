import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Avatar } from '../../components/ui/Avatar';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { FarmIsometric, FARM_VIEWS } from '../../components/dashboard/FarmIsometric';
import { TaskChip } from '../../components/dashboard/TaskChip';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatDateLong, formatBaht, monthShort, displayYear } from '../../lib/format';
import { getLocale, periodOptions, useT } from '../../i18n';

const RADIAN = Math.PI / 180;

const DASH_COLORS = {
  cutting: '#A8D04A',
  planting: '#2E4A1F',
  watering: '#4F7A2B',
  spraying: '#7DA33A',
};
const LABEL_FILL = { cutting: '#1A1A1A' };

// Hero chip positions (lg+), as % of the hero illustration box
const CHIP_POS = {
  planting: { left: 0, top: '10%' },
  watering: { left: 0, top: '60%' },
  cutting: { right: 0, top: '10%' },
  spraying: { right: 0, top: '60%' },
};

function formatNumber(n) {
  return Number(n).toLocaleString(getLocale(), { maximumFractionDigits: 0 });
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

function renderPercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) {
  if (percent < 0.03) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill={LABEL_FILL[payload?.key] || '#fff'} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

function PeriodSelect({ value, onChange }) {
  const t = useT();
  return <Dropdown value={value} onChange={onChange} options={periodOptions(t)} className="min-w-0 flex-1 sm:w-32 sm:flex-none" />;
}

export default function Dashboard() {
  const t = useT();
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

  const entriesThisMonth = useMemo(() => entries.filter((e) => isThisMonth(e.date)), [entries]);
  const entriesToday = useMemo(() => entries.filter((e) => isToday(e.date)), [entries]);

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
        return { name: `${d.getDate()} ${monthShort(d.getMonth())}`, value: total };
      });
    }

    if (trendPeriod === 'year') {
      return Array.from({ length: 5 }, (_, i) => {
        const year = now.getFullYear() - (4 - i);
        const total = typedEntries
          .filter((e) => new Date(e.date).getFullYear() === year)
          .reduce((sum, e) => sum + e.total, 0);
        return { name: String(displayYear(year)), value: total };
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
      return { name: monthShort(d.getMonth()), value: total };
    });
  }, [entries, trendTypeFilter, trendPeriod, t]);

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
        return { key, name: config.labelTh, color: DASH_COLORS[key], value };
      }).filter((d) => d.value > 0),
    [breakdownEntries, t]
  );

  const taskChips = useMemo(
    () =>
      WORK_LOG_ORDER.map((key) => {
        const list = breakdownEntries.filter((e) => e.type === key);
        const value = list.reduce((sum, e) => sum + e.total, 0);
        return {
          key,
          name: WORK_LOG_TYPES[key].labelTh,
          color: DASH_COLORS[key],
          count: list.length,
          value,
          percent: breakdownTotal > 0 ? Math.round((value / breakdownTotal) * 100) : 0,
        };
      }),
    [breakdownEntries, breakdownTotal, t]
  );

  const chipUnit = { items: t('common.items'), baht: t('common.baht') };

  const recentActivity = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id)).slice(0, 6),
    [entries]
  );

  return (
    <div className="dash-theme">
      <PageHeader title={t('nav.dashboard')} />

      {/* Row 1: KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: t('dash.totalPaid'), value: formatNumber(totalAllTime), unit: 'THB' },
          { label: t('dash.paidThisMonth'), value: formatNumber(totalThisMonth), unit: 'THB' },
          { label: t('dash.totalJobs'), value: entries.length, unit: t('common.items') },
          { label: t('dash.jobsToday'), value: entriesToday.length, unit: t('common.items'), leaf: true },
        ].map((k) => (
          <div key={k.label} className="dash-card dash-card-lift flex min-w-0 flex-col justify-center p-4 sm:p-5">
            <p className="mb-1.5 truncate text-xs font-medium text-[#8A8F85] sm:text-[13px]">{k.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`truncate text-3xl font-extrabold leading-none tracking-tight ${k.leaf ? 'text-[#4F7A2B]' : 'text-[#2E4A1F]'}`}>{k.value}</h3>
              <span className="text-xs font-medium text-[#8A8F85]">{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: hero + charts */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <div className="relative min-w-0 lg:col-span-3 lg:flex lg:items-center">
          <div className="relative mx-auto w-full max-w-[900px]">
            <div className="mx-auto w-full lg:w-[80%]" style={{ aspectRatio: FARM_VIEWS.iso.aspect }}>
              <FarmIsometric className="h-full w-full" />
            </div>
            {taskChips.map((c) => (
              <TaskChip
                key={c.key}
                name={c.name}
                count={c.count}
                amount={formatNumber(c.value)}
                percent={c.percent}
                color={c.color}
                unit={chipUnit}
                className="absolute hidden lg:flex"
                style={CHIP_POS[c.key]}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
            {taskChips.map((c) => (
              <TaskChip key={c.key} name={c.name} count={c.count} amount={formatNumber(c.value)} percent={c.percent} color={c.color} unit={chipUnit} className="shadow-[0_4px_20px_rgba(0,0,0,0.06)]" />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:col-span-2">
          <div className="dash-card dash-card-lift p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="min-w-0 text-sm font-bold text-[#1A1A1A] sm:text-base">{t('dash.breakdownByTask')}</h3>
              <PeriodSelect value={breakdownPeriod} onChange={setBreakdownPeriod} />
            </div>
            <div className="relative mx-auto h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={2} cornerRadius={6} dataKey="value" stroke="none" labelLine={false} label={renderPercentLabel}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-[#8A8F85]">{t('common.total')}</span>
                <span className="text-xl font-extrabold leading-tight text-[#1A1A1A]">{formatNumber(breakdownTotal)}</span>
                <span className="text-xs font-medium text-[#8A8F85]">{t('common.baht')}</span>
              </div>
            </div>
          </div>

          <div className="dash-card dash-card-lift min-w-0 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="min-w-0 text-sm font-bold text-[#1A1A1A] sm:text-base">{t('dash.payrollOverview')}</h3>
              <div className="flex gap-2">
                <PeriodSelect value={trendPeriod} onChange={setTrendPeriod} />
                <Dropdown
                  value={trendTypeFilter}
                  onChange={setTrendTypeFilter}
                  className="min-w-0 flex-1 sm:w-36 sm:flex-none"
                  options={[
                    { value: 'all', label: t('worker.allTypes') },
                    ...WORK_LOG_ORDER.map((key) => ({ value: key, label: WORK_LOG_TYPES[key].labelTh })),
                  ]}
                />
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A8D04A" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#A8D04A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#E8ECE0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A8F85' }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A8F85' }} tickFormatter={formatCompactBaht} width={60} />
                  <Tooltip
                    cursor={{ stroke: '#A8D04A', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${formatNumber(value)} ${t('common.baht')}`, t('dash.tooltipTotal')]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4F7A2B" strokeWidth={2.5} fill="url(#dashArea)" dot={false} activeDot={{ r: 5, fill: '#2E4A1F', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: activity log */}
      <div className="dash-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
          <h3 className="min-w-0 text-sm font-bold text-[#1A1A1A] sm:text-base">{t('wlog.pageTitle')}</h3>
          <Link to="/work" data-test="dashboard-worklog-more" className="flex items-center gap-1 text-sm font-semibold text-[#4F7A2B] hover:text-[#2E4A1F]">
            More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div tabIndex={0} role="region" aria-label={t('wlog.pageTitle')} className="overflow-x-auto">
          <table className="rtable w-full min-w-[560px] border-collapse text-center text-xs sm:text-sm">
            <thead className="bg-[#2E4A1F] text-white">
              <tr>
                <th className="px-5 py-3.5 text-left font-medium sm:px-6">{t('col.name')}</th>
                <th className="px-3 py-3.5 font-medium sm:px-4">{t('col.date')}</th>
                <th className="px-3 py-3.5 font-medium sm:px-4">{t('col.workType')}</th>
                <th className="px-3 py-3.5 font-medium sm:px-4">{t('col.qty')}</th>
                <th className="px-3 py-3.5 font-medium sm:px-4">{t('col.unit')}</th>
                <th className="px-3 py-3.5 pr-5 text-right font-medium sm:px-4 sm:pr-6">{t('col.wages')}</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((entry) => {
                const config = WORK_LOG_TYPES[entry.type];
                const name = getWorkerName(entry.workerId);
                return (
                  <tr key={entry.id} className="dash-row border-b border-[#F0F2EA] last:border-0">
                    <td className="px-5 py-3.5 text-left font-medium text-[#1A1A1A] sm:px-6">
                      <div className="flex items-center gap-3">
                        <Avatar src={workers.find((w) => String(w.id) === String(entry.workerId))?.avatar} name={name} />
                        <span>{name}</span>
                      </div>
                    </td>
                    <td data-label={t('col.date')} className="px-3 py-3.5 text-[#1A1A1A] sm:px-4">
                      {entry.startDate && entry.endDate && entry.startDate !== entry.endDate
                        ? `${formatDate(entry.startDate)} - ${formatDate(entry.endDate)}`
                        : formatDateLong(entry.startDate || entry.date)}
                    </td>
                    <td data-label={t('col.workType')} className="px-3 py-3.5 sm:px-4">
                      <span className="inline-block min-w-20 rounded-full bg-[#E6F0D6] px-4 py-1.5 text-xs font-bold text-[#2E4A1F]">{config.labelTh}</span>
                    </td>
                    <td data-label={t('col.qty')} className="px-3 py-3.5 text-[#1A1A1A] sm:px-4">{config.primaryQty(entry)}</td>
                    <td data-label={t('col.unit')} className="px-3 py-3.5 text-[#1A1A1A] sm:px-4">{config.primaryUnit}</td>
                    <td data-label={t('col.wages')} className="px-3 py-3.5 pr-5 text-right font-semibold text-[#1A1A1A] sm:px-4 sm:pr-6">{formatBaht(entry.total)}</td>
                  </tr>
                );
              })}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-[#8A8F85]">
                    {t('common.noItemsYet')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
