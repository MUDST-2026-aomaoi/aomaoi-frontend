import { useMemo } from 'react';
import { Clock, Wallet, ArrowDownToLine, ArrowRight } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
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
  const { myWorkerId } = useOutletContext();
  const allEntries = useWorkLogStore((s) => s.entries);
  
  const myEntries = useMemo(() => allEntries.filter(e => e.workerId === myWorkerId), [allEntries, myWorkerId]);
  const myEntriesThisMonth = useMemo(() => myEntries.filter(e => isThisMonth(e.date)), [myEntries]);
  
  const totalBalanceThisMonth = useMemo(() => myEntriesThisMonth.reduce((sum, e) => sum + e.total, 0), [myEntriesThisMonth]);
  const todayIncome = useMemo(() => myEntries.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.total, 0), [myEntries]);

  const recentActivities = useMemo(() => {
    return [...myEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
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

  const chartBars = [
    { label: 'มี.ค.', value: 35 },
    { label: 'เม.ย.', value: 37 },
    { label: 'พ.ค.', value: 30 },
    { label: 'ก.ค.', value: 25 },
    { label: 'ส.ค.', value: 27 },
  ];

  const donutColors = ['#1C3F1B', '#708238', '#A9C46C', '#D2E1A7']; 

  return (
    <div className="flex flex-col gap-4 h-full max-w-[1200px] w-full pb-8">
      
      {/* 1. แถบแจ้งเตือนด้านบน */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium text-farm-text shadow-sm">
        <div className="text-[#91712A]">
          <Clock size={20} strokeWidth={2} />
        </div>
        <span>
          บันทึกงานล่าสุด: {recentActivities[0] ? formatDate(recentActivities[0].date) : 'ไม่มีข้อมูล'} · ทำงานแล้ว {new Set(myEntriesThisMonth.map(e => e.date)).size} วันในเดือนนี้
        </span>
      </div>

      {/* 2. Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* My Balance */}
        <div className="col-span-2 bg-[#3B4D36] rounded-xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white text-[#91712A] p-2.5 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">My balance</h2>
              <p className="text-[13px] text-white/80 font-medium">Overview This month</p>
            </div>
          </div>
          <div className="text-[40px] font-extrabold leading-none tracking-tight">{formatBaht(totalBalanceThisMonth)} <span className="text-2xl font-bold ml-1 tracking-normal">THB</span></div>
        </div>

        {/* Today's Income */}
        <div className="col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px]">
          <div>
            <h2 className="text-[17px] font-bold text-farm-text">Today's income</h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">Overview today</p>
          </div>
          <div className="text-[34px] font-extrabold text-[#3B4D36] leading-none tracking-tight">{formatBaht(todayIncome)} <span className="text-xl font-bold ml-1 tracking-normal">THB</span></div>
        </div>

        {/* Payment Status */}
        <div className="col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[140px]">
          <h2 className="text-[15px] font-bold text-gray-400 mb-3">สถานะการจ่ายเงิน</h2>
          <div className="bg-[#D1A344]/30 text-[#91712A] px-6 py-2 rounded-full font-bold flex items-center gap-2 text-[15px] mb-2.5">
            <div className="border-[2px] border-[#91712A] rounded-full p-0.5">
              <ArrowDownToLine size={14} strokeWidth={3} />
            </div>
            รอจ่าย
          </div>
          <p className="text-gray-400 font-medium text-[11px]">รอบจ่ายถัดไป: 31 สิงหาคม 2569</p>
        </div>
      </div>

      <div className="mt-1">
        <h2 className="text-2xl font-extrabold text-farm-text">Total Work Done</h2>
      </div>

      {/* 3. Middle Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statsBoxes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="bg-[#FFFDF4] px-4 py-2.5 rounded-lg flex items-center gap-3 m-3 border border-[#F3EFE6]">
                <Icon size={20} strokeWidth={2.5} className="text-[#D1A344]" />
                <span className="font-extrabold text-farm-text text-[15px]">{item.title}</span>
              </div>
              
              <div className="px-5 pb-5 text-left mt-1">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[28px] font-extrabold text-farm-text leading-none">{item.amountNum}</span>
                  <span className="text-[13px] font-bold text-gray-400">{item.unit}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[17px] font-extrabold text-farm-text leading-none">{item.thbStr}</span>
                  <span className="text-[11px] font-bold text-gray-400">บาท</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Row */}
      <div className="grid grid-cols-3 gap-4 h-[320px]">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-farm-text font-extrabold text-[17px] mb-4">Total Work Done</h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBars} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={34}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} domain={[0, 40]} ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40]} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#E5E7EB" activeBar={{ fill: '#2B3E26' }} radius={[4, 4, 0, 0]}>
                  {chartBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartBars.length - 1 ? '#2B3E26' : '#E5E7EB'} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fill: '#374151', fontSize: 12, fontWeight: '900' }} dy={-6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-farm-text font-extrabold text-[17px] mb-2 w-full text-left">Tasks by Month</h3>
          
          <div className="relative w-full h-[140px] flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsBoxes}
                  innerRadius="55%"
                  outerRadius="90%"
                  dataKey="pct"
                  stroke="none"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.45;
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
            
            <div className="absolute inset-0 m-auto flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-[11px] font-bold text-farm-text">รวม</span>
              <span className="text-lg font-extrabold text-farm-text leading-tight">{formatBaht(totalBalanceThisMonth)}</span>
              <span className="text-[11px] font-bold text-farm-text">บาท</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-4 mt-6">
            {statsBoxes.map((stat, idx) => (
              <div key={stat.id} className="flex items-center gap-3">
                <div className="w-1.5 h-[42px] rounded-full shrink-0" style={{ backgroundColor: donutColors[idx] }}></div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[12px] font-bold text-gray-800 leading-tight">{stat.title}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{stat.amountNum} {stat.unit}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight">{stat.thbStr} บาท</span>
                </div>
                <div className="text-[22px] font-extrabold text-farm-text shrink-0">{stat.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-farm-text font-extrabold text-[17px]">Recent Activity</h3>
            <Link to="/worker/history" className="text-sm font-bold text-farm-text hover:text-[#708238] flex items-center gap-1">
              More <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentActivities.map((item) => {
              const Icon = WORK_LOG_TYPES[item.type].icon;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-[#D1A344] shrink-0">
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[14px] font-extrabold text-farm-text">
                        {WORK_LOG_TYPES[item.type].labelTh} <span className="text-gray-400 font-bold mx-0.5">·</span> <span className="font-bold text-gray-500 text-[13px]">{WORK_LOG_TYPES[item.type].summaryText(item)}</span>
                      </p>
                      <p className="text-[12px] font-bold text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-extrabold text-[#537626]">+{formatBaht(item.total)}</p>
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
