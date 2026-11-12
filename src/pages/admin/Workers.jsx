import { useMemo, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { useWorkerStore } from '../../store/useWorkerStore';
import { workerService } from '../../service/workerService';
import { tError } from '../../i18n/backendMessages';
import { formatDateLong } from '../../lib/format';
import { STATUS_STYLE, STATUS_LABEL } from '../../config/status';
import { useT } from '../../i18n';

const makeWorkerSchema = (t) => z.object({
  fullName: z.string().min(1, t('form.err.fullName')).regex(/^[^0-9]*$/, t('form.err.fullNameDigits')),
  nickname: z.string().min(1, t('form.err.nickname')).regex(/^[^0-9]*$/, t('form.err.nicknameDigits')),
  username: z.string().min(3, t('form.err.min3')),
  phone: z.string().regex(/^[0-9]{10}$/, t('form.err.phone')),
});

const makeAddWorkerSchema = (t) => makeWorkerSchema(t).extend({
  tempPassword: z.string().min(6, t('form.err.min6')),
});

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function EditWorkerForm({ worker, onSubmit, onCancel, onResetPasswordSuccess }) {
  const t = useT();
  const [avatarPreview, setAvatarPreview] = useState(worker?.avatar || null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(makeWorkerSchema(t)), defaultValues: worker });

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      alert(t('setpw.err.minLength'));
      return;
    }
    setIsChangingPassword(true);
    try {
      await workerService.resetWorkerPassword(worker.id, newPassword);
      setShowPasswordChange(false);
      setNewPassword('');
      if (onResetPasswordSuccess) {
        onResetPasswordSuccess();
      }
    } catch (err) {
      console.error("Failed to reset password", err);
      alert(t('wk.err.resetFailed') + ': ' + tError(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, avatar: avatarPreview ?? undefined }))}>
      <div className="mb-4 flex items-center justify-between border-b border-farm-primary pb-2">
        <h3 className="text-lg font-bold text-farm-primary">{t('wk.editTitle')}</h3>
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input data-test="worker-form-fullname" label={t('form.fullName')} {...register('fullName')} error={errors.fullName?.message} />
        <Input data-test="worker-form-nickname" label={t('form.nickname')} {...register('nickname')} error={errors.nickname?.message} />
        <Input data-test="worker-form-username" label={t('form.username')} {...register('username')} error={errors.username?.message} />
        <Input data-test="worker-form-phone" label={t('form.phone')} {...register('phone')} error={errors.phone?.message} />
      </div>

      <div className="mb-8">
        {!showPasswordChange ? (
          <div className="flex justify-end">
            <button type="button" data-test="worker-resetpw-toggle" onClick={() => setShowPasswordChange(true)} className="text-sm font-medium text-farm-primary hover:underline">
              {t('wk.changePassword')}
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700">{t('wk.changePasswordTitle')}</h4>
              <button type="button" onClick={() => setShowPasswordChange(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                data-test="worker-resetpw-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('wk.newPasswordPlaceholder')}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-farm-primary focus:outline-none focus:ring-1 focus:ring-farm-primary"
              />
              <Button type="button" data-test="worker-resetpw-save" variant="primary" onClick={handleResetPassword} disabled={isChangingPassword}>
                {isChangingPassword ? t('common.changing') : t('common.savePassword')}
              </Button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setNewPassword(randomPassword())}
                className="flex items-center gap-1 text-xs font-medium text-farm-primary hover:underline"
              >
                <Shuffle size={12} /> {t('form.randomPasswordShort')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full gap-4">
        <Button type="button" data-test="worker-form-cancel" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" data-test="worker-form-submit" className="flex-1">
          {t('common.confirm')}
        </Button>
      </div>
    </form>
  );
}

function AddWorkerForm({ defaultValues, onSubmit, onCancel }) {
  const t = useT();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(makeAddWorkerSchema(t)), defaultValues });

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
        <h3 className="text-lg font-bold text-farm-primary">{t('wk.addTitle')}</h3>
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

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input data-test="worker-form-fullname" label={t('form.fullName')} {...register('fullName')} error={errors.fullName?.message} />
        <Input data-test="worker-form-nickname" label={t('form.nickname')} {...register('nickname')} error={errors.nickname?.message} />
        <Input data-test="worker-form-username" label={t('form.username')} {...register('username')} error={errors.username?.message} />
        <Input data-test="worker-form-phone" label={t('form.phone')} {...register('phone')} error={errors.phone?.message} />
      </div>

      <div className="mb-2">
        <Input data-test="worker-form-temppw" label={t('form.tempPassword')} {...register('tempPassword')} error={errors.tempPassword?.message} />
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
        <p>{t('wk.tempPwNote')}</p>
      </div>

      <div className="flex w-full gap-4">
        <Button type="button" data-test="worker-form-cancel" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" data-test="worker-form-submit" className="flex-1">
          {t('common.confirm')}
        </Button>
      </div>
    </form>
  );
}

