import { useMemo, useEffect } from 'react';
import { Clock, Wallet, ArrowDownToLine, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useAuthStore } from '../../controller/authController';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isToday(dateStr) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function WorkerDashboard() {
  const currentUser = useAuthStore(state => state.currentUser);
  const myWorkerId = currentUser?.id || '1';
  
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
  
  const totalBalanceThisMonth = useMemo(() => myEntriesThisMonth.reduce((sum, e) => sum + e.total, 0), [myEntriesThisMonth]);
  const todayIncome = useMemo(() => myEntries.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.total, 0), [myEntries]);
  const remainingBalance = myBalance?.remainingBalance ?? totalBalanceThisMonth;
  const isInDebt = myBalance ? Boolean(myBalance.inDebt || Number(myBalance.remainingBalance) < 0) : remainingBalance < 0;

  const recentActivities = useMemo(() => {
    return [...myEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [myEntries]);

  const statsBoxes = useMemo(() => {
    return WORK_LOG_ORDER.map(type => {
      const typeEntries = myEntriesThisMonth.filter(e => e.type === type);
      const totalThb = typeEntries.reduce((sum, e) => sum + e.total, 0);
      
      let amount = 0;
      let unit = '';
      if (type === 'cutting') {
        amount = typeEntries.reduce((sum, e) => sum + e.rows, 0);
        unit = 'แถว';
      } else if (type === 'planting') {
        amount = typeEntries.reduce((sum, e) => sum + e.furrows, 0);
        unit = 'ร่อง';
      } else if (type === 'watering') {
        amount = typeEntries.reduce((sum, e) => sum + e.days, 0);
        unit = 'วัน';
      } else if (type === 'spraying') {
        amount = typeEntries.reduce((sum, e) => sum + e.tanks, 0);
        unit = 'ถัง';
      }

      const pct = totalBalanceThisMonth > 0 ? Math.round((totalThb / totalBalanceThisMonth) * 100) : 0;

      return {
        id: type,
        title: WORK_LOG_TYPES[type].labelTh,
        amountNum: amount,
        unit: unit,
        thbStr: formatBaht(totalThb),
        pct: pct,
        icon: WORK_LOG_TYPES[type].icon
      };
    });
  }, [myEntriesThisMonth, totalBalanceThisMonth]);

  const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const chartBars = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      
      const count = myEntries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      }).length;
      
      return { label: THAI_MONTHS_SHORT[month], value: count };
    });
  }, [myEntries]);

  const donutColors = ['#1C3F1B', '#708238', '#A9C46C', '#D2E1A7']; 

  return (
    <div className="flex flex-col gap-3.5 w-full pb-2">
      
      {/* 1. แถบแจ้งเตือนด้านบน */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-normal text-farm-text shadow-sm">
        <div className="text-[#91712A]">
          <Clock size={22} strokeWidth={2.5} />
        </div>
        <span>
          บันทึกงานล่าสุด: {recentActivities[0] ? formatDate(recentActivities[0].date) : 'ไม่มีข้อมูล'} · ทำงานแล้ว {new Set(myEntriesThisMonth.map(e => e.date)).size} วันในเดือนนี้
        </span>
      </div>

      {/* 2. Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* My Balance */}
        <div className="col-span-1 bg-[#3B4D36] rounded-xl p-5 text-white shadow-sm flex flex-col justify-between min-h-[142px]">
          <div className="flex items-center gap-3.5 mb-1">
            <div className="bg-white text-[#91712A] p-2.5 rounded-lg shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold leading-tight">My balance</h2>
              <p className="text-[13px] text-white/80 font-normal mt-0.5">Overview This month</p>
            </div>
          </div>
          <div className="text-[36px] font-bold leading-none tracking-tight">{formatBaht(totalBalanceThisMonth)} <span className="text-[20px] font-semibold ml-1 tracking-normal">THB</span></div>
        </div>

        {/* Remaining Balance */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[142px]">
          <div>
            <h2 className="text-xl font-semibold text-farm-text">RemainingBalance</h2>
            <p className="text-[13px] text-gray-400 font-normal mt-1">Overview remainingBalance</p>
          </div>
          <div className={`text-[36px] font-bold leading-none tracking-tight ${isInDebt ? 'text-[#C80303]' : 'text-[#3B4D36]'}`}>
            {formatBaht(remainingBalance)} <span className="text-[20px] font-semibold ml-1 tracking-normal">THB</span>
          </div>
        </div>

        {/* Today's Income */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[142px]">
          <div>
            <h2 className="text-xl font-semibold text-farm-text">Today's income</h2>
            <p className="text-[13px] text-gray-400 font-normal mt-1">Overview today</p>
          </div>
          <div className="text-[36px] font-bold text-[#3B4D36] leading-none tracking-tight">{formatBaht(todayIncome)} <span className="text-[20px] font-semibold ml-1 tracking-normal">THB</span></div>
        </div>

        {/* Payment Status */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[142px]">
          <h2 className="text-[15px] font-medium text-gray-400 mb-2">สถานะการจ่ายเงิน</h2>
          <div className="bg-[#D1A344]/30 text-[#91712A] px-6 py-2 rounded-full font-semibold flex items-center gap-2 text-lg mb-2">
            <div className="border-[2.5px] border-[#91712A] rounded-full p-0.5">
              <ArrowDownToLine size={16} strokeWidth={3} />
            </div>
            รอจ่าย
          </div>
          <p className="text-gray-400 font-normal text-[12px]">รอบจ่ายถัดไป: 31 สิงหาคม 2569</p>
        </div>
      </div>

      <div className="mt-0.5">
        <h2 className="text-[24px] font-bold text-farm-text leading-tight">Total Work Done</h2>
      </div>

      {/* 3. Middle Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statsBoxes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="bg-[#FFFDF4] border-l-4 border-[#D1A344] px-4 py-2.5 rounded-lg flex items-center gap-3 m-3 mb-2">
                <Icon size={22} strokeWidth={2.5} className="text-[#D1A344]" />
                <span className="font-semibold text-farm-text text-[17px]">{item.title}</span>
              </div>
              
              <div className="px-5 pb-4 text-left mt-1">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-3xl font-semibold text-farm-text leading-none">{item.amountNum}</span>
                  <span className="text-[14px] font-normal text-gray-400">{item.unit}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[20px] font-medium text-farm-text leading-none">{item.thbStr}</span>
                  <span className="text-[13px] font-normal text-gray-400">บาท</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Row */}
      <div className="grid grid-cols-3 gap-4 h-[355px]">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-farm-text font-bold text-[18px] mb-2">Total Work Done</h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBars} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={36}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 'normal' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 'normal' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#E5E7EB" activeBar={{ fill: '#2B3E26' }} radius={[4, 4, 0, 0]}>
                  {chartBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartBars.length - 1 ? '#2B3E26' : '#E5E7EB'} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fill: '#4b5563', fontSize: 13, fontWeight: '500' }} dy={-6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-farm-text font-bold text-[18px] mb-1 w-full text-left">Tasks by Month</h3>
          
          <div className="relative w-full h-[145px] flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsBoxes}
                  innerRadius="55%"
                  outerRadius="90%"
                  dataKey="pct"
                  stroke="none"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
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
                  {statsBoxes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 m-auto flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-[12px] font-normal text-farm-text">รวม</span>
              <span className="text-[20px] font-bold text-farm-text leading-tight mt-0.5">{formatBaht(totalBalanceThisMonth)}</span>
              <span className="text-[12px] font-normal text-farm-text">บาท</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2.5 mt-3">
            {statsBoxes.map((stat, idx) => (
              <div key={stat.id} className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* แถบสีด้านซ้ายสุด (ยืดเต็มความสูง) */}
                <div className="w-[12px] self-stretch shrink-0" style={{ backgroundColor: donutColors[idx] }}></div>
                
                {/* เนื้อหาด้านในกรอบ */}
                <div className="flex-1 flex items-center justify-between p-2.5 pl-3">
                  <div className="flex flex-col justify-center text-left">
                    <span className="text-[13px] font-semibold text-gray-800 leading-tight">{stat.title}</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">{stat.amountNum} {stat.unit}</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight">{stat.thbStr} บาท</span>
                  </div>
                  <div className="text-[22px] font-bold text-[#2B3E26] shrink-0">{stat.pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-farm-text font-bold text-[18px]">Recent Activity</h3>
            <Link to="/history" className="text-[15px] font-medium text-farm-text hover:text-[#708238] flex items-center gap-1">
              More <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            {recentActivities.map((item) => {
              const Icon = WORK_LOG_TYPES[item.type].icon;
              return (
                <div key={item.id} className="flex items-center justify-between bg-white border border-[#F2F2F2] rounded-lg px-3.5 py-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3.5">
                    <div className="text-[#D1A344] shrink-0">
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-farm-text leading-tight">
                        {WORK_LOG_TYPES[item.type].labelTh} <span className="text-gray-400 font-medium mx-1">·</span> <span className="font-normal text-gray-500 text-[13px]">{WORK_LOG_TYPES[item.type].summaryText(item)}</span>
                      </p>
                      <p className="text-[12px] font-normal text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[16px] font-semibold text-[#537626]">+{formatBaht(item.total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
