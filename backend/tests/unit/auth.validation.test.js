import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { registerBodySchema, loginBodySchema } from '../../src/shared/validation/schemas.js';

describe('auth validation schemas', () => {
  it('registerBodySchema accepts valid email and password', () => {
    const result = registerBodySchema.safeParse({
      email: 'student@example.com',
      password: 'secret12',
    });
    assert.equal(result.success, true);
  });

  it('registerBodySchema rejects weak password', () => {
    const result = registerBodySchema.safeParse({
      email: 'student@example.com',
      password: 'short',
    });
    assert.equal(result.success, false);
  });

  it('registerBodySchema rejects unknown role field (strict)', () => {
    const result = registerBodySchema.safeParse({
      email: 'student@example.com',
      password: 'secret12',
      role: 'admin',
    });
    assert.equal(result.success, false);
  });

  it('loginBodySchema requires password', () => {
    const result = loginBodySchema.safeParse({
      email: 'student@example.com',
    });
    assert.equal(result.success, false);
  });
});
