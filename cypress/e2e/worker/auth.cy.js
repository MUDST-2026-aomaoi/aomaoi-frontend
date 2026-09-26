import { runId, uniqueFullName } from '../../support/testData';

function seedTestWorker() {
  const id = runId();
  const username = `e2e_wk_${id}`;
  return cy.seedActiveAdminWithFarm().then(({ adminToken }) => {
    return cy.seedWorker(
      {
        fullName: uniqueFullName('คนงานเทสต์'),
        nickname: 'เทสต์',
        username,
        phone: '0999999999',
        tempPassword: 'Password123'
      },
      adminToken
    ).then((worker) => ({ worker, username, adminToken }));
  });
}

describe('Worker - Authentication Flow', () => {
  it('WK-AUTH-001 Logs in successfully as an active worker', () => {
    seedTestWorker().then(({ username }) => {
      cy.visit('/login');
      cy.getByTestID('login-username').type(username);
      cy.getByTestID('login-password').type('Password123');
      cy.getByTestID('login-submit').click();

      // Verify redirection to unified dashboard
      cy.location('pathname').should('eq', '/dashboard');
      
      // Verify worker-specific elements are visible (using the hardcoded text we kept!)
      cy.contains('สถานะการจ่ายเงิน'); 
    });
  });

  it('WK-AUTH-002 Shows error on invalid password', () => {
    seedTestWorker().then(({ username }) => {
      cy.visit('/login');
      cy.getByTestID('login-username').type(username);
      cy.getByTestID('login-password').type('WrongPassword!');
      cy.getByTestID('login-submit').click();

      cy.contains('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง').should('be.visible');
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('WK-AUTH-003 Blocks login for an inactive (deleted) worker', () => {
    seedTestWorker().then(({ worker, username, adminToken }) => {
      // 1. Soft-delete the worker using the Admin API
      cy.request({
        method: 'DELETE',
        url: `${Cypress.apiUrl}/workers/${worker.id}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      }).then(() => {
        // 2. Attempt to log in as the deleted worker
        cy.visit('/login');
        cy.getByTestID('login-username').type(username);
        cy.getByTestID('login-password').type('Password123');
        cy.getByTestID('login-submit').click();

        // 3. Should block login exactly like a wrong password
        cy.contains('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง').should('be.visible');
        cy.location('pathname').should('eq', '/login');
      });
    });
  });

  it('WK-AUTH-004 Logout clears session and redirects to login', () => {
    seedTestWorker().then(({ username }) => {
      // 1. Activate account so the "Set Password" modal doesn't block the screen
      cy.activateAccount(username, 'Password123').then(() => {
        // 2. Log in via UI with the new password
        cy.visit('/login');
        cy.getByTestID('login-username').type(username);
        cy.getByTestID('login-password').type('NewPass123'); // Password was changed by activateAccount
        cy.getByTestID('login-submit').click();
        cy.location('pathname').should('eq', '/dashboard');

        // 3. Perform Logout
        cy.getByTestID('logout-button').click();
        cy.location('pathname').should('eq', '/login');

        // 4. Verify cannot access dashboard without logging in again
        cy.visit('/dashboard');
        cy.location('pathname').should('eq', '/login');
      });
    });
  });
});
