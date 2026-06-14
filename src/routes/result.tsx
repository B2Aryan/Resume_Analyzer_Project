import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { GitCompare } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { useAnalysisStore } from "@/store/analysisStore";
import { downloadATSReportPdf } from "@/lib/pdf/ats-report-pdf";
import { buildActionPlan } from "@/lib/ats/action-plan";
import { ResumeImprovementHub } from "@/components/resume-improvement-hub";
import { ProviderFallbackBanner } from "@/components/provider-fallback-banner";
import { ResultPageSkeletons } from "@/components/result-skeletons";
import { ResultHero } from "@/components/result/result-hero";
import { ResultJDMatch } from "@/components/result/result-jd-match";
import { ResultActionPlan } from "@/components/result/result-action-plan";
import { ResultComparison } from "@/components/result/result-comparison";
import { ResultKeywords } from "@/components/result/result-keywords";
import { ResultStrengths } from "@/components/result/result-strengths";
import { ResultTools } from "@/components/result/result-tools";
import { ResultScoreBreakdown } from "@/components/result/result-score-breakdown";
import { PotentialATSScore } from "@/components/result/result-potential-score";
import {
  ResultReportBody,
  ResultReportHybridBand,
} from "@/components/result/result-report-layout";
import { Card, CardContent } from "@/components/ui/card";
import type { ATSAnalysisResult } from "@/lib/ats/types";
import { compareAnalysisVersions } from "@/lib/ats/compare-versions";
import { getPreviousAnalysis } from "@/lib/storage/analysis-versions";
import {
  canCompareResumes,
  type ResumeSimilarityScores,
} from "@/lib/ats/resume-similarity";

