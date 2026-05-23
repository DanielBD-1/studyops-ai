import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_GEMINI_MODEL,
  parseEnv,
} from '../../src/config/env.js';

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
    assert.equal(env.GEMINI_MODEL, DEFAULT_GEMINI_MODEL);
  });

  it('parseEnv defaults GEMINI_MODEL to gemini-2.5-flash-lite when omitted', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      PORT: '3002',
      GEMINI_API_KEY: 'mock-gemini-key-not-real',
    });
    assert.equal(env.GEMINI_MODEL, 'gemini-2.5-flash-lite');
  });

  it('parseEnv accepts explicit GEMINI_MODEL', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      PORT: '3002',
      GEMINI_API_KEY: 'mock-gemini-key-not-real',
      GEMINI_MODEL: 'gemini-2.5-flash',
    });
    assert.equal(env.GEMINI_MODEL, 'gemini-2.5-flash');
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
