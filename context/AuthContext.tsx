'use client';

import { useCallback, createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { SupabaseClient, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { mapSupabaseUser, MappedUser } from '@/lib/supabase/mappers';

interface AuthContextValue {
  user: MappedUser | null;
  session: Session | null;
  supabase: SupabaseClient | null;
  login: (email: string, password: string) => Promise<MappedUser | null>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  check: () => boolean;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<MappedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  // Initialize Supabase client on mount (client-side only)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (typeof window !== 'undefined') {
      const client = createClient();
      setSupabase(client);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const initialise = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Unable to load Supabase session', error);
          setSession(null);
          setUser(null);
        } else {
          setSession(data.session);
          setUser(mapSupabaseUser(data.session?.user ?? null) ?? null);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Unexpected error when initialising auth', error);
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialise();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) {
        return;
      }

      // Handle user updates (email change, profile update, etc.)
      if (event === 'USER_UPDATED' && nextSession?.user) {
        // Force refresh the user data from Supabase
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        setSession(nextSession);
        setUser(mapSupabaseUser(freshUser ?? nextSession.user) ?? null);
      } else {
        setSession(nextSession);
        setUser(mapSupabaseUser(nextSession?.user ?? null) ?? null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(
    async (email: string, password: string): Promise<MappedUser | null> => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email?.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(mapSupabaseUser(data.session?.user) ?? null);

      return mapSupabaseUser(data.session?.user);
    },
    [supabase],
  );

  const register = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }): Promise<void> => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { error } = await supabase.auth.signUp({
        email: email?.trim(),
        password,
        options: {
          data: {
            name: name?.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }
    },
    [supabase],
  );

  const logout = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setSession(null);
    setUser(null);
  }, [supabase]);

  // Force refresh user data from Supabase
  const refreshUser = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (freshUser) {
      setUser(mapSupabaseUser(freshUser) ?? null);
    }
  }, [supabase]);

  const check = useCallback(() => Boolean(session?.user), [session]);

  const getAuthToken = useCallback(() => session?.access_token ?? null, [session]);

  const value = useMemo(
    () => ({
      user,
      session,
      supabase,
      login,
      logout,
      register,
      refreshUser,
      loading,
      check,
      getAuthToken,
    }),
    [user, session, supabase, login, logout, register, refreshUser, loading, check, getAuthToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
