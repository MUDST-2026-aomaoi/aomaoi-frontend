import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, UserPlus, Edit, Trash2, X, AlertTriangle, MapPin, Sprout, ImagePlus, Info } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { CURRENT_SUPER_ADMIN } from '../../config/currentUser';
import { useFarmStore } from '../../store/useFarmStore';
import { useAdminStore } from '../../store/useAdminStore';

function formatNumber(n) {
  return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

const farmSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อฟาร์ม'),
  location: z.string().min(1, 'กรุณากรอกที่ตั้ง'),
});

function FarmForm({ title, defaultValues, onSubmit, onCancel }) {
  const [imagePreview, setImagePreview] = useState(defaultValues.image ?? null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(farmSchema), defaultValues });

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, image: imagePreview ?? undefined }))}>
      <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
        <h3 className="text-lg font-bold text-farm-primary">{title}</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mb-6 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400 hover:border-farm-primary hover:text-farm-primary"
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-8 w-8" />
        )}
      </button>

      <div className="mb-4 space-y-4">
        <Input label="ชื่อฟาร์ม" {...register('name')} error={errors.name?.message} />
        <Input label="ที่ตั้ง" {...register('location')} error={errors.location?.message} />
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-md bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>สร้างฟาร์มก่อน แล้วค่อยเพิ่ม Admin ให้ฟาร์มนี้ได้จากหน้า "จัดการ Admin"</p>
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

export default function AllFarms() {
  const farms = useFarmStore((s) => s.farms);
  const addFarm = useFarmStore((s) => s.addFarm);
  const updateFarm = useFarmStore((s) => s.updateFarm);
  const setFarmStatus = useFarmStore((s) => s.setFarmStatus);
  const allAdmins = useAdminStore((s) => s.admins);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const visibleFarms = useMemo(() => farms.filter((f) => f.status !== 'inactive'), [farms]);
  const admins = useMemo(() => allAdmins.filter((a) => a.status !== 'inactive'), [allAdmins]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return visibleFarms.filter((f) => !term || [f.name, f.location].some((field) => field.toLowerCase().includes(term)));
  }, [visibleFarms, search]);

  const totalWorkers = useMemo(() => visibleFarms.reduce((sum, f) => sum + f.workerCount, 0), [visibleFarms]);

  function closeModal() {
    setModal(null);
  }

  function handleAddSubmit(data) {
    addFarm(data);
    setModal({ mode: 'success', action: 'add' });
  }

  function handleEditSubmit(data) {
    updateFarm(modal.farm.id, data);
    setModal({ mode: 'success', action: 'edit' });
  }

  function handleConfirmDelete() {
    setFarmStatus(modal.farm.id, 'inactive');
    setModal({ mode: 'success', action: 'delete', farm: modal.farm });
  }

  return (
    <div>
      <PageHeader title="All Farms" admin={CURRENT_SUPER_ADMIN} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">All Farms</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-700">{visibleFarms.length}</h3>
            <span className="font-medium text-gray-400">ฟาร์ม</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">All Admin</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-700">{admins.length}</h3>
            <span className="font-medium text-gray-400">คน</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 font-medium text-gray-600">All Worker</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-700">{totalWorkers}</h3>
            <span className="font-medium text-gray-400">คน</span>
          </div>
        </div>
      </div>

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

        <Button
          variant="accent"
          className="flex items-center gap-2"
          onClick={() => setModal({ mode: 'add', defaultValues: { name: '', location: '' } })}
        >
          <UserPlus className="h-5 w-5" />
          <span>เพิ่มฟาร์มใหม่</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((farm) => (
          <div key={farm.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-linear-to-br from-farm-primary to-[#1F3C28]">
              {farm.image ? (
                <img src={farm.image} alt={farm.name} className="h-full w-full object-cover" />
              ) : (
                <Sprout className="h-16 w-16 text-white/30" />
              )}
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModal({ mode: 'edit', farm })}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ mode: 'delete', farm })}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">{farm.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> {farm.location}
              </p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">Worker</p>
                  <p className="text-lg font-bold text-gray-800">{farm.workerCount}</p>
                </div>
                <div className="pl-3">
                  <p className="text-xs text-gray-500">Admin</p>
                  <p className="text-lg font-bold text-gray-800">{farm.adminCount}</p>
                </div>
                <div className="pl-3">
                  <p className="text-xs text-gray-500">Monthly Wages</p>
                  <p className="text-lg font-bold text-gray-800">{formatNumber(farm.monthlyWages)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full py-8 text-center text-gray-400">ไม่พบฟาร์มที่ตรงกับเงื่อนไข</p>}
      </div>

      {modal?.mode === 'add' && (
        <ModalShell onClose={closeModal} className="w-112.5">
          <FarmForm title="Add New Farm" defaultValues={modal.defaultValues} onSubmit={handleAddSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'edit' && (
        <ModalShell onClose={closeModal} className="w-112.5">
          <FarmForm title="Edit Farm" defaultValues={modal.farm} onSubmit={handleEditSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'delete' && (
        <ModalShell onClose={closeModal} className="flex w-100 flex-col items-center text-center">
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <AlertTriangle className="mb-4 h-16 w-16 stroke-[1.5] text-red-600" />
          <p className="mb-1 font-medium text-gray-800">ยืนยันการลบฟาร์ม "{modal.farm.name}"?</p>
          <p className="mb-8 text-sm font-medium text-red-600">ข้อมูลย้อนหลังจะยังอยู่ แต่ฟาร์มนี้จะไม่แสดงในระบบอีก</p>
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
            (modal.action === 'add' && 'เพิ่มฟาร์มสำเร็จ') ||
            (modal.action === 'edit' && 'แก้ไขข้อมูลสำเร็จ') ||
            'ลบฟาร์มสำเร็จ'
          }
          submessage={modal.action === 'delete' ? `${modal.farm.name} ถูกลบออกจากระบบแล้ว` : undefined}
        />
      )}
    </div>
  );
}
