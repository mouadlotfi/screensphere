'use client';

import { FiZap, FiBookmark, FiUsers } from 'react-icons/fi';

const features = [
  {
    icon: FiZap,
    title: 'Fresh premieres every week',
    description:
      'Get access to new releases and hidden gems curated from global festivals the moment they go live.',
  },
  {
    icon: FiBookmark,
    title: 'Create watchlists that travel',
    description:
      'Save titles you love on any device. Your favourites sync across the ScreenSphere universe.',
  },
  {
    icon: FiUsers,
    title: 'Recommendations made for you',
    description:
      'Discover new stories based on what you add to favorites.',
  },
];

export default function FeatureHighlights() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 shadow-2xl sm:p-8 md:p-12">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why viewers choose ScreenSphere</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
          Designed for film lovers, ScreenSphere keeps your collection organised while surfacing new favourites through curated playlists and smart suggestions.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/40 p-6 transition hover:border-cyan-400/50 hover:bg-black/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
