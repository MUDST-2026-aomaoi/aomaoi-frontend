import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, suffix, className = '', ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-farm-text">{label}</span>}
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          className={`w-full rounded-lg border border-farm-secondary/50 bg-white px-3 py-2 text-sm text-farm-text outline-none focus:border-farm-primary focus:ring-1 focus:ring-farm-primary ${className}`}
          {...props}
        />
        {suffix && <span className="whitespace-nowrap text-sm text-farm-text/60">{suffix}</span>}
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
