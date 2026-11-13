import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { DateInput } from '../../components/ui/DateInput';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { useWorkerStore } from '../../store/useWorkerStore';
import { workerService } from '../../service/workerService';
import { tError } from '../../i18n/backendMessages';
import { formatDateLong, isAttendanceClosed, todayBangkokISO } from '../../lib/format';
import { STATUS_STYLE, STATUS_LABEL } from '../../config/status';
import { useT } from '../../i18n';
import { AttendanceButtons } from '../../components/attendance/AttendanceButtons';
import { LeaveNoteModal } from '../../components/attendance/LeaveNoteModal';
import { useAttendanceStore } from '../../store/useAttendanceStore';

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
      <div className="mb-4 flex items-center justify-between border-b border-[#E6F0D6] pb-3">
        <h3 className="text-xl font-extrabold tracking-tight text-farm-primary">{t('wk.editTitle')}</h3>
        <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#A8D04A] bg-[#E6F0D6]/50 text-[#4F7A2B] transition hover:border-[#4F7A2B] hover:bg-[#E6F0D6]"
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
          <div className="rounded-2xl bg-[#F4F6F0] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700">{t('wk.changePasswordTitle')}</h4>
              <button type="button" onClick={() => setShowPasswordChange(false)} className="rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
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
                className="flex-1 rounded-xl border border-[#E4E9DA] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#4F7A2B] focus:ring-2 focus:ring-[#A8D04A]/40"
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
      <div className="mb-4 flex items-center justify-between border-b border-[#E6F0D6] pb-3">
        <h3 className="text-xl font-extrabold tracking-tight text-farm-primary">{t('wk.addTitle')}</h3>
        <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#A8D04A] bg-[#E6F0D6]/50 text-[#4F7A2B] transition hover:border-[#4F7A2B] hover:bg-[#E6F0D6]"
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

      <div className="mb-6 mt-3 flex items-start gap-2 rounded-2xl bg-[#FEF3C7]/80 p-3.5 text-xs text-[#92400E]">
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

// Summary tiles above the cards; each one is also a filter (press again to clear).
const ATTENDANCE_TILES = [
  { filter: 'PRESENT', label: 'att.present', count: 'present', dot: 'bg-[#4F7A2B]', text: 'text-[#4F7A2B]' },
  { filter: 'LEAVE', label: 'att.leave', count: 'leave', dot: 'bg-amber-500', text: 'text-amber-600' },
  { filter: 'ABSENT', label: 'att.absent', count: 'absent', dot: 'bg-red-600', text: 'text-red-600' },
  { filter: 'unchecked', label: 'att.unchecked', count: 'unchecked', dot: 'bg-gray-400', text: 'text-gray-700' },
];

