import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Shuffle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useWorkerStore } from '../../store/useWorkerStore';

const workerSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-สกุล'),
  nickname: z.string().min(1, 'กรุณากรอกชื่อเล่น'),
  username: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร'),
  tempPassword: z.string().min(6, 'ต้องมีอย่างน้อย 6 ตัวอักษร'),
});

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function WorkerForm({ defaultValues, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(workerSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Input label="ชื่อ-สกุล" {...register('fullName')} error={errors.fullName?.message} />
      <Input label="ชื่อเล่น" {...register('nickname')} error={errors.nickname?.message} />
      <Input label="Username" {...register('username')} error={errors.username?.message} />
      <div>
        <Input label="รหัสผ่านชั่วคราว" {...register('tempPassword')} error={errors.tempPassword?.message} />
        <button
          type="button"
          onClick={() => setValue('tempPassword', randomPassword(), { shouldValidate: true })}
          className="mt-1 flex items-center gap-1 text-xs font-medium text-farm-primary hover:underline"
        >
          <Shuffle size={12} /> สุ่มรหัสผ่านใหม่
        </button>
      </div>
      <p className="text-xs text-farm-text/50">คนงานต้องเปลี่ยนรหัสผ่านนี้ในการเข้าสู่ระบบครั้งแรก</p>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึก</Button>
      </div>
    </form>
  );
}

export default function Workers() {
  const workers = useWorkerStore((s) => s.workers);
  const addWorker = useWorkerStore((s) => s.addWorker);
  const updateWorker = useWorkerStore((s) => s.updateWorker);
  const deactivateWorker = useWorkerStore((s) => s.deactivateWorker);
  const nextUsername = useWorkerStore((s) => s.nextUsername);

  const [modal, setModal] = useState(null);

  function closeModal() {
    setModal(null);
  }

  function handleFormSubmit(data) {
    if (modal.mode === 'edit') {
      updateWorker(modal.worker.id, data);
    } else {
      addWorker(data);
    }
    closeModal();
  }

  function handleConfirmDelete() {
    deactivateWorker(modal.worker.id);
    closeModal();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-farm-text">คนงาน</h1>
        <Button
          onClick={() =>
            setModal({
              mode: 'add',
              defaultValues: { fullName: '', nickname: '', username: nextUsername(), tempPassword: randomPassword() },
            })
          }
          className="flex items-center gap-2"
        >
          <Plus size={16} /> เพิ่มคนงาน
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workers.map((worker) => (
          <Card key={worker.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-farm-secondary/40 text-sm font-semibold text-farm-text">
                {worker.nickname.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-farm-text">{worker.fullName}</p>
                <p className="truncate text-xs text-farm-text/60">"{worker.nickname}" · @{worker.username}</p>
              </div>
              <Badge tone={worker.isActive ? 'success' : 'neutral'}>
                {worker.isActive ? 'ใช้งานอยู่' : 'ปิดการใช้งาน'}
              </Badge>
            </div>
            <div className="flex justify-end gap-2 border-t border-farm-secondary/20 pt-3">
              <button
                type="button"
                onClick={() => setModal({ mode: 'edit', worker, defaultValues: worker })}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-farm-primary hover:bg-farm-primary/10"
              >
                <Pencil size={14} /> แก้ไข
              </button>
              {worker.isActive && (
                <button
                  type="button"
                  onClick={() => setModal({ mode: 'delete', worker })}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> ลบ
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={closeModal}
        title={modal?.mode === 'edit' ? 'แก้ไขคนงาน' : 'เพิ่มคนงาน'}
      >
        {modal && modal.mode !== 'delete' && (
          <WorkerForm defaultValues={modal.defaultValues} onSubmit={handleFormSubmit} onCancel={closeModal} />
        )}
      </Modal>

      <Modal open={modal?.mode === 'delete'} onClose={closeModal} title="ยืนยันการลบคนงาน">
        <p className="text-sm text-farm-text/80">
          ประวัติการทำงานของ <span className="font-medium">{modal?.worker?.fullName}</span> จะยังคงอยู่ในระบบ
          แต่คนงานจะไม่สามารถเข้าสู่ระบบได้อีก
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={closeModal}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            ลบคนงาน
          </Button>
        </div>
      </Modal>
    </div>
  );
}
