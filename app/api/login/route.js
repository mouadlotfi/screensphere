import { NextResponse } from 'next/server';
import { getSupabaseAnonServerClient } from '@/lib/supabaseServer.js';
import { mapSupabaseUser } from '@/lib/supabase/mappers.js';

export async function POST(request) {
  const body = await request.json();
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAnonServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.session) {
      const status = error?.status ?? 401;
      return NextResponse.json({ error: error?.message ?? 'Invalid email or password.' }, { status });
    }

    const { session } = data;

    return NextResponse.json({
      token: session.access_token,
      refreshToken: session.refresh_token,
      user: mapSupabaseUser(session.user),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to sign in at the moment.' }, { status: 500 });
  }
}
