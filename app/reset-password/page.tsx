'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function ResetPasswordContent() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isValidSession, setIsValidSession] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();

  // Handle the recovery token from URL (hash or query params) and check session
  useEffect(() => {
    const handleRecoveryToken = async () => {
      try {
        if (!supabase) {
          // Wait for supabase to initialize
          return;
        }

        // Method 1: Check for token_hash in query params (PKCE flow)
        // URL format: /reset-password?token_hash=xxx&type=recovery
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (tokenHash && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (verifyError) {
            console.error('OTP verification error:', verifyError);
            setError('Invalid or expired reset link. Please request a new one.');
            setCheckingSession(false);
            return;
          }

          setIsValidSession(true);
          setCheckingSession(false);
          return;
        }

        // Method 2: Check for hash fragment with tokens (implicit flow)
        // URL format: /reset-password#access_token=xxx&refresh_token=xxx&type=recovery
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');

          if (accessToken && refreshToken && hashType === 'recovery') {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setError('Invalid or expired reset link. Please request a new one.');
              setCheckingSession(false);
              return;
            }

            // Clear the hash from the URL for security
            window.history.replaceState(null, '', window.location.pathname);

            setIsValidSession(true);
            setCheckingSession(false);
            return;
          }
        }

        // Method 3: Check for existing session (user already authenticated via the link)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsValidSession(true);
          setCheckingSession(false);
          return;
        }

        // No valid token or session found
        setError('Invalid or expired reset link. Please request a new one.');
        setCheckingSession(false);
      } catch (err) {
        console.error('Recovery token error:', err);
        setError('Unable to verify reset session.');
        setCheckingSession(false);
      }
    };

    handleRecoveryToken();
  }, [supabase, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        setError('Unable to initialize authentication.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Password updated successfully! Redirecting to sign in...');
      setPassword('');
      setConfirmPassword('');

      // Sign out and redirect to sign in page
      setTimeout(async () => {
        await supabase?.auth.signOut();
        router.push('/sign-in');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Unable to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/70">Verifying reset link...</p>
      </div>
    );
  }

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

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl bg-black/80 backdrop-blur-sm border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-sm text-white/70">Enter your new password below</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-200 text-sm">
                  {success}
                </div>
              )}

              {isValidSession ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                      className="w-full p-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
                      className="w-full p-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-black transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold text-black transition-colors"
                  >
                    Request New Reset Link
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-white/70">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/sign-in')}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white/70">Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
