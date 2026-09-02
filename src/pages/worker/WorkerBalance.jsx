import { useState, useMemo } from 'react';
import { Search, Calendar, HandCoins, ArrowDownToLine, ArrowRight } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

export default function WorkerBalance() {
  const { myWorkerId } = useOutletContext();
  
  // ดึงข้อมูลจริงจาก Store
  const allEntries = useWorkLogStore((s) => s.entries);
  
  // กรองเฉพาะงานของคนนี้
  const myEntries = useMemo(() => allEntries.filter(e => e.workerId === myWorkerId), [allEntries, myWorkerId]);

  // คำนวณยอดเงินรวมทั้งหมด
  const totalBalance = useMemo(() => myEntries.reduce((sum, e) => sum + e.total, 0), [myEntries]);

  // คำนวณยอดแยกตามประเภทงาน (สำหรับ Progress Bar)
  const workStats = useMemo(() => {
    // หาค่ายอดรวมที่มากที่สุด เพื่อคำนวณ % ความยาวหลอด (เทียบจาก 100%)
    let maxTypeTotal = 0;
    const totalsByType = WORK_LOG_ORDER.reduce((acc, type) => {
      const typeTotal = myEntries.filter(e => e.type === type).reduce((sum, e) => sum + e.total, 0);
      if (typeTotal > maxTypeTotal) maxTypeTotal = typeTotal;
      acc[type] = typeTotal;
      return acc;
    }, {});

    return WORK_LOG_ORDER.map(type => {
      const typeTotal = totalsByType[type];
      const pct = maxTypeTotal > 0 ? (typeTotal / maxTypeTotal) * 100 : 0;
      // หา Quantity รวม (รวมข้อความแบบง่ายๆ โดยดึงเฉพาะรายการนั้นมา แล้วเอาข้อความมาต่อกัน หรือใช้สรุปรวม)
      // เนื่องจาก Quantity แต่ละประเภทมีหน่วยต่างกัน เราจึงโชว์เป็นชื่อประเภท + ยอดเงินแทน
      // แต่ใน Figma มีตัวเลขรวมด้วย เพื่อความง่าย เราโชว์รวมจำนวนแถว หรือรายการที่ทำ
      const typeEntries = myEntries.filter(e => e.type === type);
      
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
        name: `${WORK_LOG_TYPES[type].labelTh} · ${summaryStr}`,
        amount: formatBaht(typeTotal),
        pct: `${pct}%`,
      };
    });
  }, [myEntries]);

  // จัดเตรียมข้อมูลสำหรับตารางรายการทั้งหมด
  const tableData = useMemo(() => {
    return myEntries
      .map(e => ({
        id: e.id,
        rawDate: e.date,
        displayDate: formatDate(e.date),
        typeLabel: WORK_LOG_TYPES[e.type].labelTh,
        quantity: WORK_LOG_TYPES[e.type].summaryText(e),
        balance: formatBaht(e.total)
      }))
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [myEntries]);

  // ระบบตัวกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredTable = useMemo(() => {
    return tableData.filter(item => {
      const matchSearch = item.typeLabel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = filterDate ? item.rawDate === filterDate : true;
      return matchSearch && matchDate;
    });
  }, [tableData, searchTerm, filterDate]);

  return (
    <div className="bg-[#4A4238] rounded-2xl p-4 flex flex-col gap-3 h-[calc(100vh-120px)] shadow-md overflow-hidden">
      
      {/* 1. ส่วนบน */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-farm-primary rounded-xl p-5 pb-3 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white text-farm-accent p-2 rounded-xl shadow-sm">
                <HandCoins size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">My balance</h2>
                <p className="text-xs text-white/80 mt-0.5">Overview This month</p>
              </div>
            </div>
            <div className="text-3xl font-bold">{formatBaht(totalBalance)}</div>
          </div>
          <div className="relative z-10 border-t border-white/20 mt-3 pt-2 flex justify-between items-center text-xs font-medium text-white/80 cursor-pointer hover:text-white transition-colors">
            <span>See details</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="bg-white rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="text-gray-500 font-bold text-sm">สถานะการจ่ายเงิน</p>
            <div className="bg-[#EADDB5] text-[#91712A] px-3 py-1.5 rounded-full font-bold flex items-center gap-2 text-xs">
              <div className="border-2 border-[#91712A] rounded-full p-0.5">
                <ArrowDownToLine size={10} strokeWidth={3} />
              </div>
              รอจ่าย
            </div>
          </div>
          <p className="text-gray-400 font-medium text-xs">รอบจ่ายถัดไป: 31 สิงหาคม 2569</p>
        </div>
      </div>

      {/* 2. ส่วนกลาง (แยกยอดตามประเภทงาน) */}
      <div className="bg-white rounded-xl p-4 shadow-sm shrink-0">
        <h3 className="text-farm-text font-extrabold text-base mb-2">แยกยอดตามประเภทงาน</h3>
        <div className="flex flex-col gap-2.5">
          {workStats.map((stat, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-farm-text font-bold text-xs">{stat.name}</p>
                <p className="text-farm-text font-bold text-xs">{stat.amount}</p>
              </div>
              <div className="w-full bg-[#F3EFE6] rounded-full h-2">
                <div 
                  className="bg-[#D1A344] h-2 rounded-full" 
                  style={{ width: stat.pct }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ส่วนล่าง (ตารางรายการทั้งหมด) */}
      <div className="bg-white rounded-xl p-4 flex-1 flex flex-col min-h-0 shadow-sm">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h3 className="text-farm-text font-extrabold text-base">รายการทั้งหมด</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-[180px] border border-gray-200 rounded-md overflow-hidden flex items-center">
              <input 
                type="text" 
                placeholder="search your activity" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-farm-text outline-none text-xs placeholder:text-gray-400 bg-transparent"
              />
              <Search size={14} className="absolute right-2 text-gray-400" />
            </div>
            <div className="relative w-[140px] border border-gray-200 rounded-md overflow-hidden flex items-center">
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-2 pr-7 py-1.5 text-farm-text outline-none text-xs text-gray-600 bg-transparent relative z-20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar size={14} className="absolute right-2 text-gray-400 z-10 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-t-lg border border-gray-200 min-h-0">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#E5E7EB] sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-gray-500 font-bold text-xs whitespace-nowrap">Work Date</th>
                <th className="py-2 px-4 text-gray-500 font-bold text-xs whitespace-nowrap">Work Type</th>
                <th className="py-2 px-4 text-gray-500 font-bold text-xs text-center whitespace-nowrap">Quantity</th>
                <th className="py-2 px-4 text-gray-500 font-bold text-xs text-right whitespace-nowrap">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTable.length > 0 ? (
                filteredTable.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 text-farm-text font-medium">{item.displayDate}</td>
                    <td className="py-2 px-4 text-farm-text font-medium">{item.typeLabel}</td>
                    <td className="py-2 px-4 text-farm-text font-medium text-center">{item.quantity}</td>
                    <td className="py-2 px-4 text-farm-text font-medium text-right">{item.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500 text-xs font-medium">
                    ไม่พบรายการที่ค้นหา
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
