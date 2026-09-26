export function ModalShell({ onClose, children, className = '' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div data-test="modal" className={`relative rounded-2xl bg-white p-6 shadow-xl ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
