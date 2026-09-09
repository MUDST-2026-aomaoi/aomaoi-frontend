import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, ChevronDown, UserPlus, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES, WORK_LOG_ORDER } from '../../config/workLogTypes';
import { formatDateLong, formatBaht } from '../../lib/format';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(n) {
  return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function EntryForm({ type, onTypeChange, workers, onSubmit, onCancel }) {
  const config = WORK_LOG_TYPES[type];
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: {
      date: todayISO(),
      workerId: workers[0]?.id ?? '',
      ...Object.fromEntries(config.fields.map((f) => [f.name, f.defaultValue])),
    },
  });

  const values = watch();
  const previewValid = config.fields.every((f) => Number(values[f.name]) > 0);
  const preview = previewValid
    ? config.calcTotal(config.fields.reduce((acc, f) => ({ ...acc, [f.name]: Number(values[f.name]) }), {}))
    : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
        <h3 className="text-lg font-bold text-farm-primary">Add New Work Record</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input type="date" label="วันที่ทำงาน" {...register('date')} error={errors.date?.message} />
          <Select label="คนงาน" {...register('workerId')} error={errors.workerId?.message}>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${1 + config.fields.length}, minmax(0,1fr))` }}>
          <Select label="ประเภทงาน" value={type} onChange={(e) => onTypeChange(e.target.value)}>
            {WORK_LOG_ORDER.map((key) => (
              <option key={key} value={key}>
                {WORK_LOG_TYPES[key].labelTh}
              </option>
            ))}
          </Select>
          {config.fields.map((field) => (
            <Input key={field.name} type="number" step="any" label={field.label} {...register(field.name)} error={errors[field.name]?.message} />
          ))}
        </div>

        <div className="rounded-lg bg-farm-sidebar px-5 py-4 text-white">
          <p className="text-xs text-white/60">{config.formulaLabel}</p>
          <p className="mt-1 text-sm font-medium text-white/90">ค่าแรงรวม</p>
          <p className="text-2xl font-bold">{formatNumber(preview)} บาท</p>
        </div>
      </div>

      <div className="mt-6 flex w-full gap-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          cancel
        </Button>
        <Button type="submit" className="flex-1">
          confirm
        </Button>
      </div>
    </form>
  );
}

export default function WorkLog() {
  const allWorkers = useWorkerStore((s) => s.workers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const allEntries = useWorkLogStore((s) => s.entries);
  const addEntry = useWorkLogStore((s) => s.addEntry);

  const activeWorkers = useMemo(() => allWorkers.filter((w) => w.status !== 'inactive'), [allWorkers]);

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalState, setModalState] = useState(null);
  const [entryType, setEntryType] = useState(WORK_LOG_ORDER[0]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allEntries
      .filter((e) => workerFilter === 'all' || e.workerId === workerFilter)
      .filter((e) => typeFilter === 'all' || e.type === typeFilter)
      .filter((e) => !term || getWorkerName(e.workerId).toLowerCase().includes(term))
      .sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id));
  }, [allEntries, workerFilter, typeFilter, search, getWorkerName]);

  function openNewEntry() {
    setEntryType(WORK_LOG_ORDER[0]);
    setModalState('form');
  }

  function handleSubmit(type, data) {
    const config = WORK_LOG_TYPES[type];
    const numericData = { ...data };
    config.fields.forEach((f) => {
      numericData[f.name] = Number(data[f.name]);
    });
    addEntry(type, numericData);
    setModalState('success');
  }

  return (
    <div>
      <PageHeader title="Work Activity Log" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-lg flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-farm-primary"
          />
          <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className="min-w-40 appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-600 focus:outline-none"
            >
              <option value="all">พนักงานทั้งหมด</option>
              {allWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="min-w-40 appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-600 focus:outline-none"
            >
              <option value="all">ประเภทงานทั้งหมด</option>
              {WORK_LOG_ORDER.map((key) => (
                <option key={key} value={key}>
                  {WORK_LOG_TYPES[key].labelTh}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <Button variant="accent" className="flex items-center gap-2" onClick={openNewEntry}>
            <UserPlus className="h-5 w-5" />
            <span>บันทึกงานใหม่</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-center text-sm">
          <thead className="bg-[#3F5C2B] text-white">
            <tr>
              <th className="border-r border-[#517339] px-6 py-3.5 text-left font-medium">Name</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Date</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Work Type</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Qty</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Unit</th>
              <th className="px-4 py-3.5 font-medium">Wages</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const config = WORK_LOG_TYPES[entry.type];
              return (
                <tr key={entry.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50">
                  <td className="border-r border-gray-200 px-6 py-4 text-left font-medium text-gray-800">
                    {getWorkerName(entry.workerId)}
                  </td>
                  <td className="border-r border-gray-200 px-4 py-4 text-gray-800">{formatDateLong(entry.date)}</td>
                  <td className="border-r border-gray-200 px-4 py-4">
                    <span className={`inline-block min-w-17.5 rounded-full px-4 py-1.5 text-xs font-bold ${config.badgeClass}`}>
                      {config.labelTh}
                    </span>
                  </td>
                  <td className="border-r border-gray-200 px-4 py-4 text-gray-800">{config.primaryQty(entry)}</td>
                  <td className="border-r border-gray-200 px-4 py-4 text-gray-800">{config.primaryUnit}</td>
                  <td className="px-4 py-4 font-medium text-gray-800">{formatBaht(entry.total)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-gray-400">
                  ไม่พบรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalState === 'form' && (
        <ModalShell onClose={() => setModalState(null)} className="w-112.5">
          <EntryForm
            key={entryType}
            type={entryType}
            onTypeChange={setEntryType}
            workers={activeWorkers}
            onSubmit={(data) => handleSubmit(entryType, data)}
            onCancel={() => setModalState(null)}
          />
        </ModalShell>
      )}

      {modalState === 'success' && <SuccessModal onClose={() => setModalState(null)} message="บันทึกงานสำเร็จ" />}
    </div>
  );
}
