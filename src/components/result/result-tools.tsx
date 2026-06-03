import { memo, useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, ArrowRight, Copy, Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  rewriteResumeBullet,
  type BulletRewriteResult,
} from "@/lib/ats/bullet-rewriter";

export interface ResultToolsProps {
  part: "rewriter" | "actions";
  role: string;
  resumeText: string;
  jobDescription: string;
  onDownloadPdf: () => void;
}

export const ResultTools = memo(function ResultTools({
  part,
  role,
  resumeText,
  jobDescription,
  onDownloadPdf,
}: ResultToolsProps) {
  const [bulletInput, setBulletInput] = useState("");
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletRewrite, setBulletRewrite] = useState<BulletRewriteResult | null>(null);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, []);

  const handleRewriteBullet = useCallback(async () => {
    if (!bulletInput.trim()) {
      toast.error("Enter a bullet point to rewrite.");
      return;
    }
    setBulletLoading(true);
    setBulletRewrite(null);
    try {
      const result = await rewriteResumeBullet({
        originalBullet: bulletInput,
        resumeText,
        targetRole: role,
        jobDescription: jobDescription || undefined,
      });
      if (result.success) {
        setBulletRewrite(result.data);
      } else if (result.isQuotaError) {
        toast.error("Daily AI limit reached. Please try again later.");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Could not rewrite bullet. Please try again.");
    } finally {
      setBulletLoading(false);
    }
  }, [bulletInput, resumeText, role, jobDescription]);

  if (part === "actions") {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h3 className="font-display text-base font-semibold">Next actions</h3>
          <div className="mt-4 space-y-2">
            <Button asChild variant="hero" className="w-full">
              <Link to="/upload">
                Re-scan after edits <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={onDownloadPdf}>
              <Download className="h-4 w-4" aria-hidden /> Download PDF Report
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/dashboard">Save to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 border-primary/20">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Wand2 className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Bullet rewriter</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">Improve Resume Bullet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a weak bullet from your resume. We&apos;ll suggest stronger, ATS-friendly, and
          impact-focused versions using your analysis context — without inventing metrics or fake
          experience.
        </p>

        <div className="mt-5 space-y-2">
          <Label htmlFor="bullet-input">Existing bullet point</Label>
          <Textarea
            id="bullet-input"
            placeholder='e.g. "Built an e-commerce website."'
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            className="min-h-[88px] resize-y"
            disabled={bulletLoading}
          />
        </div>

        <Button
          type="button"
          variant="hero"
          className="mt-4 w-full sm:w-auto"
          disabled={bulletLoading || !bulletInput.trim()}
          onClick={handleRewriteBullet}
          aria-busy={bulletLoading}
        >
          {bulletLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Rewriting…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" aria-hidden /> Rewrite bullet
            </>
          )}
        </Button>

        {bulletRewrite && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Original
              </p>
              <p className="mt-2 text-sm text-foreground">{bulletInput.trim()}</p>
            </div>

            {(
              [
                { key: "stronger" as const, label: "Stronger version", text: bulletRewrite.stronger },
                {
                  key: "atsOptimized" as const,
                  label: "ATS-optimized version",
                  text: bulletRewrite.atsOptimized,
                },
                {
                  key: "impactFocused" as const,
                  label: "Impact-focused version",
                  text: bulletRewrite.impactFocused,
                },
              ] as const
            ).map((variant) => (
              <div
                key={variant.key}
                className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold text-foreground">{variant.label}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => copyToClipboard(variant.text, variant.label)}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{variant.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
