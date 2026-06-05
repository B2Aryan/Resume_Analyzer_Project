import { useEffect, useState } from "react";
import { Check, Loader2, Wand2, FileText, Search, Target, PenTool, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const COVER_LETTER_STEPS = [
  {
    id: 1,
    icon: Search,
    label: "Analyzing resume",
  },
  {
    id: 2,
    icon: FileText,
    label: "Reading job description",
  },
  {
    id: 3,
    icon: Target,
    label: "Matching skills and keywords",
  },
  {
    id: 4,
    icon: PenTool,
    label: "Writing personalized cover letter",
  },
  {
    id: 5,
    icon: Wand2,
    label: "Finalizing content",
  },
];

const MOTIVATIONAL_MESSAGES = [
  "Analyzing your experience…",
  "Finding relevant achievements…",
  "Tailoring content for the role…",
  "Generating a recruiter-friendly cover letter…",
  "Almost done…",
];

interface CoverLetterProgressOverlayProps {
  open: boolean;
  onCancel: () => void;
}

export function CoverLetterProgressOverlay({
  open,
  onCancel,
}: CoverLetterProgressOverlayProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!open) {
      setActiveStepIndex(0);
      setMessageIndex(0);
      setBarWidth(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < COVER_LETTER_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 2500);

    const id = requestAnimationFrame(() => {
      const targetWidth = Math.round(((activeStepIndex + 1) / COVER_LETTER_STEPS.length) * 100);
      setBarWidth(targetWidth);
    });

    return () => {
      clearInterval(stepInterval);
      clearInterval(messageInterval);
      cancelAnimationFrame(id);
    };
  }, [open, activeStepIndex]);

  const completedStepIds = new Set(
    COVER_LETTER_STEPS.slice(0, activeStepIndex).map((s) => s.id)
  );

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="w-full max-w-md sm:max-w-[500px]">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 text-primary">
          <Wand2 className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Generating Cover Letter
          </span>
        </div>
        
        <h2 className="mt-3 font-display text-xl font-bold text-foreground">
          Crafting your personalized letter
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {MOTIVATIONAL_MESSAGES[messageIndex]}
        </p>

        <div
          className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(((activeStepIndex + 1) / COVER_LETTER_STEPS.length) * 100)}
        >
          <div
            className="h-full rounded-full bg-gradient-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(((activeStepIndex + 1) / COVER_LETTER_STEPS.length) * 100)}%` }}
          />
        </div>

        <ol className="mt-6 space-y-3">
          {COVER_LETTER_STEPS.map((step, idx) => {
            const done = completedStepIds.has(step.id);
            const active = activeStepIndex === idx;
            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-start gap-3 text-sm transition-opacity duration-300",
                  done || active ? "opacity-100" : "opacity-45",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    done
                      ? "border-success bg-success text-success-foreground"
                      : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "leading-snug",
                    done ? "text-muted-foreground line-through" : "text-foreground",
                    active && !done && "font-medium",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
