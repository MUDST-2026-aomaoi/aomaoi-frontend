import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import SetPasswordModal from '../../components/auth/SetPasswordModal';
import logo from '../../assets/sugarcane-logo.png';

export function AdminLayout({ children }) {
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(
    location.state?.showSetPassword || false
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => e.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="relative flex h-dvh bg-farm-bg">
      {showPasswordModal && (
        <SetPasswordModal onSuccess={() => setShowPasswordModal(false)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 bg-farm-sidebar px-4 py-3 text-white md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
            data-test="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            className="-ml-2 rounded-lg p-2 transition-colors hover:bg-farm-sidebarActive"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img src={logo} alt="" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold text-farm-sidebarAccent">Sugarcane</span>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
