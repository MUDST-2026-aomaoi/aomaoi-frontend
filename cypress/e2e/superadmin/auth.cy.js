import { runId } from '../../support/testData';

describe('Superadmin - login / logout / route guard', () => {
  it('SA-AUTH-001 logs in as superadmin', () => {
    cy.visit('/login');
    cy.getByTestID('login-username').type('superadmin');
    cy.getByTestID('login-password').type('1234');
    cy.getByTestID('login-submit').click();

    cy.location('pathname').should('eq', '/dashboard');
    cy.contains('All Farms');
    cy.contains('All Admins');
    cy.contains('Audit Logs');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'auth-storage')
      .then((raw) => {
        const parsed = JSON.parse(raw);
        expect(parsed.state.isAuthenticated).to.eq(true);
        expect(parsed.state.currentUser.role).to.eq('superadmin');
      });
  });

  it('SA-AUTH-002 rejects the wrong password', () => {
    cy.visit('/login');
    cy.getByTestID('login-username').type('superadmin');
    cy.getByTestID('login-password').type('wrong-pass');
    cy.getByTestID('login-submit').click();

    cy.getByTestID('login-error').should('contain', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    cy.location('pathname').should('eq', '/login');
  });

  it('SA-AUTH-003 rejects an unknown user', () => {
    cy.visit('/login');
    cy.getByTestID('login-username').type(`nouser_${runId()}`);
    cy.getByTestID('login-password').type('123456');
    cy.getByTestID('login-submit').click();

    cy.getByTestID('login-error').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('SA-AUTH-004 blocks submit with empty fields', () => {
    cy.visit('/login');
    cy.getByTestID('login-submit').click();
    cy.location('pathname').should('eq', '/login');
    cy.getByTestID('login-error').should('not.exist');
  });

  it('SA-AUTH-005 logout clears the session', () => {
    cy.loginSession('superadmin', '1234');
    cy.visit('/dashboard');
    cy.getByTestID('logout-button').click();

    cy.location('pathname').should('eq', '/login');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'auth-storage')
      .then((raw) => {
        expect(JSON.parse(raw).state.isAuthenticated).to.eq(false);
      });

    cy.visit('/dashboard');
    cy.location('pathname').should('eq', '/login');
  });

  it('SA-GUARD-001 blocks every protected route when logged out', () => {
    ['/dashboard', '/farms', '/admins', '/audit-logs', '/workers', '/work', '/history'].forEach((path) => {
      cy.visit(path);
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('SA-GUARD-002 falls back to the dashboard on an unknown route', () => {
    cy.loginSession('superadmin', '1234');
    cy.visit('/some-unknown-page');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('SA-GUARD-003 blocks admin/worker pages for superadmin', () => {
    cy.loginSession('superadmin', '1234');
    ['/workers', '/work', '/history'].forEach((path) => {
      cy.visit(path);
      cy.location('pathname').should('eq', '/dashboard');
    });
  });

  it('SA-GUARD-004 sidebar shows only superadmin menus', () => {
    cy.loginSession('superadmin', '1234');
    cy.visit('/dashboard');
    cy.contains('a', 'Dashboard');
    cy.contains('a', 'All Farms');
    cy.contains('a', 'All Admins');
    cy.contains('a', 'Audit Logs');
    cy.contains('a', 'Workers').should('not.exist');
    cy.contains('a', 'Work Log').should('not.exist');
  });
});
