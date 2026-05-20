import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env.js';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let testAdminOverride = null;

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let testAuthOverride = null;

/**
 * Test-only: inject a mock admin client (no outbound Supabase calls).
 * @param {import('@supabase/supabase-js').SupabaseClient} mockClient
 */
export function setSupabaseAdminClientForTests(mockClient) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('setSupabaseAdminClientForTests is only available in test');
  }
  testAdminOverride = mockClient;
}

/**
 * Test-only: inject a mock auth client.
 * @param {import('@supabase/supabase-js').SupabaseClient} mockClient
 */
export function setSupabaseAuthClientForTests(mockClient) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('setSupabaseAuthClientForTests is only available in test');
  }
  testAuthOverride = mockClient;
}

/**
 * Test-only: clear injected clients and cached real clients.
 */
export function resetSupabaseClientsForTests() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetSupabaseClientsForTests is only available in test');
  }
  testAdminOverride = null;
  testAuthOverride = null;
  client = null;
  authClient = null;
}

/**
 * Server-side Supabase client (service role). Not for frontend use.
 * Phase 1B: client only — no database operations until schema exists.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseAdmin() {
  if (testAdminOverride) {
    return testAdminOverride;
  }
  if (!client) {
    const env = getEnv();
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return client;
}

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let authClient = null;

/**
 * Server-side Supabase client (anon key) for signUp / signIn only.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseAuth() {
  if (testAuthOverride) {
    return testAuthOverride;
  }
  if (!authClient) {
    const env = getEnv();
    authClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return authClient;
}
