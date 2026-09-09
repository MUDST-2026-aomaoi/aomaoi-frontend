import { useMemo } from 'react';
import { Clock, Wallet, Sprout, Droplets, SprayCan, Scissors, ArrowDownToLine, ArrowRight } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

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
  
  // 1. กรองข้อมูล
  const myEntries = useMemo(() => allEntries.filter(e => e.workerId === myWorkerId), [allEntries, myWorkerId]);
  const myEntriesThisMonth = useMemo(() => myEntries.filter(e => isThisMonth(e.date)), [myEntries]);
  
  // 2. คำนวณยอดเงินต่างๆ
  const totalBalanceThisMonth = useMemo(() => myEntriesThisMonth.reduce((sum, e) => sum + e.total, 0), [myEntriesThisMonth]);
  const todayIncome = useMemo(() => myEntries.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.total, 0), [myEntries]);

  // 3. กิจกรรมล่าสุด 4 อันดับแรก
  const recentActivities = useMemo(() => {
    return [...myEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [myEntries]);

  // 4. สรุปยอด 4 หมวดงาน
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

      // คำนวณ % สำหรับ Donut Chart
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

  // 5. เตรียมข้อมูลกราฟแท่ง (Bar Chart 5 เดือนล่าสุดสมมติ)
  const chartBars = useMemo(() => {
    // สมมติข้อมูล 5 เดือนล่าสุดสำหรับกราฟ (ในระบบจริงต้อง group by month)
    // ตรงนี้ขอดึงข้อมูล 5 งานล่าสุดมาโชว์แทนชั่วคราวเพื่อความสวยงาม
    const bars = [];
    const maxBarValue = Math.max(...recentActivities.map(a => a.total), 1);
    for (let i = 0; i < 5; i++) {
      const act = recentActivities[4 - i]; 
      if (act) {
        bars.push({ label: act.date.slice(5, 10), value: formatBaht(act.total).replace(/,/g, ''), height: `${(act.total / maxBarValue) * 100}%` });
      } else {
        bars.push({ label: '-', value: '0', height: '0%' });
      }
    }
    return bars;
  }, [recentActivities]);

  // 6. คำนวณความยาวเส้น Donut Chart (SVG)
  const donutColors = { cutting: '#3B4D36', planting: '#A9C46C', watering: '#708238', spraying: '#D2E1A7' };
  let currentOffset = 0;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-110px)] max-w-7xl mx-auto w-full">
      
      {/* 1. แถบแจ้งเตือนด้านบน */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium text-farm-text shadow-sm shrink-0">
        <Clock size={18} className="text-[#91712A]" />
        <span>
          บันทึกงานล่าสุด: {recentActivities[0] ? formatDate(recentActivities[0].date) : 'ไม่มีข้อมูล'} 
          {' '}• ทำงานแล้ว {new Set(myEntriesThisMonth.map(e => e.date)).size} วันในเดือนนี้
        </span>
      </div>

      {/* 2. Top Cards (3 กล่อง) */}
      <div className="grid grid-cols-3 gap-4 shrink-0">
        {/* My Balance */}
        <div className="bg-[#3B4D36] rounded-xl p-6 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Wallet size={24} className="text-white" />
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative">
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

      {/* 3. Middle Cards (4 กล่องสรุปงาน) */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {statsBoxes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#FFFDF4] p-3 mx-3 mt-3 rounded-lg flex items-center justify-center gap-2 border border-[#F3EFE6]">
                <Icon size={20} strokeWidth={2.5} className="text-[#91712A]" />
                <span className="font-extrabold text-farm-text">{item.title}</span>
              </div>
              <div className="p-4 pt-5 text-center">
                <div className="flex items-baseline justify-center gap-1.5 mb-2">
                  <span className="text-3xl font-extrabold text-farm-text leading-none">{item.amountNum}</span>
                  <span className="text-xs font-bold text-gray-400">{item.unit}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-lg font-extrabold text-farm-text">{item.thbStr}</span>
                  <span className="text-[10px] font-bold text-gray-400">บาท</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Row (Charts & Recent Activity) */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 mt-2">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col min-h-0">
          <h3 className="text-farm-text font-extrabold text-lg mb-6 shrink-0">Total Work Done</h3>
          <div className="flex-1 flex items-end justify-between gap-6 relative min-h-0 px-2 pb-2">
            {/* เส้นแกน Y ด้านหลัง (จำลอง) */}
            <div className="absolute top-0 bottom-6 left-0 right-0 flex flex-col justify-between z-0 pointer-events-none">
              {[40, 30, 20, 10, 0].map(v => (
                <div key={v} className="flex items-center w-full">
                  <span className="text-[10px] text-gray-300 w-4">{v}</span>
                  <div className="h-[1px] bg-gray-100 flex-1 ml-2"></div>
                </div>
              ))}
            </div>

            {chartBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10">
                <span className="text-xs font-bold text-gray-500 mb-1">{bar.value}</span>
                <div className="w-full bg-gray-200 rounded-t-sm relative flex-1 transition-colors duration-300 group-hover:bg-[#3B4D36]">
                  <div className="absolute bottom-0 left-0 w-full rounded-t-sm transition-all duration-500 bg-gray-300 group-hover:bg-[#3B4D36]" style={{ height: bar.height }}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center min-h-0">
          <h3 className="text-farm-text font-extrabold text-lg mb-4 w-full text-left shrink-0">Tasks by Month</h3>
          
          <div className="relative w-40 h-40 flex-shrink-0">
            {/* วาด Donut ด้วย SVG */}
            <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
              {statsBoxes.map((stat) => {
                if (stat.pct === 0) return null;
                const strokeDasharray = `${stat.pct} 100`;
                const strokeDashoffset = -currentOffset;
                currentOffset += stat.pct;
                
                return (
                  <circle
                    key={stat.id}
                    r="16"
                    cx="16"
                    cy="16"
                    fill="transparent"
                    stroke={donutColors[stat.id]}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            {/* วงกลมตรงกลางเพื่อโชว์ยอดเงิน */}
            <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-500">รวม</span>
              <span className="text-sm font-extrabold text-farm-text leading-tight">{formatBaht(totalBalanceThisMonth)}</span>
              <span className="text-[10px] font-bold text-gray-500">บาท</span>
            </div>
          </div>

          {/* Legend ใต้กราฟ */}
          <div className="w-full grid grid-cols-2 gap-x-2 gap-y-3 mt-6 flex-1 overflow-y-auto">
            {statsBoxes.map(stat => (
              <div key={stat.id} className="flex items-center gap-2">
                <div className="w-4 h-full rounded-sm shrink-0" style={{ backgroundColor: donutColors[stat.id] }}></div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-500 leading-none">{stat.title}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{stat.amountNum} {stat.unit} <br/>{stat.thbStr} บาท</p>
                </div>
                <div className="text-sm font-extrabold text-farm-text">{stat.pct}%</div>
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
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="text-[#91712A] shrink-0">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-farm-text">
                        {WORK_LOG_TYPES[item.type].labelTh} · <span className="font-medium text-gray-500">{WORK_LOG_TYPES[item.type].summaryText(item)}</span>
                      </p>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-[#708238] bg-[#F1F5E8] px-2 py-1 rounded-md">+{formatBaht(item.total)}</p>
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
