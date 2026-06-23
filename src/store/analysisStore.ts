import { create } from "zustand";
import {
  ATSAnalysisResult,
  ImprovementSuggestion,
  JDMatchResult,
} from "@/lib/ats/types";
import type { InterviewQuestionsResponse } from "@/lib/ats/interview-questions";
import { getCurrentStoredAnalysis } from "@/lib/storage/analysis-versions";

const PENDING_ANALYSIS_KEY = "resumePilot.pendingAnalysis";

interface AnalysisState {
  role: string;
  fileName: string;
  resumeText: string;
  jobDescription: string;
  hasJobDescription: boolean;

  score: number;
  atsCompatibility: number;
  keywordMatch: number;
  skillsScore: number;
  projectScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  suggestions: string[];
  summary: string;

  jdMatch: JDMatchResult | null;
  improvementSuggestions: ImprovementSuggestion[];

  hasResult: boolean;
  isRevealingReport: boolean;
  usedBackupProvider: boolean;
  
  analysisId: string | null;
  isSaved: boolean;
  isPublic: boolean;
  interviewQuestions: InterviewQuestionsResponse | null;

  setResult: (
    result: ATSAnalysisResult,
    role: string,
    fileName: string,
    resumeText: string,
    jobDescription?: string,
    options?: { animateEntry?: boolean; usedBackupProvider?: boolean; analysisId?: string; isSaved?: boolean; isPublic?: boolean; interviewQuestions?: InterviewQuestionsResponse },
  ) => void;
  setInterviewQuestions: (questions: InterviewQuestionsResponse | null) => void;
  setSaved: (isSaved: boolean) => void;
  setPublic: (isPublic: boolean) => void;
  acknowledgeReportReveal: () => void;
  clearResult: () => void;
  savePendingAnalysis: () => void;
  loadPendingAnalysis: () => boolean;
  clearPendingAnalysis: () => void;
  /**
   * Synchronously attempt to restore the latest analysis from localStorage.
   * Uses getCurrentStoredAnalysis() (analysis-versions key).
   * Returns true if restoration succeeded, false if nothing was stored.
   * Safe to call on every render — no-ops if hasResult is already true.
   */
  restoreFromStorage: () => boolean;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  role: "",
  fileName: "Resume.pdf",
  resumeText: "",
  jobDescription: "",
  hasJobDescription: false,

  score: 0,
  atsCompatibility: 0,
  keywordMatch: 0,
  skillsScore: 0,
  projectScore: 0,
  missingKeywords: [],
  presentKeywords: [],
  strengths: [],
  suggestions: [],
  summary: "",

  jdMatch: null,
  improvementSuggestions: [],

  hasResult: false,
  isRevealingReport: false,
  usedBackupProvider: false,
  
  analysisId: null,
  isSaved: false,
  isPublic: false,
  interviewQuestions: null,

  setResult: (result, role, fileName, resumeText, jobDescription, options) => {
    const jd = jobDescription?.trim() ?? "";
    const animateEntry = options?.animateEntry ?? false;
    set({
      role,
      fileName,
      resumeText,
      jobDescription: jd,
      hasJobDescription: jd.length > 0,
      score: result.score,
      atsCompatibility: result.atsCompatibility,
      keywordMatch: result.keywordMatch,
      skillsScore: result.skillsScore,
      projectScore: result.projectScore,
      missingKeywords: result.missingKeywords,
      presentKeywords: result.presentKeywords,
      strengths: result.strengths,
      suggestions: result.suggestions,
      summary: result.summary,
      jdMatch: result.jdMatch ?? null,
      improvementSuggestions: result.improvementSuggestions ?? [],
      hasResult: true,
      isRevealingReport: animateEntry,
      usedBackupProvider: options?.usedBackupProvider ?? false,
      analysisId: options?.analysisId ?? null,
      isSaved: options?.isSaved ?? false,
      isPublic: options?.isPublic ?? false,
      interviewQuestions: options?.interviewQuestions ?? null,
    });
  },
  
  setInterviewQuestions: (questions) => {
    set({ interviewQuestions: questions });
  },
  
  setSaved: (isSaved) => {
    set({ isSaved });
  },

  setPublic: (isPublic) => {
    set({ isPublic });
  },

  acknowledgeReportReveal: () => {
    set({ isRevealingReport: false });
  },

  clearResult: () => {
    set({
      role: "",
      fileName: "Resume.pdf",
      resumeText: "",
      jobDescription: "",
      hasJobDescription: false,
      score: 0,
      atsCompatibility: 0,
      keywordMatch: 0,
      skillsScore: 0,
      projectScore: 0,
      missingKeywords: [],
      presentKeywords: [],
      strengths: [],
      suggestions: [],
      summary: "",
      jdMatch: null,
      improvementSuggestions: [],
      hasResult: false,
      isRevealingReport: false,
      usedBackupProvider: false,
      analysisId: null,
      isSaved: false,
      isPublic: false,
      interviewQuestions: null,
    });
  },

  savePendingAnalysis: () => {
    const state = get();
    if (!state.hasResult) return;

    const pending = {
      role: state.role,
      fileName: state.fileName,
      resumeText: state.resumeText,
      jobDescription: state.jobDescription,
      hasJobDescription: state.hasJobDescription,
      score: state.score,
      atsCompatibility: state.atsCompatibility,
      keywordMatch: state.keywordMatch,
      skillsScore: state.skillsScore,
      projectScore: state.projectScore,
      missingKeywords: state.missingKeywords,
      presentKeywords: state.presentKeywords,
      strengths: state.strengths,
      suggestions: state.suggestions,
      summary: state.summary,
      jdMatch: state.jdMatch,
      improvementSuggestions: state.improvementSuggestions,
      usedBackupProvider: state.usedBackupProvider,
    };

    localStorage.setItem(PENDING_ANALYSIS_KEY, JSON.stringify(pending));
  },

  loadPendingAnalysis: () => {
    const stored = localStorage.getItem(PENDING_ANALYSIS_KEY);
    if (!stored) return false;

    try {
      const pending = JSON.parse(stored);
      const result: ATSAnalysisResult = {
        score: pending.score,
        atsCompatibility: pending.atsCompatibility,
        keywordMatch: pending.keywordMatch,
        skillsScore: pending.skillsScore,
        projectScore: pending.projectScore,
        missingKeywords: pending.missingKeywords,
        presentKeywords: pending.presentKeywords,
        strengths: pending.strengths,
        suggestions: pending.suggestions,
        summary: pending.summary,
        jdMatch: pending.jdMatch,
        improvementSuggestions: pending.improvementSuggestions,
      };

      get().setResult(result, pending.role, pending.fileName, pending.resumeText, pending.jobDescription, {
        animateEntry: false,
        usedBackupProvider: pending.usedBackupProvider,
      });

      return true;
    } catch (e) {
      console.error("Failed to load pending analysis:", e);
      return false;
    }
  },

  clearPendingAnalysis: () => {
    localStorage.removeItem(PENDING_ANALYSIS_KEY);
  },

  restoreFromStorage: () => {
    if (get().hasResult) return true;

    const snapshot = getCurrentStoredAnalysis();
    if (!snapshot) return false;

    try {
      get().setResult(
        snapshot.result,
        snapshot.role,
        snapshot.fileName,
        snapshot.resumeText ?? "",
        snapshot.result.jdMatch ? "" : undefined,
        { animateEntry: false },
      );
      return true;
    } catch (e) {
      console.error("restoreFromStorage failed:", e);
      return false;
    }
  },
}));
