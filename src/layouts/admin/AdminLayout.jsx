import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-farm-bg">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
