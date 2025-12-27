import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  // Get the origin for redirects
  const origin = request.nextUrl.origin;

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Handle different verification types
      if (type === 'email_change') {
        // Email change was successful - redirect to settings with success flag
        return NextResponse.redirect(`${origin}/settings?email_changed=true`);
      } else if (type === 'recovery') {
        // Password recovery - redirect to reset password page
        return NextResponse.redirect(`${origin}/reset-password`);
      } else if (type === 'signup' || type === 'email') {
        // Email confirmation - redirect to home with confirmed flag
        return NextResponse.redirect(`${origin}/?confirmed=true`);
      } else if (type === 'magiclink') {
        // Magic link login - redirect to home
        return NextResponse.redirect(`${origin}/`);
      } else {
        // Default: redirect to the next URL or home
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Log the error for debugging
    console.error('Auth verification error:', error.message);
  }

  // If we get here, something went wrong
  // Redirect to sign-in with an error
  return NextResponse.redirect(`${origin}/sign-in?error=verification_failed`);
}
