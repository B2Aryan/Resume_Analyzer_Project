import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center sm:px-6",
        className,
      )}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-display text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children ? <div className="mt-4 w-full max-w-sm">{children}</div> : null}
    </div>
  );
}
