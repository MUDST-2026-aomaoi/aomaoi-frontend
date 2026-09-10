import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, FileText, LogOut, Sprout } from 'lucide-react';

const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors';
const linkActive = 'bg-farm-sidebarActive text-white border-l-4 border-farm-sidebarAccent -ml-6 pl-9 rounded-none';
const linkInactive = 'text-farm-sidebarText hover:text-white';

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-farm-sidebar text-white">
      <div className="flex items-center gap-3 p-6">
        <Sprout className="h-8 w-8 text-farm-sidebarAccent" />
        <h1 className="text-2xl font-bold text-farm-sidebarAccent">Sugarcane</h1>
      </div>

      <div className="flex-1 px-6 py-4">
        <p className="mb-4 text-sm text-farm-sidebarText">Menu</p>
        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <LayoutGrid className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/workers" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <Users className="h-5 w-5" />
            <span>Workers</span>
          </NavLink>

          <NavLink to="/work" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <FileText className="h-5 w-5" />
            <span>Work Log</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-6">
        <button type="button" onClick={() => navigate('/login')} className="flex items-center gap-3 text-white transition-colors hover:text-farm-sidebarText">
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
