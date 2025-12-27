import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseServer';

interface PostBody {
  email?: string;
}

interface PostResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PostResponse | ErrorResponse>> {
  try {
    const body: PostBody = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 422 });
    }

    const supabase = getSupabaseServiceRoleClient();

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      // Log silently but don't expose to client
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  } catch {
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }
}
