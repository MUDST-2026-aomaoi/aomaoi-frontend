export function ModalShell({ onClose, children, className = '' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-6 sm:p-4">
      <div
        data-test="modal"
        className={`relative my-auto max-h-[calc(100dvh-3rem)] w-full max-w-88 overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-xl sm:max-h-[90dvh] sm:max-w-md sm:p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
