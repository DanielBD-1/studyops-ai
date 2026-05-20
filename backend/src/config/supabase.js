import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env.js';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * Server-side Supabase client (service role). Not for frontend use.
 * Phase 1B: client only — no database operations until schema exists.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseAdmin() {
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
