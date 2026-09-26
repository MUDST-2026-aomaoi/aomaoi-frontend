import { runId, uniqueFullName } from '../../support/testData';

describe('Superadmin - audit log', () => {
  beforeEach(() => {
    cy.loginSession('superadmin', '1234');
  });

  it('SA-AUDIT-001 logs admin/worker actions with their real actor', () => {
    const id = runId();

    cy.seedSuperadminToken().then((token) => {
      cy.seedFarm(`E2E Audit Farm ${id}`, 'นครปฐม', token).then((farm) => {
        const adminUsername = `e2e_adm_${id}`;
        cy.seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username: adminUsername, phone: '0812345678', tempPassword: 'Temp1234' }, token).then((admin) => {
          cy.activateAccount(adminUsername, 'Temp1234').then(({ token: adminToken }) => {
            const workerUsername = `e2e_wkr_${id}`;
            cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken).then((worker) => {
              cy.request({
                method: 'POST',
                url: `${Cypress.apiUrl}/workers/${worker.id}/reset-password`,
                headers: { Authorization: `Bearer ${adminToken}` },
                body: { newPassword: 'Reset1234' },
              });

              cy.request({
                method: 'DELETE',
                url: `${Cypress.apiUrl}/admins/${admin.id}`,
                headers: { Authorization: `Bearer ${token}` },
              });

              cy.visit('/audit-logs');
              cy.getByTestID('audit-search').type(id);
              cy.contains('[data-test="audit-row"]', 'CREATE_ADMIN').should('contain', adminUsername);
              cy.contains('[data-test="audit-row"]', 'CREATE_WORKER').should('contain', workerUsername);
              cy.contains('[data-test="audit-row"]', 'RESET_PASSWORD').should('contain', workerUsername).and('contain', adminUsername);
              cy.contains('[data-test="audit-row"]', 'DELETE_ADMIN').should('contain', adminUsername);
            });
          });
        });
      });
    });
  });

  it('SA-AUDIT-002 refresh reloads new logs without a full page reload', () => {
    const id = runId();
    cy.visit('/audit-logs');

    cy.seedSuperadminToken().then((token) =>
      cy.seedFarm(`E2E Refresh Farm ${id}`, 'นครปฐม', token).then((farm) =>
        cy.seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username: `e2e_adm_${id}`, phone: '0812345678', tempPassword: 'Temp1234' }, token)
      )
    );

    cy.getByTestID('audit-refresh').click();
    cy.getByTestID('audit-search').type(id);
    cy.contains('[data-test="audit-row"]', 'CREATE_ADMIN').should('contain', `e2e_adm_${id}`);
  });
});
