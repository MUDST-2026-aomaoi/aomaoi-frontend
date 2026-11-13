export function ModalShell({ onClose, children, className = '' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2E4A1F]/30 p-6 backdrop-blur-sm sm:p-4">
      <div
        data-test="modal"
        className={`relative my-auto max-h-[calc(100dvh-3rem)] w-full max-w-88 overflow-y-auto overscroll-contain rounded-3xl bg-white p-4 shadow-[0_20px_60px_rgba(46,74,31,0.18)] sm:max-h-[90dvh] sm:max-w-md sm:p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
