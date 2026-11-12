import { runId, uniqueFullName } from '../../support/testData';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function seedWorkerWithLogs() {
  const id = runId();
  const username = `e2e_wk_hist_${id}`;
  const fullName = uniqueFullName('คนงานประวัติ');
  
  return cy.seedActiveAdminWithFarm().then(({ adminToken }) => {
    return cy.seedWorker(
      { fullName, nickname: uniqueFullName('ประวัติ'), username, phone: '0999999999', tempPassword: 'Password123' },
      adminToken
    ).then((worker) => {
      const today = getTodayString();
      // สร้างข้อมูลจำลอง
      cy.seedWorkLog({ type: 'planting', workerId: String(worker.id), date: today, furrows: 5, waPerFurrow: 20 }, adminToken);
      cy.seedWorkLog({ type: 'spraying', workerId: String(worker.id), date: today, tanks: 3 }, adminToken);
      
      return cy.activateAccount(username, 'Password123').then(() => ({ worker, username }));
    });
  });
}

// Work logs can't be dated in the future, so use the previous month (always in the past).
function previousMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

function getSpecificDateString(day) {
  const d = previousMonthStart();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${String(day).padStart(2, '0')}`;
}

// Opens the datepicker on the previous month (if it isn't already there) and picks a day.
function pickDayOfPreviousMonth(day) {
  const label = previousMonthStart().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  cy.get('.react-datepicker__current-month').invoke('text').then((text) => {
    if (!text.includes(label)) {
      cy.get('.react-datepicker__navigation--previous').click();
    }
  });
  cy.get('.react-datepicker__day:not(.react-datepicker__day--outside-month)').contains(new RegExp(`^${day}$`)).click();
}

function seedWorkerWithDateLogs() {
  const id = runId();
  const username = `e2e_wk_hist_date_${id}`;
  const fullName = uniqueFullName('คนงานวันที่');
  
  return cy.seedActiveAdminWithFarm().then(({ adminToken }) => {
    return cy.seedWorker(
      { fullName, nickname: uniqueFullName('วันที่'), username, phone: '0999999999', tempPassword: 'Password123' },
      adminToken
    ).then((worker) => {
      // สร้างข้อมูลจำลองแบบระบุวันที่ชัดเจน (วันที่ 10 และ วันที่ 20 ของเดือนที่แล้ว)
      const date10 = getSpecificDateString(10);
      const date20 = getSpecificDateString(20);
      
      cy.seedWorkLog({ type: 'planting', workerId: String(worker.id), date: date10, furrows: 5, waPerFurrow: 20 }, adminToken);
      cy.seedWorkLog({ type: 'spraying', workerId: String(worker.id), date: date20, tanks: 3 }, adminToken);
      
      return cy.activateAccount(username, 'Password123').then(() => ({ worker, username }));
    });
  });
}

describe('Worker - History', () => {
  it('WK-HIST-001 Displays work logs in the history table', () => {
    seedWorkerWithLogs().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/history');

      // ตรวจสอบหัวตารางหรือ Title ของหน้า
      cy.contains('History').should('be.visible');
      cy.contains('th', 'วันที่').should('be.visible');
      cy.contains('th', 'ประเภทงาน').should('be.visible');
      cy.contains('th', 'จำนวน').should('be.visible');
      cy.contains('th', 'หน่วย').should('be.visible');
      cy.contains('th', 'ค่าแรง').should('be.visible');

      // ตรวจสอบว่ามีข้อมูลงานที่บอทสร้างไว้โชว์ขึ้นมา 
      cy.contains('ปลูกอ้อย').should('be.visible');
      cy.contains('250').should('be.visible'); // ยอดเงิน 5*20*2.5
      cy.contains('พ่นยา').should('be.visible');
      cy.contains('450').should('be.visible'); // ยอดเงิน 3*150
    });
  });

  it('WK-HIST-002 Can filter work logs by search text', () => {
    seedWorkerWithLogs().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/history');

      // ตรวจสอบก่อนพิมพ์ว่ามีทั้งสองงาน
      cy.contains('ปลูกอ้อย').should('be.visible');
      cy.contains('พ่นยา').should('be.visible');

      // พิมพ์ค้นหาคำว่า "พ่นยา"
      cy.get('input[placeholder="search your activity"]').type('พ่นยา');

      // ต้องเจอพ่นยา แต่ไม่เจอปลูกอ้อย
      cy.contains('พ่นยา').should('be.visible');
      cy.contains('ปลูกอ้อย').should('not.exist');
      
      // ลบคำค้นหาออก
      cy.get('input[placeholder="search your activity"]').clear();
      
      // พิมพ์ค้นหาคำว่า "ปลูก"
      cy.get('input[placeholder="search your activity"]').type('ปลูก');
      cy.contains('ปลูกอ้อย').should('be.visible');
      cy.contains('พ่นยา').should('not.exist');
    });
  });

  it('WK-HIST-003 Can filter work logs by date range', () => {
    seedWorkerWithDateLogs().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/history');

      // ตรวจสอบก่อนกรองว่ามีทั้งสองงาน
      cy.contains('ปลูกอ้อย').should('be.visible'); // ของวันที่ 10
      cy.contains('พ่นยา').should('be.visible'); // ของวันที่ 20

      // 1. กรอง Start Date ให้เริ่มต้นที่ "วันที่ 15"
      cy.get('.react-datepicker-wrapper input').first().click();
      pickDayOfPreviousMonth(15);

      // ปลูกอ้อย (วันที่ 10) ต้องหายไป เพราะเก่ากว่าวันที่ 15
      // พ่นยา (วันที่ 20) ต้องยังอยู่ เพราะใหม่กว่าวันที่ 15
      cy.contains('ปลูกอ้อย').should('not.exist');
      cy.contains('พ่นยา').should('be.visible');

      // 2. เคลียร์เงื่อนไข โดยปรับ Start Date ให้กลับไปเป็น "วันที่ 1" (งานที่โดนซ่อนจะกลับมา)
      cy.get('.react-datepicker-wrapper input').first().click();
      pickDayOfPreviousMonth(1);
      cy.contains('ปลูกอ้อย').should('be.visible');

      // 3. กรอง End Date ให้สิ้นสุดแค่ "วันที่ 15"
      cy.get('.react-datepicker-wrapper input').last().click();
      pickDayOfPreviousMonth(15);

      // ปลูกอ้อย (วันที่ 10) ต้องยังอยู่ เพราะไม่เกินวันที่ 15
      // พ่นยา (วันที่ 20) ต้องหายไป เพราะเกินวันที่ 15
      cy.contains('ปลูกอ้อย').should('be.visible');
      cy.contains('พ่นยา').should('not.exist');
    });
  });
});
