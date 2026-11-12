import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Wallet, LogOut, Menu, X } from 'lucide-react';
import logo from '../../assets/sugarcane-logo.png';
import SetPasswordModal from '../../components/auth/SetPasswordModal';
import { useAuthStore } from '../../controller/authController';
import { LanguageSwitch } from '../../components/ui/LanguageSwitch';
import { useT, ROLE_LABEL } from '../../i18n';

export default function WorkerLayout({ children }) {
  const t = useT();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // โชว์ Modal ตั้งรหัสผ่านถ้าหน้า Login แนบ state มาว่าเป็นการ login ครั้งแรก
  const [showPasswordModal, setShowPasswordModal] = useState(
    location.state?.showSetPassword || false
  );

  const currentUser = useAuthStore((state) => state.currentUser);
  const myWorkerId = currentUser?.id;
  const myUsername = currentUser?.username || 'worker';
  const myFullName = currentUser?.fullName || myUsername;

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  };

  // ฟังก์ชันสลับสีเมนู (ใช้เทคนิค -ml-6 pl-9 เหมือน Admin แต่สีสว่าง)
  const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors';
  const linkActive = 'bg-[#708238]/10 text-[#708238] border-l-4 border-[#708238] -ml-6 pl-9 rounded-none font-bold';
  const linkInactive = 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';

  const isPathActive = (path) => location.pathname.includes(path);

  const getNavClass = (path) => {
    return `${linkBase} ${isPathActive(path) ? linkActive : linkInactive}`;
  };

  const pageTitle = location.pathname.includes('/salary-advance')
    ? t('nav.salaryAdvance')
    : location.pathname.includes('/history')
      ? t('nav.history')
      : t('nav.dashboard');

  return (
    <div className="flex h-screen h-[100dvh] bg-[#F9FAFB] text-farm-text font-sans relative overflow-hidden">
      
      {/* ป็อปอัพตั้งรหัสผ่าน (บังทั้งหน้าจอ) */}
      {showPasswordModal && (
        <SetPasswordModal onSuccess={() => setShowPasswordModal(false)} />
      )}

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar: อ้างอิง Layout แบบ Admin แต่สีพื้นหลังสว่าง (Drawer บนจอมือถือ < md, Static บนจอ md ขึ้นไป) */}
      <aside
        id="worker-sidebar"
        aria-label="Worker navigation"
        className={`fixed inset-y-0 left-0 z-40 flex h-screen h-[100dvh] w-64 shrink-0 flex-col bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full'
        }`}
      >
        
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 text-[#708238]">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sugarcane Logo" className="h-9 w-9 object-contain" />
            <h1 className="text-2xl font-bold tracking-tight">Sugarcane</h1>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label={t('nav.closeMenu')}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Section */}
        <div className="flex-1 px-6 py-4 overflow-y-auto overscroll-contain">
          <p className="mb-4 text-sm text-gray-400">{t('nav.menu')}</p>
          <nav aria-label="Primary" className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              aria-current={isPathActive('/dashboard') ? 'page' : undefined}
              onClick={() => setSidebarOpen(false)}
              className={getNavClass('/dashboard')}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>{t('nav.dashboard')}</span>
            </Link>
            <Link
              to="/history"
              aria-current={isPathActive('/history') ? 'page' : undefined}
              onClick={() => setSidebarOpen(false)}
              className={getNavClass('/history')}
            >
              <History className="h-5 w-5" />
              <span>{t('nav.history')}</span>
            </Link>
            <Link
              to="/salary-advance"
              data-test="nav-worker-salary-advance"
              aria-current={isPathActive('/salary-advance') ? 'page' : undefined}
              onClick={() => setSidebarOpen(false)}
              className={getNavClass('/salary-advance')}
            >
              <Wallet className="h-5 w-5" />
              <span>{t('nav.salaryAdvance')}</span>
            </Link>
          </nav>
        </div>

        {/* Logout Section */}
        <div className="flex flex-col gap-5 p-6">
          <LanguageSwitch block />
          <button
            data-test="logout-button"
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 transition-colors hover:text-red-500 font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <header className="mb-5 sm:mb-6 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4">
          {/* Mobile Top Bar Left: Hamburger + Sugarcane Logo (ซ่อนบนจอ md ขึ้นไป) */}
          <div className="flex items-center gap-2.5 min-w-0 md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('nav.openMenu')}
              aria-expanded={sidebarOpen}
              aria-controls="worker-sidebar"
              className="p-2 -ml-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm shrink-0 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-[#708238] min-w-0">
              <img src={logo} alt="Sugarcane Logo" className="h-8 w-8 object-contain shrink-0" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight truncate">Sugarcane</span>
            </div>
          </div>

          {/* Page Title: บนมือถือ (< md) อยู่บรรทัดที่ 2 เต็มความกว้าง, บนจอ md ขึ้นไปอยู่บรรทัดแรกฝั่งซ้าย */}
          <h1 className="col-span-2 order-3 pt-1 border-t border-gray-200/80 md:border-t-0 md:pt-0 md:col-span-1 md:order-1 text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            {pageTitle}
          </h1>
          
          {/* Profile Section: อยู่บรรทัดแรกฝั่งขวาเสมอ */}
          <div className="order-2 flex items-center justify-self-end gap-2.5 sm:gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-200 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs sm:text-sm font-semibold text-farm-text max-w-[120px] sm:max-w-none truncate">{myFullName}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-gray-500">{ROLE_LABEL.worker}</p>
            </div>
          </div>
        </header>

        {children || <Outlet context={{ myWorkerId }} />}
      </main>

    </div>
  );
}
