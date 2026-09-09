import { useState, useMemo, forwardRef, useEffect, useRef } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht } from '../../lib/format';

const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <input 
      type="text"
      readOnly
      value={value}
      placeholder={placeholder}
      className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 outline-none text-sm shadow-sm focus:border-[#708238] cursor-pointer"
    />
    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
));
CustomDateInput.displayName = 'CustomDateInput';

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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    return myData.filter(item => {
      const matchSearch = item.typeLabel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType ? item.type === filterType : true;
      const matchStartDate = startDate ? item.rawDate >= format(startDate, 'yyyy-MM-dd') : true;
      const matchEndDate = endDate ? item.rawDate <= format(endDate, 'yyyy-MM-dd') : true;
      return matchSearch && matchType && matchStartDate && matchEndDate;
    });
  }, [myData, searchTerm, filterType, startDate, endDate]);

  const WORK_OPTIONS = [
    { value: '', label: 'ประเภทงานทั้งหมด' },
    ...WORK_LOG_ORDER.map(t => ({ value: t, label: WORK_LOG_TYPES[t].labelTh }))
  ];

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
        <div className="relative w-[200px]" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg outline-none text-sm shadow-sm cursor-pointer flex items-center justify-between transition-colors focus:border-[#708238]"
          >
            <span className={filterType === '' ? 'text-gray-400' : 'text-gray-600'}>
              {filterType === '' ? 'ประเภทงานทั้งหมด' : WORK_LOG_TYPES[filterType].labelTh}
            </span>
          </div>
          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {WORK_OPTIONS.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    setFilterType(opt.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 ${filterType === opt.value ? 'bg-gray-50 text-farm-text font-bold' : 'text-gray-600'}`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-3">
          <div className="w-[180px]">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              customInput={<CustomDateInput placeholder="search your date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <span className="text-farm-text font-bold text-[14px] px-1">ถึง</span>

          <div className="w-[180px]">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              customInput={<CustomDateInput placeholder="search your date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

      </div>

      {/* ตาราง */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead className="bg-gray-200 border-b border-gray-200">
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
