import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../../src/errors.js';
import { resetEnvForTests } from '../../src/config/env.js';
import {
  buildGeminiPrompt,
  callGeminiApi,
  extractJsonText,
  generateStudyPlan,
  parseAndValidateGeminiOutput,
} from '../../src/services/gemini.service.js';

const PROMPT_PLACEHOLDER = 'x'.repeat(100);
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

describe('buildGeminiPrompt', () => {
  const prompt = buildGeminiPrompt(PROMPT_PLACEHOLDER);

  it('requires JSON-only output without markdown or commentary', () => {
    assert.match(prompt, /single JSON object only/i);
    assert.match(prompt, /No markdown fences/i);
    assert.match(prompt, /No commentary before or after/i);
  });

  it('forbids extra properties beyond the expected shape', () => {
    assert.match(prompt, /no extra top-level or nested properties/i);
    assert.match(prompt, /Do not add properties beyond/i);
  });

  it('states summary minimum of 50 characters', () => {
    assert.match(prompt, /summary:.*50.*2000 characters/i);
    assert.doesNotMatch(prompt, /2-3 sentence/i);
  });

  it('states keyTopics count and non-empty strings', () => {
    assert.match(prompt, /keyTopics:.*1 to 10 non-empty strings/i);
  });

  it('states allowed difficulty enum literals', () => {
    assert.match(prompt, /difficulty: exactly one of "easy", "medium", or "hard"/i);
  });

  it('states task array bounds and field minimums', () => {
    assert.match(prompt, /tasks: array of 1 to 20 objects/i);
    assert.match(prompt, /title: at least 3 characters/i);
    assert.match(prompt, /description: string, 0 to 1000 characters/i);
  });

  it('states task priority enum literals', () => {
    assert.match(prompt, /priority: exactly "low", "medium", or "high"/i);
  });

  it('states estimatedMinutes integer range 5-480', () => {
    assert.match(prompt, /estimatedMinutes: integer.*5 to 480/i);
  });

  it('states tags maximum of 5 strings', () => {
    assert.match(prompt, /tags: array with at most 5 strings/g);
  });

  it('states flashcard array bounds and minimum lengths', () => {
    assert.match(prompt, /flashcards: array of 1 to 30 objects/i);
    assert.match(prompt, /question: at least 10 characters/i);
    assert.match(prompt, /answer: at least 10 characters/i);
    assert.match(prompt, /complete explanation, not a one-word answer/i);
    assert.match(prompt, /expand it until it satisfies the minimum/i);
  });

  it('embeds study material placeholder without logging full prompt in test', () => {
    assert.ok(prompt.includes(PROMPT_PLACEHOLDER));
  });
});

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
