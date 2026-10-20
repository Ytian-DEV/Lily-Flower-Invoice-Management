import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { AuthContext } from '@/features/auth/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import {
  getCurrentSession,
  getUserProfile,
  loginWithEmailPassword,
  logout as logoutFromSupabase,
  onAuthStateChange,
} from '@/features/auth/services/authService';
import type { LoginCredentials, UserProfile } from '@/features/auth/types';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (authUserId: string) => {
    const { data, error } = await getUserProfile(authUserId);

    if (error) {
      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    await loadProfile(user.id);
  }, [loadProfile, user]);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then(async ({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await loadProfile(data.session.user.id);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { error } = await loginWithEmailPassword(credentials);

    if (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await logoutFromSupabase();

    if (error) {
      throw error;
    }

    // Cached shop data must not survive into another person's session.
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: Boolean(session),
      isAdmin: profile?.role === 'admin',
      login,
      logout,
      refreshProfile,
    }),
    [isLoading, login, logout, profile, refreshProfile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
