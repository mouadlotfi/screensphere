/**
 * Skeleton loading component for movie cards
 * Used in Row and Grid layouts during data fetching
 */

interface MovieCardSkeletonProps {
  variant?: 'slider' | 'grid';
  size?: 'compact' | 'default';
}

export default function MovieCardSkeleton({ variant = 'slider', size = 'default' }: MovieCardSkeletonProps) {
  const getContainerClasses = (): string => {
    if (variant === 'grid') {
      return 'relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-neutral-900/60 sm:rounded-xl';
    }

    if (size === 'compact') {
      return 'relative flex w-[40vw] min-w-[40vw] max-w-[10rem] snap-start flex-col overflow-hidden rounded-lg bg-neutral-900/60 sm:w-44 sm:min-w-[11rem] sm:max-w-none sm:rounded-xl md:w-48 md:min-w-[12rem] lg:w-52';
    }

    return 'relative flex w-[45vw] min-w-[45vw] max-w-[12rem] snap-start flex-col overflow-hidden rounded-lg bg-neutral-900/60 sm:w-48 sm:min-w-[12rem] sm:max-w-none sm:rounded-xl md:w-56 md:min-w-[14rem] lg:w-60';
  };

  return (
    <div className={`${getContainerClasses()} animate-pulse`}>
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-800" />
      <div className="flex flex-col gap-1.5 px-2.5 py-2.5 sm:px-3 sm:py-3">
        <div className={`${variant === 'grid' ? 'h-8 sm:h-10' : 'h-8 sm:h-12'} flex items-start`}>
          <div className="h-4 w-3/4 rounded bg-neutral-700" />
        </div>
        <div className="h-5 w-12 rounded-full bg-neutral-700" />
      </div>
    </div>
  );
}
