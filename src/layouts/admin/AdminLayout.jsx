import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';

export function AdminLayout({ children }) {
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const workersLoaded = useWorkerStore((s) => s.loaded);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const entriesLoaded = useWorkLogStore((s) => s.loaded);

  useEffect(() => {
    if (!workersLoaded) fetchWorkers();
    if (!entriesLoaded) fetchEntries();
  }, [fetchWorkers, workersLoaded, fetchEntries, entriesLoaded]);

  return (
    <div className="flex h-screen bg-farm-bg">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
}
