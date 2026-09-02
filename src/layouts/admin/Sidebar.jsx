import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, ChevronDown, BarChart3, LogOut } from 'lucide-react';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';

const linkBase = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
const linkActive = 'bg-white text-farm-primary';
const linkInactive = 'text-farm-bg/90 hover:bg-white/10';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [workLogOpen, setWorkLogOpen] = useState(location.pathname.startsWith('/admin/work'));

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-farm-primary px-3 py-4">
      <div className="mb-6 px-2">
        <span className="text-lg font-bold text-white">บัญชีไร่อ้อย</span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/admin/workers" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          <Users size={18} />
          คนงาน
        </NavLink>

        <button
          type="button"
          onClick={() => setWorkLogOpen((v) => !v)}
          className={`${linkBase} ${linkInactive} w-full justify-between`}
        >
          <span className="flex items-center gap-3">
            <ClipboardList size={18} />
            บันทึกงาน
          </span>
          <ChevronDown size={16} className={`transition-transform ${workLogOpen ? 'rotate-180' : ''}`} />
        </button>

        {workLogOpen && (
          <div className="ml-8 space-y-1 border-l border-white/15 pl-3">
            {WORK_LOG_ORDER.map((key) => {
              const type = WORK_LOG_TYPES[key];
              return (
                <NavLink
                  key={key}
                  to={`/admin/work/${type.path}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                      isActive ? 'bg-white text-farm-primary' : 'text-farm-bg/80 hover:bg-white/10'
                    }`
                  }
                >
                  <type.icon size={16} />
                  {type.labelTh}
                </NavLink>
              );
            })}
          </div>
        )}

        <NavLink to="/admin/overview" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          <BarChart3 size={18} />
          ภาพรวม
        </NavLink>
      </nav>

      <button type="button" onClick={() => navigate('/login')} className={`${linkBase} ${linkInactive} mt-4 w-full`}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
