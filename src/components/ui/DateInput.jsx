import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

const CustomDateButton = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-500 shadow-sm outline-none focus:border-[#708238]"
  >
    <span className={value ? '' : 'text-farm-text/40'}>{value || placeholder || 'เลือกวันที่'}</span>
    <Calendar className="h-4 w-4 shrink-0 text-farm-text/40" />
  </button>
));
CustomDateButton.displayName = 'CustomDateButton';

export function DateInput({ value, onChange, label, error, placeholder, className = '', isClearable = false }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-sm font-medium text-farm-text">{label}</span>}
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        dateFormat="dd/MM/yyyy"
        customInput={<CustomDateButton placeholder={placeholder} />}
        wrapperClassName="w-full"
        isClearable={isClearable && !!value}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
