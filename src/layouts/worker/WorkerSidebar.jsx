import { LayoutGrid, History, Wallet } from 'lucide-react';
import { RailSidebar } from '../admin/Sidebar';

const WORKER_NAV_ITEMS = [
  { to: '/dashboard', key: 'nav.dashboard', Icon: LayoutGrid },
  { to: '/history', key: 'nav.history', Icon: History },
  { to: '/salary-advance', key: 'nav.salaryAdvance', Icon: Wallet, testId: 'nav-worker-salary-advance' },
];

export function WorkerSidebar(props) {
  return <RailSidebar items={WORKER_NAV_ITEMS} ariaLabel="Worker navigation" {...props} />;
}
