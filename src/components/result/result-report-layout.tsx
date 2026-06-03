import { cn } from "@/lib/utils";

/** Report body: single column on mobile/tablet. */
export function ResultReportBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>;
}

/** Hub + sidebar band: stacked on mobile, 2-column on lg (no masonry). */
export function ResultReportHybridBand({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-start lg:gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
