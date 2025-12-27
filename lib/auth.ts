import { createClient as createServerClient } from './supabase/server';
import { mapSupabaseUser, MappedUser } from './supabase/mappers';
import type { NextRequest } from 'next/server';
import type { ErrorWithStatus } from './types';

export const getTokenFromRequest = (request: NextRequest): string | null => {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) {
    return null;
  }

  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) {
    return null;
  }

  return value.trim();
};

export const getAuthenticatedUser = async (request: NextRequest): Promise<MappedUser | null> => {
  try {
    const supabase = await createServerClient();
    const { data: cookieData, error: cookieError } = await supabase.auth.getUser();

    if (!cookieError && cookieData?.user) {
      return mapSupabaseUser(cookieData.user);
    }

    const token = getTokenFromRequest(request);
    if (!token) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return null;
    }

    return mapSupabaseUser(data.user);
  } catch {
    return null;
  }
};

export const requireUser = async (request: NextRequest): Promise<MappedUser> => {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    const error = new Error('Unauthenticated') as ErrorWithStatus;
    error.status = 401;
    throw error;
  }
  return user;
};
