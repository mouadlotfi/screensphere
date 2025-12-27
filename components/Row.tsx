'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsRight } from 'react-icons/fi';
import Movie from './Movie';
import { RowSkeleton } from './skeletons';
import type { Movie as MovieType, MoviesResponse } from '@/lib/types';

interface RowProps {
  title: string;
  fetchURL: string;
  rowID: string;
  genre?: string;
}

const SCROLL_AMOUNT = 500;

/**
 * Fetch movies from the API
 * Separated for React Query caching
 */
const fetchMovies = async (url: string): Promise<MovieType[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }
  const data: MoviesResponse = await response.json();
  return data?.results ?? [];
};

export default function Row({ title, fetchURL, rowID, genre }: RowProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  // Use React Query for automatic caching and deduplication
  const {
    data: movies = [],
    isLoading,
    isError: hasError,
  } = useQuery({
    queryKey: ['movies', rowID, fetchURL],
    queryFn: () => fetchMovies(fetchURL),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (sliderRef.current) {
          sliderRef.current.style.cursor = 'grab';
          sliderRef.current.style.userSelect = 'auto';
        }
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  const handleSlide = useCallback((direction: 'left' | 'right') => {
    if (!sliderRef.current) {
      return;
    }
    const scrollOffset = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    sliderRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  }, []);

  const handleViewAllClick = useCallback(() => {
    if (genre) {
      router.push(`/genre/${genre}`);
    }
  }, [genre, router]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.userSelect = 'auto';
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.userSelect = 'auto';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  // Memoize section content to prevent unnecessary recalculations
  const sectionContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex w-full gap-3 overflow-hidden sm:gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="relative flex w-[40vw] min-w-[40vw] max-w-[10rem] animate-pulse snap-start flex-col overflow-hidden rounded-lg bg-neutral-900/60 sm:w-44 sm:min-w-[11rem] sm:max-w-none sm:rounded-xl md:w-48 md:min-w-[12rem] lg:w-52"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-800" />
              <div className="flex flex-col gap-1.5 px-2.5 py-2.5 sm:px-3 sm:py-3">
                <div className="h-8 sm:h-12 flex items-start">
                  <div className="h-4 w-3/4 rounded bg-neutral-700" />
                </div>
                <div className="h-5 w-12 rounded-full bg-neutral-700" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-10 text-center text-sm text-red-200">
          We couldn't load {title.toLowerCase()} movies right now.
        </div>
      );
    }

    if (movies.length === 0) {
      return (
        <div className="rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-10 text-center text-sm text-white/60">
          No {title.toLowerCase()} movies are available yet. Check back soon for new additions.
        </div>
      );
    }

    return (
      <div className="relative group/slider">
        <button
          type="button"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1 text-black opacity-0 transition hover:bg-white focus:opacity-100 group-hover/slider:opacity-100 hidden md:block"
          onClick={() => handleSlide('left')}
          aria-label="Scroll left"
        >
          <MdChevronLeft size={26} />
        </button>

        <div
          ref={sliderRef}
          id={`slider-${rowID}`}
          className="no-scrollbar flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-2 sm:gap-4 md:gap-6 cursor-grab select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {movies.map((item) => (
            <Movie key={item.id} item={item} size="compact" />
          ))}
        </div>

        <button
          type="button"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1 text-black opacity-0 transition hover:bg-white focus:opacity-100 group-hover/slider:opacity-100 hidden md:block"
          onClick={() => handleSlide('right')}
          aria-label="Scroll right"
        >
          <MdChevronRight size={26} />
        </button>
      </div>
    );
  }, [isLoading, hasError, movies, title, handleSlide, handleMouseDown, handleMouseLeave, handleMouseUp, handleMouseMove, isDragging, rowID]);

  return (
    <section className="space-y-3 px-3 sm:space-y-4 sm:px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <h2 className="text-base font-semibold text-[#FFFDE3] sm:text-lg md:text-xl">{title}</h2>
        {genre && (
          <button
            type="button"
            onClick={handleViewAllClick}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-cyan-400 transition hover:text-cyan-200 sm:gap-2 sm:text-sm"
            aria-label={`Browse more ${title} movies`}
          >
            View all
            <FiChevronsRight className="text-xs sm:text-sm" />
          </button>
        )}
      </div>

      {sectionContent}
    </section>
  );
}
