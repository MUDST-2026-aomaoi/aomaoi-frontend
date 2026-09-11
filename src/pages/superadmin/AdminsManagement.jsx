import { useMemo, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, UserPlus, Edit, Trash2, X, AlertTriangle, ImagePlus, Info, Shuffle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Avatar } from '../../components/ui/Avatar';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { CURRENT_SUPER_ADMIN } from '../../config/currentUser';
import { useAdminStore } from '../../store/useAdminStore';
import { useFarmStore } from '../../store/useFarmStore';
import { adminService } from '../../service/adminService';
import { formatDateLong } from '../../lib/format';
import { STATUS_STYLE, STATUS_LABEL } from '../../config/status';

const adminSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล').regex(/^[^0-9]*$/, 'ชื่อ-นามสกุลต้องไม่มีตัวเลข'),
  username: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
  farmId: z.string().min(1, 'กรุณาเลือกฟาร์ม'),
});

const addAdminSchema = adminSchema.extend({
  tempPassword: z.string().min(6, 'ต้องมีอย่างน้อย 6 ตัวอักษร'),
});

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function EditAdminForm({ admin, farms, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(adminSchema), defaultValues: admin });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
        <h3 className="text-lg font-bold text-farm-primary">Edit Admin</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <Avatar src={admin.avatar} name={admin.fullName} className="h-24 w-24 border border-gray-200 text-2xl" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Input label="ชื่อ-นามสกุล" {...register('fullName')} error={errors.fullName?.message} />
        <Input label="Username" {...register('username')} error={errors.username?.message} />
        <Input label="เบอร์โทร" {...register('phone')} error={errors.phone?.message} />
        <Select label="ฟาร์ม" {...register('farmId')} error={errors.farmId?.message}>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
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

function AddAdminForm({ defaultValues, farms, onSubmit, onCancel }) {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addAdminSchema), defaultValues });

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
        <h3 className="text-lg font-bold text-farm-primary">Add New Admin</h3>
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
        <Input label="Username" {...register('username')} error={errors.username?.message} />
        <Input label="เบอร์โทร" {...register('phone')} error={errors.phone?.message} />
        <Select label="ฟาร์ม" {...register('farmId')} error={errors.farmId?.message}>
          <option value="">----- กรุณาเลือกฟาร์ม -----</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
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
        <p>ส่งข้อมูลนี้ให้ Admin ทางที่สะดวก ระบบจะบังคับเปลี่ยนรหัสผ่านตอนเข้าสู่ระบบครั้งแรก</p>
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

