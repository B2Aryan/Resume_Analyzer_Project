import { useCallback, useEffect, useState } from "react";
import { ListChecks, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import type { ActionPlan, ActionPlanItem } from "@/lib/ats/action-plan";
import {
  loadCompletedActionIds,
  saveCompletedActionIds,
} from "@/lib/storage/action-plan-progress";

const PRIORITY_LABELS = {
  high: "High Impact",
  medium: "Medium Impact",
  low: "Low Impact",
} as const;

const PRIORITY_STYLES = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
} as const;

function ActionRow({
  item,
  checked,
  onToggle,
}: {
  item: ActionPlanItem;
  checked: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring ${
        checked ? "border-success/40 bg-success/5" : "border-border bg-card"
      }`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onToggle(item.id, v === true)}
        className="mt-0.5 shrink-0"
        aria-label={`Mark complete: ${item.title}`}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-sm font-semibold leading-snug ${
              checked ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {item.title}
          </p>
          <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            ATS impact: {item.expectedAtsImpact}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{item.whyItMatters}</p>
      </div>
    </label>
  );
}

function PriorityGroup({
  priority,
  items,
  completed,
  onToggle,
}: {
  priority: keyof typeof PRIORITY_LABELS;
  items: ActionPlanItem[];
  completed: Set<string>;
  onToggle: (id: string, value: boolean) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
        >
          {PRIORITY_LABELS[priority]}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <ActionRow
            key={item.id}
            item={item}
            checked={completed.has(item.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export function ActionPlanSection({ plan }: { plan: ActionPlan }) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());

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
        <div className="mt-4">
          <Progress
            value={progressPct}
            className="h-2"
            aria-label={`Action plan progress: ${done} of ${total} completed`}
          />
        </div>

        <div className="mt-6 space-y-6">
          <PriorityGroup
            priority="high"
            items={plan.high}
            completed={completed}
            onToggle={onToggle}
          />
          <PriorityGroup
            priority="medium"
            items={plan.medium}
            completed={completed}
            onToggle={onToggle}
          />
          <PriorityGroup
            priority="low"
            items={plan.low}
            completed={completed}
            onToggle={onToggle}
          />
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
