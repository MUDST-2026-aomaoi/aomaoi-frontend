import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, LogOut, Sprout } from 'lucide-react';
import SetPasswordModal from '../../components/auth/SetPasswordModal';

export default function WorkerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // โชว์ Modal ตั้งรหัสผ่านถ้าหน้า Login แนบ state มาว่าเป็นการ login ครั้งแรก
  const [showPasswordModal, setShowPasswordModal] = useState(
    location.state?.showSetPassword || false
  );

  // TODO: เปลี่ยนเป็นดึงจาก auth จริงๆ ทีหลัง
  const myWorkerId = '1';
  const myUsername = 'somchai_j';

  const handleLogout = () => {
    navigate('/login');
  };

  // ฟังก์ชันสลับสีเมนู (ใช้เทคนิค -ml-6 pl-9 เหมือน Admin แต่สีสว่าง)
  const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors';
  const linkActive = 'bg-[#708238]/10 text-[#708238] border-l-4 border-[#708238] -ml-6 pl-9 rounded-none font-bold';
  const linkInactive = 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';

  const getNavClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `${linkBase} ${isActive ? linkActive : linkInactive}`;
  };

  const pageTitle = location.pathname.includes('/history') ? 'History' : 'Dashboard';

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-farm-text font-sans relative">
      
      {/* ป็อปอัพตั้งรหัสผ่าน (บังทั้งหน้าจอ) */}
      {showPasswordModal && (
        <SetPasswordModal onSuccess={() => setShowPasswordModal(false)} />
      )}
      
      {/* Sidebar: อ้างอิง Layout แบบ Admin แต่สีพื้นหลังสว่าง */}
      <aside className="flex h-screen w-64 shrink-0 flex-col bg-white border-r border-gray-200">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 text-[#708238]">
          <Sprout className="h-8 w-8" strokeWidth={2.5} />
          <h1 className="text-2xl font-bold tracking-tight">Sugarcane</h1>
        </div>

        {/* Menu Section */}
        <div className="flex-1 px-6 py-4">
          <p className="mb-4 text-sm text-gray-400">Menu</p>
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className={getNavClass('/dashboard')}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/history" className={getNavClass('/history')}>
              <History className="h-5 w-5" />
              <span>History</span>
            </Link>
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 transition-colors hover:text-red-500 font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          
          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-200 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-farm-text">{myUsername}</p>
              <p className="text-[12px] font-normal text-gray-500">Worker</p>
            </div>
          </div>
        </header>

        {children || <Outlet context={{ myWorkerId }} />}
      </main>

    </div>
  );
}
