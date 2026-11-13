import { useState, useMemo, forwardRef, useEffect, useRef } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { DatePickerPopperContainer } from '../../components/ui/DatePickerPopperContainer';
import { TableSkeletonRows } from '../../components/ui/Skeleton';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useT, getDateFnsLocale } from '../../i18n';
import { useSalaryAdvanceStore } from '../../store/useSalaryAdvanceStore';
import { formatDate, formatAmount, localizeDateText } from '../../lib/format';

const CustomDateInput = forwardRef(({ value, onClick, placeholder, dataTest }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <input
      type="text"
      readOnly
      value={localizeDateText(value)}
      placeholder={placeholder}
      data-test={dataTest}
      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#E4E9DA] bg-white text-gray-500 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40 cursor-pointer"
    />
    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
));
CustomDateInput.displayName = 'CustomDateInput';

const advanceOptions = (t) => [
  { value: '', label: t('worker.allAdvanceTypes') },
  { value: 'CASH', label: t('advance.cash') },
  { value: 'GOODS', label: t('advance.goods') },
];

const advanceBadge = (t) => ({
  CASH: {
    label: t('advance.cash'),
    className: 'bg-[#A2C73E]/40 text-black',
  },
  GOODS: {
    label: t('advance.goods'),
    className: 'bg-[#FFEA76]/40 text-black',
  },
});

export default function WorkerSalaryAdvance() {
  const t = useT();
  const ADVANCE_OPTIONS = advanceOptions(t);
  const ADVANCE_BADGE = advanceBadge(t);
  const myAdvances = useSalaryAdvanceStore((s) => s.myAdvances);
  const fetchMyAdvances = useSalaryAdvanceStore((s) => s.fetchMyAdvances);
  const myAdvancesLoaded = useSalaryAdvanceStore((s) => s.myLoaded);

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
  }, [myAdvances, t]);

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
    ADVANCE_OPTIONS.find((opt) => opt.value === filterType)?.label || t('worker.allAdvanceTypes');

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Subtitle ใต้ Header */}
      <p className="-mt-2 mb-5 text-sm text-[#8A8F85] sm:mb-6 sm:text-base">
        {t('wsa.subtitle')}
      </p>

      {/* แถบค้นหาและฟิลเตอร์ */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6">
        {/* Search & Dropdown Group: บนมือถืออยู่แถวเดียวกันคนละครึ่ง 50/50, บน Desktop วางเรียงต่อกัน */}
        <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto sm:flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
            <input
              type="text"
              placeholder={t('worker.searchActivity')}
              data-test="worker-advance-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3.5 sm:pl-5 pr-10 sm:pr-12 py-2.5 rounded-xl border border-[#E4E9DA] bg-white text-farm-text text-xs sm:text-sm placeholder:text-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
            />
            <Search size={18} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown ประเภทการเบิก */}
          <div className="relative flex-1 sm:flex-none w-auto sm:w-[210px] min-w-0" ref={dropdownRef}>
            <div
              data-test="worker-advance-type-filter"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 rounded-xl border border-[#E4E9DA] bg-white text-xs sm:text-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-pointer flex items-center justify-between outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
            >
              <span className={`truncate ${filterType === '' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedOptionLabel}
              </span>
            </div>
            <ChevronDown size={18} className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full min-w-[160px] rounded-2xl bg-white p-2 shadow-[0_12px_32px_rgba(46,74,31,0.12)] ring-1 ring-black/5 z-50 max-h-72 overflow-y-auto">
                {ADVANCE_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    data-test={`worker-advance-type-option-${opt.value || 'all'}`}
                    onClick={() => {
                      setFilterType(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors hover:bg-[#E6F0D6]/60 ${
                      filterType === opt.value ? 'font-semibold text-gray-900' : 'text-gray-600'
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
            <DatePicker popperContainer={DatePickerPopperContainer} locale={getDateFnsLocale()}
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              customInput={<CustomDateInput placeholder={t('worker.searchDate')} dataTest="worker-advance-start-date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <span className="text-farm-text font-bold text-[14px] px-0.5 sm:px-1 shrink-0">{t('worker.to')}</span>

          <div className="flex-1 sm:flex-none sm:w-[180px] min-w-0 [&_.react-datepicker-wrapper]:w-full">
            <DatePicker popperContainer={DatePickerPopperContainer} locale={getDateFnsLocale()}
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              customInput={<CustomDateInput placeholder={t('worker.searchDate')} dataTest="worker-advance-end-date" />}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <div className="rounded-[20px] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] w-full">
        <div tabIndex={0} role="region" aria-label={t('wsa.tableLabel')} className="w-full overflow-x-auto rounded-2xl ring-1 ring-[#EEF1E6]">
          <table data-test="worker-advance-table" className="rtable w-full table-fixed text-center border-collapse min-w-[560px] md:min-w-[800px]">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead className="bg-[#2E4A1F] text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wh.col.date')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wsa.col.item')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wsa.col.type')}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-[14px] sm:text-[15px]">{t('wsa.col.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2EA]">
              {!myAdvancesLoaded ? (
                <TableSkeletonRows cols={4} rowClassName="" cellClassName="py-3.5 px-3 sm:py-4 sm:px-6" />
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} data-test="worker-advance-row" className="hover:bg-[#E6F0D6]/50 transition-colors">
                    <td data-label={t('wh.col.date')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px] whitespace-nowrap">
                      {item.displayDate}
                    </td>
                    <td data-label={t('wsa.col.item')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[13px] sm:text-[14px]">
                      {item.itemName || '-'}
                    </td>
                    <td data-label={t('wsa.col.type')} className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                      <span
                        data-test="worker-advance-row-type"
                        className={`inline-block min-w-[80px] sm:min-w-[88px] px-3 sm:px-4 py-1 rounded-full text-[12px] sm:text-[13px] font-medium ${item.badgeClass}`}
                      >
                        {item.typeLabel}
                      </span>
                    </td>
                    <td data-label={t('wsa.col.amount')} className="py-3 px-3 sm:py-4 sm:px-6 text-center font-medium text-farm-text text-[14px] sm:text-[15px] whitespace-nowrap">
                      {formatAmount(item.amount)} <span className="ml-1">{t('common.baht')}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 font-medium">
                    {t('wsa.empty')}
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
