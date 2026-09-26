import { runId, uniqueFullName } from '../../support/testData';

function seedFreshAdmin() {
  const id = runId();
  const username = `e2e_adm_${id}`;
  return cy.seedSuperadminToken().then((superToken) =>
    cy
      .seedFarm(`E2E Admin Auth Farm ${id}`, 'นครปฐม', superToken)
      .then((farm) =>
        cy
          .seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username, phone: '0812345678', tempPassword: 'Temp1234' }, superToken)
          .then((admin) => ({ farm, admin, username, id }))
      )
  );
}

describe('Admin - first login / logout / route guard', () => {
  it('AD-AUTH-001 forces a password change on first login', () => {
    seedFreshAdmin().then(({ username }) => {
      cy.visit('/login');
      cy.getByTestID('login-username').type(username);
      cy.getByTestID('login-password').type('Temp1234');
      cy.getByTestID('login-submit').click();

      cy.location('pathname').should('eq', '/dashboard');
      cy.contains('Set New Password');

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.getByTestID('setpw-old').type('wrong-old-pass');
      cy.getByTestID('setpw-new').type('NewPass123');
      cy.getByTestID('setpw-confirm').type('NewPass123');
      cy.getByTestID('setpw-submit').click();
      cy.get('@alert').should('have.been.calledWith', 'Failed to change password');
      cy.get('@alert').invoke('resetHistory');

      cy.getByTestID('setpw-old').clear().type('Temp1234');
      cy.getByTestID('setpw-new').clear().type('NewPass123');
      cy.getByTestID('setpw-confirm').clear().type('Mismatch123');
      cy.getByTestID('setpw-submit').click();
      cy.get('@alert').should('have.been.calledWith', 'Passwords do not match');
      cy.get('@alert').invoke('resetHistory');

      cy.getByTestID('setpw-new').clear().type('short');
      cy.getByTestID('setpw-confirm').clear().type('short');
      cy.getByTestID('setpw-submit').click();
      cy.get('@alert').should('have.been.calledWith', 'Password must be at least 6 characters');
      cy.get('@alert').invoke('resetHistory');

      cy.getByTestID('setpw-old').clear().type('Temp1234');
      cy.getByTestID('setpw-new').clear().type('NewPass123');
      cy.getByTestID('setpw-confirm').clear().type('NewPass123');
      cy.getByTestID('setpw-submit').click();

      cy.getByTestID('setpw-success').should('contain', 'Add New Password Successfully!');
      cy.getByTestID('setpw-success-close').click();

      cy.getByTestID('logout-button').click();
      cy.location('pathname').should('eq', '/login');

      cy.getByTestID('login-username').type(username);
      cy.getByTestID('login-password').type('NewPass123');
      cy.getByTestID('login-submit').click();
      cy.location('pathname').should('eq', '/dashboard');
      cy.contains('Set New Password').should('not.exist');
    });
  });

  it('AD-AUTH-002 logout clears the admin session', () => {
    seedFreshAdmin().then(({ username }) => {
      cy.activateAccount(username, 'Temp1234').then(({ user, token }) => {
        cy.visit('/login');
        cy.setAuthSession(user, token);
        cy.visit('/dashboard');
        cy.getByTestID('logout-button').click();
        cy.location('pathname').should('eq', '/login');
        cy.visit('/workers');
        cy.location('pathname').should('eq', '/login');
      });
    });
  });

  it('AD-GUARD-001 admin cannot open superadmin pages', () => {
    seedFreshAdmin().then(({ username }) => {
      cy.activateAccount(username, 'Temp1234');
      cy.loginSession(username, 'NewPass123');
      ['/farms', '/admins', '/audit-logs'].forEach((path) => {
        cy.visit(path);
        cy.location('pathname').should('eq', '/dashboard');
      });
    });
  });

  it('AD-GUARD-002 admin cannot open worker pages', () => {
    seedFreshAdmin().then(({ username }) => {
      cy.activateAccount(username, 'Temp1234');
      cy.loginSession(username, 'NewPass123');
      ['/history', '/balance'].forEach((path) => {
        cy.visit(path);
        cy.location('pathname').should('eq', '/dashboard');
      });
    });
  });

  it('AD-GUARD-003 sidebar shows only admin menus', () => {
    seedFreshAdmin().then(({ username }) => {
      cy.activateAccount(username, 'Temp1234');
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');
      cy.contains('a', 'Dashboard');
      cy.contains('a', 'Workers');
      cy.contains('a', 'Work Log');
      cy.contains('a', 'All Farms').should('not.exist');
      cy.contains('a', 'All Admins').should('not.exist');
      cy.contains('a', 'Audit Logs').should('not.exist');
    });
  });

  it('AD-DASH-001 dashboard "More" opens the work log page', () => {
    seedFreshAdmin().then(({ username }) => {
      cy.activateAccount(username, 'Temp1234');
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');
      cy.getByTestID('dashboard-worklog-more').click();
      cy.location('pathname').should('eq', '/work');
      cy.contains('Work Activity Log');
    });
  });
});
