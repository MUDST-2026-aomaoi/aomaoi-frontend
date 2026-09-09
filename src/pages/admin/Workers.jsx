import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, ChevronDown, UserPlus, Edit, Trash2, X, AlertTriangle, ImagePlus, Info, Shuffle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Avatar } from '../../components/ui/Avatar';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerStore } from '../../store/useWorkerStore';
import { formatDateLong } from '../../lib/format';
import { STATUS_STYLE, STATUS_LABEL } from '../../config/status';

const workerSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  nickname: z.string().min(1, 'กรุณากรอกชื่อเล่น'),
  username: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
});

const addWorkerSchema = workerSchema.extend({
  tempPassword: z.string().min(6, 'ต้องมีอย่างน้อย 6 ตัวอักษร'),
});

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function EditWorkerForm({ worker, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(workerSchema), defaultValues: worker });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
        <h3 className="text-lg font-bold text-farm-primary">Edit Worker</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <Avatar src={worker.avatar} name={worker.fullName} className="h-24 w-24 border border-gray-200 text-2xl" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Input label="ชื่อ-นามสกุล" {...register('fullName')} error={errors.fullName?.message} />
        <Input label="ชื่อเล่น" {...register('nickname')} error={errors.nickname?.message} />
        <Input label="Username" {...register('username')} error={errors.username?.message} />
        <Input label="เบอร์โทร" {...register('phone')} error={errors.phone?.message} />
      </div>

      <div className="flex w-full gap-4">
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

function AddWorkerForm({ defaultValues, onSubmit, onCancel }) {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addWorkerSchema), defaultValues });

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, avatar: avatarPreview ?? undefined }))}>
      <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
        <h3 className="text-lg font-bold text-farm-primary">Add New Worker</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-farm-primary hover:text-farm-primary"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-8 w-8" />
          )}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <Input label="ชื่อ-นามสกุล" {...register('fullName')} error={errors.fullName?.message} />
        <Input label="ชื่อเล่น" {...register('nickname')} error={errors.nickname?.message} />
        <Input label="Username" {...register('username')} error={errors.username?.message} />
        <Input label="เบอร์โทร" {...register('phone')} error={errors.phone?.message} />
      </div>

      <div className="mb-2">
        <Input label="รหัสผ่านชั่วคราว" {...register('tempPassword')} error={errors.tempPassword?.message} />
        <button
          type="button"
          onClick={() => setValue('tempPassword', randomPassword(), { shouldValidate: true })}
          className="mt-1 flex items-center gap-1 text-xs font-medium text-farm-primary hover:underline"
        >
          <Shuffle size={12} /> สุ่มรหัสผ่านใหม่
        </button>
      </div>

      <div className="mb-6 mt-3 flex items-start gap-2 rounded-md bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>ส่งข้อมูลนี้ให้คนงานทางที่สะดวก ระบบจะบังคับเปลี่ยนรหัสผ่านตอนเข้าสู่ระบบครั้งแรก</p>
      </div>

      <div className="flex w-full gap-4">
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

