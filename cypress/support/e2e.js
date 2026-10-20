import './commands';

beforeEach(() => {
  cy.task('e2eRun', null, { log: false }).then(run => {
    Cypress.e2eRun = run;
    Cypress.apiUrl = run.apiUrl;
    Cypress.superadminUsername = run.username;
    Cypress.superadminPassword = run.password;
    cy.intercept({ url: '**/api/**', middleware: true }, req => {
      if (!req.url.startsWith(`${run.apiUrl}/`)) {
        throw new Error(`Frontend API target differs from Cypress apiUrl: ${req.url}`);
      }
      req.headers['X-E2E-Run'] = run.id;
      req.headers['X-E2E-Token'] = run.token;
    });
  });
});

// Also covers interactive cypress open. Node after:spec/after:run are fallbacks.
after(() => cy.task('e2eCleanup', null, { log: false }));

Cypress.Commands.overwrite('request', (original, ...args) => {
  const options = typeof args[0] === 'object' ? { ...args[0] }
    : args.length === 1 ? { url: args[0] }
    : { method: args[0], url: args[1], body: args[2] };
  const run = Cypress.e2eRun;
  if (!run || !options.url.startsWith(`${run.apiUrl}/`)) {
    throw new Error('E2E API request must target the managed shared backend');
  }
  options.headers = { ...options.headers, 'X-E2E-Run': run.id, 'X-E2E-Token': run.token };
  return original(options);
});
