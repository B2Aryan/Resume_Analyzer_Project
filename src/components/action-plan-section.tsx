import { useCallback, useEffect, useState } from "react";
import { ListChecks, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { ActionPlan, ActionPlanItem } from "@/lib/ats/action-plan";
import {
  loadCompletedActionIds,
  saveCompletedActionIds,
} from "@/lib/storage/action-plan-progress";

function RecommendationCard({
  item,
  rank,
  checked,
  onToggle,
}: {
  item: ActionPlanItem;
  rank: number;
  checked: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  // Calculate impact display: +X ATS where X is impactScore * 2 (to make it look nice)
  const impactDisplay = `+${item.impactScore * 2} ATS`;
  
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-ring ${
        checked ? "border-success/40 bg-success/5" : "border-border bg-card hover:border-border/80"
      }`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onToggle(item.id, v === true)}
        className="mt-1 shrink-0"
        aria-label={`Mark complete: ${item.title}`}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            #{rank}
          </span>
          <p
            className={`text-sm font-semibold leading-snug ${
              checked ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {item.title}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 rounded-full border border-border bg-accent/30 px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
            Impact: {impactDisplay}
          </span>
          <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            Effort: {item.effort}
          </span>
        </div>
        
        <p className="text-xs leading-relaxed text-muted-foreground mt-1.5">{item.whyItMatters}</p>
      </div>
    </label>
  );
}

export function ActionPlanSection({ plan }: { plan: ActionPlan }) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setCompleted(new Set(loadCompletedActionIds(plan.planKey)));
  }, [plan.planKey]);

  const onToggle = useCallback(
    (id: string, value: boolean) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (value) next.add(id);
        else next.delete(id);
        saveCompletedActionIds(plan.planKey, Array.from(next));
        return next;
      });
    },
    [plan.planKey],
  );

  const total = plan.items.length;
  const done = plan.items.filter((i) => completed.has(i.id)).length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  
  const displayItems = showAll ? plan.items : plan.items.slice(0, 3);

  return (
    <Card className="border-border/60 border-primary/20">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <ListChecks className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Roadmap</span>
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold">Recommended Action Plan</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Prioritized steps from your ATS score, keywords, job match, and AI suggestions.
            </p>
          </div>
          {total > 0 && (
            <div
              className="flex shrink-0 items-center gap-2 self-start rounded-full bg-accent/50 px-3 py-1.5 text-sm font-semibold"
              aria-live="polite"
            >
              {done === total ? (
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
              ) : null}
              <span>
                {done}/{total} completed
              </span>
            </div>
          )}
        </div>

        {total === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={ListChecks}
              title="No action items right now"
              description="Your resume is in great shape for this analysis. Re-scan after edits or add a job description to generate a tailored roadmap."
            />
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {displayItems.map((item, index) => (
                <RecommendationCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  checked={completed.has(item.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
            
            {total > 3 && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show All {total} Recommendations
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
