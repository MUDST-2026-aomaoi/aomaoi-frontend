import { useMemo, useState, useEffect } from 'react';
import { Clock, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../components/ui/Dropdown';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useAuthStore } from '../../controller/authController';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';

const PERIOD_OPTIONS = [
  { value: 'month', label: 'รายเดือน' },
  { value: 'day', label: 'รายวัน' },
  { value: 'year', label: 'รายปี' },
];

const TASK_BAR_COLORS = {
  cutting: '#224213',
  planting: '#ADC565',
  watering: '#689142',
  spraying: '#517A34',
};

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

function isThisYear(dateStr) {
  if (!dateStr) return false;
  const [y] = dateStr.split('-');
  return new Date().getFullYear() === Number(y);
}

export default function WorkerDashboard() {
  const currentUser = useAuthStore(state => state.currentUser);
  const myWorkerId = currentUser?.id || '1';
  const [taskPeriod, setTaskPeriod] = useState('month');
  
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const fetchMyBalance = useWorkLogStore((s) => s.fetchMyBalance);
  useEffect(() => {
    fetchEntries();
    fetchMyBalance();
  }, [fetchEntries, fetchMyBalance]);

  const allEntries = useWorkLogStore((s) => s.entries);
  const myBalance = useWorkLogStore((s) => s.myBalance);
  
  const myEntries = useMemo(() => allEntries.filter(e => String(e.workerId) === String(myWorkerId)), [allEntries, myWorkerId]);
  const myEntriesThisMonth = useMemo(() => myEntries.filter(e => isThisMonth(e.date)), [myEntries]);
  const myEntriesToday = useMemo(() => myEntries.filter(e => isToday(e.date)), [myEntries]);
  const myEntriesThisYear = useMemo(() => myEntries.filter(e => isThisYear(e.date)), [myEntries]);
  
  const totalBalanceThisMonth = useMemo(() => myEntriesThisMonth.reduce((sum, e) => sum + Number(e.total || 0), 0), [myEntriesThisMonth]);
  const totalSalaryAdvance = Number(myBalance?.totalAdvances ?? 0);
  const remainingBalance = myBalance?.remainingBalance ?? totalBalanceThisMonth;
  const isInDebt = myBalance ? Boolean(myBalance.inDebt || Number(myBalance.remainingBalance) < 0) : remainingBalance < 0;

  const recentActivities = useMemo(() => {
    return [...myEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [myEntries]);

  const filteredTaskEntries = useMemo(() => {
    if (taskPeriod === 'day') return myEntriesToday;
    if (taskPeriod === 'year') return myEntriesThisYear;
    return myEntriesThisMonth;
  }, [taskPeriod, myEntriesToday, myEntriesThisYear, myEntriesThisMonth]);

  const taskPeriodTotal = useMemo(
    () => filteredTaskEntries.reduce((sum, e) => sum + Number(e.total || 0), 0),
    [filteredTaskEntries]
  );

  const statsBoxes = useMemo(() => {
    return WORK_LOG_ORDER.map(type => {
      const typeEntries = filteredTaskEntries.filter(e => e.type === type);
      const totalThb = typeEntries.reduce((sum, e) => sum + Number(e.total || 0), 0);
      
      let amount = 0;
      let unit = '';
      if (type === 'cutting') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.rows || 0), 0);
        unit = 'แถว';
      } else if (type === 'planting') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.furrows || 0), 0);
        unit = 'ร่อง';
      } else if (type === 'watering') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.days || 0), 0);
        unit = 'วัน';
      } else if (type === 'spraying') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.tanks || 0), 0);
        unit = 'ถัง';
      }

      const pct = taskPeriodTotal > 0 ? Math.round((totalThb / taskPeriodTotal) * 100) : 0;

      return {
        id: type,
        title: WORK_LOG_TYPES[type].labelTh,
        amountNum: amount,
        unit: unit,
        thbStr: formatBaht(totalThb),
        pct: pct,
        color: TASK_BAR_COLORS[type] || '#224213',
        icon: WORK_LOG_TYPES[type].icon
      };
    });
  }, [filteredTaskEntries, taskPeriodTotal]);

  const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const chartBars = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      
      const count = myEntries.filter(e => {
        if (!e.date) return false;
        const [ey, em] = e.date.split('-');
        return Number(ey) === year && Number(em) - 1 === month;
      }).length;
      
      return { label: THAI_MONTHS_SHORT[month], value: count };
    });
  }, [myEntries]);

  return (
    <div className="flex flex-col gap-4 w-full pb-2">
      
      {/* 1. แถบแจ้งเตือนด้านบน */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-normal text-farm-text shadow-sm">
        <div className="text-[#91712A]">
          <Clock size={22} strokeWidth={2.5} />
        </div>
        <span>
          บันทึกงานล่าสุด: {recentActivities[0] ? formatDate(recentActivities[0].date) : 'ไม่มีข้อมูล'} · ทำงานแล้ว {new Set(myEntriesThisMonth.map(e => e.date)).size} วันในเดือนนี้
        </span>
      </div>

      {/* 2. Top Cards (3 กล่องตาม Figma 544:1026) */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Earning */}
        <div className="col-span-2 bg-[#3F4F3A] rounded-xl p-5 text-white shadow-sm flex flex-col justify-between min-h-[150px]">
          <div className="flex items-center gap-4 mb-1">
            <div className="bg-white text-[#91712A] p-2.5 rounded-lg shrink-0">
              <Wallet size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold leading-tight">Total Earning</h2>
              <p className="text-[13px] text-white/80 font-normal mt-0.5">Overview This month</p>
            </div>
          </div>
          <div data-test="worker-total-earning" className="text-[42px] font-bold leading-none tracking-tight">
            {formatBaht(totalBalanceThisMonth)} <span className="text-[26px] font-semibold ml-1 tracking-normal">THB</span>
          </div>
        </div>

        {/* Total SalaryAdvance */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[150px]">
          <div>
            <h2 className="text-xl font-semibold text-farm-text">Total SalaryAdvance</h2>
            <p className="text-[13px] text-gray-400 font-normal mt-1">Overview remainingBalance</p>
          </div>
          <div data-test="worker-total-advance" className="text-[36px] font-bold text-[#2E5119] leading-none tracking-tight">
            {formatBaht(totalSalaryAdvance)} <span className="text-[20px] font-semibold ml-1 tracking-normal">THB</span>
          </div>
        </div>

        {/* RemainingBalance */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[150px]">
          <div>
            <h2 className="text-xl font-semibold text-farm-text">RemainingBalance</h2>
            <p className="text-[13px] text-gray-400 font-normal mt-1">Overview remainingBalance</p>
          </div>
          <div data-test="worker-remaining-balance" className={`text-[36px] font-bold leading-none tracking-tight ${isInDebt ? 'text-[#C80303]' : 'text-[#2E5119]'}`}>
            {formatBaht(remainingBalance)} <span className="text-[20px] font-semibold ml-1 tracking-normal">THB</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Total Work Done (Bar Chart) & Tasks (Donut + Breakdown + Period Filter) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[323px]">
        
        {/* Bar Chart: Total Work Done */}
        <div className="bg-white rounded-xl px-7 py-5 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-farm-text font-bold text-[22px] mb-2">Total Work Done</h3>
          <div className="flex-1 w-full min-h-[235px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBars} margin={{ top: 20, right: 10, left: -25, bottom: 0 }} barSize={46}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 'normal' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 'normal' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#D9D9D9" activeBar={{ fill: '#2E5119' }} radius={[4, 4, 0, 0]}>
                  {chartBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartBars.length - 1 ? '#2E5119' : '#D9D9D9'} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fill: '#111827', fontSize: 13, fontWeight: '500' }} dy={-6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks (Donut Chart + 4 Task Cards + Period Select Dropdown) */}
        <div className="bg-white rounded-xl px-7 py-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-farm-text font-bold text-[22px]">Tasks</h3>
            <Dropdown
              value={taskPeriod}
              onChange={setTaskPeriod}
              options={PERIOD_OPTIONS}
              className="w-[200px]"
              dataTest="worker-tasks-period"
            />
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Donut Chart ด้านซ้าย (จัดกึ่งกลางในพื้นที่ฝั่งซ้ายอย่างสมมาตร) */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-[210px] h-[210px] flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsBoxes}
                      innerRadius="55%"
                      outerRadius="92%"
                      dataKey="pct"
                      stroke="none"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        if (value === 0) return null;
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                            {`${value}%`}
                          </text>
                        );
                      }}
                    >
                      {statsBoxes.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 m-auto flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[14px] font-bold text-farm-text leading-tight">รวม</span>
                  <span data-test="worker-tasks-total" className="text-[20px] font-bold text-farm-text leading-tight my-1">{formatBaht(taskPeriodTotal)}</span>
                  <span className="text-[14px] font-bold text-farm-text leading-tight">บาท</span>
                </div>
              </div>
            </div>

            {/* 4 Task Breakdown Cards ด้านขวา (กว้าง 200px ตรงกับ Dropdown ด้านบนเป๊ะตาม Figma) */}
            <div className="w-full sm:w-[200px] shrink-0 flex flex-col gap-2.5">
              {statsBoxes.map((stat) => (
                <div key={stat.id} data-test={`worker-task-card-${stat.id}`} className="flex items-center bg-white rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.07)] border border-gray-100/80 overflow-hidden h-[46px]">
                  <div className="w-[13px] self-stretch shrink-0" style={{ backgroundColor: stat.color }}></div>
                  <div className="flex-1 flex items-center justify-between pl-2.5 pr-3 py-1">
                    <div className="flex flex-col justify-center text-left leading-tight">
                      <span className="text-[12px] font-medium text-black leading-tight">{stat.title}</span>
                      <span className="text-[10px] text-[#989898] font-normal leading-tight mt-0.5">{stat.amountNum} {stat.unit}</span>
                      <span className="text-[10px] text-[#989898] font-normal leading-tight">{stat.thbStr} บาท</span>
                    </div>
                    <div className="text-[20px] font-bold text-[#224213] shrink-0">{stat.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Recent Activity (เต็มความกว้างด้านล่างตาม Figma 544:1026) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-farm-text font-bold text-[20px]">Recent Activity</h3>
          <Link to="/history" className="text-[16px] font-medium text-farm-text hover:text-[#708238] flex items-center gap-1.5">
            More <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </div>
        
        <div className="space-y-2.5">
          {recentActivities.map((item) => {
            const Icon = WORK_LOG_TYPES[item.type].icon;
            return (
              <div key={item.id} className="flex items-center justify-between bg-white border border-[#F2F2F2] rounded-lg px-4 py-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4">
                  <div className="text-[#C09644] shrink-0">
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-farm-text leading-tight">
                      {WORK_LOG_TYPES[item.type].labelTh} <span className="text-black font-bold mx-1">·</span> <span className="font-normal text-gray-700 text-[14px]">{WORK_LOG_TYPES[item.type].summaryText(item)}</span>
                    </p>
                    <p className="text-[13px] font-normal text-[#989898] mt-0.5">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[18px] font-semibold text-[#517A33]">+{formatBaht(item.total)}</p>
                </div>
              </div>
            );
          })}
          {recentActivities.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">ยังไม่มีประวัติการทำงาน</p>
          )}
        </div>
      </div>

    </div>
  );
}
