import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  DOCUMENT_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  /** Optional until Trello OAuth connect ships (A3+). */
  TRELLO_API_KEY: z.string().min(1).optional(),
  /** Base64-encoded 32-byte key for AES-256-GCM token encryption. */
  TRELLO_TOKEN_ENCRYPTION_KEY: z.string().min(1).optional(),
  /** Base64-encoded 32-byte key for Trello OAuth state HMAC signing. */
  TRELLO_OAUTH_STATE_SECRET: z.string().min(1).optional(),
});

/** @typedef {z.infer<typeof envSchema>} Env */

/** @type {Env | null} */
let cached = null;

/**
 * Parse and validate environment variables. Never log return value.
 * @param {NodeJS.ProcessEnv} raw
 * @returns {Env}
 */
export function parseEnv(raw = process.env) {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`Invalid environment configuration:\n${messages.join('\n')}`);
  }
  return result.data;
}

/**
 * Validated env singleton for runtime use.
 * @returns {Env}
 */
export function getEnv() {
  if (!cached) {
    cached = parseEnv(process.env);
  }
  return cached;
}

/**
 * Test-only: clear cached env after mutating process.env.
 */
export function resetEnvCacheForTests() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetEnvCacheForTests is only available in test');
  }
  cached = null;
}

export { envSchema };
