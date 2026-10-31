import { todayISO, uniqueFullName } from '../../support/testData';

function seedFarmAdminWorker() {
  return cy.seedActiveAdminWithFarm().then(({ username, adminToken, farm, id }) =>
    cy
      .seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: `e2e_wkr_${id}`, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken)
      .then((worker) => ({ username, adminToken, farm, worker, id }))
  );
}

function pickWorker(worker) {
  cy.getByTestID('advance-form-worker').click();
  cy.getByTestID(`advance-form-worker-opt-${worker.id}`).click();
}

function visitAdvanceSalary(username) {
  cy.loginSession(username, 'NewPass123');
  cy.visit('/advance-salary');
}

describe('Admin - advance salary', () => {
  it('AD-ADVANCE-001 records a cash advance', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      visitAdvanceSalary(username);
      pickWorker(worker);
      cy.getByTestID('advance-form-amount').clear().type('500');
      cy.getByTestID('advance-save-btn').click();

      cy.contains('บันทึกการเบิกสำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.contains('[data-test="advance-row"]', worker.fullName).within(() => {
        cy.getByTestID('advance-row-type').should('contain', 'เงินสด');
        cy.getByTestID('advance-row-item').should('have.text', '');
        cy.getByTestID('advance-row-amount').should('contain', '500');
      });
    });
  });

  it('AD-ADVANCE-002 records a goods advance with an item name', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      visitAdvanceSalary(username);
      pickWorker(worker);
      cy.getByTestID('advance-type-goods').click();
      cy.getByTestID('advance-form-item').type('ข้าวสาร');
      cy.getByTestID('advance-form-amount').clear().type('300');
      cy.getByTestID('advance-save-btn').click();

      cy.contains('[data-test="advance-row"]', worker.fullName).within(() => {
        cy.getByTestID('advance-row-type').should('contain', 'สิ่งของ');
        cy.getByTestID('advance-row-item').should('contain', 'ข้าวสาร');
        cy.getByTestID('advance-row-amount').should('contain', '300');
      });
    });
  });

  it('AD-ADVANCE-003 requires an item name for goods', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      visitAdvanceSalary(username);
      pickWorker(worker);
      cy.getByTestID('advance-type-goods').click();
      cy.getByTestID('advance-form-amount').clear().type('300');
      cy.getByTestID('advance-save-btn').click();
      cy.contains('กรุณากรอกชื่อสินค้า');
      cy.getByTestID('advance-row').should('not.exist');
    });
  });

  it('AD-ADVANCE-004 requires a worker and a positive amount', () => {
    seedFarmAdminWorker().then(({ username }) => {
      visitAdvanceSalary(username);
      cy.getByTestID('advance-save-btn').click();
      cy.contains('กรุณาเลือกคนงาน');
      cy.contains('ต้องมากกว่า 0');
      cy.getByTestID('advance-row').should('not.exist');
    });
  });

  it('AD-ADVANCE-005 shows the item field only for goods', () => {
    seedFarmAdminWorker().then(({ username }) => {
      visitAdvanceSalary(username);
      cy.getByTestID('advance-form-item').should('not.exist');
      cy.getByTestID('advance-type-goods').click();
      cy.getByTestID('advance-form-item').should('be.visible');
      cy.getByTestID('advance-type-cash').click();
      cy.getByTestID('advance-form-item').should('not.exist');
    });
  });

  it('AD-ADVANCE-006 clears the form', () => {
    seedFarmAdminWorker().then(({ username, worker }) => {
      visitAdvanceSalary(username);
      pickWorker(worker);
      cy.getByTestID('advance-type-goods').click();
      cy.getByTestID('advance-form-item').type('ปุ๋ย');
      cy.getByTestID('advance-form-amount').clear().type('999');
      cy.getByTestID('advance-reset-btn').click();

      cy.getByTestID('advance-form-amount').should('have.value', '');
      cy.getByTestID('advance-form-item').should('not.exist');
      cy.getByTestID('advance-form-worker').should('not.contain', worker.fullName);
    });
  });

  it('AD-ADVANCE-007 API rejects goods without item and cash with item', () => {
    seedFarmAdminWorker().then(({ adminToken, worker }) => {
      const base = { workerId: worker.id, advanceDate: todayISO(), amount: 100 };
      const post = (body) =>
        cy.request({
          method: 'POST',
          url: `${Cypress.apiUrl}/salary-advances`,
          headers: { Authorization: `Bearer ${adminToken}` },
          body,
          failOnStatusCode: false,
        });

      post({ ...base, type: 'GOODS' }).its('status').should('eq', 400);
      post({ ...base, type: 'CASH', itemName: 'ข้าวสาร' }).its('status').should('eq', 400);
      post({ ...base, type: 'CASH' }).its('status').should('eq', 201);
    });
  });
});