export default function Workers() {
  const t = useT();
  const navigate = useNavigate();
  const workers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);
  const addWorker = useWorkerStore((s) => s.addWorker);
  const updateWorker = useWorkerStore((s) => s.updateWorker);
  const setWorkerStatus = useWorkerStore((s) => s.setWorkerStatus);
  const nextUsername = useWorkerStore((s) => s.nextUsername);
  const records = useAttendanceStore((s) => s.records);
  const fetchAttendance = useAttendanceStore((s) => s.fetchForDate);
  const setAttendance = useAttendanceStore((s) => s.setStatus);
  const markAllPresent = useAttendanceStore((s) => s.markAllPresent);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  // Attendance is only recorded for today (business time zone); the page follows midnight by itself.
  const [today, setToday] = useState(todayBangkokISO());
  // the day being checked: today, or a later day (only leave can be registered in advance)
  const [date, setDate] = useState(todayBangkokISO());
  const [closed, setClosed] = useState(isAttendanceClosed());
  const [modal, setModal] = useState(null);
  const [leaveFor, setLeaveFor] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = todayBangkokISO();
      setToday(now);
      // midnight passed: a day that is now in the past can no longer be edited, fall back to today
      setDate((selected) => (selected < now ? now : selected));
      setClosed(isAttendanceClosed());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendance(date);
  }, [date, fetchAttendance]);

  const isFuture = date > today;
  // today is locked after the closing time; a future day is always open (leave only)
  const locked = closed && !isFuture;
  const recordOf = (worker) => records[String(worker.id)];

  const counts = useMemo(() => {
    const result = { present: 0, leave: 0, absent: 0, unchecked: 0 };
    workers.forEach((w) => {
      if (w.status === 'inactive') return;
      const status = records[String(w.id)]?.status;
      if (status === 'PRESENT') result.present += 1;
      else if (status === 'LEAVE') result.leave += 1;
      else if (status === 'ABSENT') result.absent += 1;
      else result.unchecked += 1;
    });
    return result;
  }, [workers, records]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workers.filter((w) => {
      const matchesSearch =
        !term ||
        [w.fullName, w.nickname, w.username, w.phone].some((field) => (field ?? '').toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      const record = records[String(w.id)];
      const matchesAttendance =
        attendanceFilter === 'all' ||
        (attendanceFilter === 'unchecked' ? w.status !== 'inactive' && !record : record?.status === attendanceFilter);
      return matchesSearch && matchesStatus && matchesAttendance;
    });
  }, [workers, records, search, statusFilter, attendanceFilter]);

  function closeModal() {
    setModal(null);
  }

  async function saveAttendance(worker, status, note) {
    try {
      await setAttendance({ workerId: worker.id, date, status, note });
    } catch (error) {
      console.error('Failed to save attendance', error);
      alert(t('att.err.saveFailed') + ': ' + tError(error));
    }
  }

  function changeAttendance(worker, next) {
    if (next === 'LEAVE') {
      setLeaveFor({ worker, note: recordOf(worker)?.note ?? '' });
      return;
    }
    saveAttendance(worker, next, null);
  }

  async function handleAllPresent() {
    try {
      await markAllPresent(date);
    } catch (error) {
      console.error('Failed to mark everyone present', error);
      alert(t('att.err.saveFailed') + ': ' + tError(error));
    }
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

      <div className="mb-4 rounded-[20px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <DateInput
              value={date}
              onChange={(value) => setDate(!value || value < today ? today : value)}
              minDate={new Date(`${today}T00:00:00`)}
              dataTest="attendance-date"
              className="min-w-0 flex-1 sm:w-44 sm:flex-none"
            />
            {date === today ? (
              <span data-test="attendance-today" className="shrink-0 rounded-full bg-farm-primary px-3 py-1 text-xs font-semibold text-white">
                {t('att.todayBadge')}
              </span>
            ) : (
              <button
                type="button"
                data-test="attendance-back-today"
                onClick={() => setDate(today)}
                className="shrink-0 whitespace-nowrap rounded-lg border border-[#E4E9DA] px-3 py-1.5 text-xs font-semibold text-farm-primary hover:bg-[#E6F0D6]/50"
              >
                {t('att.backToToday')}
              </button>
            )}
          </div>
          <div data-test="attendance-summary" className="grid min-w-0 basis-full grid-cols-2 gap-2 sm:grid-cols-4 xl:flex-1 xl:basis-0">
            {ATTENDANCE_TILES.map((tile) => {
              const selected = attendanceFilter === tile.filter;
              const highlight = tile.filter === 'unchecked' && counts.unchecked > 0;
              return (
                <button
                  key={tile.filter}
                  type="button"
                  data-test={`attendance-stat-${tile.filter}`}
                  aria-pressed={selected}
                  onClick={() => setAttendanceFilter(selected ? 'all' : tile.filter)}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:bg-[#E6F0D6]/50 ${
                    selected ? 'border-farm-primary ring-1 ring-farm-primary' : highlight ? 'border-gray-400' : 'border-[#E4E9DA]'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-600">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tile.dot}`} />
                    <span className="truncate">{t(tile.label)}</span>
                  </span>
                  <span data-test={`attendance-count-${tile.filter}`} className={`text-lg font-bold ${tile.text}`}>
                    {counts[tile.count]}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            data-test="attendance-bulk-present"
            className="w-full whitespace-nowrap sm:w-auto"
            disabled={closed || isFuture || counts.unchecked === 0}
            onClick={handleAllPresent}
          >
            {t('att.allPresent')}
          </Button>
        </div>
        {isFuture && <p data-test="attendance-future-hint" className="mt-2 text-xs text-amber-700">{t('att.futureHint')}</p>}
        {locked && <p data-test="attendance-closed" className="mt-2 text-xs text-gray-500">{t('att.closed')}</p>}
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {filtered.map((worker) => {
          const inactive = worker.status === 'inactive';
          const record = recordOf(worker);
          const open = () => navigate(`/workers/${worker.id}`);
          return (
            <div
              key={worker.id}
              data-test="worker-row"
              role="link"
              tabIndex={0}
              onClick={open}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && event.key === 'Enter') open();
              }}
              className={`flex cursor-pointer flex-col rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(46,74,31,0.08)] sm:p-5 ${inactive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Avatar src={worker.avatar} name={worker.fullName} className="h-12 w-12 text-base" />
                <div className="min-w-0 flex-1">
                  <p data-test="worker-row-name" className="truncate font-semibold text-gray-800">{worker.fullName}</p>
                  <p className="truncate text-sm text-gray-500">{worker.nickname} · @{worker.username}</p>
                  <p className="truncate text-sm text-gray-500">{worker.phone}</p>
                </div>
                <div data-test="worker-row-manage" className="flex shrink-0 items-center gap-3 pt-0.5">
                  {!inactive ? (
                    <>
                      <button
                        type="button"
                        data-test="worker-edit"
                        onClick={(event) => {
                          event.stopPropagation();
                          setModal({ mode: 'edit', worker });
                        }}
                        className="text-gray-700 transition-colors hover:text-black"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        data-test="worker-delete"
                        onClick={(event) => {
                          event.stopPropagation();
                          setModal({ mode: 'delete', worker });
                        }}
                        className="text-red-500 transition-colors hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span data-test="worker-row-status" className={`inline-block min-w-20 whitespace-nowrap rounded-full px-4 py-1.5 text-center text-xs font-bold ${STATUS_STYLE[worker.status]}`}>
                  {STATUS_LABEL[worker.status]}
                </span>
              </div>

              {!inactive && (
                <div className="mt-3 border-t border-[#EEF1E6] pt-3">
                  <AttendanceButtons
                    status={record?.status ?? null}
                    onSelect={(next) => changeAttendance(worker, next)}
                    disabled={locked}
                    disabledStatuses={isFuture ? ['PRESENT', 'ABSENT'] : []}
                  />
                  <div className="mt-1.5 min-h-5 text-xs text-gray-500">
                    {!record && <span data-test="attendance-unchecked" className="text-gray-400">{t('att.unchecked')}</span>}
                    {record?.status === 'LEAVE' && record.note && (
                      <span data-test="attendance-note-text">{record.note}</span>
                    )}
                    {record?.autoRecorded && (
                      <span data-test="attendance-auto" className="ml-1 text-gray-400">({t('att.auto')})</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-gray-400">{t('wk.empty')}</p>
        )}
      </div>

      {leaveFor && (
        <LeaveNoteModal
          workerName={leaveFor.worker.fullName}
          initialNote={leaveFor.note}
          onCancel={() => setLeaveFor(null)}
          onConfirm={(note) => {
            const { worker } = leaveFor;
            setLeaveFor(null);
            saveAttendance(worker, 'LEAVE', note);
          }}
        />
      )}

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
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
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