export default function Workers() {
  const workers = useWorkerStore((s) => s.workers);
  const addWorker = useWorkerStore((s) => s.addWorker);
  const updateWorker = useWorkerStore((s) => s.updateWorker);
  const setWorkerStatus = useWorkerStore((s) => s.setWorkerStatus);
  const nextUsername = useWorkerStore((s) => s.nextUsername);

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workers.filter((w) => {
      const matchesSearch =
        !term ||
        [w.fullName, w.nickname, w.username, w.phone].some((field) => field.toLowerCase().includes(term));
      const matchesWorker = workerFilter === 'all' || w.id === workerFilter;
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesWorker && matchesStatus;
    });
  }, [workers, search, workerFilter, statusFilter]);

  function closeModal() {
    setModal(null);
  }

  function handleAddSubmit(data) {
    const { tempPassword, ...worker } = data;
    void tempPassword;
    addWorker(worker);
    setModal({ mode: 'success', action: 'add' });
  }

  function handleEditSubmit(data) {
    updateWorker(modal.worker.id, data);
    setModal({ mode: 'success', action: 'edit' });
  }

  function handleConfirmDelete() {
    setWorkerStatus(modal.worker.id, 'inactive');
    setModal({ mode: 'success', action: 'delete', worker: modal.worker });
  }

  return (
    <div>
      <PageHeader title="Worker Management" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-lg flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, username, เบอร์โทร"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-farm-primary"
          />
          <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className="min-w-37.5 appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-600 focus:outline-none"
            >
              <option value="all">พนักงานทั้งหมด</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-37.5 appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-600 focus:outline-none"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <Button
            variant="accent"
            className="flex items-center gap-2"
            onClick={() =>
              setModal({
                mode: 'add',
                defaultValues: { fullName: '', nickname: '', username: nextUsername(), phone: '', tempPassword: randomPassword() },
              })
            }
          >
            <UserPlus className="h-5 w-5" />
            <span>เพิ่มคนงานใหม่</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-center text-sm">
          <thead className="bg-[#3F5C2B] text-white">
            <tr>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Name</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Nickname</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Username</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Phone Number</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Status</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Start Date</th>
              <th className="px-4 py-3.5 font-medium">Manage</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((worker) => (
              <tr key={worker.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50">
                <td className="border-r border-gray-200 px-4 py-3 text-left">
                  <div className="flex items-center justify-start gap-3 pl-2">
                    <Avatar src={worker.avatar} name={worker.fullName} />
                    <span className="font-semibold text-gray-800">{worker.fullName}</span>
                  </div>
                </td>
                <td className="border-r border-gray-200 px-4 py-3 font-medium text-gray-800">{worker.nickname}</td>
                <td className="border-r border-gray-200 px-4 py-3 text-gray-800">@{worker.username}</td>
                <td className="border-r border-gray-200 px-4 py-3 text-gray-800">{worker.phone}</td>
                <td className="border-r border-gray-200 px-4 py-3">
                  <span className={`inline-block w-20 rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE[worker.status]}`}>
                    {STATUS_LABEL[worker.status]}
                  </span>
                </td>
                <td className="border-r border-gray-200 px-4 py-3 text-gray-800">{formatDateLong(worker.joinedDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: 'edit', worker })}
                      className="text-gray-700 transition-colors hover:text-black"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: 'delete', worker })}
                      className="text-red-500 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-gray-400">
                  ไม่พบคนงานที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal?.mode === 'add' && (
        <ModalShell onClose={closeModal} className="w-112.5">
          <AddWorkerForm defaultValues={modal.defaultValues} onSubmit={handleAddSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'edit' && (
        <ModalShell onClose={closeModal} className="w-112.5">
          <EditWorkerForm worker={modal.worker} onSubmit={handleEditSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'delete' && (
        <ModalShell onClose={closeModal} className="flex w-100 flex-col items-center text-center">
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <AlertTriangle className="mb-4 h-16 w-16 stroke-[1.5] text-red-600" />
          <p className="mb-1 font-medium text-gray-800">ยืนยันการลบคนงาน "{modal.worker.fullName}"?</p>
          <p className="mb-8 text-sm font-medium text-red-600">ประวัติการทำงานจะยังอยู่ แต่จะไม่สามารถเข้าสู่ระบบได้อีก</p>
          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1" onClick={closeModal}>
              cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleConfirmDelete}>
              confirm
            </Button>
          </div>
        </ModalShell>
      )}

      {modal?.mode === 'success' && (
        <SuccessModal
          onClose={closeModal}
          message={
            (modal.action === 'add' && 'เพิ่มคนงานสำเร็จ') ||
            (modal.action === 'edit' && 'แก้ไขข้อมูลสำเร็จ') ||
            'ลบคนงานสำเร็จ'
          }
          submessage={modal.action === 'delete' ? `${modal.worker.fullName} ถูกปิดการใช้งานแล้ว` : undefined}
        />
      )}
    </div>
  );
}
