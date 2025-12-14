'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { AiOutlineClose } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.jsx';

export default function SavedShow() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, getAuthToken } = useAuth();
  const router = useRouter();

  const authToken = typeof window !== 'undefined' ? getAuthToken?.() : null;

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        if (!user || !authToken) {
          setMovies([]);
          setErrorMessage('Sign in to see the shows you have saved.');
          return;
        }

        const response = await axios.get('/api/movies', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const moviesArray = response.data?.savedShows ?? [];
        setMovies(Array.isArray(moviesArray) ? moviesArray : []);
        setErrorMessage('');
      } catch (error) {
        setMovies([]);
        setErrorMessage("We couldn't load your saved shows. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [user, authToken]);

  const deleteShow = async (favoriteId) => {
    try {
      if (!user || !authToken) {
        return;
      }

      await axios.delete(`/api/user/${user.id}/delete-show/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setMovies((prevMovies) => prevMovies.filter((item) => item.id !== favoriteId));
    } catch (error) {
      console.error('Error deleting show:', error);
    }
  };

  const resolvePosterUrl = (item) => {
    const posterCandidates = [
      item?.poster_path,
      item?.posterPath,
      item?.poster,
      item?.img,
      item?.image,
      item?.backdrop_path,
    ];

    const path = posterCandidates.find((candidate) => typeof candidate === 'string' && candidate.trim() !== '');

    if (!path) {
      return '';
    }

    return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
  };

  const formatReleaseDate = (date) => {
    if (!date || typeof date !== 'string') {
      return null;
    }

    const trimmed = date.trim();
    if (!trimmed || trimmed === '1900-01-01') {
      return null;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNavigate = (movie) => {
    const tmdbId = movie?.tmdb_id ?? movie?.tmdbId ?? movie?.id;
    if (!tmdbId) {
      return;
    }
    router.push(`/movie/${tmdbId}`);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-white">Your saved shows</h1>
        <p className="mt-2 text-sm text-white/60">Revisit favourites or remove the ones you no longer love.</p>
      </header>

      {isLoading ? (
        <p className="py-20 text-center text-white/70">Loading your personal collection…</p>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 py-16 text-center text-white/70">
          <p>{errorMessage}</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-neutral-900/60 py-16 text-center text-white/60">
          <p>No saved movies yet. Start exploring and tap the heart to add favourites.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.map((item) => {
            const posterUrl = resolvePosterUrl(item);
            const title = item?.title || item?.name || 'Untitled';
            const releaseDateLabel = formatReleaseDate(item?.release_date);

            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleNavigate(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleNavigate(item);
                  }
                }}
                aria-label={`Open ${title} details`}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/70 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-neutral-800 text-sm text-white/50">No artwork</div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {releaseDateLabel && (
                      <p className="text-xs uppercase tracking-wide text-white/50">Released {releaseDateLabel}</p>
                    )}
                    {item?.overview && (
                      <p className="max-h-24 overflow-hidden text-sm leading-relaxed text-white/70">{item.overview}</p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteShow(item.id);
                      }}
                      className="flex items-center gap-2 rounded-full border border-red-500/40 px-3 py-1 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      <AiOutlineClose />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
