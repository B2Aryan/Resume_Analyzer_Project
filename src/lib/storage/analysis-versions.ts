import type { ATSAnalysisResult } from "@/lib/ats/types";

const STORAGE_KEY = "resumecheck-analysis-versions";

export interface AnalysisSnapshot {
  savedAt: string;
  role: string;
  fileName: string;
  result: ATSAnalysisResult;
}

interface AnalysisVersionStorage {
  version: 1;
  previous: AnalysisSnapshot | null;
  current: AnalysisSnapshot | null;
}

export function snapshotFromResult(
  result: ATSAnalysisResult,
  role: string,
  fileName: string,
): AnalysisSnapshot {
  return {
    savedAt: new Date().toISOString(),
    role,
    fileName,
    result,
  };
}

function loadStorage(): AnalysisVersionStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnalysisVersionStorage;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStorage(data: AnalysisVersionStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save analysis version:", error);
  }
}

/**
 * On each new analysis: shift current → previous, store new snapshot as current.
 */
export function persistNewAnalysis(snapshot: AnalysisSnapshot): void {
  const existing = loadStorage();
  saveStorage({
    version: 1,
    previous: existing?.current ?? null,
    current: snapshot,
  });
}

/** Previous analysis (one run before the latest). */
export function getPreviousAnalysis(): AnalysisSnapshot | null {
  return loadStorage()?.previous ?? null;
}

/** Latest saved analysis from localStorage (should match in-memory store after upload). */
export function getCurrentStoredAnalysis(): AnalysisSnapshot | null {
  return loadStorage()?.current ?? null;
}
