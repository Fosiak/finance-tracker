import Skeleton from "../ui/Skeleton";

function DashboardSkeleton() {
  return (
    <div
      className="min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-3 h-4 w-20" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>

        {/* Main content */}
        <div className="rounded-2xl border border-border-default bg-surface p-8">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-4 h-4 w-72 max-w-full" />
          <Skeleton className="mt-8 h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
