import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { applyTestEnv } from '../helpers/testEnv.js';
import { resetEnvCacheForTests } from '../../src/config/env.js';
import {
  decryptTrelloToken,
  encryptTrelloToken,
  isTrelloTokenEncryptionConfigured,
} from '../../src/modules/trello/trello-token-crypto.js';

const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const PLAINTEXT_TOKEN = 'ATTAsecretPlaintextTokenForUnitTestsOnly';

applyTestEnv();

describe('trello-token-crypto', () => {
  /** @type {string | undefined} */
  let previousKey;

  beforeEach(() => {
    previousKey = process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    resetEnvCacheForTests();
  });

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.TRELLO_TOKEN_ENCRYPTION_KEY = previousKey;
    }
    resetEnvCacheForTests();
  });

  it('isTrelloTokenEncryptionConfigured reflects env presence', () => {
    assert.equal(isTrelloTokenEncryptionConfigured(), true);
    delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    assert.equal(isTrelloTokenEncryptionConfigured(), false);
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
  });

  it('encrypt/decrypt round-trip succeeds', () => {
    const encrypted = encryptTrelloToken(PLAINTEXT_TOKEN);
    assert.ok(encrypted.tokenCiphertext);
    assert.ok(encrypted.tokenIv);
    assert.ok(encrypted.tokenTag);
    assert.equal(encrypted.encryptionKeyVersion, 1);
    assert.equal(encrypted.tokenCiphertext.includes(PLAINTEXT_TOKEN), false);

    const decrypted = decryptTrelloToken({
      tokenCiphertext: encrypted.tokenCiphertext,
      tokenIv: encrypted.tokenIv,
      tokenTag: encrypted.tokenTag,
    });
    assert.equal(decrypted, PLAINTEXT_TOKEN);
  });

  it('rejects missing encryption key with safe error', () => {
    delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    assert.throws(() => encryptTrelloToken(PLAINTEXT_TOKEN), /not configured/);
    assert.throws(
      () =>
        decryptTrelloToken({
          tokenCiphertext: 'YQ==',
          tokenIv: 'AAAAAAAAAAAAAAAA',
          tokenTag: 'AAAAAAAAAAAAAAAAAAAAAA==',
        }),
      /not configured/
    );
  });

  it('rejects invalid key length', () => {
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = Buffer.from('short').toString('base64');
    assert.throws(() => encryptTrelloToken(PLAINTEXT_TOKEN), /32 bytes/);
  });

  it('fails decrypt with wrong key without exposing plaintext', () => {
    const encrypted = encryptTrelloToken(PLAINTEXT_TOKEN);
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString('base64');
    resetEnvCacheForTests();

    assert.throws(
      () =>
        decryptTrelloToken({
          tokenCiphertext: encrypted.tokenCiphertext,
          tokenIv: encrypted.tokenIv,
          tokenTag: encrypted.tokenTag,
        }),
      /Failed to decrypt/
    );
  });

  it('fails decrypt with tampered ciphertext', () => {
    const encrypted = encryptTrelloToken(PLAINTEXT_TOKEN);
    const tampered = `${encrypted.tokenCiphertext.slice(0, -2)}aa`;

    assert.throws(
      () =>
        decryptTrelloToken({
          tokenCiphertext: tampered,
          tokenIv: encrypted.tokenIv,
          tokenTag: encrypted.tokenTag,
        }),
      /Failed to decrypt|Invalid encrypted/
    );
  });
});
