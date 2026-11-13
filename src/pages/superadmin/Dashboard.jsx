import { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { LoadingBlock } from '../../components/ui/Loader';
import { FarmArchipelago } from '../../components/dashboard/FarmArchipelago';
import { useFarmStore } from '../../store/useFarmStore';
import { useAdminStore } from '../../store/useAdminStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useAuthStore } from '../../controller/authController';
import { getLocale, periodOptions, useT } from '../../i18n';

const RADIAN = Math.PI / 180;
const FARM_DONUT_COLORS = ['#2E4A1F', '#4F7A2B', '#A8D04A', '#7DA33A', '#C98626'];
const OTHER_COLOR = '#B9C0AE';
const TOP_N = 5;
const MAX_TILES = 8;

function formatNumber(n) {
  return Number(n).toLocaleString(getLocale(), { maximumFractionDigits: 0 });
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

export default function SuperAdminDashboard() {
  const t = useT();
  const allFarms = useFarmStore((s) => s.farms);
  const fetchFarms = useFarmStore((s) => s.fetchFarms);
  const allAdmins = useAdminStore((s) => s.admins);
  const fetchAdmins = useAdminStore((s) => s.fetchAdmins);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const farmsLoaded = useFarmStore((s) => s.loaded);
  const adminsLoaded = useAdminStore((s) => s.loaded);
  const entriesLoaded = useWorkLogStore((s) => s.loaded);
  const workersLoaded = useWorkerStore((s) => s.loaded);
  const dataLoaded = farmsLoaded && adminsLoaded && entriesLoaded && workersLoaded;

  useEffect(() => {
    fetchFarms();
    fetchAdmins();
    fetchEntries();
    fetchWorkers();
  }, [fetchFarms, fetchAdmins, fetchEntries, fetchWorkers]);

  const [trendFarmFilter, setTrendFarmFilter] = useState('all');
  const [breakdownPeriod, setBreakdownPeriod] = useState('month');
  const [hovered, setHovered] = useState(null);

  const farms = useMemo(() => allFarms.filter((f) => f.status !== 'inactive'), [allFarms]);
  const admins = useMemo(() => allAdmins.filter((a) => a.status !== 'inactive'), [allAdmins]);

  const allEntries = useWorkLogStore((s) => s.entries);
  const allWorkers = useWorkerStore((s) => s.workers);

  // KPI cards follow the farm picked on the map / donut (all farms when nothing is picked).
  const scopedEntries = useMemo(() => {
    if (trendFarmFilter === 'all') return allEntries;
    return allEntries.filter((e) => {
      const worker = allWorkers.find((w) => String(w.id) === String(e.workerId));
      return worker && String(worker.farmId) === String(trendFarmFilter);
    });
  }, [allEntries, allWorkers, trendFarmFilter]);

  const totalAllTime = useMemo(() => scopedEntries.reduce((sum, e) => sum + e.total, 0), [scopedEntries]);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return scopedEntries.filter((e) => {
      if (!e.date) return false;
      const [y, m] = e.date.split('-');
      return Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1;
    }).reduce((sum, e) => sum + e.total, 0);
  }, [scopedEntries]);

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

  // Farms grow without limit: rank by payroll, show the top few and fold the rest into "others".
  const ranked = useMemo(() => [...breakdown].sort((x, y) => y.value - x.value), [breakdown]);
  const pct = (v) => (breakdownTotal > 0 ? Math.round((v / breakdownTotal) * 100) : 0);
  const maxValue = ranked[0]?.value || 0;

  const donutData = useMemo(() => {
    if (ranked.length <= TOP_N) return ranked;
    const rest = ranked.slice(TOP_N).reduce((sum, e) => sum + e.value, 0);
    return [...ranked.slice(0, TOP_N), { key: 'others', name: t('dash.others'), color: OTHER_COLOR, value: rest }];
  }, [ranked, t]);

  const heroFarms = useMemo(() => {
    const list = ranked.length > MAX_TILES ? ranked.slice(0, MAX_TILES - 1) : ranked;
    return list.map((f) => ({ id: f.key, name: f.name, value: f.value, share: maxValue > 0 ? f.value / maxValue : 0, percent: pct(f.value), color: f.color }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranked, maxValue, breakdownTotal]);

  const overflow = useMemo(() => {
    if (ranked.length <= MAX_TILES) return null;
    const rest = ranked.slice(MAX_TILES - 1);
    const value = rest.reduce((sum, e) => sum + e.value, 0);
    return { count: rest.length, value, percent: pct(value) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranked, breakdownTotal]);

  const moreLabel = useMemo(() => (n) => t('dash.moreFarms', { n }), [t]);

  const selectedName = farms.find((f) => f.id === trendFarmFilter)?.name;
  const toggleFarm = (id) => setTrendFarmFilter((cur) => (cur === id ? 'all' : id));
  const active = hovered ?? (trendFarmFilter === 'all' ? null : trendFarmFilter);
  // Donut centre follows hover first, then the selected farm, else the grand total.
  const focusEntry = active ? [...donutData, ...breakdown].find((e) => e.key === active) : null;

  const currentUser = useAuthStore((s) => s.currentUser);

  if (!dataLoaded) {
    return (
      <div>
        <PageHeader title={t('nav.dashboard')} />
        <LoadingBlock fill />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t('nav.dashboard')} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="flex flex-col justify-center rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('dash.totalPaid')}{selectedName && <span className="ml-1.5 text-xs font-semibold text-[#4F7A2B]">· {selectedName}</span>}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-[#205e2e]">{formatNumber(totalAllTime)}</h3>
            <span className="font-medium text-gray-400">{t('common.baht')}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('dash.paidThisMonth')}{selectedName && <span className="ml-1.5 text-xs font-semibold text-[#4F7A2B]">· {selectedName}</span>}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-gray-700">{formatNumber(totalThisMonth)}</h3>
            <span className="font-medium text-gray-400">{t('common.baht')}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('nav.farms')}{selectedName && <span className="ml-1.5 text-xs font-semibold text-[#4F7A2B]">· {selectedName}</span>}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-gray-700">{trendFarmFilter === 'all' ? farms.length : 1}</h3>
            <span className="font-medium text-gray-400">{t('farm.unit')}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 font-medium text-gray-600">{t('farm.allAdmins')}{selectedName && <span className="ml-1.5 text-xs font-semibold text-[#4F7A2B]">· {selectedName}</span>}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold sm:text-4xl text-gray-700">{trendFarmFilter === 'all' ? admins.length : admins.filter((a) => String(a.farmId) === String(trendFarmFilter)).length}</h3>
            <span className="font-medium text-gray-400">{t('common.people')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <div className="relative min-w-0 lg:col-span-3 lg:flex lg:items-start">
          <FarmArchipelago
            farms={heroFarms}
            overflow={overflow}
            hoveredId={active}
            onHover={setHovered}
            onSelect={toggleFarm}
            unit={t('common.baht')}
            moreLabel={moreLabel}
            formatValue={formatNumber}
            className="max-w-[880px]"
          />
        </div>

        <div className="min-w-0 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5 lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="min-w-0 text-sm font-bold text-[#1A1A1A] sm:text-base">{t('dash.breakdownByFarms')}</h3>
            <PeriodSelect value={breakdownPeriod} onChange={setBreakdownPeriod} />
          </div>

          <div className="relative mx-auto h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={94}
                  paddingAngle={2}
                  cornerRadius={6}
                  stroke="none"
                  isAnimationActive={false}
                  onMouseEnter={(_, i) => setHovered(donutData[i]?.key ?? null)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(_, i) => donutData[i] && donutData[i].key !== 'others' && toggleFarm(donutData[i].key)}
                  style={{ cursor: 'pointer' }}
                  labelLine={false}
                  label={renderPercentLabel}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} opacity={active && active !== entry.key ? 0.3 : 1} style={{ transition: 'opacity .2s', outline: 'none' }} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-7 text-center leading-tight">
              <p className="max-w-full truncate text-[11px] text-[#8A8F85]">{focusEntry?.name ?? t('common.total')}</p>
              <p className="text-xl font-extrabold text-[#1A1A1A]">{formatNumber(focusEntry ? focusEntry.value : breakdownTotal)}</p>
              <p className="text-[11px] text-[#8A8F85]">{t('common.baht')}</p>
            </div>
          </div>

          <ul className="mt-2 flex flex-col gap-0.5">
            {donutData.map((entry) => (
              <li key={entry.key}>
                <button
                  type="button"
                  disabled={entry.key === 'others'}
                  onMouseEnter={() => setHovered(entry.key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => toggleFarm(entry.key)}
                  className={`relative flex w-full items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-left text-xs transition ${active && active !== entry.key ? 'opacity-40' : ''} ${
                    trendFarmFilter === entry.key ? 'bg-[#E6F0D6]' : entry.key === 'others' ? '' : 'hover:bg-[#F1F5E8]'
                  }`}
                >
                  <span aria-hidden className="absolute inset-y-0 left-0 rounded-lg opacity-15" style={{ width: `${pct(entry.value)}%`, backgroundColor: entry.color }} />
                  <span className="relative h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="relative min-w-0 flex-1 truncate font-medium text-[#1A1A1A]">{entry.name}</span>
                  <span className="relative text-[#8A8F85]">{formatNumber(entry.value)}</span>
                  <span className="relative w-9 text-right font-bold text-[#2E4A1F]">{pct(entry.value)}%</span>
                </button>
              </li>
            ))}
          </ul>

          {selectedName && (
            <div className="mt-2 flex justify-center">
              <button type="button" onClick={() => setTrendFarmFilter('all')} className="rounded-full px-3 py-1 text-xs font-semibold text-[#4F7A2B] hover:bg-[#E6F0D6]">
                {t('dash.clearSelection')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
