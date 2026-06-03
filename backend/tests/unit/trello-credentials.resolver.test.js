import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { applyTestEnv } from '../helpers/testEnv.js';
import { resetEnvCacheForTests } from '../../src/config/env.js';
import { setSupabaseAdminClientForTests, resetSupabaseClientsForTests } from '../../src/config/supabase.js';
import {
  createTrelloConnectionMockSupabaseClient,
  resetMockTrelloConnections,
} from '../helpers/mockSupabaseTrelloConnection.js';
import { upsertConnection } from '../../src/modules/trello/trello-connection.repository.js';
import {
  resolveTrelloBoardListsCredentials,
  resolveTrelloDiscoveryCredentials,
  resolveTrelloSyncRequest,
} from '../../src/modules/trello/trello-credentials.resolver.js';

const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
const TEST_API_KEY = 'test-trello-api-key';
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const STORED_TOKEN = 'ATTAstoredTokenForResolverUnitTests';
const MANUAL_API_KEY = 'manual-api-key';
const MANUAL_TOKEN = 'manual-token';

applyTestEnv();

describe('trello-credentials.resolver', () => {
  /** @type {string | undefined} */
  let previousApiKey;
  /** @type {string | undefined} */
  let previousEncryptionKey;

  beforeEach(() => {
    previousApiKey = process.env.TRELLO_API_KEY;
    previousEncryptionKey = process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    process.env.TRELLO_API_KEY = TEST_API_KEY;
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    resetEnvCacheForTests();
    resetMockTrelloConnections();
    setSupabaseAdminClientForTests(createTrelloConnectionMockSupabaseClient());
  });

  afterEach(() => {
    resetSupabaseClientsForTests();
    if (previousApiKey === undefined) {
      delete process.env.TRELLO_API_KEY;
    } else {
      process.env.TRELLO_API_KEY = previousApiKey;
    }
    if (previousEncryptionKey === undefined) {
      delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.TRELLO_TOKEN_ENCRYPTION_KEY = previousEncryptionKey;
    }
    resetEnvCacheForTests();
  });

  async function seedConnection() {
    await upsertConnection({
      userId: TEST_USER_ID,
      token: STORED_TOKEN,
      scopes: 'read,write',
      trelloMemberId: 'memberResolver123',
      trelloUsername: 'resolver_user',
    });
  }

  it('manual mode returns body credentials without reading stored connection', async () => {
    await seedConnection();

    const result = await resolveTrelloDiscoveryCredentials(TEST_USER_ID, {
      apiKey: MANUAL_API_KEY,
      token: MANUAL_TOKEN,
    });

    assert.deepEqual(result, { apiKey: MANUAL_API_KEY, token: MANUAL_TOKEN });
  });

  it('stored mode returns server apiKey and decrypted token', async () => {
    await seedConnection();

    const result = await resolveTrelloDiscoveryCredentials(TEST_USER_ID, {});

    assert.equal(result.apiKey, TEST_API_KEY);
    assert.equal(result.token, STORED_TOKEN);
  });

  it('stored mode throws TRELLO_NOT_CONNECTED when user has no connection', async () => {
    await assert.rejects(
      () => resolveTrelloDiscoveryCredentials(TEST_USER_ID, {}),
      (err) => {
        assert.equal(err.code, 'TRELLO_NOT_CONNECTED');
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it('partial credentials throw VALIDATION_ERROR', async () => {
    await assert.rejects(
      () => resolveTrelloBoardListsCredentials(TEST_USER_ID, { apiKey: MANUAL_API_KEY }),
      (err) => {
        assert.equal(err.code, 'VALIDATION_ERROR');
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it('stored sync request returns list fields and stored credentials', async () => {
    await seedConnection();

    const result = await resolveTrelloSyncRequest(TEST_USER_ID, {
      listId: 'stored-list-123',
      taskIds: ['11111111-1111-4111-8111-111111111111'],
    });

    assert.equal(result.apiKey, TEST_API_KEY);
    assert.equal(result.token, STORED_TOKEN);
    assert.equal(result.listId, 'stored-list-123');
    assert.deepEqual(result.taskIds, ['11111111-1111-4111-8111-111111111111']);
  });

  it('manual sync request preserves body credentials and sync fields', async () => {
    await seedConnection();

    const result = await resolveTrelloSyncRequest(TEST_USER_ID, {
      apiKey: MANUAL_API_KEY,
      token: MANUAL_TOKEN,
      listId: 'manual-list-123',
      taskIds: ['11111111-1111-4111-8111-111111111111'],
    });

    assert.equal(result.apiKey, MANUAL_API_KEY);
    assert.equal(result.token, MANUAL_TOKEN);
    assert.equal(result.listId, 'manual-list-123');
  });

  it('stored mode throws SERVER_ERROR when TRELLO_API_KEY is missing', async () => {
    await seedConnection();
    delete process.env.TRELLO_API_KEY;
    resetEnvCacheForTests();

    await assert.rejects(
      () => resolveTrelloDiscoveryCredentials(TEST_USER_ID, {}),
      (err) => {
        assert.equal(err.code, 'SERVER_ERROR');
        assert.equal(err.status, 503);
        return true;
      }
    );
  });
});
