import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    defaultCommandTimeout: 8000,
    env: {
      apiUrl: 'http://localhost:8082/api',
    },
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      on('before:run', async () => {
        if (config.env.e2eDatabaseTarget !== 'disposable') {
          throw new Error('Set --env e2eDatabaseTarget=disposable to confirm Cypress is targeting its isolated test database.');
        }

        let readiness;
        try {
          const response = await fetch('http://localhost:8082/api/test-support/e2e-readiness');
          if (!response.ok) {
            throw new Error(`readiness endpoint returned HTTP ${response.status}`);
          }
          readiness = await response.json();
        } catch (error) {
          throw new Error(`Could not verify the isolated E2E database; refusing to run: ${error.message}`);
        }

        if (readiness.safeForE2e !== true) {
          throw new Error('Backend is not connected to the isolated aomaoi_test database; refusing to run data-writing E2E tests.');
        }
      });
      return config;
    },
  },
});
