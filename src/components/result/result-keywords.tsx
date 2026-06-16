import { memo } from "react";
import { KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export interface ResultKeywordsProps {
  missingKeywords: string[];
  presentKeywords: string[];
}

export const ResultKeywords = memo(function ResultKeywords({
  missingKeywords,
  presentKeywords,
}: ResultKeywordsProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-display text-base font-semibold">Missing keywords</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Try to add these naturally where relevant.
        </p>
        <div className="mt-4">
          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.slice(0, 10).map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
                >
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={KeyRound}
              title="No missing keywords"
              description="Your resume covers the keywords we checked for this role. Re-scan after edits or add a job description for deeper matching."
              className="py-6"
            />
          )}
        </div>
        <h3 className="mt-6 font-display text-base font-semibold">Detected keywords</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presentKeywords.length > 0 ? (
            presentKeywords.slice(0, 10).map((k) => (
              <span
                key={k}
                className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
              >
                {k}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No keywords detected yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
