'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AiFillStar } from 'react-icons/ai';

export default function Movie({ item, variant = 'slider', size = 'default' }) {
  const router = useRouter();
  const posterPath =
    item?.poster_path || item?.posterPath || item?.backdrop_path || item?.backdropPath || item?.img || item?.image;
  const rating = item?.vote_average ? item.vote_average.toFixed(1) : null;
  const title = item?.title || item?.original_title || item?.name || 'Untitled';

  const posterUrl = posterPath
    ? posterPath.startsWith('http')
      ? posterPath
      : `https://image.tmdb.org/t/p/w500${posterPath}`
    : '';

  const handleClick = () => {
    router.push(`/movie/${item.id}`);
  };

  const getContainerClasses = () => {
    if (variant === 'grid') {
      return 'group/movie relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-neutral-900/60 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 active:scale-95 touch-manipulation sm:rounded-xl';
    }
    
    if (size === 'compact') {
      // For home page rows - smaller cards to fit 2+ per row
      return 'group/movie relative flex w-[40vw] min-w-[40vw] max-w-[10rem] snap-start flex-col overflow-hidden rounded-lg bg-neutral-900/60 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:w-44 sm:min-w-[11rem] sm:max-w-none sm:rounded-xl md:w-48 md:min-w-[12rem] lg:w-52 active:scale-95 touch-manipulation';
    }
    
    // Default slider size
    return 'group/movie relative flex w-[45vw] min-w-[45vw] max-w-[12rem] snap-start flex-col overflow-hidden rounded-lg bg-neutral-900/60 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:w-48 sm:min-w-[12rem] sm:max-w-none sm:rounded-xl md:w-56 md:min-w-[14rem] lg:w-60 active:scale-95 touch-manipulation';
  };

  const containerClasses = getContainerClasses();

  return (
    <button type="button" onClick={handleClick} className={containerClasses} aria-label={`View details for ${title}`}>
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, 12rem"
            priority={variant !== 'grid'}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-800 text-sm text-white/60">No poster available</div>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/70 to-transparent px-4 py-3 text-white opacity-0 transition duration-300 group-focus-visible/movie:opacity-100 group-hover/movie:opacity-100">
          <p className="text-sm font-heading font-semibold text-white/90">View details</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-2.5 py-2.5 text-left sm:px-3 sm:py-3">
        <div className={`${variant === 'grid' ? 'h-8 sm:h-10' : 'h-8 sm:h-12'} flex items-start`}>
          <p className={`overflow-hidden text-xs font-heading font-semibold leading-tight text-white ${variant === 'grid' ? 'sm:text-xs' : 'sm:text-sm'} md:text-base`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {title}
          </p>
        </div>
        {rating && (
          <span className={`inline-flex w-fit items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-heading font-medium text-yellow-200 ${variant === 'grid' ? 'sm:flex-shrink-0 sm:px-1.5 sm:py-0.5' : 'sm:flex-shrink-0 sm:px-2 sm:py-1'}`}>
            <AiFillStar size={10} className="sm:hidden" />
            <AiFillStar size={12} className="hidden sm:block" />
            {rating}
          </span>
        )}
      </div>
    </button>
  );
}
