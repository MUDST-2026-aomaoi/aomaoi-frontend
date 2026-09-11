import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Sprout, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../../controller/authController';

const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors';
const linkActive = 'bg-farm-superSidebarActive text-white border-l-4 border-farm-sidebarAccent -ml-6 pl-9 rounded-none';
const linkInactive = 'text-white/60 hover:text-white';

export function SuperAdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-farm-superSidebar text-white">
      <div className="flex items-center gap-3 p-6">
        <Sprout className="h-8 w-8 text-farm-sidebarAccent" />
        <h1 className="text-2xl font-bold text-farm-sidebarAccent">Sugarcane</h1>
      </div>

      <div className="flex-1 px-6 py-4">
        <p className="mb-4 text-sm text-white/50">Menu</p>
        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <LayoutGrid className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/farms" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <Sprout className="h-5 w-5" />
            <span>All Farms</span>
          </NavLink>

          <NavLink to="/admins" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <Users className="h-5 w-5" />
            <span>All Admins</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-6">
        <button type="button" onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }} className="flex items-center gap-3 text-white transition-colors hover:text-white/70">
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
