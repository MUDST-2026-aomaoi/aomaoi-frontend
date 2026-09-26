import { runId, uniqueFullName } from '../../support/testData';

function seedFarmAndAdmin() {
  const id = runId();
  return cy.seedSuperadminToken().then((superToken) =>
    cy.seedFarm(`E2E Prot Farm ${id}`, 'นครปฐม', superToken).then((farm) => {
      const username = `e2e_adm_${id}`;
      return cy
        .seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username, phone: '0812345678', tempPassword: 'Temp1234' }, superToken)
        .then(() => cy.activateAccount(username, 'Temp1234'))
        .then(({ token: adminToken }) => {
          const workerUsername = `e2e_wkr_${id}`;
          return cy
            .seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken)
            .then(() => cy.activateAccount(workerUsername, 'Temp1234'))
            .then(({ token: workerToken }) => ({ superToken, adminToken, workerToken, farm, id }));
        });
    })
  );
}

describe('Superadmin-only API is protected from other roles', () => {
  it('SA-API-001 rejects requests without a token', () => {
    cy.request({ url: `${Cypress.apiUrl}/farms`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('SA-API-002 blocks admin from reading audit logs', () => {
    seedFarmAndAdmin().then(({ adminToken }) => {
      cy.request({
        url: `${Cypress.apiUrl}/superadmin/audit-logs`,
        headers: { Authorization: `Bearer ${adminToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });
  });

  it('SA-API-003 blocks worker from reading audit logs', () => {
    seedFarmAndAdmin().then(({ workerToken }) => {
      cy.request({
        url: `${Cypress.apiUrl}/superadmin/audit-logs`,
        headers: { Authorization: `Bearer ${workerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });
  });

  it('SA-API-004 blocks admin from creating a farm', () => {
    seedFarmAndAdmin().then(({ adminToken, id }) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.apiUrl}/farms`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { name: `Should Not Exist ${id}`, location: 'x' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });
  });

  it('SA-API-005 blocks admin from creating another admin', () => {
    seedFarmAndAdmin().then(({ adminToken, farm, id }) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.apiUrl}/admins`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { fullName: uniqueFullName('สมหญิง'), username: `e2e_adm2_${id}`, phone: '0812345678', tempPassword: 'Temp1234', farmId: String(farm.id) },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });
  });
});
