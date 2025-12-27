'use client';

import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="mx-auto max-w-5xl px-4">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600/30 via-purple-500/20 to-transparent px-6 py-10 text-center shadow-2xl sm:px-8 sm:py-12">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Become a ScreenSphere insider</h2>
        <p className="max-w-3xl text-sm text-white/80 sm:text-base">
          Sign up for a free account to track your progress, save favourites and receive weekly recommendations hand-picked by our editors.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Link
            href="/sign-up"
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 sm:w-auto"
          >
            Create a free account
          </Link>
          <Link
            href="/sign-in"
            className="w-full rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200 sm:w-auto"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}
