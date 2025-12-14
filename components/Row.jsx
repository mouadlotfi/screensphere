'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FiChevronsRight } from 'react-icons/fi';
import Movie from './Movie.jsx';

const SCROLL_AMOUNT = 500;

export default function Row({ title, fetchURL, rowID, genre }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const sliderRef = useRef(null);
  const router = useRouter();
  
  // Drag functionality state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
          setHasError(false);
        }

        const response = await axios.get(fetchURL);
        if (isMounted) {
          setMovies(response.data?.results ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setMovies([]);
          setHasError(true);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [fetchURL]);

  // Global mouse up listener to stop dragging when mouse is released anywhere
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

  const handleSlide = (direction) => {
    if (!sliderRef.current) {
      return;
    }
    const scrollOffset = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    sliderRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  };

  const handleViewAllClick = () => {
    if (genre) {
      router.push(`/genre/${genre}`);
    }
  };

  // Drag functionality handlers
  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.userSelect = 'auto';
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    setIsDragging(false);
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.userSelect = 'auto';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Reduced scroll speed multiplier for smoother control
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const sectionContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-10 text-center text-sm text-white/70">
          Loading {title.toLowerCase()}…
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-10 text-center text-sm text-red-200">
          We couldn’t load {title.toLowerCase()} movies right now.
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
  };

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

      {sectionContent()}
    </section>
  );
}
