import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { applyTestEnv } from '../helpers/testEnv.js';
import { resetEnvCacheForTests } from '../../src/config/env.js';
import { setSupabaseAdminClientForTests, resetSupabaseClientsForTests } from '../../src/config/supabase.js';
import {
  createTrelloConnectionMockSupabaseClient,
  resetMockTrelloConnections,
  getMockTrelloConnections,
  assertNoPlaintextTrelloTokenInValue,
} from '../helpers/mockSupabaseTrelloConnection.js';
import {
  decryptTokenForUser,
  deleteConnectionByUserId,
  getConnectionByUserId,
  updateConnectionDefaults,
  upsertConnection,
} from '../../src/modules/trello/trello-connection.repository.js';

const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const PLAINTEXT_TOKEN = 'ATTAsecretPlaintextTokenForUnitTestsOnly';

applyTestEnv();

describe('trello-connection.repository', () => {
  /** @type {string | undefined} */
  let previousKey;

  beforeEach(() => {
    previousKey = process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    resetEnvCacheForTests();
    resetMockTrelloConnections();
    setSupabaseAdminClientForTests(createTrelloConnectionMockSupabaseClient());
  });

  afterEach(() => {
    resetSupabaseClientsForTests();
    if (previousKey === undefined) {
      delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.TRELLO_TOKEN_ENCRYPTION_KEY = previousKey;
    }
    resetEnvCacheForTests();
  });

  it('getConnectionByUserId returns null when missing', async () => {
    const result = await getConnectionByUserId(TEST_USER_ID);
    assert.equal(result, null);
  });

  it('upsertConnection stores encrypted token and returns sanitized metadata', async () => {
    const metadata = await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read,write',
      trelloMemberId: 'trelloMember123',
      trelloUsername: 'studyops_user',
      expirationPolicy: 'never',
    });

    assert.equal(metadata.userId, TEST_USER_ID);
    assert.equal(metadata.trelloMemberId, 'trelloMember123');
    assert.equal(metadata.trelloUsername, 'studyops_user');
    assert.equal(metadata.scopes, 'read,write');
    assertNoPlaintextTrelloTokenInValue(metadata);

    const stored = getMockTrelloConnections().get(TEST_USER_ID);
    assert.ok(stored);
    assert.equal(stored.token_ciphertext.includes(PLAINTEXT_TOKEN), false);
    assert.ok(stored.token_iv);
    assert.ok(stored.token_tag);
  });

  it('decryptTokenForUser returns plaintext for backend use only', async () => {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read,write',
      trelloMemberId: 'trelloMember123',
    });

    const token = await decryptTokenForUser(TEST_USER_ID);
    assert.equal(token, PLAINTEXT_TOKEN);
  });

  it('decryptTokenForUser returns null when not connected', async () => {
    const token = await decryptTokenForUser(TEST_USER_ID);
    assert.equal(token, null);
  });

  it('deleteConnectionByUserId removes row', async () => {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read',
      trelloMemberId: 'member',
    });

    const deleted = await deleteConnectionByUserId(TEST_USER_ID);
    assert.equal(deleted, true);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
    assert.equal(await getConnectionByUserId(TEST_USER_ID), null);
    assert.equal(await decryptTokenForUser(TEST_USER_ID), null);
  });

  it('deleteConnectionByUserId is idempotent when missing', async () => {
    const deleted = await deleteConnectionByUserId(TEST_USER_ID);
    assert.equal(deleted, false);
  });

  it('upsert replaces existing user connection', async () => {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read',
      trelloMemberId: 'first',
    });

    await upsertConnection({
      userId: TEST_USER_ID,
      token: 'ATTAsecondTokenValueForTests',
      scopes: 'read,write',
      trelloMemberId: 'second',
    });

    assert.equal(getMockTrelloConnections().size, 1);
    const metadata = await getConnectionByUserId(TEST_USER_ID);
    assert.equal(metadata?.trelloMemberId, 'second');
    assert.equal(metadata?.scopes, 'read,write');
    assert.equal(await decryptTokenForUser(TEST_USER_ID), 'ATTAsecondTokenValueForTests');
  });

  it('updateConnectionDefaults stores board and list ids', async () => {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read,write',
      trelloMemberId: 'trelloMember123',
    });

    const metadata = await updateConnectionDefaults(TEST_USER_ID, {
      boardId: 'boardSaved123',
      listId: 'listSaved456',
    });

    assert.equal(metadata.defaultBoardId, 'boardSaved123');
    assert.equal(metadata.defaultListId, 'listSaved456');
    assertNoPlaintextTrelloTokenInValue(metadata);
  });

  it('updateConnectionDefaults throws TRELLO_NOT_CONNECTED when missing row', async () => {
    await assert.rejects(
      () =>
        updateConnectionDefaults(TEST_USER_ID, {
          boardId: 'boardSaved123',
          listId: 'listSaved456',
        }),
      (err) => {
        assert.equal(err.code, 'TRELLO_NOT_CONNECTED');
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it('upsertConnection preserves defaults when reconnecting same trello member', async () => {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read,write',
      trelloMemberId: 'trelloMember123',
    });

    await updateConnectionDefaults(TEST_USER_ID, {
      boardId: 'boardSaved123',
      listId: 'listSaved456',
    });

    await upsertConnection({
      userId: TEST_USER_ID,
      token: 'ATTAsecondTokenValueForTests',
      scopes: 'read,write',
      trelloMemberId: 'trelloMember123',
    });

    const metadata = await getConnectionByUserId(TEST_USER_ID);
    assert.equal(metadata?.defaultBoardId, 'boardSaved123');
    assert.equal(metadata?.defaultListId, 'listSaved456');
  });

  it('upsertConnection clears defaults when reconnecting different trello member', async () => {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: PLAINTEXT_TOKEN,
      scopes: 'read,write',
      trelloMemberId: 'trelloMember123',
    });

    await updateConnectionDefaults(TEST_USER_ID, {
      boardId: 'boardSaved123',
      listId: 'listSaved456',
    });

    await upsertConnection({
      userId: TEST_USER_ID,
      token: 'ATTAsecondTokenValueForTests',
      scopes: 'read,write',
      trelloMemberId: 'differentMember999',
    });

    const metadata = await getConnectionByUserId(TEST_USER_ID);
    assert.equal(metadata?.defaultBoardId, null);
    assert.equal(metadata?.defaultListId, null);
  });
});
