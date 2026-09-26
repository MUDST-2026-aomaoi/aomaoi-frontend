import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = 'ค้นหา', className = '', dataTest }) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        data-test={dataTest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-farm-text shadow-sm outline-none placeholder:text-gray-400 focus:border-[#708238]"
      />
      <Search size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
