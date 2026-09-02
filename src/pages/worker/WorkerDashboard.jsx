import { useMemo } from 'react';
import { Clock, Wallet, Sprout, Droplets, SprayCan, Scissors } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function WorkerDashboard() {
  const { myWorkerId } = useOutletContext();
  const allEntries = useWorkLogStore((s) => s.entries);
  
  // กรองงานเฉพาะของคนนี้
  const myEntries = useMemo(() => allEntries.filter(e => e.workerId === myWorkerId), [allEntries, myWorkerId]);
  
  // กรองเฉพาะเดือนนี้
  const myEntriesThisMonth = useMemo(() => myEntries.filter(e => isThisMonth(e.date)), [myEntries]);
  
  // คำนวณยอดเงินรวมเดือนนี้
  const totalBalanceThisMonth = useMemo(() => myEntriesThisMonth.reduce((sum, e) => sum + e.total, 0), [myEntriesThisMonth]);

  // คำนวณประวัติล่าสุด 3 อันดับ (เอาไว้โชว์แถบการแจ้งเตือนและรายการล่าสุด)
  const recentActivities = useMemo(() => {
    return [...myEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [myEntries]);

  // สรุปยอด 4 กล่อง (ตัดอ้อย ปลูกอ้อย รดน้ำ พ่นยา) ประจำเดือนนี้
  const statsBoxes = useMemo(() => {
    return WORK_LOG_ORDER.map(type => {
      const typeEntries = myEntriesThisMonth.filter(e => e.type === type);
      const totalThb = typeEntries.reduce((sum, e) => sum + e.total, 0);
      
      let summaryStr = '';
      if (type === 'cutting') {
        const rows = typeEntries.reduce((sum, e) => sum + e.rows, 0);
        summaryStr = `${rows} แถว`;
      } else if (type === 'planting') {
        const furrows = typeEntries.reduce((sum, e) => sum + e.furrows, 0);
        summaryStr = `${furrows} ร่อง`;
      } else if (type === 'watering') {
        const days = typeEntries.reduce((sum, e) => sum + e.days, 0);
        summaryStr = `${days} วัน`;
      } else if (type === 'spraying') {
        const tanks = typeEntries.reduce((sum, e) => sum + e.tanks, 0);
        summaryStr = `${tanks} ถัง`;
      }

      return {
        title: WORK_LOG_TYPES[type].labelTh,
        value: summaryStr,
        amount: formatBaht(totalThb),
        icon: WORK_LOG_TYPES[type].icon
      };
    });
  }, [myEntriesThisMonth]);

  // สำหรับ Chart แท่ง 5 อันล่าสุด (สมมติว่าเป็น 5 รายการล่าสุดละกันเพื่อความง่าย)
  const chartBars = useMemo(() => {
    const bars = [];
    const maxBarValue = Math.max(...recentActivities.map(a => a.total), 1);
    for (let i = 0; i < 5; i++) {
      const act = recentActivities[4 - i]; // เรียงจากเก่าไปใหม่ใน 5 อันดับ
      if (act) {
        bars.push({ label: act.date.slice(5, 10), height: `${(act.total / maxBarValue) * 100}%` });
      } else {
        bars.push({ label: '-', height: '0%' });
      }
    }
    return bars;
  }, [recentActivities]);

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-115px)]">
      
      {/* 1. แถบแจ้งเตือนด้านบนสุด */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-medium text-farm-text shadow-sm shrink-0">
        <Clock size={16} className="text-farm-accent" />
        <span>
          บันทึกงานล่าสุด: {recentActivities[0] ? formatDate(recentActivities[0].date) : 'ไม่มีข้อมูล'} 
          • ทำงานแล้ว {new Set(myEntriesThisMonth.map(e => e.date)).size} วันในเดือนนี้
        </span>
      </div>

      {/* 2. การ์ดสีเขียวแสดงยอดเงิน (My Balance) */}
      <div className="bg-farm-primary rounded-xl p-5 text-white shadow-md relative overflow-hidden shrink-0">
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="bg-white text-farm-accent p-2 rounded-xl shadow-sm">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">My balance</h2>
            <p className="text-xs text-white/80 mt-0.5">Overview This month</p>
          </div>
        </div>
        <div className="text-3xl font-bold relative z-10">{formatBaht(totalBalanceThisMonth)}</div>
        
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* 3. การ์ดสรุปงาน 4 กล่อง */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {statsBoxes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#F3EFE6] text-[#91712A] p-2 rounded-lg">
                  <Icon size={16} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-0.5">{item.title}</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-sm font-extrabold text-farm-text">{item.value}</span>
                </div>
                <p className="text-xs font-bold text-farm-accent">{item.amount}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. ส่วนครึ่งล่าง (กราฟแท่ง + ประวัติล่าสุด) */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        
        {/* กราฟจำลอง */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-farm-text font-extrabold text-sm">การทำงานล่าสุด</h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">5 รายการล่าสุด</span>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 relative pt-4 min-h-0">
            {chartBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full bg-[#F3EFE6] rounded-t-sm rounded-b-sm relative flex-1">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-[#91712A] rounded-t-sm rounded-b-sm transition-all duration-500 group-hover:bg-[#C29D45]"
                    style={{ height: bar.height }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* รายการล่าสุด */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h3 className="text-farm-text font-extrabold text-sm">ประวัติล่าสุด</h3>
            <a href="/worker/history" className="text-xs font-bold text-farm-accent hover:underline">ดูทั้งหมด</a>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
            {recentActivities.map((item) => {
              const Icon = WORK_LOG_TYPES[item.type].icon;
              return (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F3EFE6] text-[#91712A] p-2 rounded-lg shrink-0">
                      <Icon size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-farm-text">{WORK_LOG_TYPES[item.type].labelTh}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-[#91712A]">{formatBaht(item.total)}</p>
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
