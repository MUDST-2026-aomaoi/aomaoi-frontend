import { defineConfig } from 'cypress';
import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 8000,
    env: { apiUrl: 'http://localhost:8081/api' },
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      const apiUrl = String(config.env.apiUrl).replace(/\/$/, '');
      const envPath = '../aomaoi-backend/.env';
      const local = existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {};
      // Management key stays in Node; never put it in Cypress.env or browser storage.
      const key = process.env.E2E_SUPPORT_KEY || local.E2E_SUPPORT_KEY;
      let active;
      let heartbeat;
      let heartbeatError;
      async function call(path, method, headers = {}) {
        const response = await fetch(`${apiUrl}/test-support${path}`, {
          method, headers, signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) throw new Error(`E2E lifecycle ${method} ${path}: HTTP ${response.status}`);
        return response.json();
      }
      async function cleanup() {
        clearInterval(heartbeat);
        if (!active) return null;
        const result = await call(`/runs/${active.id}`, 'DELETE', { 'X-E2E-Support-Key': key });
        if (result.remaining !== 0) throw new Error('E2E cleanup left records behind');
        active = undefined;
        heartbeatError = undefined;
        return result;
      }
      on('task', {
        async e2eRun() {
          if (heartbeatError) throw heartbeatError;
          if (!active) {
            if (!key || key.length < 32) throw new Error('Set E2E_SUPPORT_KEY (32+ characters) in backend .env or the shell, then recreate app. See docs/shared-e2e.md.');
            active = await call('/runs', 'POST', { 'X-E2E-Support-Key': key });
            const current = active;
            heartbeat = setInterval(() => {
              call(`/runs/${current.id}/heartbeat`, 'POST', { 'X-E2E-Token': current.token })
                .catch(error => { if (active === current) heartbeatError = error; });
            }, 60000);
            heartbeat.unref();
          }
          return { ...active, apiUrl };
        },
        e2eCleanup: cleanup,
      });
      on('after:spec', cleanup);
      on('after:run', cleanup);
      return config;
    },
  },
});
