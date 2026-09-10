import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';

export function SuperAdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-farm-bg">
      <SuperAdminSidebar />
      <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
}
