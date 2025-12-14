'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Youtube from 'react-youtube';
import Image from 'next/image';
import { IoMdPlay } from 'react-icons/io';
import { AiFillStar } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { LuLoader2 } from 'react-icons/lu';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.jsx';

const actionButtonClasses =
  'flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold transition hover:border-cyan-300 hover:bg-white/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:w-auto';

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params?.movieId;
  const { check, user, loading, getAuthToken } = useAuth();

  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) {
        return;
      }
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await axios.get(`/api/movie/${movieId}`);

        setMovie(response.data);
        const trailerCandidate = response.data?.videos?.results?.find((video) => video.type === 'Trailer') ?? response.data?.videos?.results?.[0];
        setTrailer(trailerCandidate ?? null);
      } catch (error) {
        setErrorMessage("We couldn't fetch the movie details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

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

  const saveShow = async () => {
    try {
      if (!movie) {
        return;
      }

      const token = getAuthToken?.();
      if (!token || (!check() && !user && !loading)) {
        setSaveError('You need to be signed in to add this movie to favourites.');
        return;
      }

      setSaveMessage('');
      setSaveError('');
      setIsSaving(true);

      const posterPath = movie.poster_path ?? movie.backdrop_path ?? '';
      const payload = {
        movie_id: movie.id,
        poster_path: posterPath,
        title: movie.title ?? movie.original_title ?? movie.name ?? '',
        overview: movie.overview ?? '',
        release_date: movie.release_date ?? '',
        status: movie.status ?? '',
      };

      await axios.post('/api/add-to-favorites', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setIsLiked(true);
      setSaveMessage('Added to favourites');
    } catch (error) {
      console.error('Error saving show:', error);
      const fallbackMessage = "We couldn't save this movie right now. Please try again in a moment.";
      const responseMessage = error.response?.data?.error ?? error.response?.data?.message;
      setSaveError(typeof responseMessage === 'string' ? responseMessage : fallbackMessage);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken?.();

    if (!movieId || !token) {
      setIsLiked(false);
      return undefined;
    }

    const fetchSavedStatus = async () => {
      try {
        const response = await axios.get('/api/movies', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) {
          return;
        }

        const savedShows = response.data?.savedShows ?? [];
        const currentId = Number(movieId);
        const isAlreadySaved = savedShows.some((show) => {
          const tmdbId = Number(show.tmdb_id ?? show.id);
          return Number.isFinite(tmdbId) && tmdbId === currentId;
        });
        setIsLiked(isAlreadySaved);
      } catch (error) {
        if (isMounted) {
          setIsLiked(false);
        }
      }
    };

    fetchSavedStatus();

    return () => {
      isMounted = false;
    };
  }, [movieId, user, getAuthToken]);

  const watchMovie = () => {
    window.location.href = `https://pstream.mov/media/tmdb-movie-${movieId}`;
  };

  if (isLoading) {
    return <p className="py-20 text-center text-white/70">Loading movie details…</p>;
  }

  if (errorMessage || !movie) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/40 bg-red-500/10 p-10 text-center text-red-200">
        {errorMessage || 'Movie details are unavailable.'}
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
            <Image src={backdropUrl} alt={movie.title} fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        )}

        <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[280px,1fr] md:px-12 md:py-12">
          <div className="space-y-4">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title}
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

            {movie.genres?.length > 0 && (
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

            {movie.production_companies?.length > 0 && (
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
