import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Dropdown } from '../../components/ui/Dropdown';
import { SearchInput } from '../../components/ui/SearchInput';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerBalanceStore } from '../../store/useWorkerBalanceStore';
import { formatBaht } from '../../lib/format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'สถานะทั้งหมด' },
  { value: 'debt', label: 'ติดหนี้' },
  { value: 'ok', label: 'ปกติ' },
];

function SummaryTile({ label, value, tone = 'text-farm-text', dataTest }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-sm text-farm-text/60">{label}</p>
      <p data-test={dataTest} className={`mt-1 text-xl font-bold sm:text-2xl ${tone}`}>
        {value}
      </p>
    </Card>
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

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryTile label="รายได้รวม" value={formatBaht(totals.earnings)} dataTest="balance-total-earnings" />
        <SummaryTile label="เบิกล่วงหน้ารวม" value={formatBaht(totals.advances)} dataTest="balance-total-advances" />
        <SummaryTile label="หนี้คงค้างรวม" value={formatBaht(totals.debt)} tone="text-red-600" dataTest="balance-total-debt" />
      </div>

      <div className="mb-6 flex w-full flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="ค้นหาชื่อหรือชื่อเล่น"
          className="w-full min-w-0 sm:min-w-[220px] sm:max-w-lg sm:flex-1"
          dataTest="balance-search"
        />
        <Dropdown
          value={workerFilter}
          onChange={setWorkerFilter}
          className="min-w-0 flex-1 sm:w-56 sm:flex-none"
          dataTest="balance-worker-filter"
          options={workerOptions}
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          className="min-w-0 flex-1 sm:w-48 sm:flex-none"
          dataTest="balance-status-filter"
          options={STATUS_OPTIONS}
        />
      </div>

      {error && (
        <div data-test="balance-error" className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div tabIndex={0} role="region" aria-label="ยอดคงเหลือคนงาน" className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-center text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#3F5C2B] text-white">
            <tr>
              <th className="px-4 py-3 text-left sm:px-6 sm:py-3.5 font-medium">ชื่อ-นามสกุล</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 font-medium">ชื่อเล่น</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 text-right font-medium">รายได้รวม</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 text-right font-medium">เบิกล่วงหน้ารวม</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 text-right font-medium">ยอดคงเหลือ</th>
              <th className="px-3 py-3 pr-4 sm:px-4 sm:py-3.5 sm:pr-6 font-medium">สถานะหนี้</th>
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
                    <span className="font-medium text-gray-800">{b.fullName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800">{b.nickname || '-'}</td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 text-right text-gray-800" data-test="balance-row-earnings">
                  {formatBaht(b.totalEarnings)}
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 text-right text-gray-800" data-test="balance-row-advances">
                  {formatBaht(b.totalAdvances)}
                </td>
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-4 text-right font-semibold ${b.inDebt ? 'text-red-600' : 'text-farm-primary'}`}
                  data-test="balance-row-remaining"
                >
                  {formatBaht(b.remainingBalance)}
                </td>
                <td className="px-3 py-3 pr-4 sm:px-4 sm:py-4 sm:pr-6" data-test="balance-row-status">
                  {b.inDebt ? (
                    <Badge tone="danger">ติดหนี้ {formatBaht(b.outstandingDebt)}</Badge>
                  ) : (
                    <Badge tone="success">ปกติ</Badge>
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
