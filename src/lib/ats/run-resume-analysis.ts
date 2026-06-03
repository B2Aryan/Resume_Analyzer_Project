import { extractTextFromPDF } from "@/lib/ats/pdf-parser";
import {
  analyzeResumeWithGemini,
  type AnalysisProvider,
  type AnalysisResult,
} from "@/lib/ats/analyzer";
import type { ATSAnalysisResult } from "@/lib/ats/types";
import { buildActionPlan } from "@/lib/ats/action-plan";
import type { AnalysisProgressReporter } from "@/lib/ats/analysis-progress";

function parseResumeStructure(resumeText: string): void {
  const trimmed = resumeText.trim();
  if (!trimmed) {
    throw new Error("Resume text is empty.");
  }
  const lineCount = trimmed.split(/\n+/).filter(Boolean).length;
  if (lineCount < 2 && trimmed.length < 80) {
    throw new Error("Resume text looks too short to analyze.");
  }
}

export interface RunResumeAnalysisInput {
  file: File | null;
  pastedText: string;
  role: string;
  jobDescription?: string;
  onProgress: AnalysisProgressReporter;
}

export type RunResumeAnalysisSuccess = {
  success: true;
  data: ATSAnalysisResult;
  provider: AnalysisProvider;
  usedBackupProvider: boolean;
  fileName: string;
  resumeText: string;
};

export type RunResumeAnalysisResult = RunResumeAnalysisSuccess | Extract<AnalysisResult, { success: false }>;

export async function runResumeAnalysis(
  input: RunResumeAnalysisInput,
): Promise<RunResumeAnalysisResult> {
  const jd = input.jobDescription?.trim() ?? "";
  const hasJobDescription = jd.length > 0;
  let resumeText = input.pastedText.trim();
  let fileName = "Resume.txt";

  if (input.file) {
    input.onProgress("extract", "start");
    fileName = input.file.name;
    resumeText = await extractTextFromPDF(input.file);
    input.onProgress("extract", "complete");
  }

  input.onProgress("parse", "start");
  parseResumeStructure(resumeText);
  input.onProgress("parse", "complete");

  const result = await analyzeResumeWithGemini(resumeText, input.role, jd || undefined, {
    onProgress: input.onProgress,
    hasJobDescription,
  });

  if (!result.success) {
    return result;
  }

  input.onProgress("action-plan", "start");
  buildActionPlan({
    role: input.role,
    score: result.data.score,
    atsCompatibility: result.data.atsCompatibility,
    keywordMatch: result.data.keywordMatch,
    skillsScore: result.data.skillsScore,
    projectScore: result.data.projectScore,
    missingKeywords: result.data.missingKeywords,
    suggestions: result.data.suggestions,
    improvementSuggestions: result.data.improvementSuggestions ?? [],
    hasJobDescription,
    jdMatch: result.data.jdMatch ?? null,
    summary: result.data.summary,
    strengths: result.data.strengths,
  });
  input.onProgress("action-plan", "complete");

  input.onProgress("finalize", "start");
  input.onProgress("finalize", "complete");

  return {
    success: true,
    data: result.data,
    provider: result.provider,
    usedBackupProvider: result.usedBackupProvider,
    fileName,
    resumeText,
  };
}
