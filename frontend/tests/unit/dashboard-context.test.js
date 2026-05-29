import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createDashboardRefreshNotifier } from '../../src/context/dashboardRefreshNotifier.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dashboardContextSource = readFileSync(
  join(__dirname, '../../src/context/dashboardRefreshNotifier.js'),
  'utf8'
);

/**
 * @returns {Promise<void>}
 */
function flushMicrotasks() {
  return new Promise((resolve) => {
    queueMicrotask(resolve);
  });
}

describe('createDashboardRefreshNotifier', () => {
  it('refreshStats notifies subscribers after microtask flush', async () => {
    const notifier = createDashboardRefreshNotifier();
    let callCount = 0;
    let lastGeneration = 0;

    notifier.subscribe((generation) => {
      callCount += 1;
      lastGeneration = generation;
    });

    notifier.refreshStats();
    assert.equal(callCount, 0);

    await flushMicrotasks();

    assert.equal(callCount, 1);
    assert.equal(lastGeneration, 1);
    assert.equal(notifier.getGeneration(), 1);
  });

  it('unsubscribe stops notifications', async () => {
    const notifier = createDashboardRefreshNotifier();
    let callCount = 0;

    const unsubscribe = notifier.subscribe(() => {
      callCount += 1;
    });

    unsubscribe();
    notifier.refreshStats();
    await flushMicrotasks();

    assert.equal(callCount, 0);
  });

  it('coalesces duplicate refreshStats calls before flush', async () => {
    const notifier = createDashboardRefreshNotifier();
    let callCount = 0;

    notifier.subscribe(() => {
      callCount += 1;
    });

    notifier.refreshStats();
    notifier.refreshStats();
    notifier.refreshStats();

    await flushMicrotasks();

    assert.equal(callCount, 1);
    assert.equal(notifier.getGeneration(), 1);
  });

  it('notifies again after a subsequent refreshStats flush', async () => {
    const notifier = createDashboardRefreshNotifier();
    let callCount = 0;

    notifier.subscribe(() => {
      callCount += 1;
    });

    notifier.refreshStats();
    await flushMicrotasks();
    notifier.refreshStats();
    await flushMicrotasks();

    assert.equal(callCount, 2);
    assert.equal(notifier.getGeneration(), 2);
  });
});

describe('DashboardContext security boundaries', () => {
  it('does not call Supabase, external APIs, or store stats in context source', () => {
    assert.equal(dashboardContextSource.includes('getSupabaseBrowser'), false);
    assert.equal(dashboardContextSource.includes('getDashboardStats'), false);
    assert.equal(dashboardContextSource.includes('localStorage'), false);
    assert.equal(dashboardContextSource.includes('sessionStorage'), false);
    assert.equal(dashboardContextSource.includes('BroadcastChannel'), false);
    assert.equal(dashboardContextSource.includes('setInterval'), false);
    assert.equal(dashboardContextSource.includes('WebSocket'), false);
    assert.equal(dashboardContextSource.includes('console.'), false);
  });
});
