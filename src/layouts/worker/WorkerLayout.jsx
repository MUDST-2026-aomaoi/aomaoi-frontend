import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, LogOut, Sprout } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function WorkerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  // ดึงข้อมูลจากผู้ที่ล็อกอินเข้ามาจริงๆ
  const myWorkerId = currentUser?.id ?? '1';
  const myUsername = currentUser?.username ?? '';
  const myFullName = currentUser?.fullName ?? '';
  const myAvatar = currentUser?.avatar ?? '';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // ฟังก์ชันสลับสีเมนู (เพิ่มขอบเขียวด้านซ้ายตอน Active)
  const getNavClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-3 px-6 py-3 transition-colors border-l-4 ${
      isActive 
        ? 'border-[#708238] bg-gray-100 text-[#708238] font-bold' 
        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`;
  };

  const pageTitle = location.pathname.includes('/history') ? 'History' : 'Dashboard';

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-farm-text font-sans">
      
      {/* Sidebar: ธีมสีสว่างตามดีไซน์ใหม่ */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 z-10">
        <div>
          {/* Logo Section */}
          <div className="px-6 py-8 flex items-center gap-2 text-[#708238]">
            <Sprout size={28} strokeWidth={2.5} />
            <span className="text-2xl font-extrabold tracking-tight">Sugarcane</span>
          </div>

          <div className="pt-2 pb-4">
            <h2 className="px-6 text-[12px] text-gray-400 font-medium mb-2">Menu</h2>
            <nav className="flex flex-col gap-1">
              <Link to="/worker/dashboard" className={getNavClass('/dashboard')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/worker/history" className={getNavClass('/history')}>
                <History size={20} />
                <span>History</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-farm-text font-medium hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0">
          <h1 className="text-3xl font-bold text-farm-text">{pageTitle}</h1>
          
          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
              <img src={myAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-farm-text">{myUsername}</p>
              <p className="text-[11px] font-normal text-gray-500">Worker</p>
            </div>
          </div>
        </header>

        <main className="px-8 pb-8 flex-1">
          <Outlet context={{ myWorkerId }} />
        </main>
      </div>

    </div>
  );
}
