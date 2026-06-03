import { deleteToken, getMemberMe, trelloClientErrorMessage } from '../../clients/trello.client.js';
import { getEnv } from '../../config/env.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import {
  decryptTokenForUser,
  deleteConnectionByUserId,
  getConnectionByUserId,
  upsertConnection,
} from './trello-connection.repository.js';
import { createTrelloOAuthState, verifyTrelloOAuthState } from './trello-oauth-state.js';

const TRELLO_AUTHORIZE_BASE = 'https://trello.com/1/authorize';
const TRELLO_SCOPES = 'read,write';
const TRELLO_EXPIRATION = 'never';
const TRELLO_APP_NAME = 'StudyOps';

/**
 * @returns {string}
 */
export function requireTrelloApiKey() {
  const apiKey = getEnv().TRELLO_API_KEY?.trim();
  if (!apiKey) {
    throw new ApiError('SERVER_ERROR', 'Trello connect is not available', 503);
  }
  return apiKey;
}

/**
 * @param {import('./trello-connection.repository.js').TrelloConnectionMetadata} metadata
 */
function mapMetadataToResponse(metadata) {
  return {
    connected: true,
    trelloMemberId: metadata.trelloMemberId,
    trelloUsername: metadata.trelloUsername,
    scopes: metadata.scopes,
    expirationPolicy: metadata.expirationPolicy,
    expiresAt: metadata.expiresAt,
    defaultBoardId: metadata.defaultBoardId,
    defaultListId: metadata.defaultListId,
    connectedAt: metadata.connectedAt,
    updatedAt: metadata.updatedAt,
  };
}

/**
 * @param {{ ok: false, code: string }} result
 * @returns {never}
 */
function throwTrelloMemberValidationFailure(result) {
  const message = trelloClientErrorMessage(
    /** @type {Parameters<typeof trelloClientErrorMessage>[0]} */ (result.code),
    'member'
  );

  switch (result.code) {
    case 'TRELLO_AUTH':
      throw new ApiError('TRELLO_AUTH_ERROR', message, 401);
    case 'TRELLO_RATE_LIMIT':
      throw new ApiError('TRELLO_RATE_LIMIT', message, 429);
    case 'TRELLO_TIMEOUT':
      throw new ApiError('TRELLO_ERROR', message, 504);
    default:
      throw new ApiError('TRELLO_ERROR', message, 502);
  }
}

/**
 * @param {unknown} err
 * @returns {never}
 */
function throwSafeConnectConfigError(err) {
  if (err instanceof ApiError) {
    throw err;
  }
  throw new ApiError('SERVER_ERROR', 'Trello connect is not available', 500);
}

/**
 * @param {string} userId
 */
export async function getConnectionStatus(userId) {
  const metadata = await getConnectionByUserId(userId);
  if (!metadata) {
    return { connected: false };
  }
  return mapMetadataToResponse(metadata);
}

/**
 * @param {string} userId
 */
export function buildAuthorizeUrl(userId) {
  const apiKey = requireTrelloApiKey();
  const frontendUrl = getEnv().FRONTEND_URL.replace(/\/$/, '');
  const signedState = createTrelloOAuthState(userId);
  const returnUrl = `${frontendUrl}/trello/connect/callback?state=${encodeURIComponent(signedState)}`;

  const url = new URL(TRELLO_AUTHORIZE_BASE);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('callback_method', 'fragment');
  url.searchParams.set('return_url', returnUrl);
  url.searchParams.set('scope', TRELLO_SCOPES);
  url.searchParams.set('expiration', TRELLO_EXPIRATION);
  url.searchParams.set('name', TRELLO_APP_NAME);

  return { authorizeUrl: url.toString() };
}

/**
 * @param {string} userId
 * @param {string} token
 * @param {string} state
 */
export async function completeConnection(userId, token, state) {
  verifyTrelloOAuthState(state, userId);

  const apiKey = requireTrelloApiKey();

  const memberResult = await getMemberMe({ apiKey, token });
  if (!memberResult.ok) {
    throwTrelloMemberValidationFailure(memberResult);
  }

  try {
    const metadata = await upsertConnection({
      userId,
      token,
      scopes: TRELLO_SCOPES,
      trelloMemberId: memberResult.member.id,
      trelloUsername: memberResult.member.username,
      expirationPolicy: TRELLO_EXPIRATION,
      expiresAt: null,
    });
    return mapMetadataToResponse(metadata);
  } catch (err) {
    throwSafeConnectConfigError(err);
  }
}

/**
 * @param {string} userId
 */
export async function disconnectConnection(userId) {
  const apiKey = getEnv().TRELLO_API_KEY?.trim();

  /** @type {string | null} */
  let token = null;
  try {
    token = await decryptTokenForUser(userId);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
  }

  if (token && apiKey) {
    await deleteToken({ apiKey, token });
  }

  await deleteConnectionByUserId(userId);
  return { connected: false };
}
