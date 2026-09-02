import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useWorkerStore } from '../../store/useWorkerStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { WORK_LOG_TYPES } from '../../config/workLogTypes';
import { formatBaht, formatDate } from '../../lib/format';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function EntryForm({ config, workers, onSubmit, onCancel }) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Input type="date" label="วันที่" {...register('date')} error={errors.date?.message} />
      <Select label="คนงาน" {...register('workerId')} error={errors.workerId?.message}>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>
            {w.fullName}
          </option>
        ))}
      </Select>
      {config.fields.map((field) => (
        <Input
          key={field.name}
          type="number"
          step="any"
          label={field.label}
          suffix={field.suffix}
          {...register(field.name)}
          error={errors[field.name]?.message}
        />
      ))}
      <div className="rounded-lg bg-farm-bg px-3 py-2 text-sm text-farm-text">
        รวม: <span className="font-semibold text-farm-primary">{formatBaht(preview)}</span>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึก</Button>
      </div>
    </form>
  );
}

export default function WorkLog({ type }) {
  const config = WORK_LOG_TYPES[type];
  const allWorkers = useWorkerStore((s) => s.workers);
  const getWorkerName = useWorkerStore((s) => s.getWorkerName);
  const allEntries = useWorkLogStore((s) => s.entries);
  const addEntry = useWorkLogStore((s) => s.addEntry);

  const activeWorkers = useMemo(() => allWorkers.filter((w) => w.isActive), [allWorkers]);
  const typeEntries = useMemo(() => allEntries.filter((e) => e.type === type), [allEntries, type]);

  const [modalOpen, setModalOpen] = useState(false);
  const [workerFilter, setWorkerFilter] = useState('all');

  const filtered = useMemo(() => {
    const list = workerFilter === 'all' ? typeEntries : typeEntries.filter((e) => e.workerId === workerFilter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [typeEntries, workerFilter]);

  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.total, 0), [filtered]);

  function handleSubmit(data) {
    const numericData = { ...data };
    config.fields.forEach((f) => {
      numericData[f.name] = Number(data[f.name]);
    });
    addEntry(type, numericData);
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-farm-text">{config.labelTh}</h1>
          <p className="text-sm text-farm-text/60">สูตรคำนวณ: {config.formulaLabel}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> บันทึกรายการใหม่
        </Button>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="w-56 rounded-lg border border-farm-secondary/50 bg-white px-3 py-2 text-sm text-farm-text outline-none focus:border-farm-primary focus:ring-1 focus:ring-farm-primary"
          >
            <option value="all">คนงานทั้งหมด</option>
            {activeWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName}
              </option>
            ))}
          </select>
          <p className="text-sm text-farm-text/70">
            รวมทั้งหมด: <span className="font-semibold text-farm-primary">{formatBaht(total)}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-farm-secondary/30 text-farm-text/60">
                <th className="py-2 pr-4 font-medium">วันที่</th>
                <th className="py-2 pr-4 font-medium">คนงาน</th>
                <th className="py-2 pr-4 font-medium">รายละเอียด</th>
                <th className="py-2 pr-4 text-right font-medium">ค่าแรง</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-farm-secondary/15 last:border-0">
                  <td className="py-2 pr-4 text-farm-text/80">{formatDate(entry.date)}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{getWorkerName(entry.workerId)}</td>
                  <td className="py-2 pr-4 text-farm-text/80">{config.summaryText(entry)}</td>
                  <td className="py-2 pr-4 text-right font-medium text-farm-text">{formatBaht(entry.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-farm-text/50">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="บันทึกรายการใหม่">
        <EntryForm config={config} workers={activeWorkers} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
