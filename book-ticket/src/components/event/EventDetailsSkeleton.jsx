/**
 * EventDetailsSkeleton
 *
 * Purpose: Loading skeleton for the Event Details page three-column layout.
 * Dependencies: None (pure Tailwind CSS shimmer animation)
 */

const ShimmerBlock = ({ className = '' }) => (
  <div className={`bg-secondary/30 rounded animate-pulse ${className}`} />
);

export const EventDetailsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 animate-fade-in-up">
      {/* Left sidebar skeleton */}
      <div className="flex flex-col gap-4">
        <ShimmerBlock className="h-4 w-32" />
        <ShimmerBlock className="aspect-video w-full" />
        <ShimmerBlock className="h-8 w-3/4" />
        <ShimmerBlock className="h-4 w-48" />
        <ShimmerBlock className="h-4 w-40" />
        <ShimmerBlock className="h-4 w-44" />
        <ShimmerBlock className="h-20 w-full mt-2" />
      </div>

      {/* Center seat map skeleton */}
      <div className="flex flex-col gap-4">
        <ShimmerBlock className="h-150 w-full rounded-lg" />
        <div className="flex gap-4">
          <ShimmerBlock className="h-6 w-20" />
          <ShimmerBlock className="h-6 w-20" />
          <ShimmerBlock className="h-6 w-20" />
          <ShimmerBlock className="h-6 w-20" />
        </div>
      </div>

      {/* Right sidebar skeleton */}
      <div className="flex flex-col gap-4">
        <ShimmerBlock className="h-64 w-full rounded-lg" />
        <ShimmerBlock className="h-80 w-full rounded-lg" />
      </div>
    </div>
  );
};
