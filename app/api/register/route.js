import { NextResponse } from 'next/server';
import { getSupabaseAnonServerClient } from '@/lib/supabaseServer.js';
import { mapSupabaseUser } from '@/lib/supabase/mappers.js';

const validateRequest = (payload) => {
  const errors = [];
  if (!payload?.name || payload.name.trim().length < 2) {
    errors.push('A name is required.');
  }
  if (!payload?.email) {
    errors.push('An email address is required.');
  }
  if (!payload?.password || payload.password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }
  if (payload?.password !== payload?.passwordConfirmation && payload?.password_confirmation !== undefined) {
    errors.push('Passwords do not match.');
  }
  return errors;
};

export async function POST(request) {
  const body = await request.json();
  const errors = validateRequest(body);

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAnonServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: body.email.trim(),
      password: body.password,
      options: {
        data: {
          name: body.name.trim(),
        },
      },
    });

    if (error) {
      const status = error.status ?? 400;
      return NextResponse.json({ error: error.message || 'Unable to create account.' }, { status });
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: mapSupabaseUser(data.user),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
