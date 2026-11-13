import { Check, X } from 'lucide-react';
import { ModalShell } from './ModalShell';

export function SuccessModal({ onClose, message, submessage }) {
  return (
    <ModalShell onClose={onClose} className="flex flex-col items-center p-10 text-center sm:w-100">
      <button type="button" data-test="success-modal-close" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
        <X className="h-5 w-5" />
      </button>
      <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#E6F0D6]">
        <Check className="h-14 w-14 text-[#4F7A2B]" strokeWidth={2.5} />
      </div>
      <p data-test="success-modal-message" className="text-base font-medium text-gray-700">{message}</p>
      {submessage && <p className="mt-1 text-sm text-gray-500">{submessage}</p>}
    </ModalShell>
  );
}
