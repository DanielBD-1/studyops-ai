import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getEnv } from '../../config/env.js';
import { ApiError } from '../../shared/errors/ApiError.js';

const STATE_PURPOSE = 'trello_oauth_connect';
const STATE_TTL_SECONDS = 600;
const STATE_KEY_BYTE_LENGTH = 32;
const NONCE_BYTE_LENGTH = 16;
const DOMAIN_SEPARATION_MESSAGE = 'studyops-trello-oauth-state-v1';

const STATE_INVALID_ERROR = new ApiError(
  'TRELLO_OAUTH_STATE_INVALID',
  'Invalid or expired connection request.',
  400
);

const CONNECT_UNAVAILABLE_ERROR = new ApiError(
  'SERVER_ERROR',
  'Trello connect is not available',
  503
);

/**
 * @param {Buffer} buffer
 * @returns {string}
 */
function base64urlEncode(buffer) {
  return buffer.toString('base64url');
}

/**
 * @param {string} value
 * @returns {Buffer | null}
 */
function base64urlDecode(value) {
  try {
    return Buffer.from(value, 'base64url');
  } catch {
    return null;
  }
}

/**
 * @param {string} raw
 * @returns {Buffer}
 */
function decodeSecretKey(raw) {
  let key;
  try {
    key = Buffer.from(raw.trim(), 'base64');
  } catch {
    throw CONNECT_UNAVAILABLE_ERROR;
  }

  if (key.length !== STATE_KEY_BYTE_LENGTH) {
    throw CONNECT_UNAVAILABLE_ERROR;
  }

  return key;
}

/**
 * @returns {Buffer}
 */
function loadSigningKeyBytes() {
  const env = getEnv();
  const stateSecret = env.TRELLO_OAUTH_STATE_SECRET?.trim();

  if (stateSecret) {
    return decodeSecretKey(stateSecret);
  }

  const encryptionKeyRaw = env.TRELLO_TOKEN_ENCRYPTION_KEY?.trim();
  if (!encryptionKeyRaw) {
    throw CONNECT_UNAVAILABLE_ERROR;
  }

  const encryptionKey = decodeSecretKey(encryptionKeyRaw);
  return createHmac('sha256', encryptionKey).update(DOMAIN_SEPARATION_MESSAGE).digest();
}

/**
 * @param {string} payloadSegment
 * @returns {string}
 */
function signPayloadSegment(payloadSegment) {
  const key = loadSigningKeyBytes();
  return base64urlEncode(createHmac('sha256', key).update(payloadSegment).digest());
}

/**
 * @throws {ApiError}
 */
function throwStateInvalid() {
  throw STATE_INVALID_ERROR;
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * @param {string} userId
 * @returns {string}
 */
export function createTrelloOAuthState(userId) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    n: randomBytes(NONCE_BYTE_LENGTH).toString('hex'),
    iat: now,
    exp: now + STATE_TTL_SECONDS,
    pur: STATE_PURPOSE,
  };

  const payloadSegment = base64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  const signatureSegment = signPayloadSegment(payloadSegment);
  return `${payloadSegment}.${signatureSegment}`;
}

/**
 * @param {string} state
 * @param {string} expectedUserId
 */
export function verifyTrelloOAuthState(state, expectedUserId) {
  if (typeof state !== 'string' || !state.trim()) {
    throwStateInvalid();
  }

  const segments = state.trim().split('.');
  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    throwStateInvalid();
  }

  const [payloadSegment, signatureSegment] = segments;
  const expectedSignature = signPayloadSegment(payloadSegment);

  const providedSig = base64urlDecode(signatureSegment);
  const expectedSig = base64urlDecode(expectedSignature);

  if (!providedSig || !expectedSig || providedSig.length !== expectedSig.length) {
    throwStateInvalid();
  }

  if (!timingSafeEqual(providedSig, expectedSig)) {
    throwStateInvalid();
  }

  const payloadBytes = base64urlDecode(payloadSegment);
  if (!payloadBytes) {
    throwStateInvalid();
  }

  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(payloadBytes.toString('utf8'));
  } catch {
    throwStateInvalid();
  }

  if (!parsed || typeof parsed !== 'object') {
    throwStateInvalid();
  }

  const record = /** @type {Record<string, unknown>} */ (parsed);

  if (
    !isNonEmptyString(record.sub) ||
    !isNonEmptyString(record.n) ||
    !isFiniteNumber(record.iat) ||
    !isFiniteNumber(record.exp) ||
    record.pur !== STATE_PURPOSE
  ) {
    throwStateInvalid();
  }

  const now = Math.floor(Date.now() / 1000);
  if (record.exp < now) {
    throwStateInvalid();
  }

  if (record.sub !== expectedUserId) {
    throwStateInvalid();
  }
}
