export interface ImprovementSuggestion {
  keyword: string;
  whyItMatters: string;
  suggestion: string;
}

export interface JDMatchResult {
  /**
   * Percentage of scorable technical keywords from the JD that appear in the resume.
   * matchedKeywords.length / (matched + missing) × 100, or 0 if the JD has none.
   */
  jdMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  jdSummary: string;
  isSufficientJD: boolean;
}

export interface ATSAnalysisResult {
  score: number;
  atsCompatibility: number;
  keywordMatch: number;
  skillsScore: number;
  projectScore: number;
  strengths: string[];
  suggestions: string[];
  presentKeywords: string[];
  missingKeywords: string[];
  summary: string;
  /** Present when analysis was run against a pasted job description */
  jdMatch?: JDMatchResult;
  /** AI-generated actionable tips for missing keywords (max 5) */
  improvementSuggestions?: ImprovementSuggestion[];
}
