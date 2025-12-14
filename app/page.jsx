'use client';

import Main from '@/components/Main.jsx';
import Row from '@/components/Row.jsx';
import FeatureHighlights from '@/components/FeatureHighlights.jsx';
import CallToAction from '@/components/CallToAction.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import requests from '@/lib/requests.js';

const rowConfigurations = [
  { title: 'Upcoming', fetchURL: requests.requestUpcoming, rowID: 'upcoming', genre: 'upcoming' },
  { title: 'Popular', fetchURL: requests.requestPopular, rowID: 'popular', genre: 'popular' },
  { title: 'Top Rated', fetchURL: requests.requestTopRated, rowID: 'top-rated', genre: 'top_rated' },
  { title: 'Trending', fetchURL: requests.requestTrending, rowID: 'trending', genre: 'trending' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 sm:space-y-12">
      <Main />
      {rowConfigurations.map((config) => (
        <Row key={config.rowID} title={config.title} fetchURL={config.fetchURL} rowID={config.rowID} genre={config.genre} />
      ))}
      {!user && <FeatureHighlights />}
      {!user && <CallToAction />}
    </div>
  );
}
