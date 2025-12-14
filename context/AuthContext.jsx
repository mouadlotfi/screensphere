'use client';

import { useCallback, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient.js';
import { mapSupabaseUser } from '@/lib/supabase/mappers.js';

/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the application.
 * It manages user sessions, login/logout functionality, and user registration.
 * 
 * Features:
 * - Supabase authentication integration
 * - Session management with automatic refresh
 * - User state persistence across page reloads
 * - Registration and login methods
 * - Loading states for authentication operations
 * 
 * Context Value:
 * - user: Current authenticated user object or null
 * - loading: Boolean indicating if auth state is being determined
 * - login: Function to authenticate user with email/password
 * - register: Function to create new user account
 * - logout: Function to sign out current user
 * - getAuthToken: Function to get current session token
 * - check: Function to verify if user is authenticated
 */

// Create authentication context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * Provides authentication context to all child components.
 * Manages user session state and provides authentication methods.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Context provider with authentication state
 */
export const AuthProvider = ({ children }) => {
  // Initialize Supabase client (singleton pattern)
  const [supabase] = useState(() => getSupabaseBrowserClient());
  
  // Authentication state management
  const [session, setSession] = useState(null); // Current user session
  const [user, setUser] = useState(null); // Current user object
  const [loading, setLoading] = useState(true); // Initial loading state

  useEffect(() => {
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
          setUser(mapSupabaseUser(data.session?.user) ?? null);
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }
      setSession(nextSession);
      setUser(mapSupabaseUser(nextSession?.user) ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(
    async (email, password) => {
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
    async ({ name, email, password }) => {
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setSession(null);
    setUser(null);
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
      loading,
      check,
      getAuthToken,
    }),
    [user, session, supabase, login, logout, register, loading, check, getAuthToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
