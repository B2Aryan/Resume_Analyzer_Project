import { memo } from "react";
import { Sparkles, Zap, CheckCircle2, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export interface ResultStrengthsProps {
  part: "strengths" | "summary";
  strengths: string[];
  summary: string;
  plan?: any;
  currentScore?: number;
}

export const ResultStrengths = memo(function ResultStrengths({
  part,
  strengths,
  summary,
  plan,
  currentScore,
}: ResultStrengthsProps) {
  const navigate = useNavigate();

  if (part === "summary") {
    const top3 = plan?.items?.slice(0, 3) ?? [];
    const potentialScore = plan ? Math.min(100, currentScore + plan.items.reduce((acc, item) => acc + item.impactScore, 0)) : currentScore;
    const actualImprovement = potentialScore - (currentScore ?? 0);
    const totalRecommendations = plan?.items?.length ?? 0;

    const shortenTitle = (title: string) => {
      const missingKeywordMatch = title.match(/^Address missing keyword: (.+)$/);
      if (missingKeywordMatch) {
        return `Add ${missingKeywordMatch[1]}`;
      }
      
      const terminologyMatch = title.match(/^Add (.+) terminology to your resume$/);
      if (terminologyMatch) {
        return `Add ${terminologyMatch[1]}`;
      }
      
      const strengthenMatch = title.match(/^Strengthen resume around (.+)$/);
      if (strengthenMatch) {
        return `Strengthen ${strengthenMatch[1]}`;
      }
      
      return title;
    };

    return (
      <Card className="border-primary/30 bg-primary/5 transition-all duration-300 ease-out hover:border-primary/50 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Header with Action Center and score display */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" aria-hidden />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Action Center
                </span>
              </div>
              {currentScore != null && plan != null && actualImprovement > 0 && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current</p>
                    <p className="font-display text-lg font-bold">{currentScore}</p>
                  </div>
                  <div className="text-lg text-muted-foreground">→</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Potential</p>
                    <p className="font-display text-lg font-bold text-primary">{potentialScore}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Improvement available tag */}
            {actualImprovement > 0 && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success">
                  +{actualImprovement} Improvement Available
                </span>
              </div>
            )}
            
            {/* Top 3 actions */}
            <div className="space-y-2">
              {top3.length > 0 ? (
                top3.map((item, index) => (
                  <div key={item.id} className="flex gap-3 rounded-2xl border border-border bg-background/80 p-2.5 transition-all hover:border-primary/30 hover:bg-background">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground leading-snug">
                        {shortenTitle(item.title)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-accent/50 px-1.5 py-0 text-[10px] font-bold text-accent-foreground">
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                          +{item.impactScore * 2} ATS
                        </span>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-1.5 py-0 text-[10px] font-bold text-muted-foreground">
                          {item.expectedAtsImpact} Impact
                        </span>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-1.5 py-0 text-[10px] font-bold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {item.effort}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No action items available yet.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <Button 
            variant="ghost" 
            className="w-full justify-between px-2 text-sm font-semibold text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            View all {totalRecommendations} recommendations
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 transition-all duration-300 ease-out hover:border-primary/40 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sparkles className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">
            What&apos;s Working
          </span>
        </div>
        <h3 className="font-display text-base font-semibold">What&apos;s working</h3>
        <ul className="mt-3 space-y-2.5">
          {strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
});
