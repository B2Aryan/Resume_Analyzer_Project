import { memo } from "react";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatScoreDifference,
  type VersionComparison,
} from "@/lib/ats/compare-versions";

export interface ResultComparisonProps {
  comparison: VersionComparison;
}

export const ResultComparison = memo(function ResultComparison({
  comparison,
}: ResultComparisonProps) {
  return (
    <Card className="border-border/60 border-success/20 bg-success/5 transition-all duration-300 ease-out hover:border-primary/40 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <GitCompare className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Version history</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">Compare With Previous Analysis</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Compared to {comparison.previousFileName} ({comparison.previousRole}) ·{" "}
          {new Date(comparison.previousSavedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Previous ATS Score
            </p>
            <p className="mt-2 font-display text-3xl font-bold">{comparison.previousScore}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current ATS Score
            </p>
            <p className="mt-2 font-display text-3xl font-bold">{comparison.currentScore}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Score Difference
            </p>
            <p
              className={`mt-2 flex items-center justify-center gap-1 font-display text-3xl font-bold ${
                comparison.scoreDifference > 0
                  ? "text-success"
                  : comparison.scoreDifference < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {comparison.scoreDifference > 0 && <TrendingUp className="h-6 w-6" aria-hidden />}
              {comparison.scoreDifference < 0 && <TrendingDown className="h-6 w-6" aria-hidden />}
              {comparison.scoreDifference === 0 && <Minus className="h-6 w-6" aria-hidden />}
              {formatScoreDifference(comparison.scoreDifference)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="font-display text-sm font-semibold">Added Keywords</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Present now but not in your previous analysis.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {comparison.addedKeywords.length > 0 ? (
                comparison.addedKeywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
                  >
                    {k}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No new keywords added.</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">Removed Missing Keywords</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Gaps from your previous run that are no longer missing.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {comparison.fixedMissingKeywords.length > 0 ? (
                comparison.fixedMissingKeywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {k}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No previously missing keywords were resolved.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-display text-sm font-semibold">Improved Areas</h4>
          {comparison.improvedAreas.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {comparison.improvedAreas.map((area) => (
                <li
                  key={area.area}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  <span className="font-medium">{area.area}</span>
                  <span className="text-muted-foreground">
                    {area.previousScore} → {area.currentScore}{" "}
                    <span className="font-semibold text-success">
                      ({formatScoreDifference(area.delta)})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No section scores increased compared to your previous analysis.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
