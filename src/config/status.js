export const STATUS_STYLE = {
  active: 'bg-[#E6F0D6] text-[#2E4A1F]',
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  inactive: 'bg-[#FEE2E2] text-[#991B1B]',
};

import { t } from '../i18n';

export const STATUS_LABEL = {
  get active() { return t('status.active'); },
  get pending() { return t('status.pending'); },
  get inactive() { return t('status.inactive'); },
};
