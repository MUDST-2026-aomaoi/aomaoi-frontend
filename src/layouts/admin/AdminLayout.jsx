import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import SetPasswordModal from '../../components/auth/SetPasswordModal';

export function AdminLayout({ children }) {
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(
    location.state?.showSetPassword || false
  );

  return (
    <div className="flex h-screen bg-farm-bg relative">
      {showPasswordModal && (
        <SetPasswordModal onSuccess={() => setShowPasswordModal(false)} />
      )}
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
}
