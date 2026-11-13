import { useMemo, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Edit, Trash2, X, AlertTriangle, MapPin, Sprout, ImagePlus, Info } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/ui/ModalShell';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { LoadingBlock } from '../../components/ui/Loader';
import { TableToolbar, TOOLBAR_FILTER_CLASS } from '../../components/ui/TableToolbar';
import { PageHeader } from '../../layouts/admin/PageHeader';
import { CURRENT_SUPER_ADMIN } from '../../config/currentUser';
import { useFarmStore } from '../../store/useFarmStore';
import { useAdminStore } from '../../store/useAdminStore';
import { useWorkLogStore } from '../../store/useWorkLogStore';
import { useWorkerStore } from '../../store/useWorkerStore';
import { getLocale } from '../../i18n';
import { useT } from '../../i18n';

function formatNumber(n) {
  return Number(n).toLocaleString(getLocale(), { maximumFractionDigits: 0 });
}

const makeFarmSchema = (t) => z.object({
  name: z.string().min(1, t('farm.err.name')),
  location: z.string().min(1, t('farm.err.location')),
});

function FarmForm({ title, defaultValues, onSubmit, onCancel }) {
  const t = useT();
  const [imagePreview, setImagePreview] = useState(defaultValues.image ?? null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeFarmSchema(t)), defaultValues });

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, image: imagePreview ?? undefined }))}>
      <div className="mb-4 flex items-center justify-between border-b border-[#E6F0D6] pb-3">
        <h3 className="text-xl font-extrabold tracking-tight text-farm-primary">{title}</h3>
        <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-[#8A8F85] transition hover:bg-[#E6F0D6]/70 hover:text-[#2E4A1F]">
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
        <Input data-test="farm-form-name" label={t('farm.name')} {...register('name')} error={errors.name?.message} />
        <Input data-test="farm-form-location" label={t('farm.location')} {...register('location')} error={errors.location?.message} />
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-2xl bg-[#FEF3C7]/80 p-3.5 text-xs text-[#92400E]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t('farm.note')}</p>
      </div>

      <div className="flex w-full gap-4">
        <Button type="button" data-test="farm-form-cancel" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" data-test="farm-form-submit" className="flex-1" loading={isSubmitting}>
          {t('common.confirm')}
        </Button>
      </div>
    </form>
  );
}

