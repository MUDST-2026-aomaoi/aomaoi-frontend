import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Dropdown({ value, onChange, options, className = '', label, error, dataTest }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <span className="mb-1 block text-sm font-medium text-farm-text">{label}</span>}
      <button
        type="button"
        data-test={dataTest}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#E4E9DA] bg-white px-4 py-2.5 text-sm text-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl bg-white p-2 shadow-[0_12px_32px_rgba(46,74,31,0.12)] ring-1 ring-black/5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-test={dataTest ? `${dataTest}-opt-${opt.value}` : undefined}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#E6F0D6]/60 ${
                opt.value === value ? 'font-semibold text-gray-900' : opt.value === '' ? 'text-gray-400 italic' : 'text-gray-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
