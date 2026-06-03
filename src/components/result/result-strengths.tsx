import { memo } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ResultStrengthsProps {
  part: "strengths" | "summary";
  strengths: string[];
  summary: string;
}

export const ResultStrengths = memo(function ResultStrengths({
  part,
  strengths,
  summary,
}: ResultStrengthsProps) {
  if (part === "summary") {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">AI Resume Summary</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {summary.trim() !== "" ? summary : "No AI summary available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
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
