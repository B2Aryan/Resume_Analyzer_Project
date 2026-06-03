import type { ImprovementSuggestion, JDMatchResult } from "@/lib/ats/types";

export type ActionPriority = "high" | "medium" | "low";
export type ExpectedAtsImpact = "Low" | "Medium" | "High";

export interface ActionPlanItem {
  id: string;
  priority: ActionPriority;
  title: string;
  whyItMatters: string;
  expectedAtsImpact: ExpectedAtsImpact;
}

export interface ActionPlan {
  planKey: string;
  items: ActionPlanItem[];
  high: ActionPlanItem[];
  medium: ActionPlanItem[];
  low: ActionPlanItem[];
}

export interface ActionPlanInput {
  role: string;
  score: number;
  atsCompatibility: number;
  keywordMatch: number;
  skillsScore: number;
  projectScore: number;
  missingKeywords: string[];
  suggestions: string[];
  improvementSuggestions: ImprovementSuggestion[];
  hasJobDescription: boolean;
  jdMatch: JDMatchResult | null;
  summary: string;
  strengths: string[];
}

const MAX_PER_PRIORITY = 3;

function slugId(prefix: string, seed: string, index: number): string {
  const base = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  return `${prefix}-${base || index}-${index}`;
}

function dedupeAndPush(
  bucket: ActionPlanItem[],
  item: ActionPlanItem,
  seen: Set<string>,
): void {
  const key = item.title.toLowerCase();
  if (seen.has(key) || bucket.length >= MAX_PER_PRIORITY) return;
  seen.add(key);
  bucket.push(item);
}

function resolveMissingKeywords(input: ActionPlanInput): string[] {
  if (input.hasJobDescription && input.jdMatch?.missingKeywords.length) {
    return input.jdMatch.missingKeywords;
  }
  return input.missingKeywords;
}

function findImprovementForKeyword(
  keyword: string,
  improvements: ImprovementSuggestion[],
): ImprovementSuggestion | undefined {
  const key = keyword.toLowerCase();
  return improvements.find((i) => i.keyword.toLowerCase() === key);
}

function buildHighImpactCandidates(
  input: ActionPlanInput,
  missing: string[],
): ActionPlanItem[] {
  const items: ActionPlanItem[] = [];

  for (let i = 0; i < missing.length; i++) {
    const keyword = missing[i];
    const tip = findImprovementForKeyword(keyword, input.improvementSuggestions);
    items.push({
      id: slugId("high-kw", keyword, i),
      priority: "high",
      title: tip
        ? `Address missing keyword: ${keyword}`
        : `Add ${keyword} terminology to your resume`,
      whyItMatters:
        tip?.whyItMatters ??
        `ATS and recruiters for ${input.role} often filter on "${keyword}". It appears in your target requirements but not on your resume.`,
      expectedAtsImpact: "High",
    });
  }

  if (input.keywordMatch < 60) {
    items.push({
      id: "high-keyword-match",
      priority: "high",
      title: "Close critical keyword gaps for your target role",
      whyItMatters: `Your keyword match score is ${input.keywordMatch}/100. Adding role-specific terms from the job description improves ATS pass rates.`,
      expectedAtsImpact: "High",
    });
  }

  if (input.hasJobDescription && input.jdMatch && input.jdMatch.jdMatchScore < 65) {
    items.push({
      id: "high-jd-alignment",
      priority: "high",
      title: "Align resume content with the job description",
      whyItMatters: `Your JD keyword match is ${input.jdMatch.jdMatchScore}% (${input.jdMatch.missingKeywords.length} technical terms from the posting are not on your resume). Add them where you have real experience.`,
      expectedAtsImpact: "High",
    });
  }

  if (input.atsCompatibility < 65) {
    items.push({
      id: "high-ats-format",
      priority: "high",
      title: "Fix ATS formatting and section structure",
      whyItMatters: `ATS compatibility is ${input.atsCompatibility}/100. Clear headings, standard sections, and parse-friendly layout prevent automated rejections.`,
      expectedAtsImpact: "High",
    });
  }

  if (input.score < 60) {
    items.push({
      id: "high-overall-score",
      priority: "high",
      title: "Address top resume gaps before applying",
      whyItMatters: `Your overall ATS score is ${input.score}/100. Focus on keywords and core sections first for the biggest lift.`,
      expectedAtsImpact: "High",
    });
  }

  return items;
}

