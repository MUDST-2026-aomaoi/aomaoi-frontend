import { useMemo, useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Edit, Trash2, X, AlertTriangle, ImagePlus, Info, Shuffle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Avatar } from '../../components/ui/Avatar';
import { Dropdown } from '../../components/ui/Dropdown';
import { TableToolbar, TOOLBAR_FILTER_CLASS } from '../../components/ui/TableToolbar';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { CURRENT_SUPER_ADMIN } from '../../config/currentUser';
import { useAdminStore } from '../../store/useAdminStore';
import { useFarmStore } from '../../store/useFarmStore';
import { adminService } from '../../service/adminService';
import { tError } from '../../i18n/backendMessages';
import { formatDateLong } from '../../lib/format';
import { STATUS_STYLE, STATUS_LABEL } from '../../config/status';
import { useT } from '../../i18n';

const makeAdminSchema = (t) => z.object({
  fullName: z.string().min(1, t('form.err.fullName')).regex(/^[^0-9]*$/, t('form.err.fullNameDigits')),
  username: z.string().min(3, t('form.err.min3')),
  phone: z.string().regex(/^[0-9]{10}$/, t('form.err.phone')),
  farmId: z.string().min(1, t('adm.err.farm')),
});

const makeAddAdminSchema = (t) => makeAdminSchema(t).extend({
  tempPassword: z.string().min(6, t('form.err.min6')),
});

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function EditAdminForm({ admin, farms, onSubmit, onCancel }) {
  const t = useT();
  const [avatarPreview, setAvatarPreview] = useState(admin?.avatar || null);
  const fileInputRef = useRef(null);
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(makeAdminSchema(t)),
    defaultValues: { ...admin, farmId: admin?.farmId == null ? '' : String(admin.farmId) },
  });

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
        <h3 className="text-lg font-bold text-farm-primary">{t('adm.editTitle')}</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-farm-primary"
        >
          {avatarPreview ? (
            <>
              <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <ImagePlus className="h-6 w-6 text-white" />
              </div>
            </>
          ) : (
            <ImagePlus className="h-8 w-8 group-hover:text-farm-primary" />
          )}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Input data-test="admin-form-fullname" label={t('form.fullName')} {...register('fullName')} error={errors.fullName?.message} />
        <Input data-test="admin-form-username" label={t('form.username')} {...register('username')} error={errors.username?.message} />
        <Input data-test="admin-form-phone" label={t('form.phone')} {...register('phone')} error={errors.phone?.message} />
        <Controller
          control={control}
          name="farmId"
          render={({ field }) => (
            <Dropdown
              label={t('adm.farm')}
              dataTest="admin-form-farm"
              value={field.value}
              onChange={field.onChange}
              error={errors.farmId?.message}
              options={farms.map((f) => ({ value: String(f.id), label: f.name }))}
            />
          )}
        />
      </div>

      <div className="flex w-full gap-4">
        <Button type="button" data-test="admin-form-cancel" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" data-test="admin-form-submit" className="flex-1">
          {t('common.confirm')}
        </Button>
      </div>
    </form>
  );
}

function AddAdminForm({ defaultValues, farms, onSubmit, onCancel }) {
  const t = useT();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(makeAddAdminSchema(t)), defaultValues });

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
        <h3 className="text-lg font-bold text-farm-primary">{t('adm.addTitle')}</h3>
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
        <Input data-test="admin-form-fullname" label={t('form.fullName')} {...register('fullName')} error={errors.fullName?.message} />
        <Input data-test="admin-form-username" label={t('form.username')} {...register('username')} error={errors.username?.message} />
        <Input data-test="admin-form-phone" label={t('form.phone')} {...register('phone')} error={errors.phone?.message} />
        <Controller
          control={control}
          name="farmId"
          render={({ field }) => (
            <Dropdown
              label={t('adm.farm')}
              dataTest="admin-form-farm"
              value={field.value}
              onChange={field.onChange}
              error={errors.farmId?.message}
              options={[
                { value: '', label: t('adm.pickFarm') },
                ...farms.map((f) => ({ value: String(f.id), label: f.name })),
              ]}
            />
          )}
        />
      </div>

      <div className="mb-2">
        <Input data-test="admin-form-temppw" label={t('form.tempPassword')} {...register('tempPassword')} error={errors.tempPassword?.message} />
        <button
          type="button"
          onClick={() => setValue('tempPassword', randomPassword(), { shouldValidate: true })}
          className="mt-1 flex items-center gap-1 text-xs font-medium text-farm-primary hover:underline"
        >
          <Shuffle size={12} /> {t('form.randomPassword')}
        </button>
      </div>

      <div className="mb-6 mt-3 flex items-start gap-2 rounded-md bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t('adm.tempPwNote')}</p>
      </div>

      <div className="flex w-full gap-4">
        <Button type="button" data-test="admin-form-cancel" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" data-test="admin-form-submit" className="flex-1">
          {t('common.confirm')}
        </Button>
      </div>
    </form>
  );
}

