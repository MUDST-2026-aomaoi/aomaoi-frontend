import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Wallet, LogOut, CircleUserRound } from 'lucide-react';
import { useWorkerStore } from '../../store/useWorkerStore';

export default function WorkerLayout() {
  const location = useLocation();
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  
  // สมมติว่าตอนนี้ล็อกอินด้วย ID '1'
  const myWorkerId = '1';
  const myName = getWorkerName(myWorkerId);

  const getNavClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-white/20 text-white font-medium shadow-sm' 
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`;
  };

  const getPageInfo = () => {
    if (location.pathname.includes('/history')) return { title: 'History', sub: 'Here is the history of overall data' };
    if (location.pathname.includes('/balance')) return { title: 'Balance', sub: 'Here is the balance of overall data' };
    return { title: 'Dashboard', sub: 'Here is the summary of overall data' };
  };
  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-farm-bg text-farm-text font-sans">
      <aside className="w-64 bg-farm-primary text-white flex flex-col justify-between shrink-0 shadow-lg z-10">
        <div>
          <div className="px-6 pt-8 pb-4">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Main Menu</h2>
            <nav className="flex flex-col gap-2">
              <Link to="/worker/dashboard" className={getNavClass('/dashboard')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/worker/history" className={getNavClass('/history')}>
                <History size={20} />
                <span>History</span>
              </Link>
              <Link to="/worker/balance" className={getNavClass('/balance')}>
                <Wallet size={20} />
                <span>Balance</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full">
            <LogOut size={20} />
            <span>logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-farm-text">{pageInfo.title}</h1>
            <p className="text-farm-primary font-medium text-sm mt-1">{pageInfo.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-farm-primary leading-none">{myName}</p>
              <p className="text-xs text-gray-500 mt-1">Worker</p>
            </div>
            <CircleUserRound size={36} className="text-gray-400" strokeWidth={1.5} />
          </div>
        </header>

        <main className="px-8 pb-8 flex-1">
          <Outlet context={{ myWorkerId }} />
        </main>
      </div>
    </div>
  );
}
