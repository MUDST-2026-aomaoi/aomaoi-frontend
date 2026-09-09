import { create } from 'zustand';

const seedFarms = [
  {
    id: '1',
    name: 'ไร่อ้อยสุขใจ',
    location: 'อ.ด่านช้าง จ.สุพรรณบุรี',
    workerCount: 5,
    adminCount: 1,
    monthlyWages: 186200,
    totalWages: 1000000,
    joinedDate: '2025-06-01',
    status: 'active',
  },
  {
    id: '2',
    name: 'ไร่อ้อยบ้านโป่ง',
    location: 'อ.บ้านโป่ง จ.ราชบุรี',
    workerCount: 4,
    adminCount: 1,
    monthlyWages: 82000,
    totalWages: 500000,
    joinedDate: '2025-08-10',
    status: 'active',
  },
  {
    id: '3',
    name: 'ไร่อ้อยหนองบัว',
    location: 'อ.หนองบัว จ.นครสวรรค์',
    workerCount: 3,
    adminCount: 1,
    monthlyWages: 96800,
    totalWages: 465000,
    joinedDate: '2025-09-20',
    status: 'active',
  },
];

let nextId = seedFarms.length + 1;

export const useFarmStore = create((set, get) => ({
  farms: seedFarms,

  addFarm: (data) => {
    const id = String(nextId++);
    set((state) => ({
      farms: [
        ...state.farms,
        {
          id,
          status: 'active',
          workerCount: 0,
          adminCount: 0,
          monthlyWages: 0,
          totalWages: 0,
          joinedDate: new Date().toISOString().slice(0, 10),
          ...data,
        },
      ],
    }));
    return id;
  },

  updateFarm: (id, data) =>
    set((state) => ({
      farms: state.farms.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  setFarmStatus: (id, status) =>
    set((state) => ({
      farms: state.farms.map((f) => (f.id === id ? { ...f, status } : f)),
    })),

  getFarmName: (id) => get().farms.find((f) => f.id === id)?.name ?? 'ไม่ทราบฟาร์ม',
}));
