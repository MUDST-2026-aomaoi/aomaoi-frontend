import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { CURRENT_SUPER_ADMIN } from '../../config/currentUser';
import { useFarmStore } from '../../store/useFarmStore';
import { useAdminStore } from '../../store/useAdminStore';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const RADIAN = Math.PI / 180;
const FARM_LINE_COLORS = ['#3b82f6', '#ef4444', '#22c55e'];
const FARM_DONUT_COLORS = ['#1F3C28', '#6A9E48', '#B4D355'];

function formatNumber(n) {
  return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function formatCompactBaht(n) {
  if (n >= 1e6) return `฿ ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `฿ ${Math.round(n / 1e3)}K`;
  return `฿ ${n}`;
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

function PeriodSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-500 focus:outline-none"
      >
        <option value="month">รายเดือน</option>
        <option value="day">รายวัน</option>
        <option value="year">รายปี</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-gray-400" />
    </div>
  );
}

function farmValueForPeriod(farm, period) {
  if (period === 'day') return Math.round(farm.monthlyWages / 30);
  if (period === 'year') return farm.totalWages;
  return farm.monthlyWages;
}

export default function SuperAdminDashboard() {
  const allFarms = useFarmStore((s) => s.farms);
  const allAdmins = useAdminStore((s) => s.admins);

  const [trendPeriod, setTrendPeriod] = useState('month');
  const [trendFarmFilter, setTrendFarmFilter] = useState('all');
  const [breakdownPeriod, setBreakdownPeriod] = useState('month');

  const farms = useMemo(() => allFarms.filter((f) => f.status !== 'inactive'), [allFarms]);
  const admins = useMemo(() => allAdmins.filter((a) => a.status !== 'inactive'), [allAdmins]);

  const totalAllTime = useMemo(() => farms.reduce((sum, f) => sum + f.totalWages, 0), [farms]);
  const totalThisMonth = useMemo(() => farms.reduce((sum, f) => sum + f.monthlyWages, 0), [farms]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const point = { name: THAI_MONTHS_SHORT[d.getMonth()] };
      farms.forEach((f, idx) => {
        const wave = Math.sin((i + idx * 2) * 0.9) * 0.12;
        point[f.id] = Math.max(0, Math.round(f.monthlyWages * (0.5 + i * 0.1 + wave)));
      });
      return point;
    });
  }, [farms]);

  const breakdown = useMemo(
    () =>
      farms.map((f, idx) => ({
        key: f.id,
        name: f.name,
        color: FARM_DONUT_COLORS[idx % FARM_DONUT_COLORS.length],
        value: farmValueForPeriod(f, breakdownPeriod),
      })),
    [farms, breakdownPeriod]
  );

  const breakdownTotal = useMemo(() => breakdown.reduce((sum, e) => sum + e.value, 0), [breakdown]);

  const visibleTrendFarms = useMemo(
    () => farms.filter((f) => trendFarmFilter === 'all' || f.id === trendFarmFilter),
    [farms, trendFarmFilter]
  );

  return (
    <div>
      <PageHeader title="Dashboard" admin={CURRENT_SUPER_ADMIN} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">ยอดชำระรวม</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-[#205e2e]">{formatNumber(totalAllTime)}</h3>
            <span className="font-medium text-gray-400">บาท</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">ยอดชำระเดือนนี้</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-gray-700">{formatNumber(totalThisMonth)}</h3>
            <span className="font-medium text-gray-400">บาท</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">All Farms</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-gray-700">{farms.length}</h3>
            <span className="font-medium text-gray-400">ฟาร์ม</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">All Admin</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-gray-700">{admins.length}</h3>
            <span className="font-medium text-gray-400">คน</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Payroll Overview</h3>
            <div className="flex gap-2">
              <PeriodSelect value={trendPeriod} onChange={setTrendPeriod} />
              <div className="relative">
                <select
                  value={trendFarmFilter}
                  onChange={(e) => setTrendFarmFilter(e.target.value)}
                  className="appearance-none rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-500 focus:outline-none"
                >
                  <option value="all">ฟาร์มทั้งหมด</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={formatCompactBaht} width={64} />
                <Tooltip formatter={(value, key) => [`${formatNumber(value)} บาท`, farms.find((f) => f.id === key)?.name ?? key]} />
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

          <div className="mt-3 flex flex-wrap items-center gap-6">
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

        <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Payroll Breakdown by Farms</h3>
            <PeriodSelect value={breakdownPeriod} onChange={setBreakdownPeriod} />
          </div>

          <div className="flex flex-1 items-center justify-center gap-10">
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
                <p className="text-xs text-gray-600">รวม</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(breakdownTotal)}</p>
                <p className="text-xs text-gray-600">บาท</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {breakdown.map((entry) => (
                <div key={entry.key} className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full" style={{ background: entry.color }} />
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
    </div>
  );
}
