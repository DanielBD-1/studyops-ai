import { apiFetch } from './api.js';

/**
 * @param {{ email: string, password: string }} body
 */
export async function register(body) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @param {{ email: string, password: string }} body
 */
export async function login(body) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @param {string} accessToken
 */
export async function logout(accessToken) {
  return apiFetch(
    '/api/auth/logout',
    { method: 'POST' },
    accessToken
  );
}

/**
 * @param {string} accessToken
 */
export async function getMe(accessToken) {
  return apiFetch('/api/auth/me', { method: 'GET' }, accessToken);
}
