import { LayoutGrid, Sprout, Users, ClipboardList } from 'lucide-react';
import { RailSidebar } from '../admin/Sidebar';

const SUPER_NAV_ITEMS = [
  { to: '/dashboard', key: 'nav.dashboard', Icon: LayoutGrid },
  { to: '/farms', key: 'nav.farms', Icon: Sprout },
  { to: '/admins', key: 'nav.admins', Icon: Users },
  { to: '/audit-logs', key: 'nav.auditLogs', Icon: ClipboardList },
];

export function SuperAdminSidebar(props) {
  return <RailSidebar items={SUPER_NAV_ITEMS} ariaLabel="Super admin navigation" {...props} />;
}
