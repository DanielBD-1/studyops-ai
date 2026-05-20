import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../../src/config/env.js';

describe('document-service env validation', () => {
  it('parseEnv accepts PORT only (GEMINI optional)', () => {
    const env = parseEnv({ NODE_ENV: 'test', PORT: '3002' });
    assert.equal(env.PORT, 3002);
    assert.equal(env.GEMINI_API_KEY, undefined);
  });

  it('parseEnv accepts optional GEMINI_API_KEY placeholder', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      PORT: '3002',
      GEMINI_API_KEY: 'mock-gemini-key-not-real',
    });
    assert.equal(env.GEMINI_API_KEY, 'mock-gemini-key-not-real');
  });

  it('parseEnv rejects invalid PORT', () => {
    assert.throws(() => parseEnv({ PORT: '0' }), /Invalid environment configuration/);
  });
});
