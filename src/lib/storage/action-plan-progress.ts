const STORAGE_KEY = "resumecheck-action-plan-progress";

interface ActionPlanProgressStorage {
  version: 1;
  /** planKey → completed action ids */
  completedByPlan: Record<string, string[]>;
}

function loadStorage(): ActionPlanProgressStorage {
  if (typeof window === "undefined") {
    return { version: 1, completedByPlan: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, completedByPlan: {} };
    const parsed = JSON.parse(raw) as ActionPlanProgressStorage;
    if (parsed.version !== 1 || !parsed.completedByPlan) {
      return { version: 1, completedByPlan: {} };
    }
    return parsed;
  } catch {
    return { version: 1, completedByPlan: {} };
  }
}

function saveStorage(data: ActionPlanProgressStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save action plan progress:", error);
  }
}

export function loadCompletedActionIds(planKey: string): string[] {
  return loadStorage().completedByPlan[planKey] ?? [];
}

export function saveCompletedActionIds(
  planKey: string,
  completedIds: string[],
): void {
  const data = loadStorage();
  data.completedByPlan[planKey] = completedIds;
  saveStorage(data);
}
