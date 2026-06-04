
import { ATSAnalysisResult } from "./types";

export interface ResumeSimilarityScores {
  total: number;
  roleScore: number;
  filenameScore: number;
  keywordScore: number;
}

export interface ResumeSimilarityParams {
  current: {
    role: string;
    fileName: string;
    analysisResult: ATSAnalysisResult;
  };
  previous: {
    role: string;
    fileName: string;
    analysisResult: ATSAnalysisResult;
  };
}

// Helper: Normalize text for comparison
const normalize = (text: string): string =>
  text.toLowerCase().trim().replace(/\s+/g, " ");

// Helper: Calculate partial string match (0-1)
const calculatePartialMatch = (a: string, b: string): number => {
  const aNorm = normalize(a);
  const bNorm = normalize(b);
  if (aNorm === bNorm) return 1;

  // Check if one contains the other (partial match)
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) {
    return 0.6;
  }

  // Split into words and count common words
  const aWords = aNorm.split(" ");
  const bWords = bNorm.split(" ");
  const commonWords = aWords.filter((w) => bWords.includes(w));
  if (commonWords.length === 0) return 0;

  return (commonWords.length / Math.max(aWords.length, bWords.length)) * 0.5;
};

// Helper: Calculate keyword overlap score (0-40)
const calculateKeywordOverlapScore = (
  currentKeywords: string[],
  previousKeywords: string[],
): number => {
  if (previousKeywords.length === 0) return 40;

  const currentNorm = new Set(currentKeywords.map((k) => normalize(k)));
  const commonCount = previousKeywords.filter((k) =>
    currentNorm.has(normalize(k)),
  ).length;
  const overlapRatio = commonCount / previousKeywords.length;
  return Math.round(overlapRatio * 40);
};

// Calculate resume similarity scores (0-100)
export function calculateResumeSimilarity(
  params: ResumeSimilarityParams,
): ResumeSimilarityScores {
  const { current, previous } = params;

  // 1. Target Role Similarity (40 points)
  const roleScore = Math.round(
    calculatePartialMatch(current.role, previous.role) * 40,
  );

  // 2. Filename Similarity (20 points)
  const filenameScore = Math.round(
    calculatePartialMatch(current.fileName, previous.fileName) * 20,
  );

  // 3. Keyword Overlap (40 points)
  const keywordScore = calculateKeywordOverlapScore(
    current.analysisResult.presentKeywords || [],
    previous.analysisResult.presentKeywords || [],
  );

  const total = roleScore + filenameScore + keywordScore;

  // Debug logs
  console.log("Resume Similarity Score:", total);
  console.log("Role Score:", roleScore);
  console.log("Filename Score:", filenameScore);
  console.log("Keyword Score:", keywordScore);

  return {
    total,
    roleScore,
    filenameScore,
    keywordScore,
  };
}

// Determine if two resumes can be compared (similarity >= 60)
export function canCompareResumes(
  params: ResumeSimilarityParams,
): { canCompare: boolean; similarity: ResumeSimilarityScores } {
  const similarity = calculateResumeSimilarity(params);
  return {
    canCompare: similarity.total >= 60,
    similarity,
  };
}
