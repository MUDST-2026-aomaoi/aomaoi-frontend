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
  const username = `e2e_wk_dash_${id}`;
  const fullName = uniqueFullName('คนงานหน้าบอร์ด');
  
  return cy.seedActiveAdminWithFarm().then(({ adminToken }) => {
    return cy.seedWorker(
      { fullName, nickname: 'บอร์ด', username, phone: '0999999999', tempPassword: 'Password123' },
      adminToken
    ).then((worker) => {
      const today = getTodayString();
      // สร้างข้อมูลงานจำลองของเดือนนี้ เพื่อให้กราฟและตัวเลขสรุปขึ้น
      cy.seedWorkLog({ type: 'cutting', workerId: String(worker.id), date: today, rows: 2, waPerRow: 100 }, adminToken);
      cy.seedWorkLog({ type: 'spraying', workerId: String(worker.id), date: today, tanks: 5 }, adminToken);
      
      // Activate และ return กลับไปให้เทสต์ใช้
      return cy.activateAccount(username, 'Password123').then(() => ({ worker, username, fullName }));
    });
  });
}

describe('Worker - Dashboard', () => {
  it('WK-DASH-001 Displays correct overview stats and elements', () => {
    seedWorkerWithLogs().then(({ username, fullName }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      // 1. ตรวจสอบชื่อคนงานที่มุมซ้ายบน
      cy.contains(fullName).should('be.visible');

      // 2. ตรวจสอบสถานะการจ่ายเงิน (ที่เพิ่งลบ Hardcode เปลี่ยนเป็น Dynamic ไป!)
      cy.contains('รอจ่าย').should('be.visible');

      // 3. ตรวจสอบยอดเงินรวม (2 ร่อง ร่องละ 100 วา = 400 บาท) + (5 ถัง ถังละ 150 บาท = 750 บาท) รวม 1,150 บาท
      cy.contains('1,150').should('be.visible');
    });
  });

  it('WK-DASH-002 Displays recent activities correctly', () => {
    seedWorkerWithLogs().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      // ตรวจสอบว่าโชว์ใน Recent Activity
      cy.contains('ตัดอ้อย').should('be.visible');
      cy.contains('พ่นยา').should('be.visible');
      // เช็กยอดเงินรายตัวที่ควรแสดงใน Recent Activity
      cy.contains('+฿400').should('be.visible');
      cy.contains('+฿750').should('be.visible');
    });
  });

  it('WK-DASH-003 Can navigate to History page from Dashboard', () => {
    seedWorkerWithLogs().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      // กดปุ่ม More ตรง Recent Activity (มี class หรือ href ไปที่ /history)
      cy.get('a[href="/history"]').first().click();
      cy.location('pathname').should('eq', '/history');
    });
  });
});
