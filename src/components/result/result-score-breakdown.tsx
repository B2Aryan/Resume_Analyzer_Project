import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBar } from "@/components/score-ring";

export interface ScoreBreakdownItem {
  label: string;
  value: number;
  hint: string;
}

export interface ResultScoreBreakdownProps {
  breakdown: ScoreBreakdownItem[];
}

export const ResultScoreBreakdown = memo(function ResultScoreBreakdown({
  breakdown,
}: ResultScoreBreakdownProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-6 sm:p-8">
        <h3 className="font-display text-lg font-semibold">Score breakdown</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {breakdown.map((b) => (
            <ScoreBar key={b.label} {...b} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
