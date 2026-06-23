import { memo, useMemo } from "react";
import { Sparkles, Zap, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { checkGrammar } from "@/lib/ats/grammar-check";

export interface ResultStrengthsProps {
  part: "strengths" | "summary";
  strengths: string[];
  summary: string;
  plan?: any;
  currentScore?: number;
  resumeText?: string;
}

/**
 * Distribute an improvement budget across the top 3 items proportionally by
 * impactScore. Ensures:
 *   - All gains are integers ≥ 1
 *   - They are strictly different (no two equal)
 *   - They sum exactly to `budget`
 *   - Higher-impact items get larger shares
 */
function distributeGains(items: any[], budget: number): number[] {
  if (items.length === 0 || budget <= 0) return [];

  const n = items.length;
  const weights = items.map((item) => {
    const base = { High: 5, Medium: 3, Low: 1 }[item.expectedAtsImpact as string] ?? 2;
    const priorityBonus = item.priority === "high" ? 2 : item.priority === "medium" ? 1 : 0;
    return base + priorityBonus;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Raw proportional allocation (may have decimals)
  const raw = weights.map((w) => (w / totalWeight) * budget);

  // Floor everything, accumulate remainder
  const gains = raw.map((v) => Math.max(1, Math.floor(v)));
  let remainder = budget - gains.reduce((a, b) => a + b, 0);

  // Distribute remainder to highest fractional parts first
  const fracs = raw.map((v, i) => ({ i, frac: v - Math.floor(v) }));
  fracs.sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) {
    gains[fracs[k % n].i]++;
  }

  // Ensure all gains are distinct — if two are equal, shift 1 point down/up
  for (let i = 1; i < gains.length; i++) {
    if (gains[i] >= gains[i - 1]) {
      // Try to reduce this one by 1 (keep ≥ 1)
      if (gains[i] > 1) {
        gains[i]--;
        gains[0]++; // give the point to the top item
      } else if (gains[i - 1] < budget - 1) {
        gains[i - 1]++;
        gains[i]--;
      }
    }
  }

  return gains;
}

export const ResultStrengths = memo(function ResultStrengths({
  part,
  strengths,
  summary,
  plan,
  currentScore,
  resumeText,
}: ResultStrengthsProps) {
  // Grammar gain — computed once, used in potential score and display
  const grammarGain = useMemo(() => {
    if (part !== "summary" || !resumeText) return 0;
    return checkGrammar(resumeText).estimatedAtsGain;
  }, [part, resumeText]);

  if (part === "summary") {
    const top3 = plan?.items?.slice(0, 3) ?? [];

    // ── Realistic improvement budget ────────────────────────────────────────
    const headroom = 100 - (currentScore ?? 100);
    const rawBudget = Math.round(headroom * 0.4);
    const budget = Math.min(28, Math.max(top3.length, rawBudget));

    // Potential score includes recommendation budget + grammar gains
    const potentialScore = Math.min(100, (currentScore ?? 0) + budget + grammarGain);
    const actualImprovement = budget; // shown as "Improvement Available" (recs only)
    const totalPotentialImprovement = potentialScore - (currentScore ?? 0);

    // Distribute gains so they sum exactly to actualImprovement (recs portion)
    const gains = distributeGains(top3, actualImprovement);

    const shortenTitle = (title: string) => {
      const missingKeywordMatch = title.match(/^Address missing keyword: (.+)$/);
      if (missingKeywordMatch) return `Add ${missingKeywordMatch[1]}`;
      const terminologyMatch = title.match(/^Add (.+) terminology to your resume$/);
      if (terminologyMatch) return `Add ${terminologyMatch[1]}`;
      const strengthenMatch = title.match(/^Strengthen resume around (.+)$/);
      if (strengthenMatch) return `Strengthen ${strengthenMatch[1]}`;
      return title;
    };

    return (
      <Card className="border-primary/30 bg-primary/5 transition-all duration-300 ease-out hover:border-primary/50 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Header with ATS Opportunities and score display */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" aria-hidden />
                <span className="text-sm font-bold uppercase tracking-wider">
                  ATS Opportunities
                </span>
              </div>
              {currentScore != null && plan != null && totalPotentialImprovement > 0 && (
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

            {/* Top 3 actions */}
            <div className="space-y-2">
              {top3.length > 0 ? (
                top3.map((item: any, index: number) => (
                  <div key={item.id} className="flex gap-3 rounded-2xl border border-border bg-background/80 p-2.5 transition-all hover:border-primary/30 hover:bg-background">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground leading-snug">
                        {shortenTitle(item.title)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {gains[index] != null && gains[index] > 0 && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-accent/50 px-1.5 py-0 text-[10px] font-bold text-accent-foreground">
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                            +{gains[index]} ATS
                          </span>
                        )}
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
