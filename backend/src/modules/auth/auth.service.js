import { getSupabaseAdmin, getSupabaseAuth } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';

export const PROFILE_FETCH_RETRY_ATTEMPTS = 3;
export const PROFILE_FETCH_RETRY_DELAY_MS = 150;

/**
 * @param {() => Promise<unknown>} loadOnce
 * @param {{ attempts?: number, delayMs?: number }} [options]
 */
export async function loadProfileWithBoundedRetry(loadOnce, options = {}) {
  const attempts = options.attempts ?? PROFILE_FETCH_RETRY_ATTEMPTS;
  const delayMs = options.delayMs ?? PROFILE_FETCH_RETRY_DELAY_MS;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await loadOnce();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NOT_FOUND' && attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }

  throw new ApiError('NOT_FOUND', 'User profile not found', 404);
}

/**
 * @param {import('@supabase/supabase-js').Session | null} session
 */
export function mapSession(session) {
  if (!session) return null;
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    token_type: session.token_type ?? 'bearer',
  };
}

/**
 * @param {{ id: string, email: string, role: string }} profile
 */
export function mapUser(profile) {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
  };
}

/**
 * @param {string} userId
 */
export async function getProfileByUserId(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('id, email, role, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('NOT_FOUND', 'User profile not found', 404);
    }
    throw new ApiError('DATABASE_ERROR', 'Failed to load user profile', 500);
  }

  return data;
}

/**
 * @param {string} userId
 * @param {{ attempts?: number, delayMs?: number }} [options]
 */
export async function getProfileByUserIdWithRetry(userId, options) {
  return loadProfileWithBoundedRetry(() => getProfileByUserId(userId), options);
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function registerUser(email, password) {
  const { data, error } = await getSupabaseAuth().auth.signUp({ email, password });

  if (error) {
    throw new ApiError('VALIDATION_ERROR', error.message, 400);
  }

  const session = data.session ?? null;
  const authUser = data.user;

  if (!session) {
    return {
      user: null,
      session: null,
      message: 'Check your email to confirm your account before signing in.',
    };
  }

  if (!authUser?.id) {
    throw new ApiError('SERVER_ERROR', 'Registration succeeded but user id is missing', 500);
  }

  const profile = await getProfileByUserIdWithRetry(authUser.id);
  return {
    user: mapUser(profile),
    session: mapSession(session),
    message: null,
  };
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function loginUser(email, password) {
  const { data, error } = await getSupabaseAuth().auth.signInWithPassword({ email, password });

  if (error) {
    const status = error.message?.toLowerCase().includes('invalid') ? 401 : 400;
    const code = status === 401 ? 'AUTH_REQUIRED' : 'VALIDATION_ERROR';
    throw new ApiError(code, error.message, status);
  }

  if (!data.session || !data.user?.id) {
    throw new ApiError('SERVER_ERROR', 'Login succeeded but session is missing', 500);
  }

  const profile = await getProfileByUserIdWithRetry(data.user.id);
  return {
    user: mapUser(profile),
    session: mapSession(data.session),
  };
}

/**
 * @param {string} accessToken
 */
export async function getAuthUserFromToken(accessToken) {
  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);

    if (error || !data.user) {
      throw new ApiError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    return {
      id: data.user.id,
      email: data.user.email ?? '',
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('AUTH_REQUIRED', 'Authentication required', 401);
  }
}

/**
 * @param {string} userId
 */
export async function getMe(userId) {
  const profile = await getProfileByUserId(userId);
  return { user: mapUser(profile) };
}
