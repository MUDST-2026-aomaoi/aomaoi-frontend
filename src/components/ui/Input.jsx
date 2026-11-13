import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, suffix, className = '', labelClass = '', ...props }, ref) {
  return (
    <label className="block">
      {label && <span className={`mb-1 text-sm font-medium text-farm-text ${labelClass || 'block'}`}>{label}</span>}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full rounded-xl border border-[#E4E9DA] bg-white px-3 py-2 text-sm text-farm-text outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40 ${suffix ? 'pr-14' : ''} ${className}`}
          {...props}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-farm-text/50">{suffix}</span>}
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
