import { uniqueFullName } from '../../support/testData';

function seedAdminFarmWorker() {
  return cy.seedActiveAdminWithFarm().then(({ adminToken, farm, id }) =>
    cy
      .seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: `e2e_wkr_${id}`, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken)
      .then((worker) => cy.activateAccount(`e2e_wkr_${id}`, 'Temp1234').then(({ token: workerToken }) => ({ adminToken, farm, worker, workerToken, id })))
  );
}

describe('Admin-only API is protected from other roles', () => {
  it('AD-API-001 rejects requests without a token', () => {
    cy.request({ url: `${Cypress.apiUrl}/workers`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('AD-API-002 blocks a worker from creating workers', () => {
    seedAdminFarmWorker().then(({ workerToken, id }) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.apiUrl}/workers`,
        headers: { Authorization: `Bearer ${workerToken}` },
        body: { fullName: uniqueFullName('แอบสร้าง'), nickname: uniqueFullName('ก'), username: `e2e_should_not_exist_${id}`, phone: '0899999999', tempPassword: 'Temp1234' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });
  });

  it('AD-API-003 blocks a worker from recording their own work log', () => {
    seedAdminFarmWorker().then(({ workerToken, worker }) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.apiUrl}/work-logs`,
        headers: { Authorization: `Bearer ${workerToken}` },
        body: { type: 'spraying', workerId: String(worker.id), date: '2026-09-01', tanks: 99 },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });
  });

  it('AD-API-004 blocks an admin from resetting a worker in another farm', () => {
    seedAdminFarmWorker().then(({ worker: workerB }) => {
      cy.seedActiveAdminWithFarm().then(({ adminToken: tokenA }) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.apiUrl}/workers/${workerB.id}/reset-password`,
          headers: { Authorization: `Bearer ${tokenA}` },
          body: { newPassword: 'Hacked123' },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.be.oneOf([403, 404]);
        });

        // seedAdminFarmWorker() already activated workerB via cy.activateAccount(),
        // which changes the temp password to 'NewPass123' - that's the real
        // current password to check nothing changed, not the original temp one.
        cy.apiLogin(workerB.username, 'NewPass123').then((res) => {
          expect(res.status).to.eq(200);
        });
      });
    });
  });
});
