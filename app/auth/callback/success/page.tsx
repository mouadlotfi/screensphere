'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function CallbackSuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    // Auto-close this tab after 5 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-black/80 backdrop-blur-sm border border-white/10 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <svg
              className="h-8 w-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Success!</h1>

          {type === 'password_reset' ? (
            <div>
              <p className="text-white/70 mb-6">
                A new tab has been opened for you to reset your password. If it didn't open automatically, please check your pop-up blocker settings.
              </p>
              <button
                onClick={() => window.open('/reset-password', '_blank')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold text-black transition-colors mb-3"
              >
                Open Password Reset Page
              </button>
            </div>
          ) : type === 'email_confirmation' ? (
            <div>
              <p className="text-white/70 mb-6">
                Your email has been confirmed successfully! A new tab has been opened with your ScreenSphere account. If it didn't open automatically, please check your pop-up blocker settings.
              </p>
              <button
                onClick={() => window.open('/?confirmed=true', '_blank')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold text-black transition-colors mb-3"
              >
                Open ScreenSphere
              </button>
            </div>
          ) : type === 'email_change' ? (
            <div>
              <p className="text-white/70 mb-6">
                Your email address has been changed successfully! A new tab has been opened with your settings. If it didn't open automatically, please check your pop-up blocker settings.
              </p>
              <button
                onClick={() => window.open('/settings?email_changed=true', '_blank')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold text-black transition-colors mb-3"
              >
                Open Settings
              </button>
            </div>
          ) : (
            <div>
              <p className="text-white/70 mb-6">
                Authentication successful! A new tab has been opened. If it didn't open automatically, please check your pop-up blocker settings.
              </p>
              <button
                onClick={() => window.open('/', '_blank')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold text-black transition-colors mb-3"
              >
                Open ScreenSphere
              </button>
            </div>
          )}

          <p className="text-sm text-white/50">
            This page will close automatically in 5 seconds...
          </p>

          <button
            onClick={() => window.close()}
            className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Close this page manually
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-black/80 backdrop-blur-sm border border-white/10 p-8 shadow-2xl text-center">
          <div className="animate-pulse">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/10" />
            <div className="h-8 w-32 mx-auto mb-3 rounded bg-white/10" />
            <div className="h-4 w-full mb-2 rounded bg-white/10" />
            <div className="h-4 w-3/4 mx-auto rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallbackSuccessPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full min-h-screen">
        <Image
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="Background"
          fill
          priority
          className="hidden sm:block object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60 sm:bg-black/40" />

        <Suspense fallback={<LoadingFallback />}>
          <CallbackSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
