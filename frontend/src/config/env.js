import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

/** @typedef {z.infer<typeof envSchema>} FrontendEnv */

/** @type {FrontendEnv | null} */
let cached = null;

/**
 * Validate Vite environment variables. Never log return value.
 * @param {Record<string, unknown>} raw
 * @returns {FrontendEnv}
 */
export function parseEnv(raw = import.meta.env) {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`Invalid frontend environment:\n${messages.join('\n')}`);
  }
  return result.data;
}

/** @returns {FrontendEnv} */
export function getEnv() {
  if (!cached) {
    cached = parseEnv(import.meta.env);
  }
  return cached;
}

export { envSchema };
