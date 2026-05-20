import { getEnv } from '../config/env.js';

/**
 * @typedef {{ success: true, data: T, meta: { timestamp: string } }} ApiSuccess<T>
 * @typedef {{ success: false, error: { code: string, message: string, details?: unknown }, meta: { timestamp: string } }} ApiFailure
 */

/**
 * @param {string} path
 * @param {RequestInit} [init]
 * @param {string} [accessToken]
 * @returns {Promise<ApiSuccess<unknown> | ApiFailure>}
 */
export async function apiFetch(path, init = {}, accessToken) {
  const { VITE_API_URL } = getEnv();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${VITE_API_URL}${path}`, {
    ...init,
    headers,
  });

  const json = await response.json();
  return json;
}
