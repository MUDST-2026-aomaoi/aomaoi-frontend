import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { DatePickerPopperContainer } from './DatePickerPopperContainer';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useT, getDateFnsLocale } from '../../i18n';
import { localizeDateText } from '../../lib/format';

const CustomDateButton = forwardRef(({ value, onClick, placeholder, dataTest }, ref) => {
  const t = useT();
  return (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    data-test={dataTest}
    className="flex w-full items-center justify-between rounded-xl border border-[#E4E9DA] bg-white px-4 py-2.5 text-left text-sm text-gray-500 shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
  >
    <span className={value ? '' : 'text-farm-text/40'}>{localizeDateText(value) || placeholder || t('common.selectDate')}</span>
    <Calendar className="h-4 w-4 shrink-0 text-farm-text/40" />
  </button>
  );
});
CustomDateButton.displayName = 'CustomDateButton';

const parseLocalDate = (str) => {
  if (!str) return null;
  if (typeof str !== 'string') return new Date(str);
  if (str.includes('T')) return new Date(str);
  const parts = str.split('-').map(Number);
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  return new Date(str);
};

export function DateInput({ value, onChange, label, error, placeholder, className = '', isClearable = false, dataTest, maxDate, minDate, labelClass = '' }) {
  useT();
  return (
    <label className={`block ${className}`}>
      {label && <span className={`mb-1 text-sm font-medium text-farm-text ${labelClass || 'block'}`}>{label}</span>}
      <DatePicker popperContainer={DatePickerPopperContainer} locale={getDateFnsLocale()}
        selected={parseLocalDate(value)}
        onChange={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        dateFormat="dd/MM/yyyy"
        customInput={<CustomDateButton placeholder={placeholder} dataTest={dataTest} />}
        wrapperClassName="w-full"
        maxDate={maxDate}
        minDate={minDate}
        isClearable={isClearable && !!value}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
