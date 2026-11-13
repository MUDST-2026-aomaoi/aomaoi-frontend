import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, FileText, Wallet, Scale, LogOut, X, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import logo from '../../assets/sugarcane-logo.png';
import { useAuthStore } from '../../controller/authController';
import { useLangStore } from '../../store/useLangStore';
import { useT } from '../../i18n';
import { LanguageSwitch } from '../../components/ui/LanguageSwitch';

export const ADMIN_NAV_ITEMS = [
  { to: '/dashboard', key: 'nav.dashboard', Icon: LayoutGrid },
  { to: '/workers', key: 'nav.workers', Icon: Users },
  { to: '/work', key: 'nav.workLog', Icon: FileText },
  { to: '/advance-salary', key: 'nav.advanceSalary', Icon: Wallet },
  { to: '/financial-balance', key: 'nav.financialBalance', Icon: Scale },
];

const CARD = 'bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(46,74,31,0.10)] ring-1 ring-white/70';
const ITEM = 'relative flex h-11 w-full items-center gap-3 rounded-2xl px-3.5 text-sm font-semibold transition-colors';

function useDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia('(min-width: 768px)');
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia('(min-width: 768px)').matches,
    () => true
  );
}

function Label({ show, children }) {
  return <span className={`whitespace-nowrap transition-opacity duration-150 ${show ? 'opacity-100' : 'opacity-0'}`}>{children}</span>;
}

function NavItems({ t, items, showLabels, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {items.map(({ to, key, Icon, testId }) => (
        <NavLink
          key={to}
          to={to}
          data-test={testId}
          title={showLabels ? undefined : t(key)}
          aria-label={t(key)}
          onClick={onNavigate}
          className={({ isActive }) => `${ITEM} ${isActive ? 'bg-[#E6F0D6] text-[#2E4A1F]' : 'text-[#6B7264] hover:bg-[#F1F5E8] hover:text-[#2E4A1F]'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r-full bg-[#A8D04A]" />}
              <Icon className="h-5 w-5 shrink-0" />
              <Label show={showLabels}>{t(key)}</Label>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Footer({ t, showLabels }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <div className="flex flex-col gap-2 px-2 pb-3">
      {showLabels ? (
        <div className="px-1.5">
          <LanguageSwitch block />
        </div>
      ) : (
        <div role="group" data-test="lang-switch" aria-label="Language" className="mx-auto flex w-12 flex-col gap-0.5 rounded-xl bg-[#F1F5E8] p-0.5">
          {['th', 'en'].map((code) => (
            <button
              key={code}
              type="button"
              data-test={`lang-${code}`}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={`h-7 rounded-lg text-[11px] font-bold transition-colors ${lang === code ? 'bg-[#2E4A1F] text-white' : 'text-[#6B7264] hover:text-[#2E4A1F]'}`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        data-test="logout-button"
        title={showLabels ? undefined : t('nav.logout')}
        aria-label={t('nav.logout')}
        onClick={() => {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }}
        className={`${ITEM} text-[#6B7264] hover:bg-[#F1F5E8] hover:text-[#2E4A1F]`}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <Label show={showLabels}>{t('nav.logout')}</Label>
      </button>
    </div>
  );
}

function Brand({ showLabels }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 pl-[14px] pr-3">
      <img src={logo} alt="Sugarcane Logo" className="h-9 w-9 shrink-0 object-contain" />
      <Label show={showLabels}>
        <h1 className="text-xl font-extrabold tracking-tight text-[#7DA33A]">Sugarcane</h1>
      </Label>
    </div>
  );
}

export function Sidebar(props) {
  return <RailSidebar items={ADMIN_NAV_ITEMS} ariaLabel="Admin navigation" {...props} />;
}

export function RailSidebar({ items, ariaLabel, open = false, onClose }) {
  const t = useT();
  const desktop = useDesktop();
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  // Expanded rail floats over the page, so any outside click or Esc folds it back.
  useEffect(() => {
    if (!desktop || !expanded) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setExpanded(false);
    const onKey = (e) => e.key === 'Escape' && setExpanded(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [desktop, expanded]);

  if (desktop) {
    return (
      <div className="relative hidden h-full w-[88px] shrink-0 md:block">
        <div ref={ref} className="absolute bottom-4 left-4 top-4 z-40 transition-[width] duration-200 ease-out" style={{ width: expanded ? 232 : 64 }}>
          <aside id="admin-sidebar" aria-label={ariaLabel} className={`flex h-full flex-col overflow-hidden rounded-3xl ${CARD}`}>
            <Brand showLabels={expanded} />
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
              <NavItems t={t} items={items} showLabels={expanded} onNavigate={() => setExpanded(false)} />
            </div>
            <div className="px-2 pb-1">
              <button
                type="button"
                data-test="sidebar-expand"
                title={expanded ? undefined : t('nav.openMenu')}
                aria-label={expanded ? t('nav.closeMenu') : t('nav.openMenu')}
                aria-expanded={expanded}
                aria-controls="admin-sidebar"
                onClick={() => setExpanded((v) => !v)}
                className={`${ITEM} text-[#6B7264] hover:bg-[#F1F5E8] hover:text-[#2E4A1F]`}
              >
                {expanded ? <PanelLeftClose className="h-5 w-5 shrink-0" /> : <PanelLeftOpen className="h-5 w-5 shrink-0" />}
                <Label show={expanded}>{t('nav.closeMenu')}</Label>
              </button>
            </div>
            <Footer t={t} showLabels={expanded} />
          </aside>
        </div>
      </div>
    );
  }

  // Phones: slide-in drawer, always with labels.
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-[#2E4A1F]/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />}
      <aside
        id="admin-sidebar"
        aria-label={ariaLabel}
        className={`fixed inset-y-3 left-3 z-40 flex w-64 flex-col overflow-hidden rounded-3xl transition-transform duration-200 ease-out ${CARD} ${open ? 'translate-x-0' : '-translate-x-[110%]'}`}
      >
        <div className="flex items-center">
          <div className="flex-1">
            <Brand showLabels />
          </div>
          <button type="button" aria-label={t('nav.closeMenu')} onClick={onClose} className="mr-3 rounded-xl p-1.5 text-[#6B7264] hover:bg-[#F1F5E8]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <NavItems t={t} items={items} showLabels onNavigate={onClose} />
        </div>
        <Footer t={t} showLabels />
      </aside>
    </>
  );
}
