import { useAuthStore } from '../../controller/authController';
import { Menu } from 'lucide-react';
import logo from '../../assets/sugarcane-logo.png';
import { useSidebar } from './SidebarContext';
import { useT, ROLE_LABEL } from '../../i18n';

export function PageHeader({ title }) {
  const t = useT();
  const currentUser = useAuthStore((s) => s.currentUser);
  const sidebar = useSidebar();

  const name = currentUser?.fullName || currentUser?.username || 'User';
  const roleDisplay = ROLE_LABEL[currentUser?.role] || 'User';

  const avatar = currentUser?.avatar;

  return (
    <header className="mb-5 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 sm:mb-6">
      <div className="flex min-w-0 items-center gap-2.5 md:hidden">
        <button type="button" aria-label={t('nav.openMenu')} aria-expanded={sidebar?.open} aria-controls="admin-sidebar" data-test="sidebar-toggle" onClick={sidebar?.openSidebar} className="-ml-1 shrink-0 rounded-lg bg-white p-2 text-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2 text-[#708238]">
          <img src={logo} alt="Sugarcane Logo" className="h-8 w-8 shrink-0 object-contain" />
          <span className="truncate text-xl font-bold tracking-tight">Sugarcane</span>
        </div>
      </div>
      <h1 className="order-3 col-span-2 truncate border-t border-[#E4E9DA] pt-3 text-2xl font-extrabold tracking-tight text-[#1A1A1A] md:order-1 md:col-span-1 md:border-0 md:pt-0 sm:text-3xl">{title}</h1>
      <div className="order-2 flex shrink-0 items-center justify-self-end gap-2.5 sm:gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4F7A2B] text-base font-semibold uppercase text-white sm:h-11 sm:w-11">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 leading-tight">
          <p className="max-w-[120px] truncate text-xs font-semibold text-farm-text sm:max-w-none sm:text-sm">{name}</p>
          <p className="text-[11px] text-farm-text/50 sm:text-xs">{roleDisplay}</p>
        </div>
      </div>
    </header>
  );
}
