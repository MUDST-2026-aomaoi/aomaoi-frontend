import { useState, useMemo, forwardRef, useEffect, useRef } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { DatePickerPopperContainer } from '../../components/ui/DatePickerPopperContainer';
import { TableLoadingRow } from '../../components/ui/Loader';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useAuthStore } from '../../controller/authController';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatAmount, localizeDateText } from '../../lib/format';
import { useT, getDateFnsLocale } from '../../i18n';

const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <input 
      type="text"
      readOnly
      value={localizeDateText(value)}
      placeholder={placeholder}
      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#E4E9DA] bg-white text-gray-500 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40 cursor-pointer"
    />
    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
));
CustomDateInput.displayName = 'CustomDateInput';

export default function WorkerHistory() {
  const t = useT();
  const currentUser = useAuthStore(state => state.currentUser);
  const myWorkerId = currentUser?.id || '1';
  
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const allEntries = useWorkLogStore((s) => s.entries);
  const entriesLoaded = useWorkLogStore((s) => s.loaded);
  
  const myData = useMemo(() => {
    return allEntries
      .filter(e => String(e.workerId) === String(myWorkerId))
      .map(e => {
        let qty = 0;
        let unit = '';
        let badgeStyle = '';
        
        if (e.type === 'cutting') {
          qty = e.rows;
          unit = t('wh.unit.waPerRow');
          badgeStyle = 'bg-[#1C3F1B] text-white'; // Dark Green
        } else if (e.type === 'planting') {
          qty = e.furrows;
          unit = t('wh.unit.waPerFurrow');
          badgeStyle = 'bg-[#708238] text-white'; // Olive Green
        } else if (e.type === 'watering') {
          qty = e.days;
          unit = t('wl.unit.day');
          badgeStyle = 'bg-[#A9C46C] text-[#1C3F1B]'; // Light Green
        } else if (e.type === 'spraying') {
          qty = e.tanks;
          unit = t('wl.unit.tank');
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

  // Job counts for the summary cards (ignore the table filters).
  const stats = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const today = `${month}-${pad(now.getDate())}`;
    return {
      today: myData.filter((e) => e.rawDate === today).length,
      month: myData.filter((e) => e.rawDate?.startsWith(month)).length,
      all: myData.length,
    };
  }, [myData]);

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
    { value: '', label: t('worker.allTypes') },
    ...WORK_LOG_ORDER.map(key => ({ value: key, label: WORK_LOG_TYPES[key].labelTh }))
  ];

  return (
    <div className="flex flex-col w-full pb-20">
      
      {/* Subtitle ใต้ Header */}
      <p className="-mt-2 mb-5 text-sm text-[#8A8F85] sm:mb-6 sm:text-base">{t('wh.subtitle')}</p>

      {/* สรุปจำนวนงาน */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { key: 'today', label: t('wh.statToday'), value: stats.today, tone: 'text-[#2E5119]' },
          { key: 'month', label: t('wh.statMonth'), value: stats.month, tone: 'text-gray-700' },
          { key: 'all', label: t('wh.statAll'), value: stats.all, tone: 'text-gray-700' },
        ].map((c) => (
          <div key={c.key} data-test={`worker-history-stat-${c.key}`} className="flex flex-col justify-center rounded-[20px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
            <p className="mb-1 text-xs font-medium text-gray-600 sm:text-base">{c.label}</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span className={`text-2xl font-bold sm:text-4xl ${c.tone}`}>{c.value}</span>
              <span className="text-xs font-medium text-gray-400 sm:text-base">{t('wh.statUnit')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* แถบค้นหาและฟิลเตอร์ */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6">
        
        {/* Search & Dropdown Group: บนมือถืออยู่แถวเดียวกันคนละครึ่ง 50/50, บน Desktop วางเรียงต่อกัน */}
        <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto sm:flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
            <input 
              type="text" 
              placeholder={t('worker.searchActivity')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3.5 sm:pl-5 pr-10 sm:pr-12 py-2.5 rounded-xl border border-[#E4E9DA] bg-white text-farm-text text-xs sm:text-sm placeholder:text-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
            />
            <Search size={18} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown ประเภทงาน */}
          <div className="relative flex-1 sm:flex-none w-auto sm:w-[200px] min-w-0" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 rounded-xl border border-[#E4E9DA] bg-white text-xs sm:text-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-pointer flex items-center justify-between outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
            >
              <span className={`truncate ${filterType === '' ? 'text-gray-400' : 'text-gray-600'}`}>
                {filterType === '' ? t('worker.allTypes') : WORK_LOG_TYPES[filterType].labelTh}
              </span>
            </div>
            <ChevronDown size={18} className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full min-w-[160px] rounded-2xl bg-white p-2 shadow-[0_12px_32px_rgba(46,74,31,0.12)] ring-1 ring-black/5 z-50 max-h-72 overflow-y-auto">
                {WORK_OPTIONS.map(opt => (
                  <div 
                    key={opt.value}
                    onClick={() => {
                      setFilterType(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors hover:bg-[#E6F0D6]/60 ${filterType === opt.value ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
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
            <DatePicker popperContainer={DatePickerPopperContainer} locale={getDateFnsLocale()}
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              customInput={<CustomDateInput placeholder={t('worker.searchDate')} />}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <span className="text-farm-text font-bold text-[14px] px-0.5 sm:px-1 shrink-0">{t('worker.to')}</span>

          <div className="flex-1 sm:flex-none sm:w-[180px] min-w-0 [&_.react-datepicker-wrapper]:w-full">
            <DatePicker popperContainer={DatePickerPopperContainer} locale={getDateFnsLocale()}
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              customInput={<CustomDateInput placeholder={t('worker.searchDate')} />}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

      </div>

      {/* ตาราง */}
      <div className="rounded-[20px] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] w-full">
        <div tabIndex={0} role="region" aria-label={t('wh.tableLabel')} className="w-full overflow-x-auto rounded-2xl ring-1 ring-[#EEF1E6]">
          <table className="rtable w-full table-fixed text-center border-collapse min-w-[620px] md:min-w-[800px]">
            <colgroup>
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
              <col className="w-1/5" />
            </colgroup>
            <thead className="bg-[#2E4A1F] text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wh.col.date')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wh.col.type')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wh.col.qty')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wh.col.unit')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wh.col.wage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2EA]">
              {!entriesLoaded ? (
                <TableLoadingRow cols={5} />
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-[#E6F0D6]/50 transition-colors">
                    <td data-label={t('wh.col.date')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px] whitespace-nowrap">
                      {item.displayDate}
                    </td>
                    <td data-label={t('wh.col.type')} className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                      <span className={`inline-block min-w-[80px] sm:min-w-[88px] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[12px] sm:text-[13px] font-bold ${item.badgeStyle}`}>
                        {item.typeLabel}
                      </span>
                    </td>
                    <td data-label={t('wh.col.qty')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[14px] sm:text-[15px]">
                      {item.qty}
                    </td>
                    <td data-label={t('wh.col.unit')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px]">
                      {item.unit}
                    </td>
                    <td data-label={t('wh.col.wage')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[14px] sm:text-[15px] whitespace-nowrap">
                      {formatAmount(item.total)} <span className="ml-1">{t('common.baht')}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">
                    {t('wh.empty')}
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
