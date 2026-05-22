import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { AppError } from '../../src/errors.js';
import { PRD_VALID_GEMINI_OUTPUT, VALID_STUDY_TEXT } from '../helpers/fixtures.js';
import { listenApp, postJson } from '../helpers/http.js';

describe('POST /process', () => {
  let port = 0;
  let closeServer = async () => {};
  /** @type {typeof fetch | undefined} */
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = () => {
      throw new Error('fetch must not be called in integration tests');
    };
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
  });

  /**
   * @param {(studyText: string) => Promise<unknown>} geminiGenerate
   */
  async function startWithMock(geminiGenerate) {
    await closeServer();
    const bound = await listenApp(createApp({ geminiGenerate }));
    port = bound.port;
    closeServer = bound.close;
  }

  after(async () => {
    await closeServer();
  });

  it('valid studyText + valid mock JSON returns 200', async () => {
    await startWithMock(async () => PRD_VALID_GEMINI_OUTPUT);

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: VALID_STUDY_TEXT,
    });

    assert.equal(statusCode, 200);
    const json = JSON.parse(body);
    assert.equal(json.success, true);
    assert.equal(json.data.difficulty, 'medium');
  });

  it('missing body field returns 400 VALIDATION_ERROR', async () => {
    await startWithMock(async () => PRD_VALID_GEMINI_OUTPUT);

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {});

    assert.equal(statusCode, 400);
    assert.equal(JSON.parse(body).error.code, 'VALIDATION_ERROR');
  });

  it('99 characters returns 400 VALIDATION_ERROR', async () => {
    await startWithMock(async () => PRD_VALID_GEMINI_OUTPUT);

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: 'x'.repeat(99),
    });

    assert.equal(statusCode, 400);
    assert.equal(JSON.parse(body).error.code, 'VALIDATION_ERROR');
  });

  it('50001 characters returns 400 VALIDATION_ERROR', async () => {
    await startWithMock(async () => PRD_VALID_GEMINI_OUTPUT);

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: 'x'.repeat(50001),
    });

    assert.equal(statusCode, 400);
    assert.equal(JSON.parse(body).error.code, 'VALIDATION_ERROR');
  });

  it('timeout returns 504 GEMINI_TIMEOUT', async () => {
    await startWithMock(async () => {
      throw new AppError(
        'GEMINI_TIMEOUT',
        'Request timed out, please try shorter text',
        504
      );
    });

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: VALID_STUDY_TEXT,
    });

    assert.equal(statusCode, 504);
    assert.equal(JSON.parse(body).error.code, 'GEMINI_TIMEOUT');
  });

  it('API failure returns 500 GEMINI_API_ERROR', async () => {
    await startWithMock(async () => {
      throw new AppError('GEMINI_API_ERROR', 'AI processing failed, please try again', 500);
    });

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: VALID_STUDY_TEXT,
    });

    assert.equal(statusCode, 500);
    assert.equal(JSON.parse(body).error.code, 'GEMINI_API_ERROR');
  });

  it('rate limit returns 429 GEMINI_RATE_LIMIT', async () => {
    await startWithMock(async () => {
      throw new AppError(
        'GEMINI_RATE_LIMIT',
        'Service temporarily unavailable, please wait 1 minute',
        429
      );
    });

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: VALID_STUDY_TEXT,
    });

    assert.equal(statusCode, 429);
    assert.equal(JSON.parse(body).error.code, 'GEMINI_RATE_LIMIT');
  });

  it('non-JSON model output returns 500 GEMINI_INVALID_RESPONSE', async () => {
    await startWithMock(async () => {
      throw new AppError(
        'GEMINI_INVALID_RESPONSE',
        'Invalid response from AI, please try again',
        500
      );
    });

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: VALID_STUDY_TEXT,
    });

    assert.equal(statusCode, 500);
    assert.equal(JSON.parse(body).error.code, 'GEMINI_INVALID_RESPONSE');
  });

  it('JSON failing Zod returns 500 GEMINI_INVALID_RESPONSE', async () => {
    await startWithMock(async () => {
      const { parseAndValidateGeminiOutput } = await import(
        '../../src/services/gemini.service.js'
      );
      return parseAndValidateGeminiOutput(JSON.stringify({ summary: 'too short' }));
    });

    const { statusCode, body } = await postJson(`http://127.0.0.1:${port}/process`, {
      studyText: VALID_STUDY_TEXT,
    });

    assert.equal(statusCode, 500);
    assert.equal(JSON.parse(body).error.code, 'GEMINI_INVALID_RESPONSE');
  });
});
