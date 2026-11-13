import { useMemo, useState, useEffect } from 'react';
import { Clock, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../components/ui/Dropdown';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useAuthStore } from '../../controller/authController';
import { LoadingBlock } from '../../components/ui/Loader';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDate, formatBaht, formatAmount } from '../../lib/format';
import { useT, periodOptions } from '../../i18n';

import { TaskZones } from '../../components/dashboard/TaskZones';

const TASK_BAR_COLORS = {
  cutting: '#224213',
  planting: '#ADC565',
  watering: '#689142',
  spraying: '#517A34',
};

function isToday(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-');
  const now = new Date();
  return now.getFullYear() === Number(y) && now.getMonth() + 1 === Number(m) && now.getDate() === Number(d);
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const [y, m] = dateStr.split('-');
  const now = new Date();
  return now.getFullYear() === Number(y) && now.getMonth() + 1 === Number(m);
}

function isThisYear(dateStr) {
  if (!dateStr) return false;
  const [y] = dateStr.split('-');
  return new Date().getFullYear() === Number(y);
}

export default function WorkerDashboard() {
  const t = useT();
  const currentUser = useAuthStore(state => state.currentUser);
  const myWorkerId = currentUser?.id || '1';
  const [taskPeriod, setTaskPeriod] = useState('month');
  const [activeTask, setActiveTask] = useState(null);
  
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const fetchMyBalance = useWorkLogStore((s) => s.fetchMyBalance);
  const entriesLoaded = useWorkLogStore((s) => s.loaded);
  useEffect(() => {
    fetchEntries();
    fetchMyBalance();
  }, [fetchEntries, fetchMyBalance]);

  const allEntries = useWorkLogStore((s) => s.entries);
  const myBalance = useWorkLogStore((s) => s.myBalance);
  
  const myEntries = useMemo(() => allEntries.filter(e => String(e.workerId) === String(myWorkerId)), [allEntries, myWorkerId]);
  const myEntriesThisMonth = useMemo(() => myEntries.filter(e => isThisMonth(e.date)), [myEntries]);
  const myEntriesToday = useMemo(() => myEntries.filter(e => isToday(e.date)), [myEntries]);
  const myEntriesThisYear = useMemo(() => myEntries.filter(e => isThisYear(e.date)), [myEntries]);
  
  const totalBalanceThisMonth = useMemo(() => myEntriesThisMonth.reduce((sum, e) => sum + Number(e.total || 0), 0), [myEntriesThisMonth]);
  const totalSalaryAdvance = Number(myBalance?.totalAdvances ?? 0);
  const remainingBalance = myBalance?.remainingBalance ?? totalBalanceThisMonth;
  const isInDebt = myBalance ? Boolean(myBalance.inDebt || Number(myBalance.remainingBalance) < 0) : remainingBalance < 0;

  const recentActivities = useMemo(() => {
    return [...myEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [myEntries]);

  const filteredTaskEntries = useMemo(() => {
    if (taskPeriod === 'day') return myEntriesToday;
    if (taskPeriod === 'year') return myEntriesThisYear;
    return myEntriesThisMonth;
  }, [taskPeriod, myEntriesToday, myEntriesThisYear, myEntriesThisMonth]);

  const taskPeriodTotal = useMemo(
    () => filteredTaskEntries.reduce((sum, e) => sum + Number(e.total || 0), 0),
    [filteredTaskEntries]
  );

  const statsBoxes = useMemo(() => {
    return WORK_LOG_ORDER.map(type => {
      const typeEntries = filteredTaskEntries.filter(e => e.type === type);
      const totalThb = typeEntries.reduce((sum, e) => sum + Number(e.total || 0), 0);
      
      let amount = 0;
      let unit = '';
      if (type === 'cutting') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.rows || 0), 0);
        unit = t('wl.suffix.rows');
      } else if (type === 'planting') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.furrows || 0), 0);
        unit = t('wl.suffix.furrows');
      } else if (type === 'watering') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.days || 0), 0);
        unit = t('wl.unit.day');
      } else if (type === 'spraying') {
        amount = typeEntries.reduce((sum, e) => sum + Number(e.tanks || 0), 0);
        unit = t('wl.suffix.tanks');
      }

      const pct = taskPeriodTotal > 0 ? Math.round((totalThb / taskPeriodTotal) * 100) : 0;

      return {
        id: type,
        title: WORK_LOG_TYPES[type].labelTh,
        amountNum: amount,
        unit: unit,
        thbStr: formatAmount(totalThb),
        pct: pct,
        color: TASK_BAR_COLORS[type] || '#224213',
        icon: WORK_LOG_TYPES[type].icon
      };
    });
  }, [filteredTaskEntries, taskPeriodTotal, t]);

  const zones = useMemo(() => statsBoxes.map((s) => ({ id: s.id, label: s.title, pct: s.pct, color: s.color })), [statsBoxes]);
  const activeStat = statsBoxes.find((s) => s.id === activeTask);

  if (!entriesLoaded) return <LoadingBlock className="py-24" />;

  return (
    <div className="flex flex-col gap-4 w-full pb-2">
      
      {/* 1. แถบแจ้งเตือนด้านบน */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-[20px] px-4 py-3 text-sm sm:text-base font-normal text-farm-text shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="text-[#91712A] shrink-0">
            <Clock size={22} strokeWidth={2.5} />
          </div>
          <span>
            {t('wd.latest', {
              date: recentActivities[0] ? formatDate(recentActivities[0].date) : t('common.noData'),
              days: new Set(myEntriesThisMonth.map(e => e.date)).size,
            })}
          </span>
        </div>
        {isInDebt && (
          <span
            data-test="worker-debt-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F47E7E] text-white shrink-0 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF0202]"></span>
            </span>
            {t('worker.inDebt')}
          </span>
        )}
      </div>

      {/* 2. Top Cards (3 กล่องตาม Figma 544:1026) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Earning */}
        <div className="col-span-2 bg-[#2E4A1F] rounded-[20px] p-4 sm:p-5 text-white shadow-sm flex flex-col justify-between min-h-[130px] sm:min-h-[150px]">
          <div className="flex items-center gap-3 sm:gap-4 mb-1">
            <div className="bg-white text-[#91712A] p-2 sm:p-2.5 rounded-lg shrink-0">
              <Wallet size={26} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold leading-tight">{t('wd.totalEarning')}</h2>
              <p className="text-[12px] sm:text-[13px] text-white/80 font-normal mt-0.5">{t('wd.overviewThisMonth')}</p>
            </div>
          </div>
          <div data-test="worker-total-earning" className="text-3xl sm:text-4xl xl:text-[42px] font-bold leading-none tracking-tight mt-3 sm:mt-0">
            {formatAmount(totalBalanceThisMonth)} <span className="text-xl sm:text-2xl xl:text-[26px] font-semibold ml-1 tracking-normal">{t('common.thb')}</span>
          </div>
        </div>

        {/* Total SalaryAdvance */}
        <div className="col-span-1 bg-white rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[120px] sm:min-h-[150px]">
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-farm-text">{t('wd.totalAdvance')}</h2>
            <p className="text-[12px] sm:text-[13px] text-gray-400 font-normal mt-1">{t('wd.overviewRemaining')}</p>
          </div>
          <div data-test="worker-total-advance" className="flex flex-wrap items-baseline gap-x-1 text-xl sm:text-3xl xl:text-[36px] font-bold text-[#2E5119] leading-none tracking-tight mt-3 sm:mt-0 break-all">
            {formatAmount(totalSalaryAdvance)} <span className="text-sm sm:text-[20px] font-semibold tracking-normal">{t('common.thb')}</span>
          </div>
        </div>

        {/* RemainingBalance */}
        <div className="col-span-1 bg-white rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[120px] sm:min-h-[150px]">
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-farm-text">{t('wd.remaining')}</h2>
            <p className="text-[12px] sm:text-[13px] text-gray-400 font-normal mt-1">{t('wd.overviewRemaining')}</p>
          </div>
          <div data-test="worker-remaining-balance" className={`flex flex-wrap items-baseline gap-x-1 text-xl sm:text-3xl xl:text-[36px] font-bold leading-none tracking-tight mt-3 sm:mt-0 break-all ${isInDebt ? 'text-[#C80303]' : 'text-[#2E5119]'}`}>
            {formatAmount(remainingBalance)} <span className="text-sm sm:text-[20px] font-semibold tracking-normal">{t('common.thb')}</span>
          </div>
        </div>
      </div>

      {/* 3. Tasks: isometric zones + breakdown + period filter */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        
        {/* Tasks (Donut Chart + 4 Task Cards + Period Select Dropdown) */}
        <div className="lg:col-span-3 bg-white rounded-[20px] p-4 sm:px-7 sm:py-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-farm-text font-extrabold text-lg sm:text-xl">{t('wd.tasks')}</h3>
            <Dropdown
              value={taskPeriod}
              onChange={setTaskPeriod}
              options={periodOptions(t)}
              className="w-[150px] sm:w-[200px]"
              dataTest="worker-tasks-period"
            />
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
            {/* Isometric work zones: tap a zone or card to see that task's pay */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-2 w-full">
              <TaskZones zones={zones} activeId={activeTask} onActive={setActiveTask} className="max-w-[320px]" />
              <div className="text-center leading-tight">
                <p className="text-xs text-[#8A8F85]">{activeStat ? activeStat.title : t('common.total')}</p>
                <p className="text-2xl font-extrabold text-[#1A1A1A]">
                  <span data-test="worker-tasks-total">{activeStat ? activeStat.thbStr : formatAmount(taskPeriodTotal)}</span>{' '}
                  <span className="text-sm font-semibold text-[#8A8F85]">{t('common.baht')}</span>
                </p>
              </div>
            </div>

            {/* 4 Task Breakdown Cards ด้านขวา (กว้าง 200px ตรงกับ Dropdown ด้านบนเป๊ะตาม Figma บนจอ sm ขึ้นไป, และ 2 คอลัมน์บนจอมือถือ) */}
            <div className="w-full grid grid-cols-2 gap-2.5 sm:flex sm:flex-col sm:w-[200px] shrink-0">
              {statsBoxes.map((stat) => (
                <div key={stat.id} data-test={`worker-task-card-${stat.id}`} onMouseEnter={() => setActiveTask(stat.id)} onMouseLeave={() => setActiveTask(null)} onClick={() => setActiveTask(activeTask === stat.id ? null : stat.id)} className={`flex items-center bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden h-[46px] cursor-pointer transition ${activeTask && activeTask !== stat.id ? 'opacity-40' : ''} ${activeTask === stat.id ? 'ring-2 ring-[#A8D04A]' : ''}`}>
                  <div className="w-[10px] sm:w-[13px] self-stretch shrink-0" style={{ backgroundColor: stat.color }}></div>
                  <div className="flex-1 flex items-center justify-between pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 py-1 min-w-0">
                    <div className="flex flex-col justify-center text-left leading-tight min-w-0">
                      <span className="text-[11px] sm:text-[12px] font-medium text-black leading-tight truncate">{stat.title}</span>
                      <span className="text-[10px] text-[#989898] font-normal leading-tight mt-0.5 truncate">{stat.amountNum} {stat.unit}</span>
                      <span className="text-[10px] text-[#989898] font-normal leading-tight truncate">{stat.thbStr} {t('common.baht')}</span>
                    </div>
                    <div className="text-[16px] sm:text-[20px] font-bold text-[#224213] shrink-0 ml-1">{stat.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* 4. Recent Activity (ข้าง Tasks บนจอใหญ่) */}
      <div className="lg:col-span-2 min-w-0 bg-white rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-farm-text font-bold text-lg sm:text-[20px]">{t('wd.recentActivity')}</h3>
          <Link to="/history" className="text-sm sm:text-[16px] font-medium text-farm-text hover:text-[#4F7A2B] flex items-center gap-1.5">
            More <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </div>
        
        <div className="space-y-2.5">
          {recentActivities.map((item) => {
            const Icon = WORK_LOG_TYPES[item.type].icon;
            return (
              <div key={item.id} className="flex items-center justify-between gap-2 bg-[#F8FAF3] rounded-xl px-3 sm:px-4 py-2.5">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="text-[#C09644] shrink-0">
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] sm:text-[14px] font-semibold text-farm-text leading-tight">
                      {WORK_LOG_TYPES[item.type].labelTh} <span className="text-black font-bold mx-1">·</span> <span className="font-normal text-gray-700 text-[13px] sm:text-[14px]">{WORK_LOG_TYPES[item.type].summaryText(item)}</span>
                    </p>
                    <p className="text-[12px] sm:text-[13px] font-normal text-[#989898] mt-0.5">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base sm:text-[18px] font-semibold text-[#517A33]">+{formatBaht(item.total)}</p>
                </div>
              </div>
            );
          })}
          {recentActivities.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">{t('wd.noHistory')}</p>
          )}
        </div>
      </div>

      </div>

    </div>
  );
}
