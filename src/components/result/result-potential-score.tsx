import { Card, CardContent } from "@/components/ui/card";
import type { ActionPlan } from "@/lib/ats/action-plan";

interface PotentialATSScoreProps {
  currentScore: number;
  actionPlan: ActionPlan;
}

export function PotentialATSScore({ currentScore, actionPlan }: PotentialATSScoreProps) {
  // Calculate sum of top 3 impact scores
  const top3ImpactSum = actionPlan.items
    .slice(0, 3)
    .reduce((sum, item) => sum + (item.impactScore || 0), 0);
  
  // Apply diminishing returns formula
  const improvement = (top3ImpactSum * (100 - currentScore)) / 100;
  const potentialScoreBeforeCap = Math.round(currentScore + improvement);
  
  // Cap at 95
  const potentialScore = Math.min(95, potentialScoreBeforeCap);
  const actualImprovement = potentialScore - currentScore;

  return (
    <Card className="border-border/60 border-primary/20">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Potential Score
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              With top 3 recommendations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="font-display text-3xl font-bold">{currentScore}</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div>
              <p className="text-xs text-muted-foreground">Potential</p>
              <p className="font-display text-3xl font-bold text-primary">{potentialScore}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            +{actualImprovement} Improvement Available
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
