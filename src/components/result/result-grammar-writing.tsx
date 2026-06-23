import { memo, useMemo } from "react";
import { PenLine, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { checkGrammar } from "@/lib/ats/grammar-check";

interface ResultGrammarWritingProps {
  resumeText: string;
}

export const ResultGrammarWriting = memo(function ResultGrammarWriting({
  resumeText,
}: ResultGrammarWritingProps) {
  const result = useMemo(() => checkGrammar(resumeText), [resumeText]);

  const top3 = result.issues.slice(0, 3);

  const clarityColor =
    result.clarityScore >= 80
      ? "text-success"
      : result.clarityScore >= 60
        ? "text-warning"
        : "text-destructive";

  return (
    <Card className="border-border/60 transition-all duration-300 ease-out hover:border-primary/40 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-2 text-primary">
            <PenLine className="h-4 w-4" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider">
              Grammar &amp; Writing
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-muted/30 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
                Issues
              </p>
              <p className="mt-0.5 font-display text-base font-bold">
                {result.issueCount}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
                Clarity
              </p>
              <p className={`mt-0.5 font-display text-base font-bold ${clarityColor}`}>
                {result.clarityScore}
                <span className="text-[10px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
                ATS Gain
              </p>
              <p className="mt-0.5 font-display text-base font-bold text-primary">
                +{result.estimatedAtsGain}
              </p>
            </div>
          </div>

          {/* ATS gain chip */}
          {result.estimatedAtsGain > 0 && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
              <span className="text-xs text-muted-foreground">
                Fixing grammar issues could improve your ATS score by{" "}
                <span className="font-semibold text-primary">+{result.estimatedAtsGain} pts</span>
              </span>
            </div>
          )}

          {/* Issues list or clean state */}
          {top3.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
              <p className="text-xs text-success font-medium">
                No major grammar or writing issues detected
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {top3.map((issue, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-snug">
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    issue.severity === "high"
                      ? "bg-destructive"
                      : issue.severity === "medium"
                        ? "bg-warning"
                        : "bg-muted-foreground"
                  }`} aria-hidden />
                  {issue.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
