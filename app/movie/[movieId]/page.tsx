'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { IoMdPlay } from 'react-icons/io';
import { AiFillStar } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { LuLoader2 } from 'react-icons/lu';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import type { MovieDetails, Video } from '@/lib/types';

// Dynamic import for YouTube player to reduce initial bundle
const Youtube = dynamic(() => import('react-youtube'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center bg-neutral-900 text-white/60">
      Loading player...
    </div>
  ),
});

const actionButtonClasses =
  'flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold transition hover:border-cyan-300 hover:bg-white/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:w-auto';

/**
 * Fetch movie details from API
 */
const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
  const response = await fetch(`/api/movie/${movieId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }
  return response.json();
};

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params?.movieId as string;
  const { user, getAuthToken } = useAuth();
  const { isFavorite: checkIsFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();

  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

  // Use React Query for movie details with caching
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovieDetails(movieId),
    enabled: !!movieId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  // Check if movie is in favorites using context
  const isLiked = movie?.id ? checkIsFavorite(movie.id) : false;
  const favoriteId = movie?.id ? getFavoriteId(movie.id) : null;

  // Extract trailer from movie data
  const trailer = useMemo(() => {
    if (!movie?.videos?.results) return null;
    return movie.videos.results.find((video) => video.type === 'Trailer') ?? movie.videos.results[0] ?? null;
  }, [movie?.videos?.results]);

  const posterUrl = useMemo(
    () => (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''),
    [movie?.poster_path],
  );

  const backdropUrl = useMemo(() => {
    const path = movie?.backdrop_path || movie?.poster_path;
    return path ? `https://image.tmdb.org/t/p/original${path}` : '';
  }, [movie?.backdrop_path, movie?.poster_path]);

  const isUpcoming = useMemo(() => {
    if (!movie) {
      return false;
    }

    const status = movie.status?.toLowerCase();
    if (status === 'upcoming') {
      return true;
    }

    if (status === 'released') {
      return false;
    }

    if (movie.release_date) {
      const releaseDate = new Date(movie.release_date);
      return Number.isFinite(releaseDate.getTime()) && releaseDate > new Date();
    }

    return false;
  }, [movie]);

  const saveShow = useCallback(async () => {
    if (!movie) return;

    const token = getAuthToken?.();
    if (!token || !user) {
      setSaveError('You need to be signed in to add this movie to favourites.');
      return;
    }

    setSaveMessage('');
    setSaveError('');
    setIsSaving(true);

    try {
      if (isLiked && favoriteId) {
        // Remove from favorites
        const response = await fetch(`/api/user/${user.id}/delete-show/${favoriteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          removeFavorite(movie.id);
          setSaveMessage('Removed from favourites');
        }
      } else {
        // Add to favorites
        const posterPath = movie.poster_path ?? movie.backdrop_path ?? '';
        const response = await fetch('/api/add-to-favorites', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tmdbId: movie.id,
            posterPath,
            title: movie.title ?? movie.original_title ?? movie.name ?? '',
            overview: movie.overview ?? '',
            releaseDate: movie.release_date ?? '',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          addFavorite({
            id: data.favorite?.id || '',
            tmdbId: movie.id,
            title: movie.title ?? '',
            posterPath,
          });
          setSaveMessage('Added to favourites');
        }
      }
    } catch {
      setSaveError("We couldn't save this movie right now. Please try again in a moment.");
    } finally {
      setIsSaving(false);
    }
  }, [movie, user, getAuthToken, isLiked, favoriteId, addFavorite, removeFavorite]);

  const watchMovie = useCallback(() => {
    window.open(`https://pstream.mov/media/tmdb-movie-${movieId}`, '_blank');
  }, [movieId]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/70">
          <div className="h-64 w-full bg-neutral-800 sm:h-80 md:h-96" />
          <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[280px,1fr] md:px-12 md:py-12">
            <div className="space-y-4">
              <div className="h-96 w-full rounded-2xl bg-neutral-800" />
              <div className="flex gap-3">
                <div className="h-10 w-24 rounded-full bg-neutral-700" />
                <div className="h-10 w-24 rounded-full bg-neutral-700" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-10 w-2/3 rounded bg-neutral-700" />
              <div className="h-4 w-full rounded bg-neutral-700" />
              <div className="h-4 w-3/4 rounded bg-neutral-700" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !movie) {
    const errorMessage = error instanceof Error ? error.message : 'Movie details are unavailable.';
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/40 bg-red-500/10 p-10 text-center text-red-200">
        {errorMessage}
      </div>
    );
  }

  const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const runtimeHours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
  const runtimeMinutes = movie.runtime ? movie.runtime % 60 : null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <article className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/70 shadow-2xl">
        {backdropUrl && (
          <div className="relative h-64 w-full sm:h-80 md:h-96">
            <Image src={backdropUrl} alt={movie.title || ''} fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        )}

        <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[280px,1fr] md:px-12 md:py-12">
          <div className="space-y-4">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title || ''}
                width={500}
                height={750}
                className="w-full rounded-2xl object-cover shadow-lg"
                priority
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl bg-neutral-800 text-white/60">No poster</div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={watchMovie} className={actionButtonClasses}>
                <IoMdPlay />
                Watch now
              </button>
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className={`${actionButtonClasses} border-dashed`}
                disabled={!trailer}
              >
                <IoMdPlay />
                Trailer
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <header className="space-y-3">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                {movie.release_date && <span>Released {new Date(movie.release_date).toLocaleDateString()}</span>}
                {movie.original_language && <span>Language: {movie.original_language.toUpperCase()}</span>}
                {runtimeHours !== null && (
                  <span>
                    {runtimeHours > 0 && `${runtimeHours}h `}
                    {runtimeMinutes}m
                  </span>
                )}
                {voteAverage && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-200">
                    <AiFillStar />
                    {voteAverage}
                  </span>
                )}
                {isUpcoming && <span className="rounded-full border border-cyan-400/60 px-3 py-1 text-xs text-cyan-200">Coming soon</span>}
              </div>
            </header>

            <p className="text-white/70">{movie.overview || 'No synopsis available for this title.'}</p>

            {movie.genres && movie.genres.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveShow}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-black transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-white/60"
              >
                {isSaving ? (
                  <LuLoader2 className="animate-spin" />
                ) : isLiked ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
                {isLiked ? 'Saved' : 'Add to favourites'}
              </button>
              {saveMessage && <span className="text-sm text-cyan-300">{saveMessage}</span>}
              {saveError && <span className="text-sm text-red-300">{saveError}</span>}
            </div>

            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Production</h2>
                <p className="text-sm text-white/70">
                  {movie.production_companies.map((company) => company.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>

      {isTrailerOpen && trailer?.key && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setIsTrailerOpen(false)}
              className="absolute -top-10 right-0 rounded-full border border-white/30 px-4 py-1 text-sm text-white/70 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Close
            </button>
            <Youtube videoId={trailer.key} className="w-full overflow-hidden rounded-2xl" opts={{ width: '100%', playerVars: { autoplay: 1 } }} />
          </div>
        </div>
      )}
    </section>
  );
}
