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
      { fullName, nickname: uniqueFullName('บอร์ด'), username, phone: '0999999999', tempPassword: 'Password123' },
      adminToken
    ).then((worker) => {
      const today = getTodayString();
      // สร้างข้อมูลงานจำลองของเดือนนี้ เพื่อให้กราฟและตัวเลขสรุปขึ้น
      cy.seedWorkLog({ type: 'cutting', workerId: String(worker.id), date: today, rows: 2, waPerRow: 100 }, adminToken);
      cy.seedWorkLog({ type: 'spraying', workerId: String(worker.id), date: today, tanks: 5 }, adminToken);
      
      // Activate และ return กลับไปให้เทสต์ใช้
      return cy.activateAccount(username, 'Password123').then(() => ({ worker, username, fullName, adminToken }));
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

      // 2. ตรวจสอบการ์ดสรุปยอดเงินหลักทั้ง 3 ใบ
      cy.contains('My balance').should('be.visible');
      cy.contains('RemainingBalance').should('be.visible');
      cy.contains("Today's income").should('be.visible');

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

  it('WK-DASH-004 Displays positive remaining balance after partial salary advance', () => {
    seedWorkerWithLogs().then(({ worker, username, adminToken }) => {
      const today = getTodayString();
      // รายได้รวม 1,150 บาท เบิกเงินสดล่วงหน้า 350 บาท -> คงเหลือ 800 บาท
      cy.seedSalaryAdvance(
        { workerId: worker.id, advanceDate: today, type: 'CASH', amount: 350 },
        adminToken
      );

      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      cy.contains('My balance').should('be.visible');
      cy.contains('฿1,150').should('be.visible');
      cy.contains('RemainingBalance').should('be.visible');
      cy.contains('฿800').should('be.visible');
    });
  });

  it('WK-DASH-005 Displays negative remaining balance in red when salary advance exceeds earnings', () => {
    seedWorkerWithLogs().then(({ worker, username, adminToken }) => {
      const today = getTodayString();
      // รายได้รวม 1,150 บาท เบิกของล่วงหน้า 1,250 บาท -> ติดลบ -100 บาท (ติดหนี้)
      cy.seedSalaryAdvance(
        { workerId: worker.id, advanceDate: today, type: 'GOODS', amount: 1250, itemName: 'ข้าวสาร 1 กระสอบ' },
        adminToken
      );

      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      cy.contains('My balance').should('be.visible');
      cy.contains('฿1,150').should('be.visible');
      cy.contains('RemainingBalance').should('be.visible');
      cy.contains('-฿100')
        .should('be.visible')
        .and('have.class', 'text-[#C80303]');
    });
  });

  it('WK-DASH-006 Displays positive remaining balance after goods advance within earnings', () => {
    seedWorkerWithLogs().then(({ worker, username, adminToken }) => {
      const today = getTodayString();
      // รายได้รวม 1,150 บาท เบิกสิ่งของล่วงหน้า 450 บาท (ยังไม่เกินรายได้) -> คงเหลือ 700 บาท (สีเขียว)
      cy.seedSalaryAdvance(
        { workerId: worker.id, advanceDate: today, type: 'GOODS', amount: 450, itemName: 'ปุ๋ยและอุปกรณ์' },
        adminToken
      );

      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      cy.contains('My balance').should('be.visible');
      cy.contains('฿1,150').should('be.visible');
      cy.contains('RemainingBalance').should('be.visible');
      cy.contains('฿700')
        .should('be.visible')
        .and('have.class', 'text-[#3B4D36]');
    });
  });

  it('WK-DASH-007 Displays negative remaining balance in red when cash advance exceeds earnings', () => {
    seedWorkerWithLogs().then(({ worker, username, adminToken }) => {
      const today = getTodayString();
      // รายได้รวม 1,150 บาท เบิกเงินสดล่วงหน้า 1,350 บาท (เกินรายได้) -> ติดลบ -200 บาท (สีแดง)
      cy.seedSalaryAdvance(
        { workerId: worker.id, advanceDate: today, type: 'CASH', amount: 1350 },
        adminToken
      );

      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      cy.contains('My balance').should('be.visible');
      cy.contains('฿1,150').should('be.visible');
      cy.contains('RemainingBalance').should('be.visible');
      cy.contains('-฿200')
        .should('be.visible')
        .and('have.class', 'text-[#C80303]');
    });
  });
});
