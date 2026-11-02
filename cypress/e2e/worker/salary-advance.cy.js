import { runId, uniqueFullName } from '../../support/testData';

function getSpecificDateString(day) {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

function seedWorkerWithAdvances() {
  const id = runId();
  const username = `e2e_wk_adv_${id}`;
  const fullName = uniqueFullName('คนงานเบิกเงิน');

  return cy.seedActiveAdminWithFarm().then(({ adminToken }) => {
    return cy
      .seedWorker(
        { fullName, nickname: uniqueFullName('เบิก'), username, phone: '0999999999', tempPassword: 'Password123' },
        adminToken
      )
      .then((worker) => {
        const date10 = getSpecificDateString(10);
        const date20 = getSpecificDateString(20);

        cy.seedSalaryAdvance(
          { workerId: worker.id, advanceDate: date10, type: 'CASH', amount: 400 },
          adminToken
        );
        cy.seedSalaryAdvance(
          { workerId: worker.id, advanceDate: date20, type: 'GOODS', amount: 650, itemName: 'ข้าวสารหอมมะลิ' },
          adminToken
        );

        return cy.activateAccount(username, 'Password123').then(() => ({ worker, username, adminToken }));
      });
  });
}

describe('Worker - Salary Advance', () => {
  it('WK-ADV-001 Navigates to Salary Advance page from sidebar and displays worker advances', () => {
    seedWorkerWithAdvances().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');

      cy.getByTestID('nav-worker-salary-advance').click();
      cy.location('pathname').should('eq', '/salary-advance');

      cy.contains('h1', 'Salary Advance').should('be.visible');
      cy.contains('Here is the salary advance of overall data').should('be.visible');

      cy.contains('th', 'วันที่').should('be.visible');
      cy.contains('th', 'ชื่อสินค้า').should('be.visible');
      cy.contains('th', 'ประเภทการเบิก').should('be.visible');
      cy.contains('th', 'จำนวนเงิน').should('be.visible');

      cy.getByTestID('worker-advance-row').should('have.length', 2);
      cy.contains('ข้าวสารหอมมะลิ').should('be.visible');
      cy.contains('เงินสด').should('be.visible');
      cy.contains('สิ่งของ').should('be.visible');
      cy.contains('฿400').should('be.visible');
      cy.contains('฿650').should('be.visible');
    });
  });

  it('WK-ADV-002 Filters salary advances by search text and advance type dropdown', () => {
    seedWorkerWithAdvances().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/salary-advance');

      cy.getByTestID('worker-advance-row').should('have.length', 2);

      // 1. ค้นหาด้วยชื่อสินค้า "ข้าวสาร"
      cy.getByTestID('worker-advance-search').type('ข้าวสาร');
      cy.getByTestID('worker-advance-row').should('have.length', 1);
      cy.contains('ข้าวสารหอมมะลิ').should('be.visible');

      // ล้างคำค้นหา
      cy.getByTestID('worker-advance-search').clear();
      cy.getByTestID('worker-advance-row').should('have.length', 2);

      // 2. กรองด้วย Dropdown ประเภทการเบิก -> เงินสด
      cy.getByTestID('worker-advance-type-filter').click();
      cy.getByTestID('worker-advance-type-option-CASH').click();
      cy.getByTestID('worker-advance-row').should('have.length', 1);
      cy.getByTestID('worker-advance-row-type').should('contain', 'เงินสด');

      // 3. กรองด้วย Dropdown ประเภทการเบิก -> สิ่งของ
      cy.getByTestID('worker-advance-type-filter').click();
      cy.getByTestID('worker-advance-type-option-GOODS').click();
      cy.getByTestID('worker-advance-row').should('have.length', 1);
      cy.getByTestID('worker-advance-row-type').should('contain', 'สิ่งของ');

      // 4. กลับเป็น ประเภทการเบิกทั้งหมด
      cy.getByTestID('worker-advance-type-filter').click();
      cy.getByTestID('worker-advance-type-option-all').click();
      cy.getByTestID('worker-advance-row').should('have.length', 2);
    });
  });

  it('WK-ADV-003 Filters salary advances by date range', () => {
    seedWorkerWithAdvances().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/salary-advance');

      cy.getByTestID('worker-advance-row').should('have.length', 2);

      // กรอง Start Date เริ่มตั้งแต่วันที่ 15 -> เหลือเฉพาะรายการวันที่ 20 (ข้าวสารหอมมะลิ)
      cy.get('.react-datepicker-wrapper input').first().click();
      cy.get('.react-datepicker__day:not(.react-datepicker__day--outside-month)').contains(/^15$/).click();

      cy.getByTestID('worker-advance-row').should('have.length', 1);
      cy.contains('ข้าวสารหอมมะลิ').should('be.visible');
    });
  });
});
