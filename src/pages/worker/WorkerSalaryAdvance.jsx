import { useState, useMemo, forwardRef, useEffect, useRef } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { DatePickerPopperContainer } from '../../components/ui/DatePickerPopperContainer';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useSalaryAdvanceStore } from '../../store/useSalaryAdvanceStore';
import { formatDate, formatAmount } from '../../lib/format';

const CustomDateInput = forwardRef(({ value, onClick, placeholder, dataTest }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <input
      type="text"
      readOnly
      value={value}
      placeholder={placeholder}
      data-test={dataTest}
      className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 outline-none text-sm shadow-sm focus:border-[#708238] cursor-pointer"
    />
    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
));
CustomDateInput.displayName = 'CustomDateInput';

const ADVANCE_OPTIONS = [
  { value: '', label: 'ประเภทการเบิกทั้งหมด' },
  { value: 'CASH', label: 'เงินสด' },
  { value: 'GOODS', label: 'สิ่งของ' },
];

const ADVANCE_BADGE = {
  CASH: {
    label: 'เงินสด',
    className: 'bg-[#A2C73E]/40 text-black',
  },
  GOODS: {
    label: 'สิ่งของ',
    className: 'bg-[#FFEA76]/40 text-black',
  },
};

export default function WorkerSalaryAdvance() {
  const myAdvances = useSalaryAdvanceStore((s) => s.myAdvances);
  const fetchMyAdvances = useSalaryAdvanceStore((s) => s.fetchMyAdvances);

  useEffect(() => {
    fetchMyAdvances();
  }, [fetchMyAdvances]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const preparedData = useMemo(() => {
    return [...myAdvances]
      .map((item) => {
        const badge = ADVANCE_BADGE[item.type] || ADVANCE_BADGE.CASH;
        return {
          id: item.id,
          rawDate: item.advanceDate,
          displayDate: formatDate(item.advanceDate),
          itemName: item.itemName || '',
          type: item.type,
          typeLabel: badge.label,
          badgeClass: badge.className,
          amount: Number(item.amount || 0),
        };
      })
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate) || Number(b.id) - Number(a.id));
  }, [myAdvances]);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return preparedData.filter((item) => {
      const matchSearch =
        !keyword ||
        item.itemName.toLowerCase().includes(keyword) ||
        item.typeLabel.toLowerCase().includes(keyword);
      const matchType = filterType ? item.type === filterType : true;
      const matchStartDate = startDate ? item.rawDate >= format(startDate, 'yyyy-MM-dd') : true;
      const matchEndDate = endDate ? item.rawDate <= format(endDate, 'yyyy-MM-dd') : true;
      return matchSearch && matchType && matchStartDate && matchEndDate;
    });
  }, [preparedData, searchTerm, filterType, startDate, endDate]);

  const selectedOptionLabel =
    ADVANCE_OPTIONS.find((opt) => opt.value === filterType)?.label || 'ประเภทการเบิกทั้งหมด';

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Subtitle ใต้ Header */}
      <p className="text-gray-400 font-medium text-sm sm:text-[18px] mb-5 sm:mb-8 mt-[-12px] sm:mt-[-20px]">
        Here is the salary advance of overall data
      </p>

      {/* แถบค้นหาและฟิลเตอร์ */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        {/* Search & Dropdown Group: บนมือถืออยู่แถวเดียวกันคนละครึ่ง 50/50, บน Desktop วางเรียงต่อกัน */}
        <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto sm:flex-1 sm:max-w-[590px]">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[220px] sm:max-w-[360px]">
            <input
              type="text"
              placeholder="search your activity"
              data-test="worker-advance-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3.5 sm:pl-5 pr-10 sm:pr-12 py-2.5 bg-white border border-gray-200 rounded-lg text-farm-text outline-none text-xs sm:text-sm placeholder:text-gray-400 shadow-sm focus:border-[#708238]"
            />
            <Search size={18} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown ประเภทการเบิก */}
          <div className="relative flex-1 sm:flex-none w-auto sm:w-[210px] min-w-0" ref={dropdownRef}>
            <div
              data-test="worker-advance-type-filter"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 bg-white border border-gray-200 rounded-lg outline-none text-xs sm:text-sm shadow-sm cursor-pointer flex items-center justify-between transition-colors focus:border-[#708238]"
            >
              <span className={`truncate ${filterType === '' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedOptionLabel}
              </span>
            </div>
            <ChevronDown size={18} className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {ADVANCE_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    data-test={`worker-advance-type-option-${opt.value || 'all'}`}
                    onClick={() => {
                      setFilterType(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors hover:bg-gray-50 ${
                      filterType === opt.value ? 'bg-gray-50 text-farm-text font-bold' : 'text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none sm:w-[180px] min-w-0 [&_.react-datepicker-wrapper]:w-full">
            <DatePicker popperContainer={DatePickerPopperContainer}
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              customInput={<CustomDateInput placeholder="search your date" dataTest="worker-advance-start-date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <span className="text-farm-text font-bold text-[14px] px-0.5 sm:px-1 shrink-0">ถึง</span>

          <div className="flex-1 sm:flex-none sm:w-[180px] min-w-0 [&_.react-datepicker-wrapper]:w-full">
            <DatePicker popperContainer={DatePickerPopperContainer}
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              customInput={<CustomDateInput placeholder="search your date" dataTest="worker-advance-end-date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div tabIndex={0} role="region" aria-label="ประวัติการเบิกเงินและสิ่งของ" className="overflow-x-auto w-full">
          <table data-test="worker-advance-table" className="w-full table-fixed text-center border-collapse min-w-[560px] md:min-w-[800px]">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead className="bg-[#E8E8E8] border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">วันที่</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">ชื่อสินค้า</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">ประเภทการเบิก</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center text-[#3E2E1F] font-bold text-[14px] sm:text-[15px]">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} data-test="worker-advance-row" className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px] whitespace-nowrap">
                      {item.displayDate}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px]">
                      {item.itemName || '-'}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                      <span
                        data-test="worker-advance-row-type"
                        className={`inline-block min-w-[80px] sm:min-w-[88px] px-3 sm:px-4 py-1 rounded-full text-[12px] sm:text-[13px] font-medium ${item.badgeClass}`}
                      >
                        {item.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[14px] sm:text-[15px] whitespace-nowrap">
                      {formatAmount(item.amount)} <span className="ml-1">บาท</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 font-medium">
                    ไม่พบรายการเบิกที่ตรงกับเงื่อนไข
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
