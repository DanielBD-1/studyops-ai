import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { decryptTrelloToken, encryptTrelloToken } from './trello-token-crypto.js';

const CONNECTION_COLUMNS =
  'user_id, scopes, expiration_policy, expires_at, trello_member_id, trello_username, default_board_id, default_list_id, connected_at, updated_at, encryption_key_version';

const CONNECTION_ROW_COLUMNS = `${CONNECTION_COLUMNS}, token_ciphertext, token_iv, token_tag`;

/**
 * @typedef {Object} TrelloConnectionMetadata
 * @property {string} userId
 * @property {string} trelloMemberId
 * @property {string | null} trelloUsername
 * @property {string} scopes
 * @property {string | null} expirationPolicy
 * @property {string | null} expiresAt
 * @property {string | null} defaultBoardId
 * @property {string | null} defaultListId
 * @property {string} connectedAt
 * @property {string} updatedAt
 * @property {number} encryptionKeyVersion
 */

/**
 * @param {Record<string, unknown>} row
 * @returns {TrelloConnectionMetadata}
 */
function toConnectionMetadata(row) {
  return {
    userId: String(row.user_id),
    trelloMemberId: String(row.trello_member_id),
    trelloUsername: row.trello_username == null ? null : String(row.trello_username),
    scopes: String(row.scopes),
    expirationPolicy: row.expiration_policy == null ? null : String(row.expiration_policy),
    expiresAt: row.expires_at == null ? null : String(row.expires_at),
    defaultBoardId: row.default_board_id == null ? null : String(row.default_board_id),
    defaultListId: row.default_list_id == null ? null : String(row.default_list_id),
    connectedAt: String(row.connected_at),
    updatedAt: String(row.updated_at),
    encryptionKeyVersion: Number(row.encryption_key_version),
  };
}

/**
 * @param {string} userId
 * @returns {Promise<TrelloConnectionMetadata | null>}
 */
export async function getConnectionByUserId(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('trello_connections')
    .select(CONNECTION_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load Trello connection', 500);
  }

  if (!data) {
    return null;
  }

  return toConnectionMetadata(data);
}

/**
 * @param {string} userId
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function loadConnectionRowForUser(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('trello_connections')
    .select(CONNECTION_ROW_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load Trello connection', 500);
  }

  return data ?? null;
}

/**
 * @param {{
 *   userId: string,
 *   token: string,
 *   scopes: string,
 *   trelloMemberId: string,
 *   trelloUsername?: string | null,
 *   expirationPolicy?: string | null,
 *   expiresAt?: string | null,
 *   defaultBoardId?: string | null,
 *   defaultListId?: string | null,
 * }} input
 * @returns {Promise<TrelloConnectionMetadata>}
 */
export async function upsertConnection(input) {
  const {
    userId,
    token,
    scopes,
    trelloMemberId,
    trelloUsername = null,
    expirationPolicy = null,
    expiresAt = null,
    defaultBoardId = null,
    defaultListId = null,
  } = input;

  const encrypted = encryptTrelloToken(token);

  const row = {
    user_id: userId,
    token_ciphertext: encrypted.tokenCiphertext,
    token_iv: encrypted.tokenIv,
    token_tag: encrypted.tokenTag,
    encryption_key_version: encrypted.encryptionKeyVersion,
    scopes,
    expiration_policy: expirationPolicy,
    expires_at: expiresAt,
    trello_member_id: trelloMemberId,
    trello_username: trelloUsername,
    default_board_id: defaultBoardId,
    default_list_id: defaultListId,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await getSupabaseAdmin()
    .from('trello_connections')
    .upsert(row, { onConflict: 'user_id' })
    .select(CONNECTION_COLUMNS)
    .single();

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to save Trello connection', 500);
  }

  return toConnectionMetadata(data);
}

/**
 * @param {string} userId
 * @returns {Promise<boolean>} true if a row was removed
 */
export async function deleteConnectionByUserId(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('trello_connections')
    .delete()
    .eq('user_id', userId)
    .select('user_id');

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to remove Trello connection', 500);
  }

  return Array.isArray(data) && data.length > 0;
}

/**
 * @param {string} userId
 * @returns {Promise<string | null>}
 */
export async function decryptTokenForUser(userId) {
  const row = await loadConnectionRowForUser(userId);
  if (!row) {
    return null;
  }

  return decryptTrelloToken({
    tokenCiphertext: String(row.token_ciphertext),
    tokenIv: String(row.token_iv),
    tokenTag: String(row.token_tag),
  });
}
