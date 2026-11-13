import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { ModalShell } from '../../components/ui/ModalShell';
import { AttendanceButtons } from '../../components/attendance/AttendanceButtons';
import { LeaveNoteModal } from '../../components/attendance/LeaveNoteModal';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useSalaryAdvanceStore } from '../../store/useSalaryAdvanceStore';
import { useWorkerBalanceStore } from '../../store/useWorkerBalanceStore';
import { attendanceService } from '../../service/attendanceService';
import { ATTENDANCE_LABEL, ATTENDANCE_STYLE } from '../../config/attendance';
import { STATUS_LABEL, STATUS_STYLE } from '../../config/status';
import { WORK_LOG_TYPES } from '../../config/workLogTypes';
import { formatAmount, formatDate, formatDateLong, isAttendanceClosed, todayBangkokISO } from '../../lib/format';
import { getLocale, useT } from '../../i18n';
import { tError } from '../../i18n/backendMessages';

const pad = (n) => String(n).padStart(2, '0');
const monthKey = (year, month) => `${year}-${pad(month + 1)}`;

function Section({ title, children, testId }) {
  return (
    <section data-test={testId} className="mb-6 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <h3 className="mb-4 text-base font-bold text-gray-900 sm:text-lg">{title}</h3>
      {children}
    </section>
  );
}

function StatTile({ label, value, tone = 'text-gray-700', testId }) {
  const t = useT();
  return (
    <div className="min-w-0 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <p className="mb-1 truncate text-sm font-medium text-gray-600">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span data-test={testId} className={`text-2xl font-bold ${tone}`}>{value}</span>
        <span className="text-sm font-medium text-gray-400">{t('common.baht')}</span>
      </div>
    </div>
  );
}

