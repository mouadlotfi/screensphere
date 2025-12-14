import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { getSupabaseAnonServerClient, getSupabaseServiceRoleClient } from '@/lib/supabaseServer.js';

export async function POST(request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    if (!body?.current_password || !body?.password || !body?.password_confirmation) {
      return NextResponse.json({ error: 'All password fields are required.' }, { status: 422 });
    }

    if (body.password !== body.password_confirmation) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 422 });
    }

    const supabaseAnon = getSupabaseAnonServerClient();
    const { error: verifyError } = await supabaseAnon.auth.signInWithPassword({
      email: user.email,
      password: body.current_password,
    });

    if (verifyError) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 422 });
    }

    const supabaseAdmin = getSupabaseServiceRoleClient();
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: body.password,
    });

    if (updateError) {
      const status = updateError.status ?? 500;
      return NextResponse.json({ error: updateError.message || 'Unable to update password.' }, { status });
    }

    return NextResponse.json({ status: 'Password updated successfully' });
  } catch (error) {
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message || 'Unable to update password.' }, { status });
  }
}
