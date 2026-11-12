import { NavLink } from 'react-router-dom';
import { LayoutGrid, Sprout, Users, LogOut, ClipboardList, X } from 'lucide-react';
import { useAuthStore } from '../../controller/authController';
import logo from '../../assets/sugarcane-logo.png';
import { useT } from '../../i18n';

const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors';
const linkActive = 'bg-farm-superSidebarActive text-white border-l-4 border-farm-sidebarAccent -ml-6 pl-9 rounded-none';
const linkInactive = 'text-white/60 hover:text-white';

export function SuperAdminSidebar({ open = false, onClose }) {
  const t = useT();
  return (
    <>
    {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />}
    <aside
      id="admin-sidebar"
      aria-label="Super admin navigation"
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-y-auto bg-farm-superSidebar text-white transition-transform duration-200 ease-out md:static md:z-auto md:h-full md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 p-6">
        <img src={logo} alt="Sugarcane Logo" className="h-9 w-9 object-contain" />
        <h1 className="flex-1 text-2xl font-bold text-farm-sidebarAccent">Sugarcane</h1>
        <button
          type="button"
          aria-label={t('nav.closeMenu')}
          onClick={onClose}
          className="rounded-lg p-1 text-white/60 transition-colors hover:text-white md:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 px-6 py-4">
        <p className="mb-4 text-sm text-white/50">{t('nav.menu')}</p>
        <nav className="flex flex-col gap-2" onClick={onClose}>
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <LayoutGrid className="h-5 w-5" />
            <span>{t('nav.dashboard')}</span>
          </NavLink>

          <NavLink to="/farms" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <Sprout className="h-5 w-5" />
            <span>{t('nav.farms')}</span>
          </NavLink>

          <NavLink to="/admins" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <Users className="h-5 w-5" />
            <span>{t('nav.admins')}</span>
          </NavLink>
          
          <NavLink to="/audit-logs" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <ClipboardList className="h-5 w-5" />
            <span>{t('nav.auditLogs')}</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-6">
        <button type="button" data-test="logout-button" onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }} className="flex items-center gap-3 text-white transition-colors hover:text-white/70">
          <LogOut className="h-5 w-5" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
    </>
  );
}
