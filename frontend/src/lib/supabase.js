import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env.js';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * Browser Supabase client (anon key only). For future Auth — no UI in Phase 1B.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseBrowser() {
  if (!client) {
    const env = getEnv();
    client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  }
  return client;
}
