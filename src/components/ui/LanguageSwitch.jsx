import { useLangStore } from '../../store/useLangStore';

const OPTIONS = [
  { value: 'th', label: 'TH' },
  { value: 'en', label: 'EN' },
];

/**
 * TH | EN toggle.
 * tone: 'light' (white backgrounds) or 'dark' (sidebars).
 * block: stretch to the full width of its container (sidebar footer), styled like a nav item.
 */
export function LanguageSwitch({ className = '', tone = 'light', block = false }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  const dark = tone === 'dark';
  const frame = dark ? 'border-white/15 bg-white/5' : 'border-gray-200 bg-white shadow-sm';
  const active = dark ? 'bg-farm-sidebarActive text-white' : 'bg-farm-primary text-white';
  const idle = dark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-800';
  const size = block ? 'flex-1 py-2.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <div
      role="group"
      aria-label="Language"
      data-test="lang-switch"
      className={`${block ? 'flex w-full' : 'inline-flex shrink-0'} rounded-lg border p-0.5 font-semibold ${frame} ${className}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          data-test={`lang-${o.value}`}
          aria-pressed={lang === o.value}
          onClick={() => setLang(o.value)}
          className={`rounded-md text-center transition-colors ${size} ${lang === o.value ? active : idle}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