export default function Workers() {
  const t = useT();
  const workers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const addWorker = useWorkerStore((s) => s.addWorker);
  const updateWorker = useWorkerStore((s) => s.updateWorker);
  const setWorkerStatus = useWorkerStore((s) => s.setWorkerStatus);
  const nextUsername = useWorkerStore((s) => s.nextUsername);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

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

  async function handleAddSubmit(data) {
    try {
      const response = await workerService.addWorker(data);
      addWorker(response);
      setModal({ mode: 'success', action: 'add' });
    } catch (error) {
      console.error("Failed to add worker", error);
      alert(t('wk.err.addFailed') + ': ' + tError(error));
    }
  }

  async function handleEditSubmit(data) {
    try {
      const response = await workerService.updateWorker(modal.worker.id, data);
      updateWorker(modal.worker.id, response);
      setModal({ mode: 'success', action: 'edit' });
    } catch (error) {
      console.error(error);
      alert(t('wk.err.updateFailed'));
    }
  }

  async function handleConfirmDelete() {
    try {
      await workerService.deleteWorker(modal.worker.id);
      setWorkerStatus(modal.worker.id, 'inactive');
      setModal({ mode: 'success', action: 'delete', worker: modal.worker });
    } catch (error) {
      console.error(error);
      alert(t('wk.err.deleteFailed'));
    }
  }

  return (
    <div>
      <PageHeader title={t('wk.pageTitle')} />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('wk.search')}
        searchTestId="worker-search"
        action={
          <Button
            variant="accent"
            data-test="worker-add-btn"
            className="flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto sm:shrink-0"
            onClick={() =>
              setModal({
                mode: 'add',
                defaultValues: { fullName: '', nickname: '', username: nextUsername(), phone: '', tempPassword: randomPassword() },
              })
            }
          >
            <UserPlus className="h-5 w-5" />
            <span>{t('wk.addBtn')}</span>
          </Button>
        }
      >
        <Dropdown
          value={workerFilter}
          onChange={setWorkerFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="worker-name-filter"
          options={[{ value: 'all', label: t('common.allWorkers') }, ...workers.map((w) => ({ value: w.id, label: w.fullName }))]}
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          className={TOOLBAR_FILTER_CLASS}
          dataTest="worker-status-filter"
          options={[
            { value: 'all', label: t('common.allStatuses') },
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </TableToolbar>

      <div tabIndex={0} role="region" aria-label={t('wk.tableLabel')} className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-center text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#3F5C2B] text-white">
            <tr>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 pl-4 sm:pl-6 text-left font-medium">{t('col.name')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.nickname')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.username')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.phone')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.status')}</th>
              <th className="px-3 py-3 font-medium sm:px-4 sm:py-3.5">{t('col.startDate')}</th>
              <th className="px-3 py-3 sm:px-4 sm:py-3.5 pr-4 sm:pr-6 font-medium">{t('col.manage')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((worker) => (
              <tr key={worker.id} data-test="worker-row" className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50">
                <td className="px-3 py-3 pl-4 text-left sm:px-4 sm:py-4 sm:pl-6">
                  <div className="flex items-center justify-start gap-3">
                    <Avatar src={worker.avatar} name={worker.fullName} />
                    <span data-test="worker-row-name" className="font-semibold text-gray-800">{worker.fullName}</span>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 font-medium text-gray-800">{worker.nickname}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-800">@{worker.username}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-800">{worker.phone}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-4">
                  <span data-test="worker-row-status" className={`inline-block w-20 rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_STYLE[worker.status]}`}>
                    {STATUS_LABEL[worker.status]}
                  </span>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-800">{formatDateLong(worker.joinedDate)}</td>
                <td className="py-3 sm:py-4 px-3 pr-4 sm:px-4 sm:pr-6 text-center" data-test="worker-row-manage">
                  {worker.status !== 'inactive' ? (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        data-test="worker-edit"
                        onClick={() => setModal({ mode: 'edit', worker })}
                        className="text-gray-700 transition-colors hover:text-black"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        data-test="worker-delete"
                        onClick={() => setModal({ mode: 'delete', worker })}
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
                  {t('wk.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal?.mode === 'add' && (
        <ModalShell onClose={closeModal} className="w-full sm:w-112.5">
          <AddWorkerForm defaultValues={modal.defaultValues} onSubmit={handleAddSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'edit' && (
        <ModalShell onClose={closeModal} className="w-full sm:w-112.5">
          <EditWorkerForm
            worker={modal.worker}
            onSubmit={handleEditSubmit}
            onCancel={closeModal}
            onResetPasswordSuccess={() => {
              setModal({ mode: 'success', action: 'reset-password' });
            }}
          />
        </ModalShell>
      )}

      {modal?.mode === 'delete' && (
        <ModalShell onClose={closeModal} className="flex w-full flex-col items-center text-center sm:w-100">
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <AlertTriangle className="mb-4 h-16 w-16 stroke-[1.5] text-red-600" />
          <p className="mb-1 font-medium text-gray-800">{t('wk.deleteConfirm', { name: modal.worker.fullName })}</p>
          <p className="mb-8 text-sm font-medium text-red-600">{t('wk.deleteNote')}</p>
          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" data-test="worker-delete-confirm" className="flex-1" onClick={handleConfirmDelete}>
              {t('common.confirm')}
            </Button>
          </div>
        </ModalShell>
      )}

      {modal?.mode === 'success' && (
        <SuccessModal
          onClose={closeModal}
          message={
            (modal.action === 'add' && t('wk.addedOk')) ||
            (modal.action === 'edit' && t('common.editedOk')) ||
            (modal.action === 'reset-password' && t('common.passwordChangedOk')) ||
            t('wk.deletedOk')
          }
          submessage={modal.action === 'delete' ? t('wk.deactivated', { name: modal.worker.fullName }) : undefined}
        />
      )}
    </div>
  );
}
