import { useMemo } from 'react';
import { Clock, Wallet, Sprout, Droplets, SprayCan, Scissors, ArrowDownToLine, ArrowRight } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

// Import Recharts
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

  // สรุปยอด 4 หมวดงาน
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
        rawThb: totalThb,
        icon: WORK_LOG_TYPES[type].icon
      };
    });
  }, [myEntriesThisMonth, totalBalanceThisMonth]);

  // ข้อมูลกราฟแท่ง (สมมติ 5 เดือน)
  // ปกติควร group ตามเดือน แต่เราจะใช้ mock data ตามภาพ Figma แทนเพื่อให้เห็นกราฟชัดๆ
  const chartBars = [
    { label: 'มี.ค.', value: 35 },
    { label: 'เม.ย.', value: 37 },
    { label: 'พ.ค.', value: 30 },
    { label: 'ก.ค.', value: 25 },
    { label: 'ส.ค.', value: 27 },
  ];

  // สีสำหรับ Donut Chart เรียงตามลำดับ (ตัดอ้อย, ปลูกอ้อย, รดน้ำ, พ่นยา)
  const donutColors = ['#1C3F1B', '#708238', '#A9C46C', '#D2E1A7']; 

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-110px)] max-w-7xl mx-auto w-full">
      
      {/* 1. แถบแจ้งเตือนด้านบน */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium text-farm-text shadow-sm shrink-0">
        <Clock size={18} className="text-[#91712A]" />
        <span>
          บันทึกงานล่าสุด: วันนี้ 08:40 น. · ทำงานแล้ว 18 วันในเดือนนี้
        </span>
      </div>

      {/* 2. Top Cards (3 กล่อง) */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 shrink-0">
        {/* My Balance */}
        <div className="bg-[#3B4D36] rounded-xl p-6 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white text-[#91712A] p-2 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">My balance</h2>
              <p className="text-xs text-white/70">Overview This month</p>
            </div>
          </div>
          <div className="text-4xl font-extrabold">{formatBaht(totalBalanceThisMonth)} <span className="text-xl">THB</span></div>
        </div>

        {/* Today's Income */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-farm-text">Today's income</h2>
            <p className="text-xs text-gray-400">Overview today</p>
          </div>
          <div className="text-4xl font-extrabold text-[#3B4D36]">{formatBaht(todayIncome)} <span className="text-xl">THB</span></div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-gray-400 mb-4">สถานะการจ่ายเงิน</h2>
          <div className="bg-[#D1A344]/20 text-[#91712A] px-8 py-2.5 rounded-full font-bold flex items-center gap-2 text-lg mb-3 shadow-sm">
            <div className="border-[3px] border-[#91712A] rounded-full p-0.5">
              <ArrowDownToLine size={16} strokeWidth={3} />
            </div>
            รอจ่าย
          </div>
          <p className="text-gray-400 font-medium text-xs">รอบจ่ายถัดไป: 31 สิงหาคม 2569</p>
        </div>
      </div>

      <div className="flex items-center mt-2">
        <h2 className="text-2xl font-extrabold text-farm-text">Total Work Done</h2>
      </div>

      {/* 3. Middle Cards (4 กล่องสรุปงาน ปรับดีไซน์ตาม Figma) */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {statsBoxes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
              {/* ป้ายสีเหลืองชิดซ้ายบน */}
              <div className="bg-[#FFFDF4] px-4 py-2 rounded-lg flex items-center gap-2 self-start mb-6 border border-[#F3EFE6]">
                <Icon size={18} strokeWidth={2.5} className="text-[#91712A]" />
                <span className="font-extrabold text-farm-text text-base">{item.title}</span>
              </div>
              
              {/* ตัวเลขจัดชิดซ้าย */}
              <div className="text-left">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-farm-text leading-none">{item.amountNum}</span>
                  <span className="text-xs font-medium text-gray-400">{item.unit}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-farm-text">{item.thbStr}</span>
                  <span className="text-[10px] font-medium text-gray-400">บาท</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Row (Charts & Recent Activity) */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 mt-2 pb-4">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col min-h-0">
          <h3 className="text-farm-text font-extrabold text-lg mb-4 shrink-0">Total Work Done</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBars} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={35}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} domain={[0, 40]} ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                {/* ใส่ activeBar ให้เปลี่ยนสีตอน Hover เป็นสีเขียวเข้ม */}
                <Bar dataKey="value" fill="#E5E7EB" activeBar={{ fill: '#3B4D36' }} radius={[4, 4, 0, 0]}>
                  {chartBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartBars.length - 1 ? '#3B4D36' : '#E5E7EB'} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} dy={-5} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center min-h-0">
          <h3 className="text-farm-text font-extrabold text-lg mb-2 w-full text-left shrink-0">Tasks by Month</h3>
          
          <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsBoxes}
                  innerRadius="50%"
                  outerRadius="80%"
                  dataKey="pct"
                  stroke="white"
                  strokeWidth={2}
                  // ตั้งค่าตำแหน่งข้อความ % ให้โชว์บนวงโดนัท
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    if (value === 0) return null;
                    return (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
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
            
            {/* วงกลมตรงกลางเพื่อโชว์ยอดเงิน */}
            <div className="absolute inset-0 m-auto flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[12px] font-bold text-farm-text">รวม</span>
              <span className="text-xl font-extrabold text-farm-text leading-tight">{formatBaht(totalBalanceThisMonth)}</span>
              <span className="text-[12px] font-bold text-farm-text">บาท</span>
            </div>
          </div>

          {/* Legend 2x2 ใต้กราฟตาม Figma */}
          <div className="w-full grid grid-cols-2 gap-x-2 gap-y-4 mt-2 shrink-0">
            {statsBoxes.map((stat, idx) => (
              <div key={stat.id} className="flex items-center gap-2">
                <div className="w-3 h-8 rounded-sm shrink-0" style={{ backgroundColor: donutColors[idx] }}></div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-500 leading-none">{stat.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">{stat.amountNum} {stat.unit} <br/>{stat.thbStr} บาท</p>
                </div>
                <div className="text-base font-extrabold text-farm-text">{stat.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-farm-text font-extrabold text-lg">Recent Activity</h3>
            <Link to="/worker/history" className="text-xs font-bold text-gray-500 hover:text-farm-text flex items-center gap-1">
              More <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0">
            {recentActivities.map((item) => {
              const Icon = WORK_LOG_TYPES[item.type].icon;
              return (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {/* ไอคอนสีเหลือง */}
                    <div className="bg-[#FFFDF4] text-[#91712A] p-2.5 rounded-lg shrink-0">
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-farm-text">
                        {WORK_LOG_TYPES[item.type].labelTh} · <span className="font-medium">{WORK_LOG_TYPES[item.type].summaryText(item)}</span>
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {/* ยอดเงินสีเขียว (ไม่มีกรอบพื้นหลังแล้ว ตาม Figma) */}
                    <p className="text-sm font-extrabold text-[#708238]">+{formatBaht(item.total)}</p>
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