export default function AdminsManagement() {
  const t = useT();
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
      const matchesFarm = farmFilter === 'all' || String(a.farmId) === farmFilter;
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
      alert(t('adm.err.addFailed') + ': ' + tError(error));
    }
  }

  async function handleEditSubmit(data) {
    try {
      const response = await adminService.updateAdmin(modal.admin.id, data);
      updateAdmin(modal.admin.id, response);
      setModal({ mode: 'success', action: 'edit' });
    } catch (error) {
      console.error(error);
      alert(t('adm.err.updateFailed'));
    }
  }

  async function handleConfirmDelete() {
    try {
      await adminService.deleteAdmin(modal.admin.id);
      setAdminStatus(modal.admin.id, 'inactive');
      setModal({ mode: 'success', action: 'delete', admin: modal.admin });
    } catch (error) {
      console.error(error);
      alert(t('adm.err.deleteFailed'));
    }
  }

  return (
    <div>
      <PageHeader title={t('adm.pageTitle')} />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('wk.search')}
        searchTestId="admin-search"
        action={
          <Button
            variant="accent"
            data-test="admin-add-btn"
            className="flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto sm:shrink-0"
            onClick={() =>
              setModal({
                mode: 'add',
                defaultValues: { fullName: '', username: nextUsername(), phone: '', farmId: '', tempPassword: randomPassword() },
              })
            }
          >
            <UserPlus className="h-5 w-5" />
            <span>{t('adm.addBtn')}</span>
          </Button>
        }
      >
        <Dropdown
          value={farmFilter}
          onChange={setFarmFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="admin-farm-filter"
          options={[{ value: 'all', label: t('adm.allFarms') }, ...farms.map((f) => ({ value: String(f.id), label: f.name }))]}
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="admin-status-filter"
          options={[
            { value: 'all', label: t('common.allStatuses') },
            { value: 'active', label: t('status.active') },
            { value: 'pending', label: t('status.pending') },
            { value: 'inactive', label: t('status.inactive') },
          ]}
        />
      </TableToolbar>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-center text-xs sm:text-sm">
          <thead className="bg-[#3F5C2B] text-white">
            <tr>
              <th className="px-4 py-3.5 font-medium">{t('col.name')}</th>
              <th className="px-4 py-3.5 font-medium">{t('col.username')}</th>
              <th className="px-4 py-3.5 font-medium">{t('col.phone')}</th>
              <th className="px-4 py-3.5 font-medium">{t('col.farm')}</th>
              <th className="px-4 py-3.5 font-medium">{t('col.status')}</th>
              <th className="px-4 py-3.5 font-medium">{t('col.startDate')}</th>
              <th className="px-4 py-3.5 font-medium">{t('col.manage')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((admin) => (
              <tr key={admin.id} data-test="admin-row" className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 sm:py-4 text-left">
                  <div className="flex items-center justify-start gap-3 pl-2">
                    <Avatar src={admin.avatar} name={admin.fullName} />
                    <span data-test="admin-row-name" className="font-semibold text-gray-800">{admin.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 sm:py-4 text-gray-800">{admin.username}</td>
                <td className="px-4 py-3 sm:py-4 text-gray-800">{admin.phone}</td>
                <td className="px-4 py-3 sm:py-4">
                  <span className="inline-block rounded-full bg-farm-secondary/40 px-3 py-1 text-xs font-medium text-farm-text">
                    {getFarmName(admin.farmId)}
                  </span>
                </td>
                <td className="px-4 py-3 sm:py-4">
                  <span data-test="admin-row-status" className={`inline-block w-20 rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE[admin.status]}`}>
                    {STATUS_LABEL[admin.status]}
                  </span>
                </td>
                <td className="px-4 py-3 sm:py-4 text-gray-800">{formatDateLong(admin.joinedDate)}</td>
                <td className="px-4 py-3 sm:py-4" data-test="admin-row-manage">
                  {admin.status !== 'inactive' ? (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        data-test="admin-edit"
                        onClick={() => setModal({ mode: 'edit', admin })}
                        className="text-gray-700 transition-colors hover:text-black"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        data-test="admin-delete"
                        onClick={() => setModal({ mode: 'delete', admin })}
                        className="text-red-500 transition-colors hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-gray-400">
                  {t('adm.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal?.mode === 'add' && (
        <ModalShell onClose={closeModal} className="sm:w-112.5">
          <AddAdminForm defaultValues={modal.defaultValues} farms={farms} onSubmit={handleAddSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'edit' && (
        <ModalShell onClose={closeModal} className="sm:w-112.5">
          <EditAdminForm admin={modal.admin} farms={farms} onSubmit={handleEditSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'delete' && (
        <ModalShell onClose={closeModal} className="flex flex-col items-center text-center sm:w-100">
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <AlertTriangle className="mb-4 h-16 w-16 stroke-[1.5] text-red-600" />
          <p className="mb-1 font-medium text-gray-800">{t('adm.deleteConfirm', { name: modal.admin.fullName })}</p>
          <p className="mb-8 text-sm font-medium text-red-600">{t('adm.deleteNote')}</p>
          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" data-test="admin-delete-confirm" className="flex-1" onClick={handleConfirmDelete}>
              {t('common.confirm')}
            </Button>
          </div>
        </ModalShell>
      )}

      {modal?.mode === 'success' && (
        <SuccessModal
          onClose={closeModal}
          message={
            (modal.action === 'add' && t('adm.addedOk')) ||
            (modal.action === 'edit' && t('common.editedOk')) ||
            t('adm.deletedOk')
          }
          submessage={modal.action === 'delete' ? t('wk.deactivated', { name: modal.admin.fullName }) : undefined}
        />
      )}
    </div>
  );
}
