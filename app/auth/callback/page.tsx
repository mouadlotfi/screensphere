'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!supabase) {
          router.push('/sign-in?error=auth_error');
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const token_hash = urlParams.get('token_hash');
        const type = urlParams.get('type');

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const hash_type = hashParams.get('type');

        const callbackType = type || hash_type;

        if (callbackType === 'email_change' && token_hash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email_change',
          });

          if (error) {
            router.push('/sign-in?error=email_change_failed');
            return;
          }

          window.open('/settings?email_changed=true', '_blank');
          router.push('/auth/callback/success?type=email_change');
          return;
        }

        if (!access_token || !refresh_token) {
          router.push('/sign-in?error=invalid_link');
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          router.push('/sign-in?error=session_error');
          return;
        }

        if (callbackType === 'recovery') {
          window.open('/reset-password', '_blank');
          router.push('/auth/callback/success?type=password_reset');
        } else if (callbackType === 'signup') {
          window.open('/?confirmed=true', '_blank');
          router.push('/auth/callback/success?type=email_confirmation');
        } else {
          window.open('/', '_blank');
          router.push('/auth/callback/success');
        }
      } catch {
        router.push('/sign-in?error=callback_failed');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
        <p className="text-white/70">Processing your request...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
            <p className="text-white/70">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
