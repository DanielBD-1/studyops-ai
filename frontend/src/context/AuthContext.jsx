import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '../lib/supabase.js';
import * as authService from '../services/auth.service.js';

/** @typedef {{ id: string, email: string, role: string } | null} AppUser */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {AppUser} */ (null));
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState(/** @type {string | null} */ (null));

  const supabase = getSupabaseBrowser();

  const fetchMe = useCallback(async (accessToken) => {
    const result = await authService.getMe(accessToken);
    if (!result.success) {
      throw new Error(result.error.message);
    }
    setUser(result.data.user);
    return result.data.user;
  }, []);

  const applySession = useCallback(
    async (session) => {
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (error) {
        throw new Error(error.message);
      }
      await fetchMe(session.access_token);
    },
    [supabase.auth, fetchMe]
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.access_token) {
        try {
          await fetchMe(session.access_token);
        } catch {
          await supabase.auth.signOut();
          if (mounted) setUser(null);
        }
      } else {
        setUser(null);
      }

      if (mounted) setLoading(false);
    }

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        return;
      }

      if (session.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        try {
          await fetchMe(session.access_token);
        } catch {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchMe]);

  const register = useCallback(
    async ({ email, password }) => {
      setAuthNotice(null);
      const result = await authService.register({ email, password });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      const { user: registeredUser, session, message } = result.data;

      if (!session) {
        setAuthNotice(
          message ?? 'Check your email to confirm your account before signing in.'
        );
        return { needsEmailConfirmation: true };
      }

      await applySession(session);
      return { needsEmailConfirmation: false, user: registeredUser };
    },
    [applySession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      setAuthNotice(null);
      const result = await authService.login({ email, password });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      const { session } = result.data;
      if (!session) {
        throw new Error('Login succeeded but no session was returned');
      }

      await applySession(session);
      return result.data.user;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      try {
        await authService.logout(session.access_token);
      } catch {
        // Client sign-out is source of truth for session removal.
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setAuthNotice(null);
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      user,
      loading,
      authNotice,
      register,
      login,
      logout,
      clearAuthNotice: () => setAuthNotice(null),
    }),
    [user, loading, authNotice, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
