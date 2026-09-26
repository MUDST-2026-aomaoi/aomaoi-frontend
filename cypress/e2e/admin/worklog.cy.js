import { uniqueFullName } from '../../support/testData';

function pickCalendarDay(day) {
  cy.contains('.react-datepicker__day:not(.react-datepicker__day--outside-month)', String(day)).click();
}

function seedFarmAdminWorker() {
  return cy.seedActiveAdminWithFarm().then(({ username, adminToken, farm, id }) =>
    cy
      .seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: `e2e_wkr_${id}`, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken)
      .then((worker) => ({ username, adminToken, farm, worker, id }))
  );
}

function openNewEntry() {
  cy.getByTestID('worklog-add-btn').click();
}

function pickWorker(worker) {
  cy.getByTestID('worklog-form-worker').click();
  cy.getByTestID(`worklog-form-worker-opt-${worker.id}`).click();
}

function pickType(typeLabelTh) {
  cy.getByTestID('worklog-form-type').click();
  cy.contains('[data-test^="worklog-form-type-opt-"]', typeLabelTh).click();
}

describe('Admin - work log', () => {
  it('AD-WORKLOG-001 records a cutting entry', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      pickWorker(worker);
      cy.getByTestID('worklog-form-rows').clear().type('3');
      cy.getByTestID('worklog-form-waPerRow').clear().type('100');
      cy.getByTestID('worklog-preview-total').should('contain', '600');
      cy.getByTestID('worklog-form-submit').click();

      cy.contains('บันทึกงานสำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.contains('[data-test="worklog-row"]', worker.fullName).within(() => {
        cy.getByTestID('worklog-row-type').should('contain', 'ตัดอ้อย');
        cy.getByTestID('worklog-row-qty').should('contain', '300');
        cy.getByTestID('worklog-row-wages').should('contain', '600');
      });
    });
  });

  it('AD-WORKLOG-002 records a planting entry', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      pickWorker(worker);
      pickType('ปลูกอ้อย');
      cy.getByTestID('worklog-form-furrows').clear().type('4');
      cy.getByTestID('worklog-form-waPerFurrow').clear().type('20');
      cy.getByTestID('worklog-preview-total').should('contain', '200');
      cy.getByTestID('worklog-form-submit').click();

      cy.contains('[data-test="worklog-row"]', worker.fullName).within(() => {
        cy.getByTestID('worklog-row-type').should('contain', 'ปลูกอ้อย');
        cy.getByTestID('worklog-row-qty').should('contain', '80');
        cy.getByTestID('worklog-row-wages').should('contain', '200');
      });
    });
  });

  it('AD-WORKLOG-003 records a watering entry over a date range', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      pickWorker(worker);
      pickType('รดน้ำ');

      cy.getByTestID('worklog-form-date').should('not.exist');
      cy.getByTestID('worklog-form-startDate').click();
      pickCalendarDay(10);
      cy.getByTestID('worklog-form-endDate').click();
      pickCalendarDay(14);
      cy.getByTestID('worklog-form-dailyRate').clear().type('350');

      cy.getByTestID('worklog-preview-summary').should('contain', '5').and('contain', '350');
      cy.getByTestID('worklog-preview-total').should('contain', '1,750');
      cy.getByTestID('worklog-form-submit').click();

      cy.contains('[data-test="worklog-row"]', worker.fullName).within(() => {
        cy.getByTestID('worklog-row-type').should('contain', 'รดน้ำ');
        cy.getByTestID('worklog-row-qty').should('contain', '5');
        cy.getByTestID('worklog-row-wages').should('contain', '1,750');
      });
    });
  });

  it('AD-WORKLOG-004 records a spraying entry', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      pickWorker(worker);
      pickType('พ่นยา');
      cy.getByTestID('worklog-form-tanks').clear().type('3');
      cy.getByTestID('worklog-preview-total').should('contain', '450');
      cy.getByTestID('worklog-form-submit').click();

      cy.contains('[data-test="worklog-row"]', worker.fullName).within(() => {
        cy.getByTestID('worklog-row-type').should('contain', 'พ่นยา');
        cy.getByTestID('worklog-row-qty').should('contain', '3');
        cy.getByTestID('worklog-row-wages').should('contain', '450');
      });
    });
  });

  it('AD-WORKLOG-005 requires a worker to be picked', () => {
    seedFarmAdminWorker().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      cy.getByTestID('worklog-form-submit').click();
      cy.contains('กรุณาเลือกคนงาน');
    });
  });

  it('AD-WORKLOG-006 rejects an end date before the start date', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      pickWorker(worker);
      pickType('รดน้ำ');
      cy.getByTestID('worklog-form-startDate').click();
      pickCalendarDay(14);
      cy.getByTestID('worklog-form-endDate').click();
      pickCalendarDay(10);
      cy.getByTestID('worklog-form-dailyRate').clear().type('350');
      cy.getByTestID('worklog-form-submit').click();
      cy.contains('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม');
    });
  });

  it('AD-WORKLOG-007 rejects a zero quantity', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      openNewEntry();
      pickWorker(worker);
      cy.getByTestID('worklog-form-rows').clear().type('0');
      cy.getByTestID('worklog-form-submit').click();
      cy.contains('ต้องมากกว่า 0');
    });
  });

  it('AD-WORKLOG-008 the server calculates wages itself for every type', () => {
    seedFarmAdminWorker().then(({ adminToken, worker }) => {
      cy.seedWorkLog({ type: 'cutting', workerId: String(worker.id), date: '2026-09-01', rows: 3, waPerRow: 100 }, adminToken).then((res) => {
        expect(res.total).to.eq(600);
      });
      cy.seedWorkLog({ type: 'planting', workerId: String(worker.id), date: '2026-09-01', furrows: 4, waPerFurrow: 20 }, adminToken).then((res) => {
        expect(res.total).to.eq(200);
      });
      cy.seedWorkLog({ type: 'watering', workerId: String(worker.id), startDate: '2026-09-01', endDate: '2026-09-05', dailyRate: 350 }, adminToken).then((res) => {
        expect(res.total).to.eq(1750);
        expect(res.days).to.eq(5);
      });
      cy.seedWorkLog({ type: 'spraying', workerId: String(worker.id), date: '2026-09-01', tanks: 3 }, adminToken).then((res) => {
        expect(res.total).to.eq(450);
      });
    });
  });

  it('AD-WORKLOG-009 filters the log by type and worker', () => {
    seedFarmAdminWorker().then(({ username, adminToken, worker }) => {
      cy.seedWorkLog({ type: 'cutting', workerId: String(worker.id), date: '2026-09-01', rows: 3, waPerRow: 100 }, adminToken);
      cy.seedWorkLog({ type: 'spraying', workerId: String(worker.id), date: '2026-09-02', tanks: 2 }, adminToken);

      cy.loginSession(username, 'NewPass123');
      cy.visit('/work');
      cy.getByTestID('worklog-type-filter').click();
      cy.contains('[data-test^="worklog-type-filter-opt-"]', 'ตัดอ้อย').click();
      cy.getByTestID('worklog-row').should('have.length', 1);
      cy.getByTestID('worklog-row-type').should('contain', 'ตัดอ้อย');
    });
  });
});
