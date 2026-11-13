import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useT } from '../../i18n';

export function Modal({ open, onClose, title, children, className = '' }) {
  const t = useT();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E4A1F]/30 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(46,74,31,0.18)] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-farm-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-farm-text/60 hover:bg-[#E6F0D6]/60"
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
