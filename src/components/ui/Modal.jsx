import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-xl bg-white p-6 shadow-lg ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-farm-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-farm-text/60 hover:bg-farm-bg"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
