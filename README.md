# บัญชีไร่อ้อย (Sugarcane Farm Accounting)

ระบบจัดการบัญชี/ค่าแรงคนงานสำหรับไร่อ้อย รองรับ 3 บทบาท คือ **Worker**, **Admin**, **Super Admin** — สร้างด้วย React + Vite + Tailwind CSS

> Frontend เชื่อมต่อ AOMAOI Backend ผ่าน REST API และใช้ JWT สำหรับการเข้าสู่ระบบ

## เทคโนโลยีที่ใช้

React 19 + Vite · React Router v7 · Zustand · Tailwind CSS v4 · react-hook-form + zod · react-datepicker · Recharts · lucide-react

## วิธีรัน

ก่อนรันด้วย Vite ในเครื่อง ให้สร้าง `.env` จากตัวอย่างเพื่อกำหนด URL ของ backend:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev -- --port 3000
```

`VITE_API_BASE_URL` ชี้ไปที่ backend เช่น `http://localhost:8081/api` เมื่อรันผ่าน Docker Compose ตัวแปรนี้ถูกกำหนดตอน build image ให้แล้ว

```bash
npm run build     # build production
npm run lint      # ตรวจโค้ดด้วย oxlint
```

## Cypress E2E

ก่อนรัน E2E ให้เปิด Docker Compose จากโฟลเดอร์ `aomaoi-backend` ก่อน คำสั่งนี้จะ build และเปิดทั้งระบบ ได้แก่ PostgreSQL, Liquibase migration, backend และ frontend ไม่ต้องเปิด frontend หรือ backend แยกอีกชุด

E2E ใช้ frontend `http://localhost:3000`, backend `http://localhost:8081` และฐานข้อมูลหลักร่วมกับแอป
Cypress สร้างบัญชี superadmin ชั่วคราวและติดรหัสรอบให้ข้อมูลที่สร้างทั้งจาก UI และ API
เมื่อจบแต่ละ spec จะลบเฉพาะข้อมูลของรอบนั้น รวมถึงเมื่อเทสไม่ผ่าน
หากโปรเซสหยุดกลางทาง backend เก็บกวาดรอบที่ไม่มี heartbeat เกิน 15 นาที

ตั้ง `E2E_SUPPORT_KEY` แบบสุ่มอย่างน้อย 32 ตัวอักษรใน backend `.env` ก่อนเปิด stack
Cypress อ่านค่านี้จาก `../aomaoi-backend/.env` หรือ environment ของ Node โดยไม่ส่ง management key เข้า browser

```powershell
# เปิดทั้งระบบจาก Compose ของ backend ก่อนเริ่ม E2E
cd C:\aomaoi\aomaoi-backend
docker compose up --build -d

# จากนั้นติดตั้ง dependencies และรัน Cypress ใน frontend
cd ..\aomaoi-frontend
npm.cmd ci
npm.cmd run cypress:run
```

ดูรายละเอียดและข้อจำกัดใน `aomaoi-backend/docs/shared-e2e.md`
ถ้ารัน Compose จาก frontend repo ให้กำหนด `E2E_SUPPORT_KEY` ค่าเดียวกันใน shell หรือ `.env` ของ repo นี้ด้วย
CI ใช้ Compose ชุดหลักบน runner ของตัวเอง และใช้ backend image ล่าสุด จึงต้องเผยแพร่ backend ที่รองรับระบบนี้ก่อน

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
