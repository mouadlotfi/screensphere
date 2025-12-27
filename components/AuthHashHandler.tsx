'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Handles implicit flow auth redirects when Supabase's default email templates
 * redirect users to the Site URL with tokens in the hash fragment.
 */
export default function AuthHashHandler() {
  const router = useRouter();
  const { supabase } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !supabase) return;

    const handleHashTokens = async () => {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (!accessToken || !type) return;

      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      await new Promise(resolve => setTimeout(resolve, 500));

      switch (type) {
        case 'email_change':
          router.push('/settings?email_changed=true');
          break;
        case 'recovery':
          router.push('/reset-password');
          break;
        case 'signup':
        case 'email':
          break;
        default:
          break;
      }
    };

    handleHashTokens();
  }, [supabase, router]);

  return null;
}
