import { useState, useMemo } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

export default function WorkerHistory() {
  const { myWorkerId } = useOutletContext();
  const allEntries = useWorkLogStore((s) => s.entries);
  
  const myData = useMemo(() => {
    return allEntries
      .filter(e => e.workerId === myWorkerId)
      .map(e => {
        let qty = 0;
        let unit = '';
        let badgeStyle = '';
        
        if (e.type === 'cutting') {
          qty = e.rows;
          unit = 'วา/แถว';
          badgeStyle = 'bg-[#1C3F1B] text-white'; // Dark Green
        } else if (e.type === 'planting') {
          qty = e.furrows;
          unit = 'วา/ร่อง'; 
          badgeStyle = 'bg-[#708238] text-white'; // Olive Green
        } else if (e.type === 'watering') {
          qty = e.days;
          unit = 'วัน';
          badgeStyle = 'bg-[#A9C46C] text-[#1C3F1B]'; // Light Green
        } else if (e.type === 'spraying') {
          qty = e.tanks;
          unit = 'ถัง';
          badgeStyle = 'bg-[#D2E1A7] text-[#1C3F1B]'; // Pale Green
        }

        return {
          id: e.id,
          rawDate: e.date,
          displayDate: formatDate(e.date),
          type: e.type,
          typeLabel: WORK_LOG_TYPES[e.type].labelTh,
          qty: qty,
          unit: unit,
          total: e.total,
          badgeStyle: badgeStyle
        };
      })
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [allEntries, myWorkerId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = useMemo(() => {
    return myData.filter(item => {
      const matchSearch = item.typeLabel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType ? item.type === filterType : true;
      const matchStartDate = startDate ? item.rawDate >= startDate : true;
      const matchEndDate = endDate ? item.rawDate <= endDate : true;
      return matchSearch && matchType && matchStartDate && matchEndDate;
    });
  }, [myData, searchTerm, filterType, startDate, endDate]);

  return (
    <div className="flex flex-col h-full w-full pb-20">
      
      {/* Subtitle ใต้ Header */}
      <p className="text-gray-400 font-medium text-[18px] mb-8 mt-[-12px]">Here is the history of overall data</p>

      {/* แถบค้นหาและฟิลเตอร์ */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[280px] max-w-[360px]">
          <input 
            type="text" 
            placeholder="search your activity" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-5 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg text-farm-text outline-none text-sm placeholder:text-gray-400 shadow-sm focus:border-[#708238]"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Dropdown ประเภทงาน */}
        <div className="relative w-[200px]">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 outline-none text-sm shadow-sm appearance-none cursor-pointer focus:border-[#708238]"
          >
            <option value="" className="text-gray-400">ประเภทงานทั้งหมด</option>
            {WORK_LOG_ORDER.map(t => (
              <option key={t} value={t}>{WORK_LOG_TYPES[t].labelTh}</option>
            ))}
          </select>
          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-3">
          <div className="relative w-[180px]">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 outline-none text-sm shadow-sm relative z-20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:border-[#708238]"
            />
            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
          </div>

          <span className="text-farm-text font-bold text-[14px] px-1">ถึง</span>

          <div className="relative w-[180px]">
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 outline-none text-sm shadow-sm relative z-20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:border-[#708238]"
            />
            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* ตาราง */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead className="bg-[#EFEBE1] border-b border-gray-200">
              <tr>
                <th className="py-4 px-8 text-left text-[#5A5248] font-bold text-[15px]">Date</th>
                <th className="py-4 px-6 text-[#5A5248] font-bold text-[15px]">Work Type</th>
                <th className="py-4 px-6 text-[#5A5248] font-bold text-[15px]">Qty</th>
                <th className="py-4 px-6 text-[#5A5248] font-bold text-[15px]">Unit</th>
                <th className="py-4 px-8 text-right text-[#5A5248] font-bold text-[15px]">Wages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-8 text-left font-medium text-farm-text text-[14px] whitespace-nowrap">
                      {item.displayDate}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-5 py-1.5 rounded-full text-[13px] font-bold ${item.badgeStyle}`}>
                        {item.typeLabel}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-farm-text text-[15px]">
                      {item.qty}
                    </td>
                    <td className="py-4 px-6 font-medium text-farm-text text-[14px]">
                      {item.unit}
                    </td>
                    <td className="py-4 px-8 text-right font-medium text-farm-text text-[15px] whitespace-nowrap">
                      {formatBaht(item.total)} <span className="ml-1">บาท</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">
                    ไม่พบประวัติการทำงานที่ตรงกับเงื่อนไข
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
