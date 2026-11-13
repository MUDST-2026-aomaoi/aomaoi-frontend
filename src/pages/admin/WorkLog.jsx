import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { Dropdown } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { TableLoadingRow } from '../../components/ui/Loader';
import { useFitRows, usePagedList } from '../../hooks/usePageSize';
import { DateInput } from '../../components/ui/DateInput';
import { Avatar } from '../../components/ui/Avatar';
import { TableToolbar, TOOLBAR_FILTER_CLASS } from '../../components/ui/TableToolbar';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER, todayISO } from '../../config/workLogTypes';
import { formatDate, formatDateLong, formatBaht } from '../../lib/format';
import { getLocale } from '../../i18n';
import { tError } from '../../i18n/backendMessages';
import { useT } from '../../i18n';

function formatNumber(n) {
  return Number(n).toLocaleString(getLocale(), { maximumFractionDigits: 0 });
}

function EntryForm({ type, onTypeChange, workerId, onWorkerIdChange, workers, submitError, onSubmit, onCancel }) {
  const t = useT();
  const config = WORK_LOG_TYPES[type];
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: {
      workerId,
      ...Object.fromEntries(
        config.fields.map((f) => [f.name, f.name === 'date' ? todayISO() : f.defaultValue])
      ),
    },
  });

  const values = watch();
  const previewValid = config.fields.every((f) =>
    f.type === 'date' ? !!values[f.name] : Number(values[f.name]) > 0
  );
  const computedValues = config.fields.reduce(
    (acc, f) => ({ ...acc, [f.name]: f.type === 'date' ? values[f.name] : Number(values[f.name]) }),
    {}
  );
  const preview = previewValid ? config.calcTotal(computedValues) : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4 flex items-center justify-between border-b border-[#E6F0D6] pb-3">
        <h3 className="text-xl font-extrabold tracking-tight text-farm-primary">{t('wlog.addTitle')}</h3>
        <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {submitError && (
          <div data-test="worklog-submit-error" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{submitError}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="workerId"
            render={({ field }) => (
              <Dropdown
                label={t('common.worker')}
                dataTest="worklog-form-worker"
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onWorkerIdChange(v);
                }}
                error={errors.workerId?.message}
                options={[
                  { value: '', label: t('wlog.pickWorker') },
                  ...workers.map((w) => ({ value: String(w.id), label: w.fullName })),
                ]}
              />
            )}
          />
          <Dropdown
            label={t('wlog.workType')}
            dataTest="worklog-form-type"
            value={type}
            onChange={onTypeChange}
            options={WORK_LOG_ORDER.map((key) => ({ value: key, label: WORK_LOG_TYPES[key].labelTh }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {config.fields.map((field) =>
            field.type === 'date' ? (
              <Controller
                key={field.name}
                control={control}
                name={field.name}
                render={({ field: rhfField }) => (
                  <DateInput
                    label={field.label}
                    dataTest={`worklog-form-${field.name}`}
                    value={rhfField.value}
                    onChange={rhfField.onChange}
                    maxDate={new Date()}
                    error={errors[field.name]?.message}
                  />
                )}
              />
            ) : (
              <Input
                key={field.name}
                type="number"
                step="any"
                label={field.label}
                suffix={field.suffix}
                data-test={`worklog-form-${field.name}`}
                {...register(field.name)}
                error={errors[field.name]?.message}
              />
            )
          )}
        </div>

        <div className="rounded-2xl bg-[#2E4A1F] px-5 py-4 text-white">
          <p data-test="worklog-preview-summary" className="text-xs text-white/60">{previewValid ? config.summaryText(computedValues) : config.formulaLabel}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-medium text-white/90">{t('wlog.totalWage')}</span>
            <span data-test="worklog-preview-total" className="text-2xl font-bold">{formatNumber(preview)} {t('common.baht')}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex w-full gap-4">
        <Button type="button" data-test="worklog-form-cancel" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" data-test="worklog-form-submit" className="flex-1" loading={isSubmitting}>
          {t('common.confirm')}
        </Button>
      </div>
    </form>
  );
}

export default function WorkLog() {
  const t = useT();
  const allWorkers = useWorkerStore((s) => s.workers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const allEntries = useWorkLogStore((s) => s.entries);
  const addEntry = useWorkLogStore((s) => s.addEntry);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const entriesLoaded = useWorkLogStore((s) => s.loaded);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);

  useEffect(() => {
    fetchWorkers();
    fetchEntries();
  }, [fetchWorkers, fetchEntries]);

  const activeWorkers = useMemo(() => allWorkers.filter((w) => w.status !== 'inactive'), [allWorkers]);

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalState, setModalState] = useState(null);
  const [entryType, setEntryType] = useState(WORK_LOG_ORDER[0]);
  const [entryWorkerId, setEntryWorkerId] = useState('');
  const [submitError, setSubmitError] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allEntries
      .filter((e) => workerFilter === 'all' || String(e.workerId) === String(workerFilter))
      .filter((e) => typeFilter === 'all' || e.type === typeFilter)
      .filter((e) => !term || getWorkerName(e.workerId).toLowerCase().includes(term))
      .sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id));
  }, [allEntries, workerFilter, typeFilter, search, getWorkerName]);

  function openNewEntry() {
    setEntryType(WORK_LOG_ORDER[0]);
    setEntryWorkerId('');
    setSubmitError('');
    setModalState('form');
  }

  async function handleSubmit(type, data) {
    const config = WORK_LOG_TYPES[type];
    const numericData = { ...data };
    config.fields.forEach((f) => {
      numericData[f.name] = f.type === 'date' ? data[f.name] : Number(data[f.name]);
    });
    setSubmitError('');
    try {
      await addEntry(type, numericData);
      setModalState('success');
    } catch (error) {
      setSubmitError(tError(error, t('wlog.saveFailed')));
    }
  }

  const { ref: tableRef, pageSize } = useFitRows();
  const pager = usePagedList(filtered, pageSize);
  const pageItems = pager.pageItems;

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t('wlog.pageTitle')} />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('wlog.search')}
        searchTestId="worklog-search"
        action={
          <Button variant="accent" data-test="worklog-add-btn" className="flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto sm:shrink-0" onClick={openNewEntry}>
            <UserPlus className="h-5 w-5" />
            <span>{t('wlog.addBtn')}</span>
          </Button>
        }
      >
        <Dropdown
          value={workerFilter}
          onChange={setWorkerFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="worklog-worker-filter"
          options={[{ value: 'all', label: t('common.allWorkers') }, ...allWorkers.map((w) => ({ value: w.id, label: w.fullName }))]}
        />
        <Dropdown
          value={typeFilter}
          onChange={setTypeFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="worklog-type-filter"
          options={[
            { value: 'all', label: t('worker.allTypes') },
            ...WORK_LOG_ORDER.map((key) => ({ value: key, label: WORK_LOG_TYPES[key].labelTh })),
          ]}
        />
      </TableToolbar>

      <div ref={tableRef} tabIndex={0} role="region" aria-label={t('wlog.tableLabel')} className="overflow-x-auto rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <table className="rtable w-full min-w-[560px] border-collapse text-center text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#2E4A1F] text-white">
            <tr>
              <th className="px-4 py-3 text-left sm:px-6 sm:py-3.5 font-medium">{t('col.name')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.date')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.workType')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.qty')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.unit')}</th>
              <th className="px-3 py-3 pr-4 text-right sm:px-4 sm:py-3.5 sm:pr-6 font-medium">{t('col.wages')}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((entry) => {
              const config = WORK_LOG_TYPES[entry.type];
              return (
                <tr key={entry.id} data-test="worklog-row" className="border-b border-[#F0F2EA] transition-colors last:border-0 hover:bg-[#E6F0D6]/50">
                  <td className="px-4 py-3 text-left font-medium sm:px-6 sm:py-4 text-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar src={allWorkers.find((w) => String(w.id) === String(entry.workerId))?.avatar} name={getWorkerName(entry.workerId)} />
                      <span>{getWorkerName(entry.workerId)}</span>
                    </div>
                  </td>
                  <td data-label={t('col.date')} className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800">
                    {entry.startDate && entry.endDate && entry.startDate !== entry.endDate
                      ? `${formatDate(entry.startDate)} - ${formatDate(entry.endDate)}`
                      : formatDateLong(entry.startDate || entry.date)}
                  </td>
                  <td data-label={t('col.workType')} className="px-3 py-3 sm:px-4 sm:py-4">
                    <span data-test="worklog-row-type" className={`inline-block min-w-17.5 rounded-full px-4 py-1.5 text-xs font-bold bg-[#E6F0D6] text-[#2E4A1F]`}>
                      {config.labelTh}
                    </span>
                  </td>
                  <td data-label={t('col.qty')} className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800" data-test="worklog-row-qty">{config.primaryQty(entry)}</td>
                  <td data-label={t('col.unit')} className="px-3 py-3 sm:px-4 sm:py-4 text-gray-800">{config.primaryUnit}</td>
                  <td data-label={t('col.wages')} className="px-3 py-3 pr-4 text-right sm:px-4 sm:py-4 sm:pr-6 font-medium text-gray-800" data-test="worklog-row-wages">{formatBaht(entry.total)}</td>
                </tr>
              );
            })}
            {!entriesLoaded && <TableLoadingRow cols={6} />}
            {entriesLoaded && filtered.length === 0 && (
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

      {modalState === 'form' && (
        <ModalShell onClose={() => setModalState(null)} className="w-full sm:w-112.5">
          <EntryForm
            key={entryType}
            type={entryType}
            onTypeChange={setEntryType}
            workerId={entryWorkerId}
            onWorkerIdChange={setEntryWorkerId}
            workers={activeWorkers}
            submitError={submitError}
            onSubmit={(data) => handleSubmit(entryType, data)}
            onCancel={() => setModalState(null)}
          />
        </ModalShell>
      )}

      {modalState === 'success' && <SuccessModal onClose={() => setModalState(null)} message={t('wlog.savedOk')} />}
    </div>
  );
}
