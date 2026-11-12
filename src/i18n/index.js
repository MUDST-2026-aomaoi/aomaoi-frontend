import { useCallback } from 'react';
import { enGB } from 'date-fns/locale/en-GB';
import { th as thLocale } from 'date-fns/locale/th';
import { useLangStore } from '../store/useLangStore';
import { MESSAGES } from './messages';

/** Role names stay in English in every language. */
export const ROLE_LABEL = { superadmin: 'Super Admin', admin: 'Admin', worker: 'Worker' };

function translate(lang, key, params) {
  const entry = MESSAGES[key];
  let text = entry?.[lang] ?? entry?.th ?? key;
  if (params) {
    Object.entries(params).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
  }
  return text;
}

/** Non-hook translate for config/services. Components should prefer useT() so they re-render. */
export function t(key, params) {
  return translate(useLangStore.getState().lang, key, params);
}

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return useCallback((key, params) => translate(lang, key, params), [lang]);
}

export function useLang() {
  return useLangStore((s) => s.lang);
}

export function getLocale(lang = useLangStore.getState().lang) {
  return lang === 'en' ? 'en-GB' : 'th-TH';
}

export function getDateFnsLocale(lang = useLangStore.getState().lang) {
  return lang === 'en' ? enGB : thLocale;
}

export function periodOptions(translate) {
  return [
    { value: 'month', label: translate('period.month') },
    { value: 'day', label: translate('period.day') },
    { value: 'year', label: translate('period.year') },
  ];
}
