import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

const CustomDateButton = forwardRef(({ value, onClick, placeholder, dataTest }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    data-test={dataTest}
    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-500 shadow-sm outline-none focus:border-[#708238]"
  >
    <span className={value ? '' : 'text-farm-text/40'}>{value || placeholder || 'เลือกวันที่'}</span>
    <Calendar className="h-4 w-4 shrink-0 text-farm-text/40" />
  </button>
));
CustomDateButton.displayName = 'CustomDateButton';

const parseLocalDate = (str) => {
  if (!str) return null;
  if (typeof str !== 'string') return new Date(str);
  if (str.includes('T')) return new Date(str);
  const parts = str.split('-').map(Number);
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  return new Date(str);
};

export function DateInput({ value, onChange, label, error, placeholder, className = '', isClearable = false, dataTest }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-sm font-medium text-farm-text">{label}</span>}
      <DatePicker
        selected={parseLocalDate(value)}
        onChange={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        dateFormat="dd/MM/yyyy"
        customInput={<CustomDateButton placeholder={placeholder} dataTest={dataTest} />}
        wrapperClassName="w-full"
        isClearable={isClearable && !!value}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
