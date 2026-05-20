import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { registerFormSchema, loginFormSchema } from '../../src/utils/validation.js';

describe('frontend auth validation', () => {
  it('registerFormSchema rejects mismatched passwords', () => {
    const result = registerFormSchema.safeParse({
      email: 'student@example.com',
      password: 'secret12',
      confirmPassword: 'different',
    });
    assert.equal(result.success, false);
  });

  it('loginFormSchema accepts valid credentials shape', () => {
    const result = loginFormSchema.safeParse({
      email: 'student@example.com',
      password: 'any',
    });
    assert.equal(result.success, true);
  });
});
