import { z } from 'zod';
import { Sprout, Droplets, SprayCan } from 'lucide-react';

// สร้าง Custom Icon รูปต้นอ้อย (เนื่องจาก Lucide ไม่มีรูปอ้อยตรงๆ)
const SugarcaneIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* ลำต้นหลัก */}
    <path d="M12 22V2" />
    {/* ปล้องอ้อย */}
    <path d="M9 17h6" />
    <path d="M9 11h6" />
    <path d="M9 5h6" />
    {/* ใบอ้อย */}
    <path d="M12 17c-4 0-7-3-7-7" />
    <path d="M12 11c4 0 7-3 7-7" />
  </svg>
);

export const WORK_LOG_TYPES = {
  cutting: {
    key: 'cutting',
    path: 'cutting',
    labelTh: 'ตัดอ้อย',
    icon: SugarcaneIcon,
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
    primaryQty: (v) => v.days,
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
