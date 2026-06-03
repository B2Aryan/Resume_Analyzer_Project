export type AnalysisProgressStepId =
  | "extract"
  | "parse"
  | "ats"
  | "jd-match"
  | "improvements"
  | "action-plan"
  | "finalize";

export type AnalysisProgressPhase = "start" | "complete" | "skip";

export type AnalysisProgressReporter = (
  step: AnalysisProgressStepId,
  phase: AnalysisProgressPhase,
) => void;

export interface AnalysisStepDefinition {
  id: AnalysisProgressStepId;
  label: string;
}

export function getAnalysisSteps(options: {
  hasPdf: boolean;
  hasJobDescription: boolean;
}): AnalysisStepDefinition[] {
  const steps: AnalysisStepDefinition[] = [];

  if (options.hasPdf) {
    steps.push({ id: "extract", label: "Extracting resume text…" });
  }

  steps.push({ id: "parse", label: "Parsing resume structure…" });
  steps.push({ id: "ats", label: "Running ATS analysis…" });

  if (options.hasJobDescription) {
    steps.push({ id: "jd-match", label: "Matching against job description…" });
  }

  steps.push({ id: "improvements", label: "Generating improvement suggestions…" });
  steps.push({ id: "action-plan", label: "Creating action plan…" });
  steps.push({ id: "finalize", label: "Finalizing report…" });

  return steps;
}

export function createProgressTracker(
  onUpdate: (activeId: AnalysisProgressStepId | null, completed: Set<AnalysisProgressStepId>) => void,
) {
  const completed = new Set<AnalysisProgressStepId>();
  let active: AnalysisProgressStepId | null = null;

  const sync = () => onUpdate(active, new Set(completed));

  const report: AnalysisProgressReporter = (step, phase) => {
    if (phase === "start") {
      active = step;
      sync();
      return;
    }
    if (phase === "complete" || phase === "skip") {
      completed.add(step);
      if (active === step) active = null;
      sync();
    }
  };

  return report;
}
