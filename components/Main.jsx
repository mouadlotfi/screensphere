'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import requests from '@/lib/requests.js';
import ReadMore from './ReadMore.jsx';

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false, // Disable arrows on all screen sizes
  autoplay: true,
  autoplaySpeed: 5000,
  pauseOnHover: false,
  adaptiveHeight: true,
};

export default function Main() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchPopular = async () => {
      try {
        const response = await axios.get(requests.requestPopular);
        if (!isMounted) {
          return;
        }
        setMovies(response.data?.results ?? []);
        setHasError(false);
      } catch (error) {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPopular();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredMovies = useMemo(() => movies.filter((movie) => movie.backdrop_path), [movies]);

  const handleNavigate = (movieId) => {
    router.push(`/movie/${movieId}`);
  };

  const shouldShowFallback = hasError || featuredMovies.length === 0;

  return (
    <section className="relative w-full text-[#FFFDE3]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" aria-hidden />

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center sm:h-[60vh] md:h-[65vh]">
          <p className="text-base text-white/70 sm:text-lg">Loading featured movies…</p>
        </div>
      ) : shouldShowFallback ? (
        <div className="relative flex h-[50vh] flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 px-4 text-center sm:h-[60vh] sm:rounded-3xl sm:px-6 md:h-[65vh] md:px-10 lg:px-16">
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl sm:h-64 sm:w-64" aria-hidden />
          <div className="absolute -top-16 -right-6 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl sm:h-64 sm:w-64" aria-hidden />
          <h1 className="text-2xl font-semibold sm:text-3xl md:text-5xl">Your cinematic universe, curated.</h1>
          <p className="mt-3 max-w-2xl text-xs text-white/70 sm:mt-4 sm:text-sm md:text-base">
            ScreenSphere connects you with a living library of movies. Sign in to build watchlists, discover new favourites and pick up where you left off across any device.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => router.push('/sign-up')}
              className="w-full rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black shadow transition hover:bg-cyan-400 sm:w-auto sm:px-6 sm:py-3"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => router.push('/genre/popular')}
              className="w-full rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200 sm:w-auto sm:px-6 sm:py-3"
            >
              Browse catalog
            </button>
          </div>
        </div>
      ) : (
        <Slider {...sliderSettings} className="relative">
          {featuredMovies.map((movie) => (
            <article key={movie.id} className="relative h-[50vh] sm:h-[60vh] md:h-[520px] lg:h-[600px]">
              <button
                type="button"
                className="absolute inset-0 h-full w-full"
                onClick={() => handleNavigate(movie.id)}
                aria-label={`Open details for ${movie.title}`}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </button>

              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="w-full px-3 pb-12 pt-20 sm:px-4 sm:pb-14 sm:pt-20 md:px-10 md:pb-16 lg:p-16">
                  <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-5xl">{movie.title}</h1>

                  <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
                    <button
                      type="button"
                      className="w-full rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white sm:w-auto sm:px-6"
                      onClick={() => handleNavigate(movie.id)}
                    >
                      More Details
                    </button>
                    {movie.release_date && (
                      <span className="text-xs text-gray-300 sm:text-sm hidden sm:inline">Released: {movie.release_date}</span>
                    )}
                  </div>

                  <div className="mt-3 max-w-3xl text-xs leading-relaxed sm:mt-4 sm:text-sm md:text-base hidden sm:block">
                    <ReadMore text={movie.overview} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </Slider>
      )}
    </section>
  );
}
