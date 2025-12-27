/**
 * Skeleton loading component for the hero/main slider
 * Displays animated placeholder during initial data fetch
 */

export default function HeroSkeleton() {
  return (
    <section className="relative w-full animate-pulse">
      <div className="h-[50vh] w-full bg-neutral-900 sm:h-[60vh] md:h-[520px] lg:h-[600px]">
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black via-black/40 to-transparent">
          <div className="w-full px-3 pb-12 pt-20 sm:px-4 sm:pb-14 sm:pt-20 md:px-10 md:pb-16 lg:p-16">
            <div className="h-8 w-2/3 rounded bg-neutral-700 sm:h-10 md:h-12 lg:w-1/2" />
            <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
              <div className="h-10 w-32 rounded-full bg-neutral-700" />
              <div className="hidden h-4 w-24 rounded bg-neutral-700 sm:block" />
            </div>
            <div className="mt-3 hidden space-y-2 sm:block sm:mt-4">
              <div className="h-4 w-full max-w-2xl rounded bg-neutral-700" />
              <div className="h-4 w-3/4 max-w-xl rounded bg-neutral-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
