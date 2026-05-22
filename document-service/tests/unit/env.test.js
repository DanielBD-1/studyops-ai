import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../../src/config/env.js';

describe('document-service env validation', () => {
  it('parseEnv requires GEMINI_API_KEY', () => {
    assert.throws(
      () => parseEnv({ NODE_ENV: 'test', PORT: '3002' }),
      /Invalid environment configuration/
    );
  });

  it('parseEnv accepts valid config with fake GEMINI_API_KEY', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      PORT: '3002',
      GEMINI_API_KEY: 'mock-gemini-key-not-real',
    });
    assert.equal(env.PORT, 3002);
    assert.equal(env.GEMINI_API_KEY, 'mock-gemini-key-not-real');
  });

  it('parseEnv rejects invalid PORT', () => {
    assert.throws(
      () =>
        parseEnv({
          PORT: '0',
          GEMINI_API_KEY: 'mock-gemini-key-not-real',
        }),
      /Invalid environment configuration/
    );
  });
});
