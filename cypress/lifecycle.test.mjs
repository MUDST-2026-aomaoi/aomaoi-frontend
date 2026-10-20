import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../cypress.config.js';

test('lifecycle retains cleanup on failure, retries safely, and does not expose management key', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.E2E_SUPPORT_KEY;
  process.env.E2E_SUPPORT_KEY = 'test-support-key-that-is-longer-than-32-characters';
  const handlers = {};
  const calls = [];
  let cleanupFailure = true;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (options.method === 'DELETE' && cleanupFailure) {
      cleanupFailure = false;
      return { ok: false, status: 503 };
    }
    return {
      ok: true,
      json: async () => options.method === 'DELETE' ? { remaining: 0 }
        : { id: 'run-one', token: 'run-token', username: 'e2e_super_test', password: 'random-password' },
    };
  };
  try {
    config.e2e.setupNodeEvents((name, handler) => { handlers[name] = handler; },
      { env: { apiUrl: 'http://localhost:8081/api' } });
    const run = await handlers.task.e2eRun();
    assert.equal(run.apiUrl, 'http://localhost:8081/api');
    assert.equal(JSON.stringify(run).includes(process.env.E2E_SUPPORT_KEY), false);
    await handlers.task.e2eRun();
    assert.equal(calls.length, 1, 'reuse one run within the spec');
    await assert.rejects(handlers['after:spec'](), /HTTP 503/);
    await handlers['after:run']();
    assert.equal(calls.filter(c => c.options.method === 'DELETE').length, 2);
    assert.equal(await handlers.task.e2eCleanup(), null);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.E2E_SUPPORT_KEY;
    else process.env.E2E_SUPPORT_KEY = originalKey;
  }
});