function NotComparableCard({ similarity }: { similarity: ResumeSimilarityScores }) {
  return (
    <Card className="border-border/60 bg-muted/30 transition-all duration-300 ease-out hover:border-primary/40 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <GitCompare className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Version history</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">This appears to be a different resume</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Version comparison is unavailable.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Similarity Score</p>
          <p className="mt-2 font-display text-3xl font-bold">{similarity.total}/100</p>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Analysis Result — ResumePilot" },
      {
        name: "description",
        content: "Your ATS resume analysis with score, keywords and improvement suggestions.",
      },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const {
    hasResult,
    role,
    fileName,
    score,
    atsCompatibility,
    keywordMatch,
    skillsScore,
    projectScore,
    missingKeywords,
    presentKeywords,
    strengths,
    suggestions,
    summary,
    hasJobDescription,
    jdMatch,
    improvementSuggestions,
    resumeText,
    jobDescription,
    isRevealingReport,
    usedBackupProvider,
    acknowledgeReportReveal,
    analysisId,
  } = useAnalysisStore();



  useEffect(() => {
    if (!hasResult) {
      toast.error("No analysis result found. Please upload a resume first.");
      navigate({ to: "/upload" });
    }
  }, [hasResult, navigate]);

  useEffect(() => {
    if (!isRevealingReport) return;
    const timer = window.setTimeout(() => acknowledgeReportReveal(), 550);
    return () => window.clearTimeout(timer);
  }, [isRevealingReport, acknowledgeReportReveal]);

  const handleDownloadPdf = useCallback(() => {
    if (!hasResult) return;
    try {
      downloadATSReportPdf({
        role,
        fileName,
        score,
        atsCompatibility,
        keywordMatch,
        skillsScore,
        projectScore,
        strengths,
        suggestions,
        missingKeywords,
        presentKeywords,
        summary,
        hasJobDescription,
        jdMatch: jdMatch ?? undefined,
      });
      toast.success("PDF report downloaded.");
    } catch {
      toast.error("Could not generate PDF report. Please try again.");
    }
  }, [
    hasResult,
    role,
    fileName,
    score,
    atsCompatibility,
    keywordMatch,
    skillsScore,
    projectScore,
    strengths,
    suggestions,
    missingKeywords,
    presentKeywords,
    summary,
    hasJobDescription,
    jdMatch,
  ]);

  const currentResult = useMemo((): ATSAnalysisResult => {
    return {
      score,
      atsCompatibility,
      keywordMatch,
      skillsScore,
      projectScore,
      strengths,
      suggestions,
      presentKeywords,
      missingKeywords,
      summary,
      jdMatch: jdMatch ?? undefined,
      improvementSuggestions,
    };
  }, [
    score,
    atsCompatibility,
    keywordMatch,
    skillsScore,
    projectScore,
    strengths,
    suggestions,
    presentKeywords,
    missingKeywords,
    summary,
    jdMatch,
    improvementSuggestions,
  ]);

  const versionComparison = useMemo(() => {
    const previous = getPreviousAnalysis();
    if (!previous) return null;

    const { canCompare, similarity } = canCompareResumes({
      current: { role, fileName, analysisResult: currentResult },
      previous: {
        role: previous.role,
        fileName: previous.fileName,
        analysisResult: previous.result,
      },
    });

    if (!canCompare) {
      return {
        type: "not_comparable",
        similarity,
        previous,
      } as const;
    }

    return {
      type: "comparable",
      comparison: compareAnalysisVersions(previous.result, currentResult, {
        savedAt: previous.savedAt,
        role: previous.role,
        fileName: previous.fileName,
      }),
    } as const;
  }, [currentResult, role, fileName]);

  const actionPlan = useMemo(
    () =>
      buildActionPlan({
        role,
        score,
        atsCompatibility,
        keywordMatch,
        skillsScore,
        projectScore,
        missingKeywords,
        suggestions,
        improvementSuggestions,
        hasJobDescription,
        jdMatch,
        summary,
        strengths,
      }),
    [
      role,
      score,
      atsCompatibility,
      keywordMatch,
      skillsScore,
      projectScore,
      missingKeywords,
      suggestions,
      improvementSuggestions,
      hasJobDescription,
      jdMatch,
      summary,
      strengths,
    ],
  );

  const breakdown = useMemo(
    () => [
      {
        label: "ATS Compatibility",
        value: atsCompatibility,
        hint: "Based on section structure and formatting.",
      },
      {
        label: "Keyword Match",
        value: keywordMatch,
        hint: `${presentKeywords.length} of ${presentKeywords.length + missingKeywords.length} keywords found.`,
      },
      {
        label: "Project Section",
        value: projectScore,
        hint: "Based on action verbs and measurable impact.",
      },
      {
        label: "Skills Section",
        value: skillsScore,
        hint: "Based on technical skills highlighted.",
      },
    ],
    [
      atsCompatibility,
      keywordMatch,
      projectScore,
      skillsScore,
      presentKeywords.length,
      missingKeywords.length,
    ],
  );

  const sidebarMissingKeywords = useMemo(
    () => (hasJobDescription && jdMatch ? jdMatch.missingKeywords : missingKeywords),
    [hasJobDescription, jdMatch, missingKeywords],
  );

  const heroProps = useMemo(
    () => ({
      fileName,
      role,
      hasJobDescription,
      hasJdMatch: Boolean(jdMatch),
      score,
      atsCompatibility,
      sidebarMissingKeywords,
      quickWinCount: suggestions.length,
      onDownloadPdf: handleDownloadPdf,
      resumeText,
      jobDescription,
    }),
    [
      fileName,
      role,
      hasJobDescription,
      jdMatch,
      score,
      atsCompatibility,
      sidebarMissingKeywords,
      suggestions.length,
      handleDownloadPdf,
      resumeText,
      jobDescription,
    ],
  );

  const toolsProps = useMemo(
    () => ({
      role,
      resumeText,
      jobDescription,
      onDownloadPdf: handleDownloadPdf,
    }),
    [role, resumeText, jobDescription, handleDownloadPdf],
  );

  const hubProps = useMemo(
    () => ({
      role,
      improvementSuggestions,
      suggestions,
    }),
    [role, improvementSuggestions, suggestions],
  );

  if (!hasResult) {
    return null;
  }

  return (
    <MarketingLayout>
      <ResultHero part="header" {...heroProps} />

      <section className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
        {isRevealingReport ? (
          <ResultPageSkeletons />
        ) : (
          <ResultReportBody className="animate-report-reveal">
            {usedBackupProvider && <ProviderFallbackBanner />}

            <ResultHero part="score" {...heroProps} />

            <PotentialATSScore currentScore={score} actionPlan={actionPlan} />

            <ResultJDMatch hasJobDescription={hasJobDescription} jdMatch={jdMatch} />

            <ResultActionPlan plan={actionPlan} />

            {versionComparison && (
              <div className="lg:hidden">
                {versionComparison.type === "comparable" ? (
                  <ResultComparison comparison={versionComparison.comparison} />
                ) : (
                  <NotComparableCard similarity={versionComparison.similarity} />
                )}
              </div>
            )}

            <ResultReportHybridBand>
              <div className="flex min-w-0 flex-col gap-6 lg:col-start-1">
                <div className="flex flex-col gap-6 lg:hidden">
                  <ResultScoreBreakdown breakdown={breakdown} />
                  <ResultStrengths part="strengths" strengths={strengths} summary={summary} />
                </div>
                <ResumeImprovementHub {...hubProps} />
              </div>

              <aside className="flex min-w-0 flex-col gap-6 lg:col-start-2">
                <ResultStrengths part="summary" strengths={strengths} summary={summary} />
                <ResultKeywords
                  missingKeywords={sidebarMissingKeywords}
                  presentKeywords={presentKeywords}
                />
                <div className="hidden flex-col gap-6 lg:flex">
                  <ResultScoreBreakdown breakdown={breakdown} />
                  <ResultStrengths part="strengths" strengths={strengths} summary={summary} />
                </div>
              </aside>
            </ResultReportHybridBand>

            <ResultTools part="rewriter" {...toolsProps} />

            {versionComparison && (
              <div className="hidden lg:block">
                {versionComparison.type === "comparable" ? (
                  <ResultComparison comparison={versionComparison.comparison} />
                ) : (
                  <NotComparableCard similarity={versionComparison.similarity} />
                )}
              </div>
            )}
          </ResultReportBody>
        )}
      </section>
    </MarketingLayout>
  );
}
