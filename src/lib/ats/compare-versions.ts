import type { ATSAnalysisResult } from "@/lib/ats/types";

export interface ImprovedArea {
  area: "Formatting" | "Skills" | "Projects" | "Keywords";
  previousScore: number;
  currentScore: number;
  delta: number;
}

export interface VersionComparison {
  previousScore: number;
  currentScore: number;
  scoreDifference: number;
  addedKeywords: string[];
  fixedMissingKeywords: string[];
  improvedAreas: ImprovedArea[];
  previousSavedAt: string;
  previousRole: string;
  previousFileName: string;
}

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase();
}

function keywordSet(keywords: string[]): Set<string> {
  return new Set(keywords.map(normalizeKeyword));
}

function keywordsAdded(current: string[], previous: string[]): string[] {
  const prev = keywordSet(previous);
  return current.filter((k) => !prev.has(normalizeKeyword(k)));
}

function missingKeywordsFixed(
  currentMissing: string[],
  previousMissing: string[],
): string[] {
  const current = keywordSet(currentMissing);
  return previousMissing.filter((k) => !current.has(normalizeKeyword(k)));
}

function buildImprovedAreas(
  previous: ATSAnalysisResult,
  current: ATSAnalysisResult,
): ImprovedArea[] {
  const candidates: ImprovedArea[] = [
    {
      area: "Formatting",
      previousScore: previous.atsCompatibility,
      currentScore: current.atsCompatibility,
      delta: current.atsCompatibility - previous.atsCompatibility,
    },
    {
      area: "Skills",
      previousScore: previous.skillsScore,
      currentScore: current.skillsScore,
      delta: current.skillsScore - previous.skillsScore,
    },
    {
      area: "Projects",
      previousScore: previous.projectScore,
      currentScore: current.projectScore,
      delta: current.projectScore - previous.projectScore,
    },
    {
      area: "Keywords",
      previousScore: previous.keywordMatch,
      currentScore: current.keywordMatch,
      delta: current.keywordMatch - previous.keywordMatch,
    },
  ];

  return candidates.filter((c) => c.delta > 0);
}

export function compareAnalysisVersions(
  previous: ATSAnalysisResult,
  current: ATSAnalysisResult,
  meta: { savedAt: string; role: string; fileName: string },
): VersionComparison {
  const scoreDifference = current.score - previous.score;

  return {
    previousScore: previous.score,
    currentScore: current.score,
    scoreDifference,
    addedKeywords: keywordsAdded(
      current.presentKeywords,
      previous.presentKeywords,
    ),
    fixedMissingKeywords: missingKeywordsFixed(
      current.missingKeywords,
      previous.missingKeywords,
    ),
    improvedAreas: buildImprovedAreas(previous, current),
    previousSavedAt: meta.savedAt,
    previousRole: meta.role,
    previousFileName: meta.fileName,
  };
}

export function formatScoreDifference(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "0";
}
