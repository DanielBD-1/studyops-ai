import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { getEnv } from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTE_LENGTH = 12;
const KEY_BYTE_LENGTH = 32;
const DEFAULT_ENCRYPTION_KEY_VERSION = 1;

/**
 * @returns {Buffer}
 */
function loadEncryptionKeyBytes() {
  const raw = getEnv().TRELLO_TOKEN_ENCRYPTION_KEY;
  if (!raw?.trim()) {
    throw new Error('TRELLO_TOKEN_ENCRYPTION_KEY is not configured');
  }

  let key;
  try {
    key = Buffer.from(raw.trim(), 'base64');
  } catch {
    throw new Error('TRELLO_TOKEN_ENCRYPTION_KEY must be valid base64');
  }

  if (key.length !== KEY_BYTE_LENGTH) {
    throw new Error('TRELLO_TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
  }

  return key;
}

/**
 * @param {string} plaintext
 * @returns {{
 *   tokenCiphertext: string,
 *   tokenIv: string,
 *   tokenTag: string,
 *   encryptionKeyVersion: number,
 * }}
 */
export function encryptTrelloToken(plaintext) {
  if (typeof plaintext !== 'string' || !plaintext) {
    throw new Error('Trello token is required for encryption');
  }

  const key = loadEncryptionKeyBytes();
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    tokenCiphertext: ciphertext.toString('base64'),
    tokenIv: iv.toString('base64'),
    tokenTag: tag.toString('base64'),
    encryptionKeyVersion: DEFAULT_ENCRYPTION_KEY_VERSION,
  };
}

/**
 * @param {{
 *   tokenCiphertext: string,
 *   tokenIv: string,
 *   tokenTag: string,
 * }} encrypted
 * @returns {string}
 */
export function decryptTrelloToken(encrypted) {
  const key = loadEncryptionKeyBytes();

  let iv;
  let ciphertext;
  let tag;
  try {
    iv = Buffer.from(encrypted.tokenIv, 'base64');
    ciphertext = Buffer.from(encrypted.tokenCiphertext, 'base64');
    tag = Buffer.from(encrypted.tokenTag, 'base64');
  } catch {
    throw new Error('Invalid encrypted Trello token payload');
  }

  if (iv.length !== IV_BYTE_LENGTH) {
    throw new Error('Invalid encrypted Trello token payload');
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    throw new Error('Failed to decrypt Trello token');
  }
}

/**
 * Whether encryption key env is present (does not validate decode length).
 * Reads process.env directly so callers can probe config without warming getEnv cache.
 * @returns {boolean}
 */
export function isTrelloTokenEncryptionConfigured() {
  return Boolean(process.env.TRELLO_TOKEN_ENCRYPTION_KEY?.trim());
}
