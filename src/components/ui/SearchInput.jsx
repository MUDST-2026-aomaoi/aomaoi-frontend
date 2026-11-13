import { Search } from 'lucide-react';
import { useT } from '../../i18n';

export function SearchInput({ value, onChange, placeholder, className = '', dataTest }) {
  const t = useT();
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        data-test={dataTest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.search')}
        className="w-full rounded-xl border border-[#E4E9DA] bg-white py-2.5 pl-4 pr-10 text-sm text-farm-text shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-gray-400 focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
      />
      <Search size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
