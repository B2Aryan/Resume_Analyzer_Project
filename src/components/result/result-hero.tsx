import { memo, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import { getVerdict } from "@/components/result/result-verdict";

export interface ResultHeroProps {
  part: "header" | "score";
  fileName: string;
  role: string;
  hasJobDescription: boolean;
  hasJdMatch: boolean;
  score: number;
  atsCompatibility: number;
  sidebarMissingKeywords: string[];
  quickWinCount: number;
  onDownloadPdf: () => void;
}

export const ResultHero = memo(function ResultHero({
  part,
  fileName,
  role,
  hasJobDescription,
  hasJdMatch,
  score,
  atsCompatibility,
  sidebarMissingKeywords,
  quickWinCount,
  onDownloadPdf,
}: ResultHeroProps) {
  const verdict = useMemo(() => getVerdict(score), [score]);

  if (part === "header") {
    return (
      <section className="border-b border-border hero-ambient overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Analysis Report
              </p>
              <h1 className="mt-1 truncate font-display text-2xl font-bold sm:text-4xl">{fileName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Target: {role} · Analyzed just now
                {hasJobDescription && hasJdMatch ? " · JD match report" : ""}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                variant="outline"
                onClick={onDownloadPdf}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4" aria-hidden /> Download PDF Report
              </Button>
              <Button asChild variant="hero" className="w-full sm:w-auto">
                <Link to="/upload">
                  <RotateCcw className="h-4 w-4" aria-hidden /> Try another resume
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="grid items-center gap-6 p-6 sm:grid-cols-[auto,1fr] sm:p-8">
        <ScoreRing score={score} />
        <div>
          <h2 className="font-display text-2xl font-bold">{verdict.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{verdict.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {atsCompatibility >= 70 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3 w-3" aria-hidden /> ATS-safe
              </span>
            )}
            {sidebarMissingKeywords.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                <AlertCircle className="h-3 w-3" aria-hidden /> Keyword gaps
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3 w-3" aria-hidden /> {quickWinCount} quick wins
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
