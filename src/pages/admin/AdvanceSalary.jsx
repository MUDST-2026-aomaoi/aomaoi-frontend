import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DateInput } from '../../components/ui/DateInput';
import { Dropdown } from '../../components/ui/Dropdown';
import { Input } from '../../components/ui/Input';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useSalaryAdvanceStore } from '../../store/useSalaryAdvanceStore';
import { useWorkerStore } from '../../store/useWorkerStore';
import { getLocale, t as tr } from '../../i18n';
import { tError } from '../../i18n/backendMessages';

const ADVANCE_TYPES = {
  CASH: { get labelTh() { return tr('advance.cash'); }, badgeClass: 'bg-[#dcfce7] text-[#166534]' },
  GOODS: { get labelTh() { return tr('advance.goods'); }, badgeClass: 'bg-[#fef08a] text-[#854d0e]' },
};

const makeSchema = (t) => z
  .object({
    workerId: z.string().min(1, t('wl.err.workerRequired')),
    advanceDate: z.string().min(1, t('wl.err.dateRequired')),
    type: z.enum(['CASH', 'GOODS']),
    itemName: z.string().max(255, t('adv.err.itemTooLong')),
    amount: z.coerce.number({ message: t('adv.err.amountRequired') }).positive(t('wl.err.positive')),
  })
  .refine((v) => v.type !== 'GOODS' || v.itemName.trim() !== '', {
    path: ['itemName'],
    message: t('adv.err.itemRequired'),
  });

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyValues() {
  return { workerId: '', advanceDate: todayISO(), type: 'CASH', itemName: '', amount: '' };
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(getLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatAmount(n) {
  return Number(n).toLocaleString(getLocale(), { maximumFractionDigits: 2 });
}

export default function AdvanceSalary() {
  const t = useT();
  const allWorkers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const advances = useSalaryAdvanceStore((s) => s.advances);
  const fetchAdvances = useSalaryAdvanceStore((s) => s.fetchAdvances);
  const addAdvance = useSalaryAdvanceStore((s) => s.addAdvance);

  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeSchema(t)), defaultValues: emptyValues() });

  const type = watch('type');

  useEffect(() => {
    fetchWorkers();
    fetchAdvances();
  }, [fetchWorkers, fetchAdvances]);

  const activeWorkers = useMemo(() => allWorkers.filter((w) => w.status !== 'inactive'), [allWorkers]);

  const sorted = useMemo(
    () => [...advances].sort((a, b) => b.advanceDate.localeCompare(a.advanceDate) || Number(b.id) - Number(a.id)),
    [advances]
  );

  function selectType(next) {
    setValue('type', next);
    if (next === 'CASH') setValue('itemName', '');
  }

  function handleReset() {
    reset(emptyValues());
    setSubmitError('');
  }

  async function onSubmit(data) {
    setSubmitError('');
    try {
      await addAdvance(data);
      reset(emptyValues());
      setShowSuccess(true);
    } catch (error) {
      setSubmitError(tError(error, t('wlog.saveFailed')));
    }
  }

  return (
    <div>
      <PageHeader title={t('adv.pageTitle')} />

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-farm-text sm:mb-6">{t('adv.formTitle')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <div data-test="advance-submit-error" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <Controller
              control={control}
              name="workerId"
              render={({ field }) => (
                <Dropdown
                  label={t('wlog.pickWorker')}
                  dataTest="advance-form-worker"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.workerId?.message}
                  options={[
                    { value: '', label: t('wlog.pickWorker') },
                    ...activeWorkers.map((w) => ({ value: String(w.id), label: w.fullName })),
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="advanceDate"
              render={({ field }) => (
                <DateInput
                  label={t('adv.date')}
                  dataTest="advance-form-date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.advanceDate?.message}
                />
              )}
            />

            {type === 'GOODS' && (
              <Input
                label={t('adv.item')}
                placeholder={t('adv.itemPlaceholder')}
                data-test="advance-form-item"
                {...register('itemName')}
                error={errors.itemName?.message}
              />
            )}

            <Input
              type="number"
              step="any"
              min="0"
              label={t('adv.amount')}
              placeholder="0"
              data-test="advance-form-amount"
              {...register('amount')}
              error={errors.amount?.message}
            />

            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {Object.entries(ADVANCE_TYPES).map(([key, cfg]) => (
                <Button
                  key={key}
                  type="button"
                  variant={type === key ? 'primary' : 'subtle'}
                  data-test={`advance-type-${key.toLowerCase()}`}
                  className={`flex-1 ${type === key ? '' : 'border-transparent bg-transparent shadow-none'}`}
                  onClick={() => selectType(key)}
                >
                  {cfg.labelTh}
                </Button>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <Button type="submit" variant="accent" data-test="advance-save-btn" className="flex-1" disabled={isSubmitting}>
                {t('adv.save')}
              </Button>
              <Button type="button" variant="subtle" data-test="advance-reset-btn" className="flex-1" onClick={handleReset}>
                {t('adv.reset')}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="min-w-0 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-farm-text sm:mb-6">{t('adv.recent')}</h2>
          <div tabIndex={0} role="region" aria-label={t('adv.recent')} className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[560px] border-collapse text-center text-xs sm:text-sm">
              <thead className="sticky top-0 bg-[#3F5C2B] text-white">
                <tr>
                  <th className="px-3 py-3 sm:px-4 font-medium">{t('col.date')}</th>
                  <th className="px-3 py-3 sm:px-4 text-left font-medium">{t('adv.col.worker')}</th>
                  <th className="px-3 py-3 sm:px-4 font-medium">{t('adv.col.type')}</th>
                  <th className="px-3 py-3 sm:px-4 font-medium">{t('adv.col.detail')}</th>
                  <th className="px-3 py-3 sm:px-4 text-right font-medium">{t('adv.col.value')}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => {
                  const cfg = ADVANCE_TYPES[a.type];
                  return (
                    <tr key={a.id} data-test="advance-row" className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-3 sm:px-4 text-gray-800">{formatShortDate(a.advanceDate)}</td>
                      <td className="px-3 py-3 sm:px-4 text-left">
                        <div className="flex items-center gap-2">
                          <Avatar name={a.workerFullName} />
                          <span className="font-medium text-gray-800">{a.workerFullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          data-test="advance-row-type"
                          className={`inline-block min-w-17.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.badgeClass}`}
                        >
                          {cfg.labelTh}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4 text-gray-800" data-test="advance-row-item">
                        {a.itemName || ''}
                      </td>
                      <td className="px-3 py-3 sm:px-4 text-right font-medium text-gray-800" data-test="advance-row-amount">
                        {formatAmount(a.amount)}
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-gray-400">
                      {t('common.noItems')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} message={t('adv.savedOk')} />}
    </div>
  );
}
