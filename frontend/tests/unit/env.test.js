import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../../src/config/env.js';

const validEnv = {
  VITE_API_URL: 'http://localhost:3001',
  VITE_SUPABASE_URL: 'https://example-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-anon-key-not-real',
};

describe('frontend env validation', () => {
  it('parseEnv accepts valid mock VITE_* variables', () => {
    const env = parseEnv({ ...validEnv });
    assert.equal(env.VITE_API_URL, validEnv.VITE_API_URL);
    assert.equal(env.VITE_SUPABASE_ANON_KEY, validEnv.VITE_SUPABASE_ANON_KEY);
  });

  it('parseEnv rejects missing VITE_SUPABASE_ANON_KEY', () => {
    const { VITE_SUPABASE_ANON_KEY: _VITE_SUPABASE_ANON_KEY, ...incomplete } = validEnv;
    assert.throws(() => parseEnv(incomplete), /Invalid frontend environment/);
  });

  it('parseEnv rejects non-URL VITE_API_URL', () => {
    assert.throws(
      () => parseEnv({ ...validEnv, VITE_API_URL: 'not-a-url' }),
      /Invalid frontend environment/
    );
  });
});
