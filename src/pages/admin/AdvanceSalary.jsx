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

const ADVANCE_TYPES = {
  CASH: { labelTh: 'เงินสด', badgeClass: 'bg-[#dcfce7] text-[#166534]' },
  GOODS: { labelTh: 'สิ่งของ', badgeClass: 'bg-[#fef08a] text-[#854d0e]' },
};

const schema = z
  .object({
    workerId: z.string().min(1, 'กรุณาเลือกคนงาน'),
    advanceDate: z.string().min(1, 'กรุณาเลือกวันที่'),
    type: z.enum(['CASH', 'GOODS']),
    itemName: z.string().max(255, 'ชื่อสินค้ายาวเกินไป'),
    amount: z.coerce.number({ message: 'กรุณากรอกจำนวนเงิน' }).positive('ต้องมากกว่า 0'),
  })
  .refine((v) => v.type !== 'GOODS' || v.itemName.trim() !== '', {
    path: ['itemName'],
    message: 'กรุณากรอกชื่อสินค้า',
  });

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyValues() {
  return { workerId: '', advanceDate: todayISO(), type: 'CASH', itemName: '', amount: '' };
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatAmount(n) {
  return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

export default function AdvanceSalary() {
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
  } = useForm({ resolver: zodResolver(schema), defaultValues: emptyValues() });

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
      setSubmitError(error.response?.data?.message || 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  }

  return (
    <div>
      <PageHeader title="Advance Salary" />

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="p-6">
          <h2 className="mb-6 text-lg font-bold text-farm-text">เพิ่มรายการเบิก</h2>
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
                  label="เลือกคนงาน"
                  dataTest="advance-form-worker"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.workerId?.message}
                  options={[
                    { value: '', label: 'เลือกคนงาน' },
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
                  label="วันที่เบิก"
                  dataTest="advance-form-date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.advanceDate?.message}
                />
              )}
            />

            {type === 'GOODS' && (
              <Input
                label="ชื่อสินค้า"
                placeholder="เช่น ข้าวสาร"
                data-test="advance-form-item"
                {...register('itemName')}
                error={errors.itemName?.message}
              />
            )}

            <Input
              type="number"
              step="any"
              min="0"
              label="จำนวนเงิน (บาท)"
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

            <div className="flex gap-4 pt-2">
              <Button type="submit" variant="accent" data-test="advance-save-btn" className="flex-1" disabled={isSubmitting}>
                บันทึกการเบิก
              </Button>
              <Button type="button" variant="subtle" data-test="advance-reset-btn" className="flex-1" onClick={handleReset}>
                ล้างฟอร์ม
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-6 text-lg font-bold text-farm-text">รายการเบิกล่าสุด</h2>
          <div className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-center text-sm">
              <thead className="sticky top-0 bg-[#3F5C2B] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">วันที่</th>
                  <th className="px-4 py-3 text-left font-medium">ชื่อคนงาน</th>
                  <th className="px-4 py-3 font-medium">ประเภท</th>
                  <th className="px-4 py-3 font-medium">รายละเอียด</th>
                  <th className="px-4 py-3 text-right font-medium">มูลค่า (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => {
                  const cfg = ADVANCE_TYPES[a.type];
                  return (
                    <tr key={a.id} data-test="advance-row" className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{formatShortDate(a.advanceDate)}</td>
                      <td className="px-4 py-3 text-left">
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
                      <td className="px-4 py-3 text-gray-800" data-test="advance-row-item">
                        {a.itemName || ''}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800" data-test="advance-row-amount">
                        {formatAmount(a.amount)}
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-gray-400">
                      ไม่พบรายการ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} message="บันทึกการเบิกสำเร็จ" />}
    </div>
  );
}
