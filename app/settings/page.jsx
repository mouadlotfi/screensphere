'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Settings from '@/components/Settings.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in');
    }
  }, [loading, user, router]);

  if (loading) {
    return <p className="py-20 text-center text-white/70">Preparing your account settings…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-neutral-900/70 p-10 text-center text-white/70">
        Please sign in to manage your account.
      </div>
    );
  }

  return <Settings />;
}
