/**
 * Skeleton loading component for movie rows
 * Displays animated placeholders during data fetching
 */

import MovieCardSkeleton from './MovieCardSkeleton';

interface RowSkeletonProps {
  title?: string;
}

export default function RowSkeleton({ title }: RowSkeletonProps) {
  return (
    <section className="space-y-3 px-3 sm:space-y-4 sm:px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {title ? (
          <h2 className="text-base font-semibold text-[#FFFDE3] sm:text-lg md:text-xl">{title}</h2>
        ) : (
          <div className="h-6 w-32 animate-pulse rounded bg-neutral-700" />
        )}
        <div className="h-5 w-20 animate-pulse rounded bg-neutral-700" />
      </div>
      <div className="flex w-full gap-3 overflow-hidden sm:gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <MovieCardSkeleton key={index} size="compact" />
        ))}
      </div>
    </section>
  );
}
