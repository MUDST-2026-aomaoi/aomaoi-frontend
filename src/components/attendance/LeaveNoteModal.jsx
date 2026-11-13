import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ModalShell } from '../ui/ModalShell';
import { useT } from '../../i18n';

/** Asks for the short note that goes with a leave (who phoned, why). The note is optional. */
export function LeaveNoteModal({ workerName, initialNote = '', onConfirm, onCancel }) {
  const t = useT();
  const [note, setNote] = useState(initialNote);

  return (
    <ModalShell onClose={onCancel} className="w-full sm:w-100">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(note.trim());
        }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
          <h3 className="text-lg font-bold text-farm-primary">{t('att.noteTitle', { name: workerName })}</h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-farm-text">{t('att.noteLabel')}</span>
          <input
            autoFocus
            type="text"
            maxLength={255}
            data-test="attendance-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('att.notePlaceholder')}
            className="w-full rounded-lg border border-farm-secondary/50 bg-white px-3 py-2 text-sm text-farm-text outline-none focus:border-farm-primary focus:ring-1 focus:ring-farm-primary"
          />
        </label>
        <div className="mt-6 flex w-full gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" data-test="attendance-note-confirm" className="flex-1">
            {t('common.confirm')}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
