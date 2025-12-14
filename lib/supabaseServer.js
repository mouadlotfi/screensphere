import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined.');
  }
  return supabaseUrl;
};

const createServerClient = (key) => {
  const supabaseUrl = getSupabaseUrl();
  if (!key) {
    throw new Error('A Supabase key is required to create a server client.');
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

let serviceRoleClient;
let anonServerClient;

export const getSupabaseServiceRoleClient = () => {
  if (!serviceRoleClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined.');
    }
    serviceRoleClient = createServerClient(serviceRoleKey);
  }

  return serviceRoleClient;
};

export const getSupabaseAnonServerClient = () => {
  if (!anonServerClient) {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.');
    }
    anonServerClient = createServerClient(anonKey);
  }

  return anonServerClient;
};
