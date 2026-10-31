import { todayISO, uniqueFullName } from '../../support/testData';

// Cutting 3 rows x 100 wa pays 600 baht (see AD-WORKLOG-001).
const EARNINGS = 600;

function seedFarmAdminWorker(suffix = 'a') {
  return cy.seedActiveAdminWithFarm().then(({ username, adminToken, farm, id }) =>
    cy
      .seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: `e2e_wkr_${suffix}_${id}`, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken)
      .then((worker) => ({ username, adminToken, farm, worker, id }))
  );
}

function seedEarnings(worker, adminToken) {
  return cy.seedWorkLog({ type: 'cutting', workerId: String(worker.id), date: todayISO(), rows: 3, waPerRow: 100 }, adminToken);
}

function seedAdvance(worker, adminToken, { type = 'CASH', amount, itemName }) {
  const payload = { workerId: worker.id, advanceDate: todayISO(), type, amount };
  if (itemName) payload.itemName = itemName;
  return cy.seedSalaryAdvance(payload, adminToken);
}

describe('Admin - financial balance', () => {
  it('AD-BALANCE-001 shows earnings, advances and remaining balance', () => {
    seedFarmAdminWorker().then(({ username, adminToken, worker }) => {
      seedEarnings(worker, adminToken);
      seedAdvance(worker, adminToken, { amount: 200 });

      cy.loginSession(username, 'NewPass123');
      cy.visit('/financial-balance');

      cy.contains('[data-test="balance-row"]', worker.fullName).within(() => {
        cy.getByTestID('balance-row-earnings').should('contain', '600');
        cy.getByTestID('balance-row-advances').should('contain', '200');
        cy.getByTestID('balance-row-remaining').should('contain', '400');
        cy.getByTestID('balance-row-status').should('contain', 'ปกติ');
      });
    });
  });

  it('AD-BALANCE-002 marks a worker in debt when advances exceed earnings', () => {
    seedFarmAdminWorker().then(({ username, adminToken, worker }) => {
      seedEarnings(worker, adminToken);
      seedAdvance(worker, adminToken, { type: 'GOODS', amount: EARNINGS + 400, itemName: 'ปุ๋ย' });

      cy.loginSession(username, 'NewPass123');
      cy.visit('/financial-balance');

      cy.contains('[data-test="balance-row"]', worker.fullName).within(() => {
        cy.getByTestID('balance-row-remaining').should('contain', '-').and('contain', '400');
        cy.getByTestID('balance-row-status').should('contain', 'ติดหนี้').and('contain', '400');
      });
      cy.getByTestID('balance-total-debt').should('contain', '400');
    });
  });

  it('AD-BALANCE-003 updates after recording an advance from the UI', () => {
    seedFarmAdminWorker().then(({ username, adminToken, worker }) => {
      seedEarnings(worker, adminToken);
      cy.loginSession(username, 'NewPass123');

      cy.visit('/advance-salary');
      cy.getByTestID('advance-form-worker').click();
      cy.getByTestID(`advance-form-worker-opt-${worker.id}`).click();
      cy.getByTestID('advance-form-amount').clear().type('250');
      cy.getByTestID('advance-save-btn').click();
      cy.getByTestID('success-modal-close').click();

      cy.visit('/financial-balance');
      cy.contains('[data-test="balance-row"]', worker.fullName).within(() => {
        cy.getByTestID('balance-row-advances').should('contain', '250');
        cy.getByTestID('balance-row-remaining').should('contain', '350');
      });
    });
  });

  it('AD-BALANCE-004 searches by nickname and filters by debt status', () => {
    seedFarmAdminWorker('a').then(({ username, adminToken, worker }) => {
      seedEarnings(worker, adminToken);
      seedAdvance(worker, adminToken, { amount: EARNINGS + 100 });

      cy.loginSession(username, 'NewPass123');
      cy.visit('/financial-balance');

      cy.getByTestID('balance-search').type(worker.nickname);
      cy.getByTestID('balance-row').should('have.length', 1).and('contain', worker.fullName);

      cy.getByTestID('balance-search').clear().type('zzz-no-such-worker');
      cy.getByTestID('balance-row').should('not.exist');
      cy.contains('ไม่พบรายการ');

      cy.getByTestID('balance-search').clear();
      cy.getByTestID('balance-status-filter').click();
      cy.getByTestID('balance-status-filter-opt-ok').click();
      cy.getByTestID('balance-row').should('not.exist');
      cy.getByTestID('balance-status-filter').click();
      cy.getByTestID('balance-status-filter-opt-debt').click();
      cy.getByTestID('balance-row').should('have.length', 1).and('contain', worker.fullName);
    });
  });

  it('AD-BALANCE-005 API: admin can list balances, anonymous cannot', () => {
    seedFarmAdminWorker().then(({ adminToken, worker }) => {
      seedEarnings(worker, adminToken);

      cy.request({ url: `${Cypress.apiUrl}/worker-balances`, failOnStatusCode: false }).its('status').should('eq', 401);
      cy.request({
        url: `${Cypress.apiUrl}/worker-balances`,
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const mine = res.body.find((b) => b.workerId === worker.id);
        expect(mine.totalEarnings).to.eq(EARNINGS);
        expect(mine.inDebt).to.eq(false);
      });
    });
  });
});