export default function AllFarms() {
  const t = useT();
  const farms = useFarmStore((s) => s.farms);
  const addFarm = useFarmStore((s) => s.addFarm);
  const updateFarm = useFarmStore((s) => s.updateFarm);
  const setFarmStatus = useFarmStore((s) => s.setFarmStatus);
  const fetchFarms = useFarmStore((s) => s.fetchFarms);
  const farmsLoaded = useFarmStore((s) => s.loaded);
  const allAdmins = useAdminStore((s) => s.admins);
  const fetchAdmins = useAdminStore((s) => s.fetchAdmins);
  const allEntries = useWorkLogStore((s) => s.entries);
  const fetchEntries = useWorkLogStore((s) => s.fetchEntries);
  const allWorkers = useWorkerStore((s) => s.workers);
  const fetchWorkers = useWorkerStore((s) => s.fetchWorkers);

  useEffect(() => {
    fetchFarms();
    fetchAdmins();
    fetchEntries();
    fetchWorkers();
  }, [fetchFarms, fetchAdmins, fetchEntries, fetchWorkers]);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const visibleFarms = useMemo(() => farms.filter((f) => f.status !== 'inactive'), [farms]);
  const admins = useMemo(() => allAdmins.filter((a) => a.status !== 'inactive'), [allAdmins]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();
    return visibleFarms
      .filter((f) => !term || [f.name, f.location].some((field) => field.toLowerCase().includes(term)))
      .map(farm => {
        // Calculate monthly wages dynamically
        const farmWages = allEntries.filter(entry => {
          const worker = allWorkers.find(w => String(w.id) === String(entry.workerId));
          if (!worker || String(worker.farmId) !== String(farm.id)) return false;
          const d = new Date(entry.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }).reduce((sum, entry) => sum + entry.total, 0);
        return { ...farm, monthlyWages: farmWages };
      });
  }, [visibleFarms, search, allEntries, allWorkers]);

  const totalWorkers = useMemo(() => visibleFarms.reduce((sum, f) => sum + f.workerCount, 0), [visibleFarms]);

  function closeModal() {
    setModal(null);
  }

  async function handleAddSubmit(data) {
    try {
      const { default: api } = await import('../../service/api');
      const res = await api.post('/farms', data);
      addFarm(res.data);
      setModal({ mode: 'success', action: 'add' });
    } catch (error) {
      console.error(error);
      alert(t('farm.err.addFailed'));
    }
  }

  async function handleEditSubmit(data) {
    try {
      const { default: api } = await import('../../service/api');
      const res = await api.put(`/farms/${modal.farm.id}`, data);
      updateFarm(modal.farm.id, res.data);
      setModal({ mode: 'success', action: 'edit' });
    } catch (error) {
      console.error(error);
      alert(t('farm.err.updateFailed'));
    }
  }

  async function handleConfirmDelete() {
    try {
      const { default: api } = await import('../../service/api');
      await api.delete(`/farms/${modal.farm.id}`);
      setFarmStatus(modal.farm.id, 'inactive');
      setModal({ mode: 'success', action: 'delete', farm: modal.farm });
    } catch (error) {
      console.error(error);
      alert(t('farm.err.deleteFailed'));
    }
  }

  return (
    <div>
      <PageHeader title={t('nav.farms')} />

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-col justify-center rounded-[20px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 truncate text-xs font-medium text-gray-600 sm:text-base">{t('nav.farms')}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className="text-2xl font-bold text-gray-700 sm:text-3xl">{visibleFarms.length}</h3>
            <span className="text-xs font-medium text-gray-400 sm:text-base">{t('farm.unit')}</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center rounded-[20px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 truncate text-xs font-medium text-gray-600 sm:text-base">{t('farm.allAdmins')}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className="text-2xl font-bold text-gray-700 sm:text-3xl">{admins.length}</h3>
            <span className="text-xs font-medium text-gray-400 sm:text-base">{t('common.people')}</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center rounded-[20px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-1 truncate text-xs font-medium text-gray-600 sm:text-base">{t('farm.allWorkers')}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className="text-2xl font-bold text-gray-700 sm:text-3xl">{totalWorkers}</h3>
            <span className="text-xs font-medium text-gray-400 sm:text-base">{t('common.people')}</span>
          </div>
        </div>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('farm.search')}
        searchTestId="farm-search"
        action={
          <Button
            variant="accent"
            data-test="farm-add-btn"
            className="flex items-center gap-1.5 whitespace-nowrap px-3 sm:gap-2 sm:px-6"
            onClick={() => setModal({ mode: 'add', defaultValues: { name: '', location: '' } })}
          >
            <UserPlus className="h-5 w-5" />
            <span>{t('farm.addBtn')}</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {filtered.map((farm) => (
          <div key={farm.id} data-test="farm-card" className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-linear-to-br from-farm-primary to-[#1F3C28]">
              {farm.image ? (
                <img src={farm.image} alt={farm.name} className="h-full w-full object-cover" />
              ) : (
                <Sprout className="h-16 w-16 text-white/30" />
              )}
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  data-test="farm-edit"
                  onClick={() => setModal({ mode: 'edit', farm })}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  data-test="farm-delete"
                  onClick={() => setModal({ mode: 'delete', farm })}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h3 data-test="farm-name" className="text-lg font-bold text-gray-900">{farm.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> {farm.location}
              </p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 border-t border-[#EEF1E6] pt-4">
                <div>
                  <p className="text-xs text-gray-500">{t('farm.cardWorkers')}</p>
                  <p className="text-lg font-bold text-gray-800">{farm.workerCount}</p>
                </div>
                <div className="pl-3">
                  <p className="text-xs text-gray-500">{t('farm.cardAdmins')}</p>
                  <p className="text-lg font-bold text-gray-800">{farm.adminCount}</p>
                </div>
                <div className="pl-3">
                  <p className="text-xs text-gray-500">{t('farm.monthlyWages')}</p>
                  <p className="text-lg font-bold text-gray-800">{formatNumber(farm.monthlyWages)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!farmsLoaded && <LoadingBlock className="col-span-full py-16" />}
        {farmsLoaded && filtered.length === 0 && <p className="col-span-full py-8 text-center text-gray-400">{t('farm.empty')}</p>}
      </div>

      {modal?.mode === 'add' && (
        <ModalShell onClose={closeModal} className="sm:w-112.5">
          <FarmForm title={t('farm.addTitle')} defaultValues={modal.defaultValues} onSubmit={handleAddSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'edit' && (
        <ModalShell onClose={closeModal} className="sm:w-112.5">
          <FarmForm title={t('farm.editTitle')} defaultValues={modal.farm} onSubmit={handleEditSubmit} onCancel={closeModal} />
        </ModalShell>
      )}

      {modal?.mode === 'delete' && (
        <ModalShell onClose={closeModal} className="flex flex-col items-center text-center sm:w-100">
          <button type="button" onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <AlertTriangle className="mb-4 h-16 w-16 stroke-[1.5] text-red-600" />
          <p className="mb-1 font-medium text-gray-800">{t('farm.deleteConfirm', { name: modal.farm.name })}</p>
          <p className="mb-8 text-sm font-medium text-red-600">{t('farm.deleteNote')}</p>
          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" data-test="farm-delete-confirm" className="flex-1" onClick={handleConfirmDelete}>
              {t('common.confirm')}
            </Button>
          </div>
        </ModalShell>
      )}

      {modal?.mode === 'success' && (
        <SuccessModal
          onClose={closeModal}
          message={
            (modal.action === 'add' && t('farm.addedOk')) ||
            (modal.action === 'edit' && t('common.editedOk')) ||
            t('farm.deletedOk')
          }
          submessage={modal.action === 'delete' ? t('farm.removed', { name: modal.farm.name }) : undefined}
        />
      )}
    </div>
  );
}
