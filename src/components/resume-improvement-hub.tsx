import { Copy, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ImprovementSuggestion } from "@/lib/ats/types";
import { toast } from "sonner";

export interface ImprovementHubItem {
  id: string;
  keyword: string;
  whyItMatters: string;
  suggestion: string;
}

function normalizeForDedupe(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80);
}

export function buildImprovementHubItems(
  improvementSuggestions: ImprovementSuggestion[],
  suggestions: string[],
): ImprovementHubItem[] {
  const items: ImprovementHubItem[] = improvementSuggestions.map((item, index) => ({
    id: `ai-${item.keyword}-${index}`,
    keyword: item.keyword,
    whyItMatters: item.whyItMatters,
    suggestion: item.suggestion,
  }));

  const seen = new Set(
    items.flatMap((item) => [
      normalizeForDedupe(item.keyword),
      normalizeForDedupe(item.whyItMatters),
    ]),
  );

  suggestions.forEach((text, index) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const key = normalizeForDedupe(trimmed);
    if (seen.has(key)) return;
    seen.add(key);

    items.push({
      id: `tip-${index}`,
      keyword: `Quick win ${index + 1}`,
      whyItMatters: trimmed,
      suggestion: trimmed,
    });
  });

  return items;
}

function formatCopyText(item: ImprovementHubItem): string {
  return `${item.keyword}\n\nWhy it matters:\n${item.whyItMatters}\n\nSuggested bullet:\n${item.suggestion}`;
}

interface ResumeImprovementHubProps {
  role: string;
  improvementSuggestions: ImprovementSuggestion[];
  suggestions: string[];
}

export function ResumeImprovementHub({
  role,
  improvementSuggestions,
  suggestions,
}: ResumeImprovementHubProps) {
  const items = buildImprovementHubItems(improvementSuggestions, suggestions);

  return (
    <Card className="border-border/60 border-primary/20">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <PenLine className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Coaching</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">Resume Improvement Hub</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Keyword-focused bullets and ATS tips for {role}. Use your action plan above to prioritize
          what to tackle first.
        </p>

        {items.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No additional coaching items for this scan. Your action plan covers the main gaps, or
            keyword alignment already looks strong.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                    {item.keyword}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(formatCopyText(item));
                        toast.success(`Copied coaching for ${item.keyword}`);
                      } catch {
                        toast.error("Could not copy to clipboard.");
                      }
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                  </Button>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">Why it matters</p>
                    <p className="mt-1 text-muted-foreground">{item.whyItMatters}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Suggested resume bullet</p>
                    <p className="mt-1 text-muted-foreground">{item.suggestion}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
