'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EmailConfirmationPage() {
  const router = useRouter();

  // Note: Removed auto-redirect to allow users to stay on confirmation page
  // Users can manually navigate to sign-in when ready

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full min-h-screen">
        {/* Background image for visual appeal */}
        <Image
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="Background"
          fill
          priority
          className="hidden sm:block object-cover"
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 sm:bg-black/40" />

        {/* Main content container */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl bg-black/80 backdrop-blur-sm border border-white/10 p-6 sm:p-8 shadow-2xl">
              
              {/* Success icon */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg 
                    className="w-8 h-8 text-green-400" 
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
                
                {/* Main heading */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Account Created Successfully
                </h1>
                
                {/* Confirmation message */}
                <div className="space-y-4 text-left">
                  <p className="text-white/90 leading-relaxed">
                    Thank you for joining ScreenSphere! We&apos;ve sent a confirmation email to your registered email address.
                  </p>
                  
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="font-semibold text-cyan-300 mb-2">Next Steps:</h3>
                    <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the confirmation link in the email</li>
                      <li>Return here to sign in to your account</li>
                    </ol>
                  </div>
                  
                  <p className="text-sm text-white/70">
                    Didn&apos;t receive the email? Check your spam folder or try signing up again.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {/* Primary action - Go to Sign In */}
                <button
                  onClick={() => router.push('/sign-in')}
                  className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold text-black leading-none text-base transition-colors flex items-center justify-center"
                >
                  Go to Sign In
                </button>
                
                {/* Secondary action - Back to Home */}
                <button
                  onClick={() => router.push('/')}
                  className="w-full h-12 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-lg leading-none text-base flex items-center justify-center transition-colors"
                >
                  Back to Home
                </button>
              </div>

              {/* Additional help text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-white/50">
                  Need help? Check your email&apos;s spam folder <br />
                  or contact support if you don&apos;t receive the email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}