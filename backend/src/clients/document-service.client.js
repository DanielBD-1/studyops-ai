import { getEnv } from '../config/env.js';
import { ApiError } from '../shared/errors/ApiError.js';

const DOCUMENT_SERVICE_TIMEOUT_MS = 35_000;

/** @type {typeof fetch | null} */
let fetchFnOverride = null;

/**
 * @param {typeof fetch | null} fn
 */
export function setDocumentServiceFetchForTests(fn) {
  fetchFnOverride = fn;
}

/**
 * @param {Record<string, unknown>} metadata
 */
function logDocumentServiceEvent(metadata) {
  console.log(
    JSON.stringify({
      service: 'backend',
      component: 'document-service-client',
      ...metadata,
    })
  );
}

/**
 * @param {string} code
 * @returns {{ message: string, status: number }}
 */
function mapDocumentServiceError(code) {
  switch (code) {
    case 'VALIDATION_ERROR':
      return { message: 'Invalid request data', status: 400 };
    case 'GEMINI_TIMEOUT':
      return {
        message: 'Request timed out, please try shorter text',
        status: 504,
      };
    case 'GEMINI_RATE_LIMIT':
      return {
        message: 'Service temporarily unavailable, please wait 1 minute',
        status: 429,
      };
    case 'GEMINI_API_ERROR':
      return { message: 'AI processing failed, please try again', status: 500 };
    case 'GEMINI_INVALID_RESPONSE':
      return {
        message: 'Invalid response from AI, please try again',
        status: 500,
      };
    default:
      return {
        message: 'Processing service unavailable, please try later',
        status: 503,
      };
  }
}

/**
 * @param {string} studyText
 * @returns {Promise<Record<string, unknown>>}
 */
export async function processStudyText(studyText) {
  const { DOCUMENT_SERVICE_URL } = getEnv();
  const base = DOCUMENT_SERVICE_URL.replace(/\/$/, '');
  const url = `${base}/process`;
  const fetchFn = fetchFnOverride ?? fetch;
  const contentLength = studyText.length;
  const startedAt = Date.now();

  let response;
  try {
    response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(DOCUMENT_SERVICE_TIMEOUT_MS),
      body: JSON.stringify({ studyText }),
    });
  } catch {
    const durationMs = Date.now() - startedAt;
    logDocumentServiceEvent({
      event: 'document_service_unreachable',
      durationMs,
      contentLength,
      documentServiceErrorCode: 'SERVER_ERROR',
    });
    throw new ApiError(
      'SERVER_ERROR',
      'Processing service unavailable, please try later',
      503
    );
  }

  const durationMs = Date.now() - startedAt;
  const httpStatus = response.status;

  let payload;
  try {
    payload = await response.json();
  } catch {
    logDocumentServiceEvent({
      event: 'document_service_invalid_envelope',
      durationMs,
      contentLength,
      httpStatus,
      documentServiceErrorCode: 'SERVER_ERROR',
    });
    throw new ApiError(
      'SERVER_ERROR',
      'Processing service unavailable, please try later',
      503
    );
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.success !== 'boolean'
  ) {
    logDocumentServiceEvent({
      event: 'document_service_invalid_envelope',
      durationMs,
      contentLength,
      httpStatus,
      documentServiceErrorCode: 'SERVER_ERROR',
    });
    throw new ApiError(
      'SERVER_ERROR',
      'Processing service unavailable, please try later',
      503
    );
  }

  if (payload.success === true) {
    if (!payload.data || typeof payload.data !== 'object') {
      logDocumentServiceEvent({
        event: 'document_service_missing_plan',
        durationMs,
        contentLength,
        httpStatus,
        documentServiceErrorCode: 'GEMINI_INVALID_RESPONSE',
      });
      throw new ApiError(
        'GEMINI_INVALID_RESPONSE',
        'Invalid response from AI, please try again',
        500
      );
    }

    logDocumentServiceEvent({
      event: 'document_service_success',
      durationMs,
      contentLength,
      httpStatus,
    });

    return /** @type {Record<string, unknown>} */ (payload.data);
  }

  const code =
    payload.error &&
    typeof payload.error === 'object' &&
    typeof payload.error.code === 'string'
      ? payload.error.code
      : 'SERVER_ERROR';
  const mapped = mapDocumentServiceError(code);

  logDocumentServiceEvent({
    event: 'document_service_error',
    durationMs,
    contentLength,
    httpStatus,
    documentServiceErrorCode: code,
  });

  throw new ApiError(mapped.status === 503 ? 'SERVER_ERROR' : code, mapped.message, mapped.status);
}
