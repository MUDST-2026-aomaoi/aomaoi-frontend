import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Avatar } from '../../components/ui/Avatar';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { LoadingBlock } from '../../components/ui/Loader';
import { FarmIsometric, FARM_VIEWS } from '../../components/dashboard/FarmIsometric';
import { TaskChip } from '../../components/dashboard/TaskChip';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatDateLong, formatBaht } from '../../lib/format';
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
  return <Dropdown value={value} onChange={onChange} options={periodOptions(t)} className="w-32 shrink-0" />;
}

export default function Dashboard() {
  const t = useT();
  const workers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const entries = useWorkLogStore((s) => s.entries);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const workersLoaded = useWorkerStore((s) => s.loaded);
  const entriesLoaded = useWorkLogStore((s) => s.loaded);

  useEffect(() => {
    fetchWorkers();
    fetchEntries();
  }, [fetchWorkers, fetchEntries]);

  const [breakdownPeriod, setBreakdownPeriod] = useState('month');
  // Task key under the pointer (donut slice or chip): everything else fades.
  const [hovered, setHovered] = useState(null);

  const entriesThisMonth = useMemo(() => entries.filter((e) => isThisMonth(e.date)), [entries]);
  const entriesToday = useMemo(() => entries.filter((e) => isToday(e.date)), [entries]);

  const totalAllTime = useMemo(() => entries.reduce((sum, e) => sum + e.total, 0), [entries]);
  const totalThisMonth = useMemo(() => entriesThisMonth.reduce((sum, e) => sum + e.total, 0), [entriesThisMonth]);

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

  const hoveredTask = hovered ? taskChips.find((c) => c.key === hovered) : null;

  const chipUnit = { items: t('common.items'), baht: t('common.baht') };

  const recentActivity = useMemo(
    () =>
      entries
        .filter((e) => !hovered || e.type === hovered)
        .sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id))
        .slice(0, 4),
    [entries, hovered]
  );

  if (!workersLoaded || !entriesLoaded) {
    return (
      <div className="dash-theme">
        <PageHeader title={t('nav.dashboard')} />
        <LoadingBlock fill />
      </div>
    );
  }

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
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <div className="relative min-w-0 lg:col-span-3 lg:flex lg:items-center">
          <div className="relative mx-auto w-full max-w-[900px]">
            <div className="mx-auto w-full lg:max-h-[max(420px,calc(100dvh-320px))] lg:w-[80%]" style={{ aspectRatio: FARM_VIEWS.iso.aspect }}>
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
                dimmed={hovered !== null && hovered !== c.key}
                active={hovered === c.key}
                onMouseEnter={() => setHovered(c.key)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
            {taskChips.map((c) => (
              <TaskChip key={c.key} name={c.name} count={c.count} amount={formatNumber(c.value)} percent={c.percent} color={c.color} unit={chipUnit} className="shadow-[0_4px_20px_rgba(0,0,0,0.06)]" dimmed={hovered !== null && hovered !== c.key} active={hovered === c.key} onMouseEnter={() => setHovered(c.key)} onMouseLeave={() => setHovered(null)} />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:col-span-2 lg:justify-center">
          <div className="dash-card dash-card-lift p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="min-w-0 text-sm font-bold text-[#1A1A1A] sm:text-base">{t('dash.breakdownByTask')}</h3>
              <PeriodSelect value={breakdownPeriod} onChange={setBreakdownPeriod} />
            </div>
            <div className="relative mx-auto h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={74}
                    paddingAngle={2}
                    cornerRadius={6}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                    labelLine={false}
                    label={renderPercentLabel}
                    onMouseEnter={(_, i) => setHovered(breakdown[i]?.key ?? null)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {breakdown.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} opacity={hovered && hovered !== entry.key ? 0.3 : 1} style={{ transition: 'opacity .2s', outline: 'none', cursor: 'pointer' }} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="max-w-full truncate px-6 text-xs font-medium text-[#8A8F85]">{hoveredTask ? hoveredTask.name : t('common.total')}</span>
                <span className="text-xl font-extrabold leading-tight text-[#1A1A1A]">{formatNumber(hoveredTask ? hoveredTask.value : breakdownTotal)}</span>
                <span className="text-xs font-medium text-[#8A8F85]">{t('common.baht')}</span>
              </div>
            </div>
          </div>

          {/* Work activity log: latest overall, or latest of the hovered task */}
          <div className="dash-card min-w-0 p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="min-w-0 truncate text-sm font-bold text-[#1A1A1A] sm:text-base">{t('wlog.pageTitle')}</h3>
                {hoveredTask && (
                  <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: hoveredTask.color, color: hoveredTask.key === 'cutting' ? '#1A1A1A' : '#fff' }}>
                    {hoveredTask.name}
                  </span>
                )}
              </div>
              <Link to="/work" data-test="dashboard-worklog-more" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#4F7A2B] hover:text-[#2E4A1F]">
                More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul aria-label={t('wlog.pageTitle')} className="min-h-[216px]">
              {recentActivity.map((entry) => {
                const config = WORK_LOG_TYPES[entry.type];
                const name = getWorkerName(entry.workerId);
                const date =
                  entry.startDate && entry.endDate && entry.startDate !== entry.endDate
                    ? `${formatDate(entry.startDate)} - ${formatDate(entry.endDate)}`
                    : formatDateLong(entry.startDate || entry.date);
                return (
                  <li key={entry.id} className="dash-row flex h-[54px] items-center gap-3 rounded-xl px-2">
                    <Avatar src={workers.find((w) => String(w.id) === String(entry.workerId))?.avatar} name={name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">{name}</p>
                      <p className="truncate text-[11px] text-[#8A8F85]">
                        {date} · {config.primaryQty(entry)} {config.primaryUnit}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{formatBaht(entry.total)}</p>
                      <span className="inline-block rounded-full bg-[#E6F0D6] px-2 py-0.5 text-[10px] font-bold text-[#2E4A1F]">{config.labelTh}</span>
                    </div>
                  </li>
                );
              })}
              {recentActivity.length === 0 && <li className="py-8 text-center text-sm text-[#8A8F85]">{t('common.noItemsYet')}</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
