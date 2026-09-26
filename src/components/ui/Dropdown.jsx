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
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm outline-none focus:border-[#708238]"
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-test={dataTest ? `${dataTest}-opt-${opt.value}` : undefined}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
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
