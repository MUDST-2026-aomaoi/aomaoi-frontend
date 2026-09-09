# บัญชีไร่อ้อย (Sugarcane Farm Accounting)

ระบบจัดการบัญชี/ค่าแรงคนงานสำหรับไร่อ้อย รองรับ 3 บทบาท คือ **Worker**, **Admin**, **Super Admin** — สร้างด้วย React + Vite + Tailwind CSS

> โปรเจกต์นี้ยังไม่มี backend จริง ข้อมูลทั้งหมดเป็น mock data เก็บใน Zustand store (อยู่ใน memory ของ browser รีเฟรชแล้วหาย ยกเว้น login ที่ persist ลง localStorage)

## เทคโนโลยีที่ใช้

React 19 + Vite · React Router v7 · Zustand · Tailwind CSS v4 · react-hook-form + zod · react-datepicker · Recharts · lucide-react

## วิธีรัน

```bash
npm install       # ติดตั้ง dependencies
npm run dev       # dev server → http://localhost:5173
npm run build     # build production
npm run lint      # ตรวจโค้ดด้วย oxlint
```

## โครงสร้างโปรเจกต์

```
src/
├── App.jsx          # ประกาศ route ทั้งหมด
├── components/
│   ├── auth/         # modal ตั้งรหัสผ่านครั้งแรก
│   └── ui/            # component กลางที่ใช้ซ้ำ (Button, Card, Modal, Dropdown, Select, Avatar ...)
├── config/            # ค่าคงที่ที่ใช้ร่วมกันหลายหน้า (ประเภทงาน+สูตรคำนวณ, สีสถานะ, current user)
├── layouts/           # Sidebar/Topbar ของ admin, superadmin, worker
├── pages/
│   ├── auth/          # Login
│   ├── worker/        # Dashboard, ประวัติงาน
│   ├── admin/          # Dashboard, จัดการคนงาน, บันทึกงาน, ภาพรวม
│   └── superadmin/     # Dashboard, จัดการฟาร์ม, จัดการ Admin
├── store/             # Zustand store (worker, work log, farm, admin, auth)
└── lib/format.js      # helper ฟอร์แมตวันที่/ตัวเลข
```

## มีอะไรให้ใช้บ้าง

- **Worker** (`/worker/*`) — ดูยอดเงิน/สรุปงานของตัวเอง, ประวัติงานพร้อมค้นหา/กรอง
- **Admin** (`/admin/*`) — Dashboard สรุปยอด+กราฟ, จัดการคนงาน (CRUD), บันทึกงาน 4 ประเภท (ตัดอ้อย/ปลูกอ้อย/รดน้ำ/พ่นยา) พร้อมคำนวณค่าแรงอัตโนมัติ, ภาพรวมรายการทั้งหมด
- **Super Admin** (`/superadmin/*`) — Dashboard สรุปทุกฟาร์ม, จัดการฟาร์ม (CRUD), จัดการบัญชี Admin ของแต่ละฟาร์ม

หมายเหตุ: หน้า Login ตอนนี้ยังไม่เช็ค username/password จริง กด login แล้วไปหน้า Worker เสมอ — ถ้าอยากดูหน้า Admin/Super Admin ให้พิมพ์ URL ตรง (`/admin/dashboard`, `/superadmin/dashboard`) ได้เลยเพราะยังไม่มี route guard กั้น
