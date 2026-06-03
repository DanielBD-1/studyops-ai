import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../../src/config/env.js';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3001',
  SUPABASE_URL: 'https://example-project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key-not-real',
  SUPABASE_ANON_KEY: 'mock-anon-key-not-real',
  FRONTEND_URL: 'http://localhost:5173',
  DOCUMENT_SERVICE_URL: 'http://localhost:3002',
};

describe('backend env validation', () => {
  it('parseEnv accepts valid mock configuration', () => {
    const env = parseEnv({ ...validEnv });
    assert.equal(env.PORT, 3001);
    assert.equal(env.SUPABASE_URL, validEnv.SUPABASE_URL);
    assert.equal(env.DOCUMENT_SERVICE_URL, 'http://localhost:3002');
  });

  it('parseEnv rejects missing SUPABASE_URL', () => {
    const { SUPABASE_URL: _SUPABASE_URL, ...incomplete } = validEnv;
    assert.throws(() => parseEnv(incomplete), /Invalid environment configuration/);
  });

  it('parseEnv rejects invalid DOCUMENT_SERVICE_URL', () => {
    assert.throws(
      () => parseEnv({ ...validEnv, DOCUMENT_SERVICE_URL: 'not-a-url' }),
      /Invalid environment configuration/
    );
  });

  it('parseEnv accepts missing optional Trello OAuth env vars', () => {
    const env = parseEnv({ ...validEnv });
    assert.equal(env.TRELLO_API_KEY, undefined);
    assert.equal(env.TRELLO_TOKEN_ENCRYPTION_KEY, undefined);
  });

  it('parseEnv accepts optional Trello OAuth placeholders', () => {
    const env = parseEnv({
      ...validEnv,
      TRELLO_API_KEY: 'placeholder-api-key',
      TRELLO_TOKEN_ENCRYPTION_KEY: 'placeholder-encryption-key',
    });
    assert.equal(env.TRELLO_API_KEY, 'placeholder-api-key');
    assert.equal(env.TRELLO_TOKEN_ENCRYPTION_KEY, 'placeholder-encryption-key');
  });
});
