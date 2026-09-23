import { z } from 'zod';
import { Scissors, Sprout, Droplets, SprayCan } from 'lucide-react';

export const WORK_LOG_TYPES = {
  cutting: {
    key: 'cutting',
    path: 'cutting',
    labelTh: 'ตัดอ้อย',
    icon: Scissors,
    formulaLabel: 'แถว × 100 วา/แถว × 2 บาท',
    chartColor: '#B4D355',
    badgeClass: 'bg-[#dcfce7] text-[#166534]',
    primaryUnit: 'วา',
    primaryQty: (v) => v.rows * v.waPerRow,
    fields: [
      { name: 'rows', label: 'จำนวนแถว', suffix: 'แถว', defaultValue: 1 },
      { name: 'waPerRow', label: 'วา/แถว (มาตรฐาน)', suffix: 'วา', defaultValue: 100 },
    ],
    schema: z.object({
      date: z.string().min(1, 'กรุณาเลือกวันที่'),
      workerId: z.string().min(1, 'กรุณาเลือกคนงาน'),
      rows: z.coerce.number().positive('ต้องมากกว่า 0'),
      waPerRow: z.coerce.number().positive('ต้องมากกว่า 0'),
    }),
    calcTotal: (v) => v.rows * v.waPerRow * 2,
    summaryText: (v) => `${v.rows} แถว × ${v.waPerRow} วา/แถว`,
  },
  planting: {
    key: 'planting',
    path: 'planting',
    labelTh: 'ปลูกอ้อย',
    icon: Sprout,
    formulaLabel: 'ร่อง × วา/ร่อง × 2.5 บาท',
    chartColor: '#1F3C28',
    badgeClass: 'bg-[#e5e7eb] text-[#374151]',
    primaryUnit: 'วา',
    primaryQty: (v) => v.furrows * v.waPerFurrow,
    fields: [
      { name: 'furrows', label: 'จำนวนร่อง', suffix: 'ร่อง', defaultValue: 1 },
      { name: 'waPerFurrow', label: 'วา/ร่อง', suffix: 'วา', defaultValue: 20 },
    ],
    schema: z.object({
      date: z.string().min(1, 'กรุณาเลือกวันที่'),
      workerId: z.string().min(1, 'กรุณาเลือกคนงาน'),
      furrows: z.coerce.number().positive('ต้องมากกว่า 0'),
      waPerFurrow: z.coerce.number().positive('ต้องมากกว่า 0'),
    }),
    calcTotal: (v) => v.furrows * v.waPerFurrow * 2.5,
    summaryText: (v) => `${v.furrows} ร่อง × ${v.waPerFurrow} วา/ร่อง`,
  },
  watering: {
    key: 'watering',
    path: 'watering',
    labelTh: 'รดน้ำ',
    icon: Droplets,
    formulaLabel: 'จำนวนวัน × ค่าแรงต่อวัน',
    chartColor: '#568A3B',
    badgeClass: 'bg-[#fef08a] text-[#854d0e]',
    primaryUnit: 'วัน',
    primaryQty: (v) => {
      if (v.startDate && v.endDate) {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
      return 0;
    },
    fields: [
      { name: 'startDate', label: 'วันที่เริ่ม', suffix: '', type: 'date', defaultValue: '' },
      { name: 'endDate', label: 'วันที่สิ้นสุด', suffix: '', type: 'date', defaultValue: '' },
      { name: 'dailyRate', label: 'ค่าแรงต่อวัน', suffix: 'บาท', defaultValue: 350 },
    ],
    schema: z.object({
      date: z.string().min(1, 'กรุณาเลือกวันที่'),
      workerId: z.string().min(1, 'กรุณาเลือกคนงาน'),
      startDate: z.string().min(1, 'กรุณาเลือกวันที่เริ่ม'),
      endDate: z.string().min(1, 'กรุณาเลือกวันที่สิ้นสุด'),
      dailyRate: z.coerce.number().positive('ต้องมากกว่า 0'),
    }).refine((data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }, { message: 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม', path: ['endDate'] }),
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
      return `${days > 0 ? days : 0} วัน × ${v.dailyRate} บาท/วัน`;
    },
  },
  spraying: {
    key: 'spraying',
    path: 'spraying',
    labelTh: 'พ่นยา',
    icon: SprayCan,
    formulaLabel: 'จำนวนถัง × 150 บาท/ถัง',
    chartColor: '#6A9E48',
    badgeClass: 'bg-[#fef08a] text-[#854d0e]',
    primaryUnit: 'ถัง',
    primaryQty: (v) => v.tanks,
    fields: [{ name: 'tanks', label: 'จำนวนถัง', suffix: 'ถัง', defaultValue: 1 }],
    schema: z.object({
      date: z.string().min(1, 'กรุณาเลือกวันที่'),
      workerId: z.string().min(1, 'กรุณาเลือกคนงาน'),
      tanks: z.coerce.number().positive('ต้องมากกว่า 0'),
    }),
    calcTotal: (v) => v.tanks * 150,
    summaryText: (v) => `${v.tanks} ถัง`,
  },
};

export const WORK_LOG_ORDER = ['cutting', 'planting', 'watering', 'spraying'];
