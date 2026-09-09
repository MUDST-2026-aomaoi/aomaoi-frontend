import { useState, useMemo } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES } from '../../config/workLogTypes';
import { formatDate } from '../../lib/format';

export default function WorkerHistory() {
  const { myWorkerId } = useOutletContext();
  
  // 1. ดึงข้อมูลจริงจาก Store ของเพื่อน
  const allEntries = useWorkLogStore((s) => s.entries);
  
  // 2. กรองเฉพาะงานของ Worker คนนี้ (สมชาย) และประยุกต์โครงสร้างให้พร้อมแสดงผล
  const myData = useMemo(() => {
    return allEntries
      .filter(e => e.workerId === myWorkerId)
      .map(e => ({
        id: e.id,
        rawDate: e.date,
        displayDate: formatDate(e.date),
        typeLabel: WORK_LOG_TYPES[e.type].labelTh,
        quantity: WORK_LOG_TYPES[e.type].summaryText(e)
      }))
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate)); // เรียงจากล่าสุดไปเก่าสุด
  }, [allEntries, myWorkerId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 3. กรองตาม Search และ Date Filter
  const filteredData = useMemo(() => {
    return myData.filter(item => {
      const matchSearch = item.typeLabel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStartDate = startDate ? item.rawDate >= startDate : true;
      const matchEndDate = endDate ? item.rawDate <= endDate : true;
      return matchSearch && matchStartDate && matchEndDate;
    });
  }, [myData, searchTerm, startDate, endDate]);

  return (
    <div className="bg-[#4A4238] rounded-2xl p-6 flex flex-col h-[calc(100vh-120px)] shadow-md">
      
      {/* ส่วนค้นหาและกรองวันที่ */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-[500px]">
          <input 
            type="text" 
            placeholder="search your activity (เช่น ตัดอ้อย)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-5 pr-10 py-3 bg-white rounded-xl text-farm-text outline-none text-sm placeholder:text-gray-400 shadow-sm"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative w-[200px] bg-white rounded-xl shadow-sm">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-transparent text-farm-text outline-none text-sm text-gray-600 relative z-20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
        </div>

        <span className="text-white font-medium text-lg px-1">ถึง</span>

        <div className="relative w-[200px] bg-white rounded-xl shadow-sm">
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-transparent text-farm-text outline-none text-sm text-gray-600 relative z-20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
        </div>
      </div>

      <h2 className="text-white text-2xl font-bold mb-4">Recent Activities</h2>

      {/* ตารางข้อมูล */}
      <div className="bg-white rounded-xl overflow-y-auto flex-1 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#D9D9D9] sticky top-0 z-10">
            <tr>
              <th className="py-4 px-6 text-farm-text font-bold text-lg border-b border-gray-300">Work Date</th>
              <th className="py-4 px-6 text-farm-text font-bold text-lg border-b border-gray-300">Work Type</th>
              <th className="py-4 px-6 text-farm-text font-bold text-lg border-b border-gray-300">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-farm-text font-medium">{item.displayDate}</td>
                  <td className="py-3 px-6 text-farm-text font-medium">{item.typeLabel}</td>
                  <td className="py-3 px-6 text-farm-text font-medium">{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500 font-medium">
                  ไม่พบประวัติการทำงานที่คุณค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
