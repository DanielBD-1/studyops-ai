import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../../src/errors.js';
import { resetEnvForTests } from '../../src/config/env.js';
import {
  callGeminiApi,
  extractJsonText,
  generateStudyPlan,
  parseAndValidateGeminiOutput,
} from '../../src/services/gemini.service.js';
import { PRD_VALID_GEMINI_OUTPUT } from '../helpers/fixtures.js';

/** @param {unknown} url */
function urlString(url) {
  return typeof url === 'string' ? url : url instanceof URL ? url.href : String(url);
}

function geminiSuccessFetch() {
  return async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(PRD_VALID_GEMINI_OUTPUT) }],
          },
        },
      ],
    }),
  });
}

describe('gemini.service helpers', () => {
  it('extractJsonText strips markdown fences', () => {
    const inner = JSON.stringify({ ok: true });
    assert.equal(extractJsonText('```json\n' + inner + '\n```'), inner);
  });

  it('parseAndValidateGeminiOutput accepts valid JSON string', () => {
    const data = parseAndValidateGeminiOutput(JSON.stringify(PRD_VALID_GEMINI_OUTPUT));
    assert.equal(data.difficulty, 'medium');
  });

  it('parseAndValidateGeminiOutput rejects non-JSON', () => {
    assert.throws(
      () => parseAndValidateGeminiOutput('not-json'),
      (err) => err instanceof AppError && err.code === 'GEMINI_INVALID_RESPONSE'
    );
  });
});

describe('callGeminiApi (mocked fetch)', () => {
  it('maps HTTP 429 to GEMINI_RATE_LIMIT', async () => {
    await assert.rejects(
      () =>
        callGeminiApi('x'.repeat(100), {
          apiKey: 'fake-key',
          fetchFn: async () => ({ ok: false, status: 429, json: async () => ({}) }),
        }),
      (err) => err instanceof AppError && err.code === 'GEMINI_RATE_LIMIT'
    );
  });

  it('maps timeout to GEMINI_TIMEOUT', async () => {
    await assert.rejects(
      () =>
        callGeminiApi('x'.repeat(100), {
          apiKey: 'fake-key',
          fetchFn: async () => {
            const err = new Error('aborted');
            err.name = 'TimeoutError';
            throw err;
          },
        }),
      (err) => err instanceof AppError && err.code === 'GEMINI_TIMEOUT'
    );
  });

  it('maps HTTP 500 to GEMINI_API_ERROR', async () => {
    await assert.rejects(
      () =>
        callGeminiApi('x'.repeat(100), {
          apiKey: 'fake-key',
          fetchFn: async () => ({ ok: false, status: 500, json: async () => ({}) }),
        }),
      (err) => err instanceof AppError && err.code === 'GEMINI_API_ERROR'
    );
  });

  it('returns validated output when fetchFn returns Gemini API shape', async () => {
    const data = await callGeminiApi('x'.repeat(100), {
      apiKey: 'fake-key',
      fetchFn: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(PRD_VALID_GEMINI_OUTPUT) }],
              },
            },
          ],
        }),
      }),
    });
    assert.equal(data.summary, PRD_VALID_GEMINI_OUTPUT.summary);
  });
});

describe('generateStudyPlan (mocked fetch)', () => {
  const originalFetch = globalThis.fetch;
  const envSnapshot = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  };

  function restoreProcessEnv() {
    if (envSnapshot.GEMINI_API_KEY === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = envSnapshot.GEMINI_API_KEY;
    }
    if (envSnapshot.GEMINI_MODEL === undefined) {
      delete process.env.GEMINI_MODEL;
    } else {
      process.env.GEMINI_MODEL = envSnapshot.GEMINI_MODEL;
    }
    resetEnvForTests();
  }

  it('uses default gemini-2.5-flash-lite when GEMINI_MODEL is unset', async () => {
    process.env.GEMINI_API_KEY = 'mock-gemini-key-not-real';
    delete process.env.GEMINI_MODEL;
    resetEnvForTests();

    let capturedUrl = '';
    globalThis.fetch = async (url) => {
      capturedUrl = urlString(url);
      return geminiSuccessFetch()();
    };

    try {
      await generateStudyPlan('x'.repeat(100));
      assert.match(capturedUrl, /\/gemini-2\.5-flash-lite:generateContent/);
    } finally {
      globalThis.fetch = originalFetch;
      restoreProcessEnv();
    }
  });

  it('uses configured GEMINI_MODEL from env in API URL', async () => {
    process.env.GEMINI_API_KEY = 'mock-gemini-key-not-real';
    process.env.GEMINI_MODEL = 'gemini-2.5-flash';
    resetEnvForTests();

    let capturedUrl = '';
    globalThis.fetch = async (url) => {
      capturedUrl = urlString(url);
      return geminiSuccessFetch()();
    };

    try {
      await generateStudyPlan('x'.repeat(100));
      assert.match(capturedUrl, /\/gemini-2\.5-flash:generateContent/);
    } finally {
      globalThis.fetch = originalFetch;
      restoreProcessEnv();
    }
  });
});
