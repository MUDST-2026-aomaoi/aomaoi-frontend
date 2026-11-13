import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SetPasswordModal from '../../components/auth/SetPasswordModal';
import { useAuthStore } from '../../controller/authController';
import { useT } from '../../i18n';
import { SidebarContext } from '../admin/SidebarContext';
import { PageHeader } from '../admin/PageHeader';
import { WorkerSidebar } from './WorkerSidebar';

export default function WorkerLayout({ children }) {
  const t = useT();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show the set-password modal when Login flags a first-time sign-in.
  const [showPasswordModal, setShowPasswordModal] = useState(location.state?.showSetPassword || false);

  const myWorkerId = useAuthStore((state) => state.currentUser?.id);

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

  const pageTitle = location.pathname.includes('/salary-advance')
    ? t('nav.salaryAdvance')
    : location.pathname.includes('/history')
      ? t('nav.history')
      : t('nav.dashboard');

  return (
    <SidebarContext.Provider value={sidebarContext}>
      <div className="admin-skin relative flex h-dvh overflow-hidden bg-[#F4F6F0]">
        {showPasswordModal && <SetPasswordModal onSuccess={() => setShowPasswordModal(false)} />}
        <WorkerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <PageHeader title={pageTitle} />
            {children || <Outlet context={{ myWorkerId }} />}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
