import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`border-border/60 shadow-soft ${className ?? ""}`}>
      <CardContent className="p-6 sm:p-8">{children}</CardContent>
    </Card>
  );
}

export function ResultPageSkeletons() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading analysis report"
    >
      <SkeletonCard>
        <div className="grid items-center gap-6 sm:grid-cols-[auto,1fr]">
          <Skeleton className="mx-auto h-28 w-28 rounded-full sm:mx-0" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-5 w-56" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </SkeletonCard>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-start lg:gap-6">
        <SkeletonCard className="lg:col-start-1">
          <Skeleton className="h-5 w-52" />
          <div className="mt-5 space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </SkeletonCard>

        <div className="flex flex-col gap-6 lg:col-start-2">
          <SkeletonCard>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-20 w-full" />
          </SkeletonCard>
          <SkeletonCard>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-16 w-full" />
          </SkeletonCard>
          <SkeletonCard className="hidden lg:block">
            <Skeleton className="h-4 w-48" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </SkeletonCard>
        </div>
      </div>

      <SkeletonCard>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
      </SkeletonCard>
    </div>
  );
}
