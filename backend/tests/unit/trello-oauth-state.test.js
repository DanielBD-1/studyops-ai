import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomBytes } from 'node:crypto';
import { applyTestEnv } from '../helpers/testEnv.js';
import { resetEnvCacheForTests } from '../../src/config/env.js';
import {
  createTrelloOAuthState,
  verifyTrelloOAuthState,
} from '../../src/modules/trello/trello-oauth-state.js';
import { ApiError } from '../../src/shared/errors/ApiError.js';

const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_USER_ID = '22222222-2222-4222-8222-222222222222';
const TEST_STATE_SECRET = randomBytes(32).toString('base64');
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const TAMPERED_STATE = 'definitely-not-a-valid-state-value';

applyTestEnv();

describe('trello-oauth-state', () => {
  /** @type {string | undefined} */
  let previousStateSecret;
  /** @type {string | undefined} */
  let previousEncryptionKey;

  beforeEach(() => {
    previousStateSecret = process.env.TRELLO_OAUTH_STATE_SECRET;
    previousEncryptionKey = process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    process.env.TRELLO_OAUTH_STATE_SECRET = TEST_STATE_SECRET;
    delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    resetEnvCacheForTests();
  });

  afterEach(() => {
    if (previousStateSecret === undefined) {
      delete process.env.TRELLO_OAUTH_STATE_SECRET;
    } else {
      process.env.TRELLO_OAUTH_STATE_SECRET = previousStateSecret;
    }
    if (previousEncryptionKey === undefined) {
      delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.TRELLO_TOKEN_ENCRYPTION_KEY = previousEncryptionKey;
    }
    resetEnvCacheForTests();
  });

  it('createTrelloOAuthState returns payload.signature format', () => {
    const state = createTrelloOAuthState(TEST_USER_ID);
    const segments = state.split('.');

    assert.equal(segments.length, 2);
    assert.ok(segments[0].length > 0);
    assert.ok(segments[1].length > 0);
  });

  it('valid state verifies for matching userId', () => {
    const state = createTrelloOAuthState(TEST_USER_ID);
    assert.doesNotThrow(() => verifyTrelloOAuthState(state, TEST_USER_ID));
  });

  it('wrong userId fails with TRELLO_OAUTH_STATE_INVALID', () => {
    const state = createTrelloOAuthState(TEST_USER_ID);

    assert.throws(
      () => verifyTrelloOAuthState(state, OTHER_USER_ID),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.code, 'TRELLO_OAUTH_STATE_INVALID');
        assert.equal(err.status, 400);
        assert.equal(err.message, 'Invalid or expired connection request.');
        assert.equal(String(err.message).includes(state), false);
        return true;
      }
    );
  });

  it('tampered payload fails', () => {
    const state = createTrelloOAuthState(TEST_USER_ID);
    const [payloadSegment, signatureSegment] = state.split('.');
    const tamperedPayload = `${payloadSegment}x`;
    const tampered = `${tamperedPayload}.${signatureSegment}`;

    assert.throws(
      () => verifyTrelloOAuthState(tampered, TEST_USER_ID),
      (err) => err instanceof ApiError && err.code === 'TRELLO_OAUTH_STATE_INVALID'
    );
  });

  it('tampered signature fails', () => {
    const state = createTrelloOAuthState(TEST_USER_ID);
    const [payloadSegment] = state.split('.');
    const tampered = `${payloadSegment}.${Buffer.from('bad-signature').toString('base64url')}`;

    assert.throws(
      () => verifyTrelloOAuthState(tampered, TEST_USER_ID),
      (err) => err instanceof ApiError && err.code === 'TRELLO_OAUTH_STATE_INVALID'
    );
  });

  it('expired state fails', () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: TEST_USER_ID,
      n: randomBytes(16).toString('hex'),
      iat: now - 700,
      exp: now - 100,
      pur: 'trello_oauth_connect',
    };
    const payloadSegment = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const key = Buffer.from(TEST_STATE_SECRET, 'base64');
    const signatureSegment = createHmac('sha256', key).update(payloadSegment).digest('base64url');
    const state = `${payloadSegment}.${signatureSegment}`;

    assert.throws(
      () => verifyTrelloOAuthState(state, TEST_USER_ID),
      (err) => err instanceof ApiError && err.code === 'TRELLO_OAUTH_STATE_INVALID'
    );
  });

  it('wrong purpose fails', () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: TEST_USER_ID,
      n: randomBytes(16).toString('hex'),
      iat: now,
      exp: now + 600,
      pur: 'wrong_purpose',
    };
    const payloadSegment = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const key = Buffer.from(TEST_STATE_SECRET, 'base64');
    const signatureSegment = createHmac('sha256', key).update(payloadSegment).digest('base64url');
    const state = `${payloadSegment}.${signatureSegment}`;

    assert.throws(
      () => verifyTrelloOAuthState(state, TEST_USER_ID),
      (err) => err instanceof ApiError && err.code === 'TRELLO_OAUTH_STATE_INVALID'
    );
  });

  it('malformed state fails', () => {
    for (const badState of ['', '   ', 'only-one-segment', '.', '..', 'a.b.c']) {
      assert.throws(
        () => verifyTrelloOAuthState(badState, TEST_USER_ID),
        (err) => err instanceof ApiError && err.code === 'TRELLO_OAUTH_STATE_INVALID'
      );
    }
  });

  it('missing signing config maps safely', () => {
    delete process.env.TRELLO_OAUTH_STATE_SECRET;
    delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    resetEnvCacheForTests();

    assert.throws(
      () => createTrelloOAuthState(TEST_USER_ID),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.code, 'SERVER_ERROR');
        assert.equal(err.status, 503);
        assert.equal(err.message, 'Trello connect is not available');
        return true;
      }
    );
  });

  it('derived signing key works when state secret is missing but encryption key is set', () => {
    delete process.env.TRELLO_OAUTH_STATE_SECRET;
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    resetEnvCacheForTests();

    const state = createTrelloOAuthState(TEST_USER_ID);
    assert.doesNotThrow(() => verifyTrelloOAuthState(state, TEST_USER_ID));
  });

  it('generated nonce differs across calls', () => {
    const first = createTrelloOAuthState(TEST_USER_ID);
    const second = createTrelloOAuthState(TEST_USER_ID);
    assert.notEqual(first, second);
  });

  it('thrown error messages do not contain submitted state', () => {
    try {
      verifyTrelloOAuthState(TAMPERED_STATE, TEST_USER_ID);
      assert.fail('expected throw');
    } catch (err) {
      assert.ok(err instanceof ApiError);
      assert.equal(String(err.message).includes(TAMPERED_STATE), false);
    }
  });
});
