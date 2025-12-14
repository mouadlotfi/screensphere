'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import startCase from 'lodash.startcase';
import { useParams } from 'next/navigation';
import Movie from '@/components/Movie.jsx';

const genreTitles = {
  popular: 'Popular Picks',
  upcoming: 'Upcoming Releases',
  top_rated: 'Top Rated',
  trending: 'Trending Now',
};

const resolveEndpoint = (genre) => {
  if (!genre) {
    return '/api/movies/popular';
  }
  if (genre === 'trending') {
    return '/api/movies/trending';
  }
  return `/api/movies/${genre}`;
};

export default function GenrePage() {
  const params = useParams();
  const genre = params?.genre;
  const [movies, setMovies] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const buildUrl = useCallback(
    (pageNumber) => {
      const base = resolveEndpoint(genre);
      return `${base}?page=${pageNumber}`;
    },
    [genre],
  );

  const fetchMovies = useCallback(
    async (pageNumber) => {
      try {
        if (pageNumber === 1) {
          setIsInitialLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setErrorMessage('');

        const response = await axios.get(buildUrl(pageNumber));
        const results = response.data?.results ?? [];
        const totalPages = response.data?.total_pages ?? pageNumber;

        setMovies((previous) => (pageNumber === 1 ? results : [...previous, ...results]));
        setHasMore(pageNumber < totalPages);
      } catch (error) {
        if (pageNumber === 1) {
          setMovies([]);
        }
        setHasMore(false);
        setErrorMessage("We couldn't load this collection. Please try again later.");
      } finally {
        if (pageNumber === 1) {
          setIsInitialLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [buildUrl],
  );

  useEffect(() => {
    if (!genre) {
      setMovies([]);
      return;
    }
    setMovies([]);
    setCurrentPage(1);
    fetchMovies(1);
  }, [fetchMovies, genre]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMovies(nextPage);
  };

  const heading = useMemo(() => genreTitles[genre] ?? startCase(genre ?? ''), [genre]);

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
      <header className="mb-6 flex flex-col gap-2 text-white sm:mb-8 sm:gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">{heading}</h1>
        <p className="text-xs text-white/60 sm:text-sm">Discover the best films curated for this category.</p>
      </header>

      {isInitialLoading ? (
        <p className="py-20 text-center text-white/70">Loading movies…</p>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-200">{errorMessage}</div>
      ) : movies.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-10 text-center text-white/60">No movies found in this collection.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((item) => (
              <Movie key={item.id} item={item} variant="grid" />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center sm:mt-10">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-white/40 sm:px-6 sm:py-3"
              >
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
