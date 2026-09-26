# บั๊กที่เจอจาก E2E Test (admin + superadmin)

รันเทส Cypress ฝั่ง admin/superadmin ผ่าน 44/57 เคส ที่พังทั้งหมดเจอบั๊กจริง ไม่ใช่เทสเขียนผิด สรุปให้ตามนี้ ยังไม่ได้แก้อะไร รอทีม backend/worker เทสของตัวเองให้จบก่อน

## 1. Backend ไม่เช็ค role เลย (สำคัญสุด)

`SecurityConfig` มีแค่ `.anyRequest().authenticated()` ไม่มี role-based authorization เลย ผลคือ:

- worker เรียก `POST /api/workers`, `POST /api/work-logs` ได้เอง (ควรเป็นสิทธิ์ admin เท่านั้น)
- admin เรียก `POST /api/farms`, `POST /api/admins` ได้ (ควรเป็นสิทธิ์ superadmin เท่านั้น)
- admin/worker อ่าน `GET /api/superadmin/audit-logs` ได้ (ควรเป็น superadmin เท่านั้น)
- admin คนหนึ่ง reset password คนงานฟาร์มอื่นได้ (`POST /api/workers/{id}/reset-password`)

ต้องเพิ่ม role check ใน `SecurityConfig` หรือใน service layer แต่ละ endpoint

## 2. ลบ admin แล้วยัง login ได้

`AuthService.login()` เช็ค `status == inactive` เฉพาะ worker (บรรทัด ~66-68) ไม่มีเช็คให้ admin เลย ทำให้ admin ที่โดนลบ (soft delete) ยัง login เข้าระบบได้ปกติ ต้องเพิ่มเช็คแบบเดียวกับ worker ให้ admin ด้วย

## 3. Frontend: dropdown ฟาร์มส่ง type ผิด (ผมทำเอง ยังไม่แก้)

`AdminsManagement.jsx` — dropdown เลือกฟาร์ม (ทั้งฟอร์มเพิ่ม admin และตัว filter) ใช้ `value: f.id` ซึ่งเป็น number แต่ zod schema (`farmId: z.string()`) ต้องการ string เลยเกิด:
- กด "เพิ่ม Admin ใหม่" ไม่สำเร็จ (validate ไม่ผ่านแบบเงียบๆ)
- filter admin ตามฟาร์มไม่ทำงาน (เทียบ number กับ string ไม่ตรงกัน)

แก้ไม่ยาก แค่เปลี่ยน `value: f.id` เป็น `value: String(f.id)` ทั้งสองที่ ยังไม่แก้ตามที่บอก

## 4. Frontend: เปลี่ยน "ประเภทงาน" ในฟอร์มบันทึกงานแล้วคนงานที่เลือกไว้หายไป

`WorkLog.jsx` — modal "Add New Work Record" render `<EntryForm key={entryType} .../>` พอเปลี่ยน dropdown "ประเภทงาน" ทั้งฟอร์ม remount ใหม่ (เพราะ key เปลี่ยน) ทำให้ค่าที่กรอกไว้ก่อนหน้ารวมถึงคนงานที่เลือกไว้ถูกล้างหมดแบบไม่มีเตือน

ถ้าผู้ใช้จริงเลือกคนงานก่อนแล้วค่อยเปลี่ยนประเภทงาน จะต้องกลับไปเลือกคนงานใหม่อีกครั้ง ถ้าไม่ทันสังเกตจะกดบันทึกไม่ผ่าน (เพราะ workerId ว่าง)

สูตรคำนวณค่าแรงเช็คแล้วถูกต้องหมดทุกประเภทงาน (เทสยิง API ตรงผ่าน) ปัญหาอยู่ที่ UI state เท่านั้น

---

รายละเอียดเทส/test case ทั้งหมดอยู่ที่ `cypress/TEST_CASES.md`, รันซ้ำได้ด้วย `npm run cypress:run` (ต้องเปิด backend + `npm run dev` ก่อน)
