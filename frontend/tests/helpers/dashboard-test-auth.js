import { createElement } from 'react';
import { AuthContext } from '../../src/context/AuthContext.jsx';

/**
 * @param {Partial<import('react').ContextType<typeof AuthContext>>} [overrides]
 * @returns {import('react').ContextType<typeof AuthContext>}
 */
export function createDashboardTestAuthValue(overrides = {}) {
  return {
    user: { id: 'user-1', email: 'student@example.com', role: 'student' },
    loading: false,
    authNotice: null,
    register: async () => ({ needsEmailConfirmation: false }),
    login: async () => ({}),
    logout: async () => {},
    clearAuthNotice: () => {},
    ...overrides,
  };
}

/**
 * @param {{
 *   value?: import('react').ContextType<typeof AuthContext>,
 *   children: import('react').ReactNode,
 * }} props
 */
export function DashboardTestAuthProvider({ value, children }) {
  return createElement(
    AuthContext.Provider,
    { value: value ?? createDashboardTestAuthValue() },
    children
  );
}
