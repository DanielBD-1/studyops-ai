import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import {
  documentServiceErrorEnvelope,
  documentServiceSuccessEnvelope,
  MOCK_GEMINI_PLAN,
} from '../helpers/mockDocumentService.js';
import { ApiError } from '../../src/shared/errors/ApiError.js';
import {
  processStudyText,
  setDocumentServiceFetchForTests,
} from '../../src/clients/document-service.client.js';

applyTestEnv();

describe('document-service.client', () => {
  afterEach(() => {
    setDocumentServiceFetchForTests(null);
  });

  it('returns plan data on success envelope', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => documentServiceSuccessEnvelope(MOCK_GEMINI_PLAN),
    }));

    const plan = await processStudyText('x'.repeat(100));
    assert.equal(plan.difficulty, 'medium');
  });

  it('maps GEMINI_TIMEOUT to 504', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 504,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_TIMEOUT',
          'Request timed out, please try shorter text',
          504
        ),
    }));

    await assert.rejects(
      () => processStudyText('x'.repeat(100)),
      (err) =>
        err instanceof ApiError &&
        err.code === 'GEMINI_TIMEOUT' &&
        err.status === 504
    );
  });

  it('maps GEMINI_RATE_LIMIT to 429', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 429,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_RATE_LIMIT',
          'Service temporarily unavailable, please wait 1 minute',
          429
        ),
    }));

    await assert.rejects(
      () => processStudyText('x'.repeat(100)),
      (err) => err instanceof ApiError && err.code === 'GEMINI_RATE_LIMIT'
    );
  });

  it('maps GEMINI_API_ERROR to 500', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 500,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_API_ERROR',
          'AI processing failed, please try again',
          500
        ),
    }));

    await assert.rejects(
      () => processStudyText('x'.repeat(100)),
      (err) => err instanceof ApiError && err.code === 'GEMINI_API_ERROR'
    );
  });

  it('maps GEMINI_INVALID_RESPONSE to 500', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 500,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_INVALID_RESPONSE',
          'Invalid response from AI, please try again',
          500
        ),
    }));

    await assert.rejects(
      () => processStudyText('x'.repeat(100)),
      (err) => err instanceof ApiError && err.code === 'GEMINI_INVALID_RESPONSE'
    );
  });

  it('maps network failure to SERVER_ERROR 503', async () => {
    setDocumentServiceFetchForTests(async () => {
      throw new Error('ECONNREFUSED');
    });

    await assert.rejects(
      () => processStudyText('x'.repeat(100)),
      (err) =>
        err instanceof ApiError &&
        err.code === 'SERVER_ERROR' &&
        err.status === 503 &&
        err.message.includes('Processing service unavailable')
    );
  });

  it('maps invalid envelope to SERVER_ERROR 503', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ not: 'envelope' }),
    }));

    await assert.rejects(
      () => processStudyText('x'.repeat(100)),
      (err) => err instanceof ApiError && err.status === 503
    );
  });
});
