import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAnalysisSteps,
  type AnalysisProgressStepId,
} from "@/lib/ats/analysis-progress";

type OverlayPhase = "progress" | "success";

interface AnalysisProgressOverlayProps {
  open: boolean;
  phase: OverlayPhase;
  hasPdf: boolean;
  hasJobDescription: boolean;
  activeStepId: AnalysisProgressStepId | null;
  completedStepIds: Set<AnalysisProgressStepId>;
}

export function AnalysisProgressOverlay({
  open,
  phase,
  hasPdf,
  hasJobDescription,
  activeStepId,
  completedStepIds,
}: AnalysisProgressOverlayProps) {
  const steps = useMemo(
    () => getAnalysisSteps({ hasPdf, hasJobDescription }),
    [hasPdf, hasJobDescription],
  );

  const completedCount = steps.filter((s) => completedStepIds.has(s.id)).length;
  const progressPct =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    if (!open) {
      setBarWidth(0);
      return;
    }
    const id = requestAnimationFrame(() => setBarWidth(progressPct));
    return () => cancelAnimationFrame(id);
  }, [open, progressPct]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-progress-title"
      aria-describedby="analysis-progress-desc"
    >
      <div className="w-full max-w-md animate-scale-in rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8">
        {phase === "success" ? (
          <div className="flex flex-col items-center text-center" aria-live="polite">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden />
            </div>
            <h2
              id="analysis-progress-title"
              className="mt-4 font-display text-xl font-bold text-foreground"
            >
              Analysis complete
            </h2>
            <p id="analysis-progress-desc" className="mt-2 text-sm text-muted-foreground">
              Opening your personalized report…
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Analyzing resume
              </span>
            </div>
            <h2
              id="analysis-progress-title"
              className="mt-3 font-display text-xl font-bold text-foreground"
            >
              Building your ATS report
            </h2>
            <p id="analysis-progress-desc" className="mt-1 text-sm text-muted-foreground">
              Usually takes 5–15 seconds
            </p>

            <div
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
              aria-label="Analysis progress"
            >
              <div
                className="h-full rounded-full bg-gradient-primary transition-[width] duration-500 ease-out"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <ol className="mt-6 space-y-3" aria-live="polite" aria-relevant="additions text">
              {steps.map((step) => {
                const done = completedStepIds.has(step.id);
                const active = activeStepId === step.id;
                return (
                  <li
                    key={step.id}
                    className={cn(
                      "flex items-start gap-3 text-sm transition-opacity duration-300",
                      done || active ? "opacity-100" : "opacity-45",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        done
                          ? "border-success bg-success text-success-foreground"
                          : active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/40 text-muted-foreground",
                      )}
                      aria-hidden
                    >
                      {done ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : active ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "leading-snug",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                        active && !done && "font-medium",
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
