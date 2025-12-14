import { getSupabaseServiceRoleClient } from './supabaseServer.js';
import { mapSupabaseUser } from './supabase/mappers.js';

export const getTokenFromRequest = (request) => {
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

export const getAuthenticatedUser = async (request) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return null;
  }

  return mapSupabaseUser(data.user);
};

export const requireUser = async (request) => {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    const error = new Error('Unauthenticated');
    error.status = 401;
    throw error;
  }
  return user;
};
