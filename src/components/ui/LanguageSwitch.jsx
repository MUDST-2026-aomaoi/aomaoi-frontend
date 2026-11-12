import { useLangStore } from '../../store/useLangStore';

const OPTIONS = [
  { value: 'th', label: 'TH' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitch({ className = '', tone = 'light' }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const active = tone === 'dark' ? 'bg-white text-farm-text' : 'bg-farm-primary text-white';
  const idle = tone === 'dark' ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-800';
  return (
    <div role="group" aria-label="Language" data-test="lang-switch" className={`inline-flex shrink-0 rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-semibold shadow-sm ${className}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          data-test={`lang-${o.value}`}
          aria-pressed={lang === o.value}
          onClick={() => setLang(o.value)}
          className={`rounded-md px-2.5 py-1 transition-colors ${lang === o.value ? active : idle}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