export default function AdminsManagement() {
  const admins = useAdminStore((s) => s.admins);
  const addAdmin = useAdminStore((s) => s.addAdmin);
  const updateAdmin = useAdminStore((s) => s.updateAdmin);
  const setAdminStatus = useAdminStore((s) => s.setAdminStatus);
  const nextUsername = useAdminStore((s) => s.nextUsername);
  const allFarms = useFarmStore((s) => s.farms);
  const getFarmName = useFarmStore((s) => s.getFarmName);
  const fetchAdmins = useAdminStore((s) => s.fetchAdmins);
  const fetchFarms = useFarmStore((s) => s.fetchFarms);

  useEffect(() => {
    fetchAdmins();
    fetchFarms();
  }, [fetchAdmins, fetchFarms]);

  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const farms = useMemo(() => allFarms.filter((f) => f.status !== 'inactive'), [allFarms]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return admins.filter((a) => {
      const matchesSearch = !term || [a.fullName, a.username, a.phone].some((field) => field.toLowerCase().includes(term));
      const matchesFarm = farmFilter === 'all' || a.farmId === farmFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesFarm && matchesStatus;
    });
  }, [admins, search, farmFilter, statusFilter]);

  function closeModal() {
    setModal(null);
  }

  async function handleAddSubmit(data) {
    try {
      const response = await adminService.addAdmin(data);
      addAdmin(response);
      setModal({ mode: 'success', action: 'add' });
    } catch (error) {
      console.error("Failed to add admin", error);
      alert("Failed to add admin: " + (error.response?.data?.message || error.message));
    }
  }

  async function handleEditSubmit(data) {
    try {
      const response = await adminService.updateAdmin(modal.admin.id, data);
      updateAdmin(modal.admin.id, response);
      setModal({ mode: 'success', action: 'edit' });
    } catch (error) {
      console.error(error);
      alert('Failed to update admin');
    }
  }

  async function handleConfirmDelete() {
    try {
      await adminService.deleteAdmin(modal.admin.id);
      setAdminStatus(modal.admin.id, 'inactive');
      setModal({ mode: 'success', action: 'delete', admin: modal.admin });
    } catch (error) {
      console.error(error);
      alert('Failed to delete admin');
    }
  }

  return (
    <div>
      <PageHeader title="Admins Management"  />

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
          <Dropdown
            value={farmFilter}
            onChange={setFarmFilter}
            className="w-48"
            options={[{ value: 'all', label: 'ฟาร์มทั้งหมด' }, ...farms.map((f) => ({ value: f.id, label: f.name }))]}
          />

          <Dropdown
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48"
            options={[
              { value: 'all', label: 'สถานะทั้งหมด' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <Button
            variant="accent"
            className="flex items-center gap-2"
            onClick={() =>
              setModal({
                mode: 'add',
                defaultValues: { fullName: '', username: nextUsername(), phone: '', farmId: '', tempPassword: randomPassword() },
              })
            }
          >
            <UserPlus className="h-5 w-5" />
            <span>เพิ่ม Admin ใหม่</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-center text-sm">
          <thead className="bg-[#3F5C2B] text-white">
            <tr>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Name</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Username</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Phone Number</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Farm</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Status</th>
              <th className="border-r border-[#517339] px-4 py-3.5 font-medium">Start Date</th>
              <th className="px-4 py-3.5 font-medium">Manage</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((admin) => (
              <tr key={admin.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50">
                <td className="border-r border-gray-200 px-4 py-3 text-left">
                  <div className="flex items-center justify-start gap-3 pl-2">
                    <Avatar src={admin.avatar} name={admin.fullName} />
                    <span className="font-semibold text-gray-800">{admin.fullName}</span>
                  </div>
                </td>
                <td className="border-r border-gray-200 px-4 py-3 text-gray-800">{admin.username}</td>
                <td className="border-r border-gray-200 px-4 py-3 text-gray-800">{admin.phone}</td>
                <td className="border-r border-gray-200 px-4 py-3">
                  <span className="inline-block rounded-full bg-farm-secondary/40 px-3 py-1 text-xs font-medium text-farm-text">
                    {getFarmName(admin.farmId)}
                  </span>
                </td>
                <td className="border-r border-gray-200 px-4 py-3">
                  <span className={`inline-block w-20 rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE[admin.status]}`}>
                    {STATUS_LABEL[admin.status]}
                  </span>
                </td>
                <td className="border-r border-gray-200 px-4 py-3 text-gray-800">{formatDateLong(admin.joinedDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: 'edit', admin })}
                      className="text-gray-700 transition-colors hover:text-black"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: 'delete', admin })}
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
                  ไม่พบ Admin ที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal?.mode === 'add' && (
        <ModalShell onClose={closeModal} className="w-112.5">
          <AddAdminForm defaultValues={modal.defaultValues} farms={farms} onSubmit={handleAddSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'edit' && (
        <ModalShell onClose={closeModal} className="w-112.5">
          <EditAdminForm  farms={farms} onSubmit={handleEditSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'delete' && (
        <ModalShell onClose={closeModal} className="flex w-100 flex-col items-center text-center">
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <AlertTriangle className="mb-4 h-16 w-16 stroke-[1.5] text-red-600" />
          <p className="mb-1 font-medium text-gray-800">ยืนยันการลบ Admin "{modal.admin.fullName}"?</p>
          <p className="mb-8 text-sm font-medium text-red-600">ประวัติจะยังอยู่ แต่จะไม่สามารถเข้าสู่ระบบได้อีก</p>
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
            (modal.action === 'add' && 'เพิ่ม Admin สำเร็จ') ||
            (modal.action === 'edit' && 'แก้ไขข้อมูลสำเร็จ') ||
            'ลบ Admin สำเร็จ'
          }
          submessage={modal.action === 'delete' ? `${modal.admin.fullName} ถูกปิดการใช้งานแล้ว` : undefined}
        />
      )}
    </div>
  );
}
