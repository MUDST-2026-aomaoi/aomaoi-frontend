# บัญชีไร่อ้อย (Sugarcane Farm Accounting)

ระบบจัดการบัญชี/ค่าแรงคนงานสำหรับไร่อ้อย รองรับ 3 บทบาท (role) คือ **Worker**, **Admin**, และ **Super Admin** — สร้างด้วย React + Vite + Tailwind CSS

> โปรเจกต์นี้ยัง **ไม่มี backend จริง** ข้อมูลทั้งหมดเป็น mock data ที่เก็บใน Zustand store (อยู่ใน memory ของ browser เท่านั้น รีเฟรชหน้าแล้วข้อมูลที่เพิ่ม/แก้ไขจะหายกลับไปเป็นค่าเริ่มต้น ยกเว้นระบบ login ที่ persist ลง localStorage)

## สารบัญ

- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [เริ่มต้นใช้งาน](#เริ่มต้นใช้งาน)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [บทบาทและหน้าเพจ](#บทบาทและหน้าเพจ)
- [ระบบ Login (mock)](#ระบบ-login-mock)
- [ระบบสี / Design Tokens](#ระบบสี--design-tokens)
- [Shared UI Components](#shared-ui-components)
- [State Management (Zustand Stores)](#state-management-zustand-stores)
- [ข้อจำกัดที่รู้อยู่แล้ว / สิ่งที่ยังไม่ได้ทำ](#ข้อจำกัดที่รู้อยู่แล้ว--สิ่งที่ยังไม่ได้ทำ)

## เทคโนโลยีที่ใช้

| ส่วน | ใช้ตัวไหน |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| State management | Zustand (บาง store ใช้ `persist` middleware เก็บลง localStorage) |
| Styling | Tailwind CSS v4 |
| Form + Validation | react-hook-form + zod |
| Date picker | react-datepicker |
| กราฟ/ชาร์ต | Recharts |
| Icon | lucide-react |
| Lint | oxlint |

## เริ่มต้นใช้งาน

```bash
npm install       # ติดตั้ง dependencies
npm run dev       # รัน dev server (http://localhost:5173)
npm run build     # build สำหรับ production
npm run preview   # preview ไฟล์ที่ build แล้ว
npm run lint      # ตรวจโค้ดด้วย oxlint
```

หน้าแรกที่เปิดคือ `/login` — ดูรายละเอียด account ทดสอบได้ใน[หัวข้อ Login](#ระบบ-login-mock)

## โครงสร้างโปรเจกต์

```
src/
├── App.jsx                    # ประกาศ route ทั้งหมดของแอป
├── main.jsx                   # entry point
│
├── components/
│   ├── auth/
│   │   └── SetPasswordModal.jsx   # popup บังคับตั้งรหัสผ่านใหม่ตอน login ครั้งแรก
│   └── ui/                        # component กลางที่ใช้ซ้ำได้ทุกหน้า (ดูหัวข้อ Shared UI Components)
│
├── config/
│   ├── currentUser.js          # ข้อมูล mock ของ Super Admin ที่ล็อกอินอยู่
│   ├── status.js                # สี/label ของสถานะ Active / Pending / Inactive (ใช้ร่วมกันหลายตาราง)
│   └── workLogTypes.js          # นิยามงานแต่ละประเภท (ตัดอ้อย/ปลูกอ้อย/รดน้ำ/พ่นยา) สูตรคำนวณค่าแรง สี badge ฯลฯ
│
├── layouts/
│   ├── admin/                  # Sidebar + Topbar (สีเขียว) + PageHeader ของฝั่ง Admin
│   ├── superadmin/             # Sidebar (สีน้ำตาล) ของฝั่ง Super Admin
│   └── worker/                 # Layout ของฝั่ง Worker (โทนสว่าง)
│
├── pages/
│   ├── auth/Login.jsx          # หน้า login (ดู limitation ด้านล่าง)
│   ├── worker/                 # Dashboard, ประวัติการทำงาน, ยอดเงิน ของคนงาน
│   ├── admin/                  # Dashboard, จัดการคนงาน, บันทึกงาน, ภาพรวม
│   └── superadmin/              # Dashboard, จัดการฟาร์ม, จัดการ Admin
│
├── store/                      # Zustand stores ทั้งหมด (ดูหัวข้อ State Management)
└── lib/format.js               # helper ฟอร์แมตวันที่ / ตัวเลขเงิน (แบบ th-TH)
```

## บทบาทและหน้าเพจ

### Worker — `/worker/*`
| Route | หน้าที่ |
|---|---|
| `/worker/dashboard` | สรุปยอดเงินเดือนนี้ งานวันนี้ กราฟรายรับตามประเภทงาน |
| `/worker/history` | ประวัติงานทั้งหมด ค้นหา/กรองตามประเภทงานและช่วงวันที่ |

### Admin — `/admin/*`
| Route | หน้าที่ |
|---|---|
| `/admin/dashboard` | KPI สรุปยอดเงิน, กราฟ Payroll Overview, Payroll Breakdown by Task, ตาราง Work Activity Log ล่าสุด |
| `/admin/workers` | จัดการคนงาน (เพิ่ม/แก้ไข/ปิดการใช้งาน), อัปโหลดรูปโปรไฟล์, สุ่มรหัสผ่านชั่วคราว |
| `/admin/work` | บันทึกงานของทุกคนงาน รวม 4 ประเภทงานในตารางเดียว พร้อมฟอร์มบันทึกงานใหม่ที่คำนวณค่าแรงอัตโนมัติตามสูตร |
| `/admin/overview` | ตารางรวมรายการงานทั้งหมด กรองตามคนงาน (ไม่มีลิงก์จาก sidebar แล้ว แต่ route ยังเปิดใช้ได้) |

### Super Admin — `/superadmin/*`
| Route | หน้าที่ |
|---|---|
| `/superadmin/dashboard` | ภาพรวมทุกฟาร์ม: ยอดชำระรวม/เดือนนี้, กราฟเทียบรายฟาร์ม, Payroll Breakdown by Farms |
| `/superadmin/farms` | จัดการฟาร์ม (เพิ่ม/แก้ไข/ลบ) พร้อมอัปโหลดรูปฟาร์ม |
| `/superadmin/admins` | จัดการบัญชี Admin ของแต่ละฟาร์ม |

ทั้ง Admin และ Super Admin ใช้ธีมสี, ตาราง, dropdown, modal (Add/Edit/Delete/Success) ในรูปแบบเดียวกันเพื่อความสม่ำเสมอของ UI

## ระบบ Login (mock)

**สถานะปัจจุบัน:** หน้า `/login` เป็น UI เท่านั้น ฟอร์ม username/password ยังไม่ได้ผูกกับ `useAuthStore` จริง (กด LOGIN แล้ว navigate ไป `/worker/dashboard` ตรงๆ) — ส่วน `useAuthStore.js` มี logic การตรวจสอบสิทธิ์แบบ mock ครบแล้ว (รองรับ 3 role, บังคับเปลี่ยนรหัสผ่านตอน login ครั้งแรก, เก็บ session ลง localStorage) แต่ยังไม่ถูกเรียกใช้จากหน้า Login

Mock account ที่มีอยู่ใน `useAuthStore.js` (`MOCK_PASSWORDS`):

| Role | Username | Password | หมายเหตุ |
|---|---|---|---|
| Worker | `w001` – `w006` | `admin123` | ต้องตั้งรหัสผ่านใหม่ตอน login ครั้งแรก |
| Admin | `somchai_j`, `Pimchanok_r`, `Kanthida_w` | `admin123` | ต้องตั้งรหัสผ่านใหม่ตอน login ครั้งแรก |
| Super Admin | `superadmin` | `super1234` | ไม่บังคับเปลี่ยนรหัสผ่าน |

## ระบบสี / Design Tokens

กำหนดไว้ที่ `tailwind.config.js` ภายใต้ namespace `farm.*`:

| Token | สี | ใช้ตรงไหน |
|---|---|---|
| `farm-primary` | เขียวเข้ม | ปุ่ม confirm, กราฟ, สีหลักของ Admin |
| `farm-accent` | ทอง | ปุ่ม "เพิ่ม..." (Add), avatar เริ่มต้น |
| `farm-bg` | เทาอ่อนเกือบขาว | พื้นหลังหลักของทั้งแอป (ให้ตรงโทนกับฝั่ง Worker) |
| `farm-sidebar` / `farm-sidebarActive` | เขียวเข้มมาก | Sidebar ฝั่ง Admin |
| `farm-superSidebar` / `farm-superSidebarActive` | น้ำตาลเข้ม | Sidebar ฝั่ง Super Admin |
| `farm-sidebarAccent` | เขียวมะนาว | โลโก้ "Sugarcane" และ highlight เมนูที่ active ทั้งสอง sidebar |

สี badge สถานะ (`Active` / `Pending` / `Inactive`) รวมไว้ที่ `src/config/status.js` ที่เดียว ใช้ร่วมกันทั้งตาราง Workers และ Admins Management

## Shared UI Components

อยู่ที่ `src/components/ui/` ออกแบบให้ import ไปใช้ซ้ำได้ทุกหน้า:

- **`Dropdown`** — dropdown ปุ่มกำหนดเอง (ไม่ใช้ `<select>` เพราะ custom ลำบาก) ใช้เป็น filter ทุกหน้า
- **`Select`** — `<select>` จริงสำหรับฟิลด์ในฟอร์ม (ผูกกับ react-hook-form ผ่าน `register`) มี chevron icon กำหนดเอง
- **`Input`** — text/number/date input มาตรฐานของฟอร์ม
- **`ModalShell`** / **`SuccessModal`** — โครง modal กลาง + หน้าจอ "สำเร็จ" (วงกลมติ๊กถูก) ใช้ร่วมกันทุก flow Add/Edit/Delete
- **`Avatar`** — แสดงรูปโปรไฟล์ ถ้าไม่มีรูปจะ fallback เป็นตัวอักษรแรกของชื่อ
- **`Card`**, **`Badge`**, **`Button`** (variant: `primary` / `outline` / `danger` / `accent`)

## State Management (Zustand Stores)

อยู่ที่ `src/store/` — เป็น mock data ทั้งหมด ไม่มีการเรียก API จริง:

| Store | เก็บอะไร |
|---|---|
| `useWorkerStore` | รายชื่อคนงาน (ผูกกับ Admin) |
| `useWorkLogStore` | รายการบันทึกงานของคนงานทุกคน ทุกประเภทงาน |
| `useFarmStore` | รายชื่อฟาร์ม (ผูกกับ Super Admin) |
| `useAdminStore` | รายชื่อ Admin ของแต่ละฟาร์ม |
| `useAuthStore` | mock บัญชีผู้ใช้ + session (persist ลง localStorage เท่านั้น) |

สูตรคำนวณค่าแรงของแต่ละประเภทงาน (ตัดอ้อย/ปลูกอ้อย/รดน้ำ/พ่นยา) กำหนดไว้ที่เดียวใน `src/config/workLogTypes.js` ทั้งฟอร์ม, ตาราง, และกราฟ ดึงจากที่นี่ทั้งหมด — ถ้าจะแก้สูตรหรือเพิ่มประเภทงานใหม่ แก้ไฟล์นี้ไฟล์เดียวพอ

## ข้อจำกัดที่รู้อยู่แล้ว / สิ่งที่ยังไม่ได้ทำ

- ยังไม่มี backend/API จริง — ข้อมูลทั้งหมดอยู่ใน memory รีเฟรชหน้าแล้วหาย (ยกเว้นข้อมูล auth ที่ persist ไว้)
- หน้า Login ยังไม่ได้ผูก validation จริงกับ `useAuthStore` (ดูหัวข้อ Login ด้านบน)
- รูปโปรไฟล์/รูปฟาร์มที่อัปโหลด เป็นแค่ base64 เก็บใน state ของหน้านั้น ไม่ได้อัปโหลดขึ้นเซิร์ฟเวอร์ไหน รีเฟรชแล้วหายเช่นกัน
- `package.json` มี dependency ชื่อ `DatePicker` (ตัวพิมพ์ใหญ่) ที่ไม่ได้ใช้งานจริงปนอยู่กับ `react-datepicker` — น่าจะติดมาจากการติดตั้งผิดชื่อ ควรลบทิ้งภายหลัง
