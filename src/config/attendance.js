import { t } from '../i18n';

export const ATTENDANCE_STATUSES = ['PRESENT', 'LEAVE', 'ABSENT'];

/** Button (selected) and chip/cell colours per status. */
export const ATTENDANCE_STYLE = {
  PRESENT: { active: 'border-green-600 bg-green-600 text-white', chip: 'bg-green-100 text-green-800', cell: 'bg-green-100 text-green-900 border-green-200' },
  LEAVE: { active: 'border-amber-500 bg-amber-500 text-white', chip: 'bg-amber-100 text-amber-800', cell: 'bg-amber-100 text-amber-900 border-amber-200' },
  ABSENT: { active: 'border-red-600 bg-red-600 text-white', chip: 'bg-red-100 text-red-700', cell: 'bg-red-100 text-red-800 border-red-200' },
};

export const ATTENDANCE_LABEL = {
  get PRESENT() { return t('att.present'); },
  get LEAVE() { return t('att.leave'); },
  get ABSENT() { return t('att.absent'); },
};
