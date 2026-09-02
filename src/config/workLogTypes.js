import { z } from 'zod';
import { Scissors, Sprout, Droplets, SprayCan } from 'lucide-react';

export const WORK_LOG_TYPES = {
  cutting: {
    key: 'cutting',
    path: 'cutting',
    labelTh: 'ตัดอ้อย',
    icon: Scissors,
    formulaLabel: 'แถว × 100 วา/แถว × 2 บาท',
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
    fields: [
      { name: 'days', label: 'จำนวนวัน', suffix: 'วัน', defaultValue: 1 },
      { name: 'dailyRate', label: 'ค่าแรงต่อวัน', suffix: 'บาท', defaultValue: 350 },
    ],
    schema: z.object({
      date: z.string().min(1, 'กรุณาเลือกวันที่'),
      workerId: z.string().min(1, 'กรุณาเลือกคนงาน'),
      days: z.coerce.number().positive('ต้องมากกว่า 0'),
      dailyRate: z.coerce.number().positive('ต้องมากกว่า 0'),
    }),
    calcTotal: (v) => v.days * v.dailyRate,
    summaryText: (v) => `${v.days} วัน × ${v.dailyRate} บาท/วัน`,
  },
  spraying: {
    key: 'spraying',
    path: 'spraying',
    labelTh: 'พ่นยา',
    icon: SprayCan,
    formulaLabel: 'จำนวนถัง × 150 บาท/ถัง',
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
