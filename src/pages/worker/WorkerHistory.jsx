import { useState, useMemo, forwardRef, useEffect, useRef } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useAuthStore } from '../../controller/authController';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatAmount } from '../../lib/format';

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
  const currentUser = useAuthStore(state => state.currentUser);
  const myWorkerId = currentUser?.id || '1';
  
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const allEntries = useWorkLogStore((s) => s.entries);
  
  const myData = useMemo(() => {
    return allEntries
      .filter(e => String(e.workerId) === String(myWorkerId))
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
          rawDate: e.startDate || e.date,
          displayDate: e.startDate && e.endDate && e.startDate !== e.endDate
            ? `${formatDate(e.startDate)} - ${formatDate(e.endDate)}`
            : formatDate(e.startDate || e.date),
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
    <div className="flex flex-col w-full pb-20">
      
      {/* Subtitle ใต้ Header */}
      <p className="text-gray-400 font-medium text-sm sm:text-[18px] mb-5 sm:mb-8 mt-[-12px] sm:mt-[-20px]">Here is the history of overall data</p>

      {/* แถบค้นหาและฟิลเตอร์ */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[240px] sm:max-w-[360px]">
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
        <div className="relative w-full sm:w-[200px]" ref={dropdownRef}>
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
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none sm:w-[180px] min-w-0 [&_.react-datepicker-wrapper]:w-full">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              customInput={<CustomDateInput placeholder="search your date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <span className="text-farm-text font-bold text-[14px] px-0.5 sm:px-1 shrink-0">ถึง</span>

          <div className="flex-1 sm:flex-none sm:w-[180px] min-w-0 [&_.react-datepicker-wrapper]:w-full">
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
        <div tabIndex={0} role="region" aria-label="ประวัติการทำงาน" className="overflow-x-auto w-full">
          <table className="w-full table-fixed text-center border-collapse min-w-[620px] md:min-w-[800px]">
            <colgroup>
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
            </colgroup>
            <thead className="bg-[#E8E8E8] border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">วันที่</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">ประเภทงาน</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">จำนวน</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">หน่วย</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">ค่าแรง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px] whitespace-nowrap">
                      {item.displayDate}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                      <span className={`inline-block min-w-[80px] sm:min-w-[88px] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[12px] sm:text-[13px] font-bold ${item.badgeStyle}`}>
                        {item.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[14px] sm:text-[15px]">
                      {item.qty}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px]">
                      {item.unit}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[14px] sm:text-[15px] whitespace-nowrap">
                      {formatAmount(item.total)} <span className="ml-1">บาท</span>
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
