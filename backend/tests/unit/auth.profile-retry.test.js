import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../../src/shared/errors/ApiError.js';
import { loadProfileWithBoundedRetry } from '../../src/modules/auth/auth.service.js';

const sampleProfile = {
  id: 'user-uuid',
  email: 'student@example.com',
  role: 'student',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('loadProfileWithBoundedRetry', () => {
  it('returns profile when it exists on the first attempt', async () => {
    let calls = 0;
    const profile = await loadProfileWithBoundedRetry(
      async () => {
        calls += 1;
        return sampleProfile;
      },
      { attempts: 3, delayMs: 0 }
    );

    assert.deepEqual(profile, sampleProfile);
    assert.equal(calls, 1);
  });

  it('returns profile when it appears after one retry', async () => {
    let calls = 0;
    const profile = await loadProfileWithBoundedRetry(
      async () => {
        calls += 1;
        if (calls === 1) {
          throw new ApiError('NOT_FOUND', 'User profile not found', 404);
        }
        return sampleProfile;
      },
      { attempts: 3, delayMs: 0 }
    );

    assert.deepEqual(profile, sampleProfile);
    assert.equal(calls, 2);
  });

  it('throws NOT_FOUND when profile is still missing after all retries', async () => {
    let calls = 0;

    await assert.rejects(
      () =>
        loadProfileWithBoundedRetry(
          async () => {
            calls += 1;
            throw new ApiError('NOT_FOUND', 'User profile not found', 404);
          },
          { attempts: 3, delayMs: 0 }
        ),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.code, 'NOT_FOUND');
        assert.equal(err.status, 404);
        return true;
      }
    );

    assert.equal(calls, 3);
  });

  it('does not retry on non-NOT_FOUND errors', async () => {
    let calls = 0;

    await assert.rejects(
      () =>
        loadProfileWithBoundedRetry(
          async () => {
            calls += 1;
            throw new ApiError('DATABASE_ERROR', 'Failed to load user profile', 500);
          },
          { attempts: 3, delayMs: 0 }
        ),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.code, 'DATABASE_ERROR');
        return true;
      }
    );

    assert.equal(calls, 1);
  });
});
