import { create } from "zustand";
import {
  ATSAnalysisResult,
  ImprovementSuggestion,
  JDMatchResult,
} from "@/lib/ats/types";

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

  setResult: (
    result: ATSAnalysisResult,
    role: string,
    fileName: string,
    resumeText: string,
    jobDescription?: string,
    options?: { animateEntry?: boolean; usedBackupProvider?: boolean; analysisId?: string; isSaved?: boolean },
  ) => void;
  setSaved: (isSaved: boolean) => void;
  acknowledgeReportReveal: () => void;
  clearResult: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
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
    });
  },
  
  setSaved: (isSaved) => {
    set({ isSaved });
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
    });
  },
}));
