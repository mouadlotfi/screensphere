'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.jsx';

/**
 * Sign In Page Component
 * 
 * This component handles user authentication for the ScreenSphere application.
 * It provides a clean, professional sign-in form with error handling.
 * 
 * Features:
 * - Email and password authentication
 * - Real-time error feedback
 * - Responsive design with background image
 * - Automatic redirect for authenticated users
 * - Professional UI with loading states
 * 
 * User Flow:
 * 1. User enters credentials
 * 2. Form validates input
 * 3. On success, redirects to home page
 * 4. On error, displays appropriate error message
 */
export default function SignInPage() {
  // Form state management
  const [email, setEmail] = useState(''); // User's email address
  const [password, setPassword] = useState(''); // User's password
  const [error, setError] = useState(''); // Error message display
  const [loading, setLoading] = useState(false); // Form submission state
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  // Authentication context and routing
  const { login, user } = useAuth();
  const router = useRouter();

  // Effect: Redirect authenticated users to home page
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  // Handler: Process form submission with authentication
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    try {
      // Attempt user authentication through auth context
      await login(email, password);
      router.push('/'); // Redirect to home page on success
    } catch (err) {
      // Display error message to user
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-sm text-white/70">Sign in to your ScreenSphere account</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors"
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full p-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-black transition-colors"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/70">
                  New to ScreenSphere?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/sign-up')}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    Create an account
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