export default function WorkerDetail() {
  const t = useT();
  const { id } = useParams();
  const workers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const entries = useWorkLogStore((s) => s.entries);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const advances = useSalaryAdvanceStore((s) => s.advances);
  const fetchAdvances = useSalaryAdvanceStore((s) => s.fetchAdvances);
  const balances = useWorkerBalanceStore((s) => s.balances);
  const fetchBalances = useWorkerBalanceStore((s) => s.fetchBalances);

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [records, setRecords] = useState({});
  const [loadedWorkers, setLoadedWorkers] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [leaveFor, setLeaveFor] = useState(null);

  useEffect(() => {
    fetchWorkers().finally(() => setLoadedWorkers(true));
    fetchEntries();
    fetchAdvances();
    fetchBalances();
  }, [fetchWorkers, fetchEntries, fetchAdvances, fetchBalances]);

  const worker = useMemo(() => workers.find((w) => String(w.id) === String(id)), [workers, id]);

  const loadMonth = useCallback(async () => {
    try {
      const rows = await attendanceService.getWorkerMonth(id, monthKey(cursor.year, cursor.month));
      setRecords(Object.fromEntries(rows.map((r) => [r.date, r])));
    } catch (error) {
      console.error('Failed to load attendance', error);
      setRecords({});
    }
  }, [id, cursor]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const days = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const length = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells = Array.from({ length: first.getDay() }, () => null);
    for (let d = 1; d <= length; d += 1) cells.push(`${monthKey(cursor.year, cursor.month)}-${pad(d)}`);
    return cells;
  }, [cursor]);

  // 2024-01-07 is a Sunday: the grid starts on Sunday, like Date#getDay().
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(getLocale(), { weekday: 'short' }));

  const monthTitle = new Date(cursor.year, cursor.month, 1).toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' });
  const monthCounts = useMemo(() => {
    const result = { present: 0, leave: 0, absent: 0 };
    Object.values(records).forEach((r) => {
      if (r.status === 'PRESENT') result.present += 1;
      else if (r.status === 'LEAVE') result.leave += 1;
      else if (r.status === 'ABSENT') result.absent += 1;
    });
    return result;
  }, [records]);

  const myEntries = useMemo(
    () => entries
      .filter((e) => String(e.workerId) === String(id))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || Number(b.id) - Number(a.id))
      .slice(0, 8),
    [entries, id]
  );
  const myAdvances = useMemo(
    () => advances.filter((a) => String(a.workerId) === String(id) && !a.cancelledAt).slice(0, 8),
    [advances, id]
  );
  const balance = balances.find((b) => String(b.workerId) === String(id));

  function shiftMonth(delta) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  async function saveDay(date, status, note) {
    try {
      await attendanceService.set({ workerId: Number(id), date, status, note });
      await loadMonth();
    } catch (error) {
      console.error('Failed to save attendance', error);
      alert(t('att.err.saveFailed') + ': ' + tError(error));
    }
  }

  function chooseStatus(date, next) {
    setSelectedDay(null);
    if (next === 'LEAVE') {
      setLeaveFor({ date, note: records[date]?.note ?? '' });
      return;
    }
    saveDay(date, next, null);
  }

  if (!worker) {
    return (
      <div>
        <PageHeader title={t('wkd.title')} />
        <Link to="/workers" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-farm-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t('wkd.back')}
        </Link>
        <p data-test="worker-detail-missing" className="py-8 text-center text-gray-400">
          {loadedWorkers ? t('wkd.notFound') : t('common.loading')}
        </p>
      </div>
    );
  }

  const inactive = worker.status === 'inactive';
  const today = todayBangkokISO();
  const closed = isAttendanceClosed();

  return (
    <div>
      <PageHeader title={t('wkd.title')} />
      <Link to="/workers" data-test="worker-detail-back" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-farm-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> {t('wkd.back')}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        <Avatar src={worker.avatar} name={worker.fullName} className="h-16 w-16 text-2xl" />
        <div className="min-w-0 flex-1">
          <h2 data-test="worker-detail-name" className="truncate text-xl font-bold text-gray-900">{worker.fullName}</h2>
          <p className="text-sm text-gray-500">{worker.nickname} · @{worker.username}</p>
          <p className="text-sm text-gray-500">{worker.phone} · {t('wkd.joined')} {formatDateLong(worker.joinedDate)}</p>
        </div>
        <span className={`inline-block min-w-20 whitespace-nowrap rounded-full px-4 py-1.5 text-center text-xs font-bold ${STATUS_STYLE[worker.status]}`}>
          {STATUS_LABEL[worker.status]}
        </span>
      </div>

      {balance && (
        <div data-test="worker-detail-balance" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatTile label={t('wkd.earnings')} value={formatAmount(balance.totalEarnings)} tone="text-[#205e2e]" testId="worker-detail-earnings" />
          <StatTile label={t('wkd.advances')} value={formatAmount(balance.totalAdvances)} testId="worker-detail-advances" />
          <StatTile
            label={t('wkd.remaining')}
            value={formatAmount(balance.remainingBalance)}
            tone={balance.inDebt ? 'text-red-600' : 'text-gray-700'}
            testId="worker-detail-remaining"
          />
        </div>
      )}

      <Section title={t('wkd.attendance')} testId="worker-detail-attendance">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button type="button" data-test="attendance-prev-month" aria-label={t('wkd.prevMonth')} onClick={() => shiftMonth(-1)} className="rounded-lg border border-[#E4E9DA] p-1.5 text-gray-600 hover:bg-[#E6F0D6]/50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span data-test="attendance-month-title" className="min-w-36 text-center font-semibold text-gray-800">{monthTitle}</span>
            <button type="button" data-test="attendance-next-month" aria-label={t('wkd.nextMonth')} onClick={() => shiftMonth(1)} className="rounded-lg border border-[#E4E9DA] p-1.5 text-gray-600 hover:bg-[#E6F0D6]/50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p data-test="attendance-month-summary" className="text-sm text-gray-600">
            {t('wkd.monthSummary', monthCounts)}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekdays.map((name) => (
            <div key={name} className="py-1 text-center text-xs font-semibold text-gray-500">{name}</div>
          ))}
          {days.map((date, index) => {
            if (!date) return <div key={`blank-${index}`} />;
            const record = records[date];
            const beforeJoined = worker.joinedDate && date < worker.joinedDate;
            // today and later can be edited (a future day only accepts leave); past days are read-only history
            const clickable = !inactive && !beforeJoined && (date > today || (date === today && !closed));
            return (
              <button
                key={date}
                type="button"
                data-test="attendance-day"
                data-date={date}
                data-status={record?.status ?? ''}
                disabled={!clickable}
                onClick={() => setSelectedDay(date)}
                title={record?.note || undefined}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-colors ${
                  record ? ATTENDANCE_STYLE[record.status].cell : 'border-[#EEF1E6] bg-white text-gray-700 hover:bg-[#E6F0D6]/50'
                } ${date === today ? 'ring-2 ring-farm-primary' : ''} ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="font-semibold">{Number(date.slice(8))}</span>
                {record && (
                  <span className="text-[10px] leading-none">
                    {ATTENDANCE_LABEL[record.status]}{record.autoRecorded ? '*' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-400">* {t('att.auto')} · {t('wkd.onlyToday')}</p>
        {closed && <p data-test="attendance-closed" className="mt-1 text-xs text-gray-500">{t('att.closed')}</p>}
      </Section>

      <Section title={t('wkd.workHistory')} testId="worker-detail-work">
        {myEntries.length === 0 ? (
          <p className="py-4 text-center text-gray-400">{t('wkd.noWork')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0F2EA] text-gray-500">
                  <th className="py-2 pr-4 font-medium">{t('col.date')}</th>
                  <th className="py-2 pr-4 font-medium">{t('col.workType')}</th>
                  <th className="py-2 pr-4 font-medium">{t('col.qty')}</th>
                  <th className="py-2 text-right font-medium">{t('col.wages')}</th>
                </tr>
              </thead>
              <tbody>
                {myEntries.map((entry) => {
                  const config = WORK_LOG_TYPES[entry.type];
                  return (
                    <tr key={entry.id} className="border-b border-[#F0F2EA] last:border-0">
                      <td data-label={t('col.date')} className="py-2 pr-4 text-gray-700">
                        {entry.startDate && entry.endDate && entry.startDate !== entry.endDate
                          ? `${formatDate(entry.startDate)} - ${formatDate(entry.endDate)}`
                          : formatDate(entry.startDate || entry.date)}
                      </td>
                      <td data-label={t('col.workType')} className="py-2 pr-4 text-gray-700">{config?.labelTh ?? entry.type}</td>
                      <td data-label={t('col.qty')} className="py-2 pr-4 text-gray-700">{config ? `${config.primaryQty(entry)} ${config.primaryUnit}` : ''}</td>
                      <td data-label={t('col.wages')} className="py-2 text-right font-medium text-gray-800">{formatAmount(entry.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title={t('wkd.advanceHistory')} testId="worker-detail-advances-list">
        {myAdvances.length === 0 ? (
          <p className="py-4 text-center text-gray-400">{t('wkd.noAdvance')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0F2EA] text-gray-500">
                  <th className="py-2 pr-4 font-medium">{t('col.date')}</th>
                  <th className="py-2 pr-4 font-medium">{t('adv.col.type')}</th>
                  <th className="py-2 pr-4 font-medium">{t('adv.col.detail')}</th>
                  <th className="py-2 text-right font-medium">{t('adv.col.value')}</th>
                </tr>
              </thead>
              <tbody>
                {myAdvances.map((advance) => (
                  <tr key={advance.id} className="border-b border-[#F0F2EA] last:border-0">
                    <td data-label={t('col.date')} className="py-2 pr-4 text-gray-700">{formatDate(advance.advanceDate)}</td>
                    <td data-label={t('adv.col.type')} className="py-2 pr-4 text-gray-700">{advance.type === 'CASH' ? t('advance.cash') : t('advance.goods')}</td>
                    <td data-label={t('adv.col.detail')} className="py-2 pr-4 text-gray-700">{advance.itemName || ''}</td>
                    <td data-label={t('adv.col.value')} className="py-2 text-right font-medium text-gray-800">{formatAmount(advance.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {selectedDay && (
        <ModalShell onClose={() => setSelectedDay(null)} className="w-full sm:w-100">
          <div className="mb-4 flex items-center justify-between border-b border-[#E6F0D6] pb-3">
            <h3 className="text-xl font-extrabold tracking-tight text-farm-primary">{t('wkd.dayTitle', { date: formatDateLong(selectedDay) })}</h3>
            <button type="button" onClick={() => setSelectedDay(null)} className="rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
              <X className="h-5 w-5" />
            </button>
          </div>
          {records[selectedDay]?.autoRecorded && <p className="mb-2 text-xs text-gray-400">{t('att.auto')}</p>}
          {records[selectedDay]?.note && <p className="mb-2 text-sm text-gray-600">{records[selectedDay].note}</p>}
          <AttendanceButtons
            status={records[selectedDay]?.status ?? null}
            onSelect={(next) => chooseStatus(selectedDay, next)}
            disabledStatuses={selectedDay > today ? ['PRESENT', 'ABSENT'] : []}
          />
          {selectedDay > today && <p className="mt-2 text-xs text-amber-700">{t('att.futureHint')}</p>}
        </ModalShell>
      )}

      {leaveFor && (
        <LeaveNoteModal
          workerName={worker.fullName}
          initialNote={leaveFor.note}
          onCancel={() => setLeaveFor(null)}
          onConfirm={(note) => {
            const { date } = leaveFor;
            setLeaveFor(null);
            saveDay(date, 'LEAVE', note);
          }}
        />
      )}
    </div>
  );
}
