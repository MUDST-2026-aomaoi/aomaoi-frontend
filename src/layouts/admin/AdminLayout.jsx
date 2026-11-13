import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarContext } from './SidebarContext';
import SetPasswordModal from '../../components/auth/SetPasswordModal';

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

  const sidebarContext = {
    open: sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
  };

  return (
    <SidebarContext.Provider value={sidebarContext}>
      <div className="admin-skin relative flex h-dvh overflow-hidden bg-[#F4F6F0]">
        {showPasswordModal && (
          <SetPasswordModal onSuccess={() => setShowPasswordModal(false)} />
        )}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
