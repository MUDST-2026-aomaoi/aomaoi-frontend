import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { STATUS_STYLE } from '../../config/status';
import { Dropdown } from '../../components/ui/Dropdown';
import { TableToolbar, TOOLBAR_FILTER_CLASS } from '../../components/ui/TableToolbar';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerBalanceStore } from '../../store/useWorkerBalanceStore';
import { formatAmount } from '../../lib/format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'สถานะทั้งหมด' },
  { value: 'debt', label: 'ติดหนี้' },
  { value: 'ok', label: 'ปกติ' },
];

function SummaryTile({ label, value, tone = 'text-gray-700', dataTest }) {
  // Same sizing as the Dashboard stat cards. Unit wraps under the number on very narrow screens.
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-1 truncate text-sm font-medium text-gray-600 sm:text-base">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 data-test={dataTest} className={`text-2xl font-bold sm:text-3xl ${tone}`}>
          {value}
        </h3>
        <span className="text-sm font-medium text-gray-400">บาท</span>
      </div>
    </div>
  );
}

export default function FinancialBalance() {
  const balances = useWorkerBalanceStore((s) => s.balances);
  const loaded = useWorkerBalanceStore((s) => s.loaded);
  const error = useWorkerBalanceStore((s) => s.error);
  const fetchBalances = useWorkerBalanceStore((s) => s.fetchBalances);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workerFilter, setWorkerFilter] = useState('all');

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const workerOptions = useMemo(
    () => [
      { value: 'all', label: 'คนงานทั้งหมด' },
      ...balances.map((b) => ({ value: String(b.workerId), label: b.nickname ? `${b.fullName} (${b.nickname})` : b.fullName })),
    ],
    [balances]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return balances
      .filter((b) => workerFilter === 'all' || String(b.workerId) === workerFilter)
      .filter((b) => !term || b.fullName.toLowerCase().includes(term) || (b.nickname || '').toLowerCase().includes(term))
      .filter((b) => statusFilter === 'all' || (statusFilter === 'debt' ? b.inDebt : !b.inDebt));
  }, [balances, search, statusFilter, workerFilter]);

  const totals = useMemo(
    () =>
      balances
        .filter((b) => workerFilter === 'all' || String(b.workerId) === workerFilter)
        .reduce(
        (acc, b) => ({
          earnings: acc.earnings + Number(b.totalEarnings),
          advances: acc.advances + Number(b.totalAdvances),
          debt: acc.debt + Number(b.outstandingDebt),
        }),
        { earnings: 0, advances: 0, debt: 0 }
      ),
    [balances, workerFilter]
  );

  return (
    <div>
      <PageHeader title="Financial Balance" />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <SummaryTile label="รายได้รวม" value={formatAmount(totals.earnings)} tone="text-[#205e2e]" dataTest="balance-total-earnings" />
        <SummaryTile label="เบิกล่วงหน้ารวม" value={formatAmount(totals.advances)} dataTest="balance-total-advances" />
        <SummaryTile label="หนี้คงค้างรวม" value={formatAmount(totals.debt)} tone="text-red-600" dataTest="balance-total-debt" />
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ค้นหาชื่อหรือชื่อเล่น"
        searchTestId="balance-search"
      >
        <Dropdown
          value={workerFilter}
          onChange={setWorkerFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="balance-worker-filter"
          options={workerOptions}
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="balance-status-filter"
          options={STATUS_OPTIONS}
        />
      </TableToolbar>

      {error && (
        <div data-test="balance-error" className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div tabIndex={0} role="region" aria-label="ยอดคงเหลือคนงาน" className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-center text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#3F5C2B] text-white">
            <tr>
              <th className="px-4 py-3 text-left sm:px-6 sm:py-3.5 font-medium">Name</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">Nickname</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">Earnings</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">Advances</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">Balance</th>
              <th className="px-3 py-3 pr-4 sm:px-4 sm:py-3.5 sm:pr-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b.workerId}
                data-test="balance-row"
                className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-left sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.fullName} />
                    <span className="font-semibold text-gray-800">{b.fullName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800">{b.nickname || '-'}</td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800" data-test="balance-row-earnings">
                  {formatAmount(b.totalEarnings)}
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800" data-test="balance-row-advances">
                  {formatAmount(b.totalAdvances)}
                </td>
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-4 font-semibold ${b.inDebt ? 'text-red-600' : 'text-farm-primary'}`}
                  data-test="balance-row-remaining"
                >
                  {formatAmount(b.remainingBalance)}
                </td>
                <td className="px-3 py-3 pr-4 sm:px-4 sm:py-4 sm:pr-6" data-test="balance-row-status">
                  {b.inDebt ? (
                    <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE.inactive}`}>ติดหนี้ {formatAmount(b.outstandingDebt)}</span>
                  ) : (
                    <span className={`inline-block min-w-20 rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE.active}`}>ปกติ</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-gray-400">
                  {loaded ? 'ไม่พบรายการ' : 'กำลังโหลด...'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
