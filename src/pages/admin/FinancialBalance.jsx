import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { STATUS_STYLE } from '../../config/status';
import { Dropdown } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { TableLoadingRow } from '../../components/ui/Loader';
import { useFitRows, usePagedList } from '../../hooks/usePageSize';
import { TableToolbar, TOOLBAR_FILTER_CLASS } from '../../components/ui/TableToolbar';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerBalanceStore } from '../../store/useWorkerBalanceStore';
import { formatAmount } from '../../lib/format';
import { useT } from '../../i18n';

const statusOptions = (t) => [
  { value: 'all', label: t('common.allStatuses') },
  { value: 'debt', label: t('fb.debt') },
  { value: 'ok', label: t('fb.ok') },
];

function SummaryTile({ label, value, tone = 'text-gray-700', dataTest }) {
  const t = useT();
  // Three tiles always share one row: type scales up with the screen, label may wrap to 2 lines.
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:rounded-[20px] sm:p-4 lg:p-5">
      <p className="mb-1 text-xs font-medium leading-snug text-gray-600 sm:text-sm lg:text-base">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <h3 data-test={dataTest} className={`text-lg font-bold leading-tight sm:text-2xl lg:text-3xl ${tone}`}>
          {value}
        </h3>
        <span className="text-[11px] font-medium text-gray-400 sm:text-sm">{t('common.baht')}</span>
      </div>
    </div>
  );
}

export default function FinancialBalance() {
  const t = useT();
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
      { value: 'all', label: t('fb.allWorkers') },
      ...balances.map((b) => ({ value: String(b.workerId), label: b.nickname ? `${b.fullName} (${b.nickname})` : b.fullName })),
    ],
    [balances, t]
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

  const { ref: tableRef, pageSize } = useFitRows();
  const pager = usePagedList(filtered, pageSize);
  const pageItems = pager.pageItems;

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t('fb.pageTitle')} />

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <SummaryTile label={t('fb.totalEarnings')} value={formatAmount(totals.earnings)} tone="text-[#205e2e]" dataTest="balance-total-earnings" />
        <SummaryTile label={t('fb.totalAdvances')} value={formatAmount(totals.advances)} dataTest="balance-total-advances" />
        <SummaryTile label={t('fb.totalDebt')} value={formatAmount(totals.debt)} tone="text-red-600" dataTest="balance-total-debt" />
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('fb.search')}
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
          options={statusOptions(t)}
        />
      </TableToolbar>

      {error && (
        <div data-test="balance-error" className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div ref={tableRef} tabIndex={0} role="region" aria-label={t('fb.tableLabel')} className="overflow-x-auto rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <table className="rtable w-full min-w-[600px] border-collapse text-center text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#2E4A1F] text-white">
            <tr>
              <th className="px-4 py-3 text-left sm:px-6 sm:py-3.5 font-medium">{t('col.name')}</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">{t('col.nickname')}</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">{t('fb.col.earnings')}</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">{t('fb.col.advances')}</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">{t('fb.col.balance')}</th>
              <th className="px-3 py-3 pr-4 sm:px-4 sm:py-3.5 sm:pr-6 font-medium">{t('col.status')}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((b) => (
              <tr
                key={b.workerId}
                data-test="balance-row"
                className="border-b border-[#F0F2EA] transition-colors last:border-0 hover:bg-[#E6F0D6]/50"
              >
                <td className="px-4 py-3 text-left sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.fullName} />
                    <span className="font-semibold text-gray-800">{b.fullName}</span>
                  </div>
                </td>
                <td data-label={t('col.nickname')} className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800">{b.nickname || '-'}</td>
                <td data-label={t('fb.col.earnings')} className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800" data-test="balance-row-earnings">
                  {formatAmount(b.totalEarnings)}
                </td>
                <td data-label={t('fb.col.advances')} className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800" data-test="balance-row-advances">
                  {formatAmount(b.totalAdvances)}
                </td>
                <td data-label={t('fb.col.balance')}
                  className={`px-3 py-3 sm:px-4 sm:py-4 font-semibold ${b.inDebt ? 'text-red-600' : 'text-farm-primary'}`}
                  data-test="balance-row-remaining"
                >
                  {formatAmount(b.remainingBalance)}
                </td>
                <td data-label={t('col.status')} className="px-3 py-3 pr-4 sm:px-4 sm:py-4 sm:pr-6" data-test="balance-row-status">
                  {b.inDebt ? (
                    <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE.inactive}`}>{t('fb.debtAmount', { amount: formatAmount(b.outstandingDebt) })}</span>
                  ) : (
                    <span className={`inline-block min-w-20 rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE.active}`}>{t('fb.ok')}</span>
                  )}
                </td>
              </tr>
            ))}
            {!loaded && <TableLoadingRow cols={6} />}
            {loaded && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-gray-400">
                  {t('common.noItems')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination pager={pager} />
    </div>
  );
}
