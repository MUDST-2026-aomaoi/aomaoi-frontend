export const STATUS_STYLE = {
  active: 'bg-[#dcfce7] text-[#166534]',
  pending: 'bg-[#fef08a] text-[#854d0e]',
  inactive: 'bg-[#fecdd3] text-[#991b1b]',
};

import { t } from '../i18n';

export const STATUS_LABEL = {
  get active() { return t('status.active'); },
  get pending() { return t('status.pending'); },
  get inactive() { return t('status.inactive'); },
};
