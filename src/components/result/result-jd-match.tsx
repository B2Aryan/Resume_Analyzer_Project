import { memo, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBar } from "@/components/score-ring";
import { EmptyState } from "@/components/empty-state";
import type { JDMatchResult } from "@/lib/ats/types";

export interface ResultJDMatchProps {
  hasJobDescription: boolean;
  jdMatch: JDMatchResult | null;
}

export const ResultJDMatch = memo(function ResultJDMatch({
  hasJobDescription,
  jdMatch,
}: ResultJDMatchProps) {
  const jdScoreHint = useMemo(() => {
    if (!jdMatch) return "";
    const total = jdMatch.matchedKeywords.length + jdMatch.missingKeywords.length;
    if (total > 0) {
      return `${jdMatch.matchedKeywords.length} of ${total} technical keywords from the job description appear in your resume. Generic role titles are excluded.`;
    }
    return "No scorable technical keywords were found in the job description text.";
  }, [jdMatch]);

  if (!hasJobDescription) {
    return (
      <Card className="border-border/60 border-dashed">
        <CardContent className="p-6 sm:p-8">
          <EmptyState
            icon={Briefcase}
            title="No job description provided"
            description="Paste a full job description on your next scan to unlock tailored match scores, JD-specific keywords, and a targeted action plan."
          >
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/upload">Add job description on next scan</Link>
            </Button>
          </EmptyState>
        </CardContent>
      </Card>
    );
  }

  if (!jdMatch) return null;

  // Check if JD is insufficient (<3 keywords)
  if (!jdMatch.isSufficientJD) {
    return (
      <Card className="border-border/60 border-dashed">
        <CardContent className="p-6 sm:p-8">
          <EmptyState
            icon={Briefcase}
            title="Provide a detailed job description"
            description="Provide a detailed job description for accurate keyword matching."
          >
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/upload">Update job description on next scan</Link>
            </Button>
          </EmptyState>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 border-primary/30 shadow-soft">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Briefcase className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Job Description Match
          </span>
        </div>
        <div className="mt-5 max-w-xl">
          <ScoreBar label="JD Match Score" value={jdMatch.jdMatchScore} hint={jdScoreHint} />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="font-display text-sm font-semibold">Matched Keywords</h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {jdMatch.matchedKeywords.length > 0 ? (
                jdMatch.matchedKeywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
                  >
                    {k}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No matched keywords identified.</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">Missing Keywords</h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {jdMatch.missingKeywords.length > 0 ? (
                jdMatch.missingKeywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
                  >
                    {k}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No missing keywords — strong JD alignment.
                </p>
              )}
            </div>
          </div>
        </div>
        {jdMatch.jdSummary.trim() !== "" && (
          <div className="mt-6">
            <h4 className="font-display text-sm font-semibold">JD Summary</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{jdMatch.jdSummary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
