import { Check, X } from 'lucide-react';
import { ModalShell } from './ModalShell';

export function SuccessModal({ onClose, message, submessage }) {
  return (
    <ModalShell onClose={onClose} className="flex w-100 flex-col items-center p-10 text-center">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
      <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-farm-primary">
        <Check className="h-14 w-14 text-farm-primary" strokeWidth={2.5} />
      </div>
      <p className="text-base font-medium text-gray-700">{message}</p>
      {submessage && <p className="mt-1 text-sm text-gray-500">{submessage}</p>}
    </ModalShell>
  );
}
