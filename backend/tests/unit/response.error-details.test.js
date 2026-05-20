import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

function createMockRes() {
  /** @type {{ statusCode: number, body: unknown }} */
  const state = { statusCode: 0, body: null };
  return {
    status(code) {
      state.statusCode = code;
      return this;
    },
    json(payload) {
      state.body = payload;
      return this;
    },
    getState: () => state,
  };
}

describe('error details by NODE_ENV', () => {
  /** @type {string | undefined} */
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('includes validation details when NODE_ENV is test', async () => {
    process.env.NODE_ENV = 'test';
    const { sendValidationError } = await import('../../src/shared/utils/response.js');
    const res = createMockRes();
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'bad' });
    assert.equal(parsed.success, false);

    sendValidationError(res, parsed.error);
    const { body } = res.getState();
    assert.equal(body.success, false);
    assert.ok(body.error.details);
    assert.ok(Array.isArray(body.error.details.issues));
    assert.ok(body.error.details.issues.length > 0);
  });

  it('includes validation details when NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development';
    const { sendValidationError } = await import('../../src/shared/utils/response.js');
    const res = createMockRes();
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'bad' });
    assert.equal(parsed.success, false);

    sendValidationError(res, parsed.error);
    const { body } = res.getState();
    assert.ok(body.error.details);
  });

  it('omits validation details when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    const { sendValidationError, sendError } = await import('../../src/shared/utils/response.js');
    const res = createMockRes();
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'bad' });
    assert.equal(parsed.success, false);

    sendValidationError(res, parsed.error);
    let { body } = res.getState();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.equal(body.error.details, undefined);

    const res2 = createMockRes();
    sendError(res2, 'SERVER_ERROR', 'Something failed', 500, { reason: 'hidden' });
    body = res2.getState().body;
    assert.equal(body.error.details, undefined);
    assert.equal(body.error.message, 'Something failed');
  });
});
