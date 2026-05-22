/** Redacted logging — no study text, prompts, URLs, keys, or raw responses. */

/**
 * @param {'info' | 'error'} level
 * @param {Record<string, unknown>} metadata
 */
export function logGeminiEvent(level, metadata) {
  const entry = {
    service: 'document-service',
    component: 'gemini',
    ...metadata,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
