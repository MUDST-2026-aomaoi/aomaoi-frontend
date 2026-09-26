// cy.getByTestID(id) - required selector helper (Lab Week 7)
Cypress.Commands.add('getByTestID', (id) => cy.get(`[data-test="${id}"]`));

// Cypress 16 removed Cypress.env() as a way to read config-time env values
// synchronously, so the backend base URL is exposed here as a plain property
// instead (specs read it as `Cypress.apiUrl`).
Cypress.apiUrl = 'http://localhost:8081/api';

function apiUrl(path) {
  return `${Cypress.apiUrl}${path}`;
}

// Raw login against the backend. Does not touch the app / localStorage.
Cypress.Commands.add('apiLogin', (username, password) => {
  return cy.request({
    method: 'POST',
    url: apiUrl('/auth/login'),
    body: { username, password },
    failOnStatusCode: false,
  });
});

// Writes the zustand-persist shape the app reads on boot, then reloads.
Cypress.Commands.add('setAuthSession', (user, token) => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: { currentUser: user, token, isAuthenticated: true },
        version: 0,
      })
    );
  });
});

// Logs in via API once per (username,password) pair and caches the browser
// session, so specs that are not about the login form skip the login UI.
Cypress.Commands.add('loginSession', (username, password) => {
  cy.session(
    [username, password],
    () => {
      cy.apiLogin(username, password).then((res) => {
        expect(res.status, 'login status').to.eq(200);
        cy.visit('/login');
        cy.setAuthSession(res.body.user, res.body.token);
      });
    },
    {
      validate() {
        cy.window()
          .its('localStorage')
          .invoke('getItem', 'auth-storage')
          .should('exist');
      },
    }
  );
});

// ---- API seeding helpers (farm -> admin -> worker -> work log) ----

Cypress.Commands.add('seedSuperadminToken', () => {
  return cy.apiLogin('superadmin', '1234').then((res) => {
    expect(res.status, 'superadmin login').to.eq(200);
    return res.body.token;
  });
});

Cypress.Commands.add('seedFarm', (name, location, token) => {
  return cy
    .request({
      method: 'POST',
      url: apiUrl('/farms'),
      headers: { Authorization: `Bearer ${token}` },
      body: { name, location },
    })
    .then((res) => res.body);
});

Cypress.Commands.add('seedAdmin', (farm, { fullName, username, phone, tempPassword }, token) => {
  return cy
    .request({
      method: 'POST',
      url: apiUrl('/admins'),
      headers: { Authorization: `Bearer ${token}` },
      body: { fullName, username, phone, tempPassword, farmId: String(farm.id) },
    })
    .then((res) => res.body);
});

// Logs in with the temp password and immediately sets a real password so
// isFirstLogin becomes false. Returns the fresh { token, user }.
Cypress.Commands.add('activateAccount', (username, tempPassword, newPassword = 'NewPass123') => {
  return cy.apiLogin(username, tempPassword).then((loginRes) => {
    expect(loginRes.status, `activate login for ${username}`).to.eq(200);
    const token = loginRes.body.token;
    return cy
      .request({
        method: 'POST',
        url: apiUrl('/auth/change-password'),
        headers: { Authorization: `Bearer ${token}` },
        body: { oldPassword: tempPassword, newPassword },
      })
      .then(() => cy.apiLogin(username, newPassword))
      .then((res) => res.body);
  });
});

// Worker's farmId is taken server-side from the admin's own profile, so this
// MUST be called with that admin's token, not the superadmin's.
Cypress.Commands.add('seedWorker', ({ fullName, nickname, username, phone, tempPassword }, adminToken) => {
  return cy
    .request({
      method: 'POST',
      url: apiUrl('/workers'),
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { fullName, nickname, username, phone, tempPassword },
    })
    .then((res) => res.body);
});

Cypress.Commands.add('seedWorkLog', (payload, adminToken) => {
  return cy
    .request({
      method: 'POST',
      url: apiUrl('/work-logs'),
      headers: { Authorization: `Bearer ${adminToken}` },
      body: payload,
    })
    .then((res) => res.body);
});

// Convenience: farm + a fully-activated admin of that farm, ready to seed
// workers/work-logs under. Requires ../support/testData's runId/uniqueFullName.
Cypress.Commands.add('seedActiveAdminWithFarm', () => {
  const id = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;
  const username = `e2e_adm_${id}`;
  return cy.seedSuperadminToken().then((superToken) =>
    cy.seedFarm(`E2E Farm ${id}`, 'นครปฐม', superToken).then((farm) =>
      cy
        .seedAdmin(farm, { fullName: `แอดมิน ${id}`.replace(/[0-9]/g, ''), username, phone: '0812345678', tempPassword: 'Temp1234' }, superToken)
        .then((admin) =>
          cy.activateAccount(username, 'Temp1234').then(({ token: adminToken }) => ({
            id,
            farm,
            admin,
            username,
            adminToken,
            superToken,
          }))
        )
    )
  );
});
