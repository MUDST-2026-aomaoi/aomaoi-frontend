import { z } from 'zod';
import { Scissors, Sprout, Droplets, SprayCan } from 'lucide-react';
import { t } from '../i18n';

export function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const notFuture = (value) => !value || value <= todayISO();

export const WORK_LOG_TYPES = {
  cutting: {
    key: 'cutting',
    path: 'cutting',
    get labelTh() { return t('wl.cutting.label'); },
    icon: Scissors,
    get formulaLabel() { return t('wl.cutting.formula'); },
    chartColor: '#B4D355',
    badgeClass: 'bg-[#dcfce7] text-[#166534]',
    get primaryUnit() { return t('wl.unit.wa'); },
    primaryQty: (v) => v.rows * v.waPerRow,
    get fields() { return [
      { name: 'date', label: t('wl.field.workDate'), type: 'date', defaultValue: '' },
      { name: 'rows', label: t('wl.field.rows'), suffix: t('wl.suffix.rows'), defaultValue: 1 },
      { name: 'waPerRow', label: t('wl.field.waPerRow'), suffix: t('wl.unit.wa'), defaultValue: 100 },
    ]; },
    get schema() { return z.object({
      date: z.string().min(1, t('wl.err.dateRequired')).refine(notFuture, t('wl.err.futureDate')),
      workerId: z.string().min(1, t('wl.err.workerRequired')),
      rows: z.coerce.number().positive(t('wl.err.positive')),
      waPerRow: z.coerce.number().positive(t('wl.err.positive')),
    }); },
    calcTotal: (v) => v.rows * v.waPerRow * 2,
    summaryText: (v) => t('wl.cutting.summary', { rows: v.rows, waPerRow: v.waPerRow }),
  },
  planting: {
    key: 'planting',
    path: 'planting',
    get labelTh() { return t('wl.planting.label'); },
    icon: Sprout,
    get formulaLabel() { return t('wl.planting.formula'); },
    chartColor: '#1F3C28',
    badgeClass: 'bg-[#e5e7eb] text-[#374151]',
    get primaryUnit() { return t('wl.unit.wa'); },
    primaryQty: (v) => v.furrows * v.waPerFurrow,
    get fields() { return [
      { name: 'date', label: t('wl.field.workDate'), type: 'date', defaultValue: '' },
      { name: 'furrows', label: t('wl.field.furrows'), suffix: t('wl.suffix.furrows'), defaultValue: 1 },
      { name: 'waPerFurrow', label: t('wl.field.waPerFurrow'), suffix: t('wl.unit.wa'), defaultValue: 20 },
    ]; },
    get schema() { return z.object({
      date: z.string().min(1, t('wl.err.dateRequired')).refine(notFuture, t('wl.err.futureDate')),
      workerId: z.string().min(1, t('wl.err.workerRequired')),
      furrows: z.coerce.number().positive(t('wl.err.positive')),
      waPerFurrow: z.coerce.number().positive(t('wl.err.positive')),
    }); },
    calcTotal: (v) => v.furrows * v.waPerFurrow * 2.5,
    summaryText: (v) => t('wl.planting.summary', { furrows: v.furrows, waPerFurrow: v.waPerFurrow }),
  },
  watering: {
    key: 'watering',
    path: 'watering',
    get labelTh() { return t('wl.watering.label'); },
    icon: Droplets,
    get formulaLabel() { return t('wl.watering.formula'); },
    chartColor: '#568A3B',
    badgeClass: 'bg-[#fef08a] text-[#854d0e]',
    get primaryUnit() { return t('wl.unit.day'); },
    primaryQty: (v) => {
      if (v.startDate && v.endDate) {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
      return 0;
    },
    get fields() { return [
      { name: 'startDate', label: t('wl.field.startDate'), suffix: '', type: 'date', defaultValue: '' },
      { name: 'endDate', label: t('wl.field.endDate'), suffix: '', type: 'date', defaultValue: '' },
      { name: 'dailyRate', label: t('wl.field.dailyRate'), suffix: t('wl.suffix.baht'), defaultValue: 350 },
    ]; },
    get schema() { return z.object({
      workerId: z.string().min(1, t('wl.err.workerRequired')),
      startDate: z.string().min(1, t('wl.err.startRequired')).refine(notFuture, t('wl.err.futureDate')),
      endDate: z.string().min(1, t('wl.err.endRequired')).refine(notFuture, t('wl.err.futureDate')),
      dailyRate: z.coerce.number().positive(t('wl.err.positive')),
    }).refine((data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }, { message: t('wl.err.endBeforeStart'), path: ['endDate'] }); },
    calcTotal: (v) => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return (days > 0 ? days : 0) * v.dailyRate;
    },
    summaryText: (v) => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return t('wl.watering.summary', { days: days > 0 ? days : 0, dailyRate: v.dailyRate });
    },
  },
  spraying: {
    key: 'spraying',
    path: 'spraying',
    get labelTh() { return t('wl.spraying.label'); },
    icon: SprayCan,
    get formulaLabel() { return t('wl.spraying.formula'); },
    chartColor: '#6A9E48',
    badgeClass: 'bg-[#fef08a] text-[#854d0e]',
    get primaryUnit() { return t('wl.unit.tank'); },
    primaryQty: (v) => v.tanks,
    get fields() { return [
      { name: 'date', label: t('wl.field.workDate'), type: 'date', defaultValue: '' },
      { name: 'tanks', label: t('wl.field.tanks'), suffix: t('wl.suffix.tanks'), defaultValue: 1 },
    ]; },
    get schema() { return z.object({
      date: z.string().min(1, t('wl.err.dateRequired')).refine(notFuture, t('wl.err.futureDate')),
      workerId: z.string().min(1, t('wl.err.workerRequired')),
      tanks: z.coerce.number().positive(t('wl.err.positive')),
    }); },
    calcTotal: (v) => v.tanks * 150,
    summaryText: (v) => t('wl.spraying.summary', { tanks: v.tanks }),
  },
};

export const WORK_LOG_ORDER = ['cutting', 'planting', 'watering', 'spraying'];