function buildMediumImpactCandidates(
  input: ActionPlanInput,
  missing: string[],
  usedImprovementKeywords: Set<string>,
): ActionPlanItem[] {
  const items: ActionPlanItem[] = [];

  for (let i = 0; i < input.improvementSuggestions.length; i++) {
    const tip = input.improvementSuggestions[i];
    if (usedImprovementKeywords.has(tip.keyword.toLowerCase())) continue;
    items.push({
      id: slugId("med-imp", tip.keyword, i),
      priority: "medium",
      title: `Strengthen resume around ${tip.keyword}`,
      whyItMatters: tip.whyItMatters,
      expectedAtsImpact: "Medium",
    });
  }

  if (input.skillsScore < 70) {
    items.push({
      id: "med-skills-section",
      priority: "medium",
      title: "Expand and organize your technical skills section",
      whyItMatters: `Skills alignment scored ${input.skillsScore}/100. Group relevant tools and technologies for ${input.role} where you have evidence.`,
      expectedAtsImpact: "Medium",
    });
  }

  if (input.projectScore < 70) {
    items.push({
      id: "med-project-impact",
      priority: "medium",
      title: "Improve project bullet impact and clarity",
      whyItMatters: `Project section scored ${input.projectScore}/100. Use strong verbs, specific technologies, and outcome-oriented phrasing supported by your work.`,
      expectedAtsImpact: "Medium",
    });
  }

  for (let i = 0; i < input.suggestions.length; i++) {
    const text = input.suggestions[i];
    if (!text.trim()) continue;
    items.push({
      id: slugId("med-sug", text, i),
      priority: "medium",
      title: truncateTitle(text),
      whyItMatters: `This was flagged in your ATS analysis as a meaningful improvement for ${input.role}.`,
      expectedAtsImpact: "Medium",
    });
  }

  if (missing.length > 0 && input.keywordMatch >= 60 && input.keywordMatch < 80) {
    items.push({
      id: "med-keyword-polish",
      priority: "medium",
      title: "Weave remaining keywords into project descriptions",
      whyItMatters: `You have partial keyword coverage. Natural mentions in bullets help ATS without keyword stuffing.`,
      expectedAtsImpact: "Medium",
    });
  }

  return items;
}

function buildLowImpactCandidates(input: ActionPlanInput): ActionPlanItem[] {
  const items: ActionPlanItem[] = [];

  if (input.summary.trim().length > 0 && input.summary.length < 120) {
    items.push({
      id: "low-summary-length",
      priority: "low",
      title: "Expand your professional summary",
      whyItMatters:
        "A concise but complete summary helps recruiters quickly understand your fit. Add role focus and top strengths supported by your resume.",
      expectedAtsImpact: "Low",
    });
  } else {
    items.push({
      id: "low-summary-wording",
      priority: "low",
      title: "Polish professional summary wording",
      whyItMatters:
        "Refining summary phrasing improves first impressions with recruiters after ATS screening.",
      expectedAtsImpact: "Low",
    });
  }

  if (input.atsCompatibility >= 65 && input.atsCompatibility < 85) {
    items.push({
      id: "low-format-polish",
      priority: "low",
      title: "Polish formatting and section labels",
      whyItMatters: `ATS compatibility is ${input.atsCompatibility}/100. Minor layout and heading consistency improvements aid parsing.`,
      expectedAtsImpact: "Low",
    });
  }

  if (input.strengths.length > 0) {
    items.push({
      id: "low-lead-with-strengths",
      priority: "low",
      title: "Lead with your strongest evidence earlier on the page",
      whyItMatters:
        "Your analysis identified clear strengths. Placing them in summary or top bullets improves recruiter scan value.",
      expectedAtsImpact: "Low",
    });
  }

  items.push({
    id: "low-proofread",
    priority: "low",
    title: "Proofread for consistency and tense",
    whyItMatters:
      "Consistent verb tense, punctuation, and terminology improve readability for both ATS and human reviewers.",
    expectedAtsImpact: "Low",
  });

  return items;
}

function truncateTitle(text: string, max = 72): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1)}…`;
}

export function buildActionPlanKey(itemIds: string[]): string {
  return itemIds.slice().sort().join("|");
}

/**
 * Build a prioritized action plan (max 3 per priority tier) from analysis data.
 */
export function buildActionPlan(input: ActionPlanInput): ActionPlan {
  const missing = resolveMissingKeywords(input);
  const usedImprovementKeywords = new Set<string>();
  const highSeen = new Set<string>();
  const mediumSeen = new Set<string>();
  const lowSeen = new Set<string>();

  const high: ActionPlanItem[] = [];
  const medium: ActionPlanItem[] = [];
  const low: ActionPlanItem[] = [];

  const highCandidates = buildHighImpactCandidates(input, missing);
  for (const item of highCandidates) {
    dedupeAndPush(high, item, highSeen);
  }

  for (const kw of missing) {
    usedImprovementKeywords.add(kw.toLowerCase());
  }

  const mediumCandidates = buildMediumImpactCandidates(
    input,
    missing,
    usedImprovementKeywords,
  );
  for (const item of mediumCandidates) {
    dedupeAndPush(medium, item, mediumSeen);
  }

  const lowCandidates = buildLowImpactCandidates(input);
  for (const item of lowCandidates) {
    dedupeAndPush(low, item, lowSeen);
  }

  const items = [...high, ...medium, ...low];
  const planKey = buildActionPlanKey(items.map((i) => i.id));

  return { planKey, items, high, medium, low };
}
