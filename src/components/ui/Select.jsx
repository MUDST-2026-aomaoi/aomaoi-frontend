import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-farm-text">{label}</span>}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-xl border border-[#E4E9DA] bg-white px-3 py-2 pr-9 text-sm text-farm-text outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-farm-text/40" />
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
