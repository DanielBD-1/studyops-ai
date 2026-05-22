import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  GEMINI_API_KEY: z.string().min(1),
});

/** @typedef {z.infer<typeof envSchema>} Env */

/** @type {Env | null} */
let cached = null;

/**
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

/** @returns {Env} */
export function getEnv() {
  if (!cached) {
    cached = parseEnv(process.env);
  }
  return cached;
}

export { envSchema };
