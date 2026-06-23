/**
 * Local grammar & writing quality heuristics.
 * Pure function — no API calls. Runs on the already-extracted resume text.
 */

export interface GrammarIssue {
  /** Short label shown as a bullet */
  label: string;
  /** Severity: high issues are shown first */
  severity: "high" | "medium" | "low";
}

export interface GrammarCheckResult {
  /** Total number of detected issues */
  issueCount: number;
  /** Writing clarity score out of 100 */
  clarityScore: number;
  /**
   * Estimated ATS gain from fixing all issues (0–6).
   * Grammar rarely moves ATS scores dramatically; we cap it at +6.
   */
  estimatedAtsGain: number;
  /** Up to N most important issues */
  issues: GrammarIssue[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

// ─── main ───────────────────────────────────────────────────────────────────

export function checkGrammar(resumeText: string): GrammarCheckResult {
  const text = resumeText ?? "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const allIssues: GrammarIssue[] = [];

  // 1. Multiple consecutive spaces (≥2 spaces not at line start)
  const extraSpaces = countMatches(text, /(?<!\n) {2,}/g);
  if (extraSpaces > 0) {
    allIssues.push({
      label: `Multiple consecutive spaces (${extraSpaces} occurrence${extraSpaces > 1 ? "s" : ""})`,
      severity: "medium",
    });
  }

  // 2. Double punctuation (.., !!, ??, .,)
  const doublePunct = countMatches(text, /[.!?,;]{2,}/g);
  if (doublePunct > 0) {
    allIssues.push({
      label: `Inconsistent punctuation — double symbols detected`,
      severity: "medium",
    });
  }

  // 3. Missing period/punctuation at end of bullet lines
  const bulletLines = lines.filter((l) => /^[-•*▸➤→]/.test(l));
  const noPunctBullets = bulletLines.filter((l) => !/[.!?;,]$/.test(l));
  // Only flag if more than half the bullets lack consistent end punctuation
  // AND there are enough bullets to be statistically meaningful
  if (bulletLines.length >= 4 && noPunctBullets.length > bulletLines.length * 0.5) {
    allIssues.push({
      label: "Inconsistent bullet punctuation — some bullets end without punctuation",
      severity: "low",
    });
  }

  // 4. Weak opening verbs — "Responsible for", "Worked on", "Helped with"
  const weakVerbs = ["responsible for", "worked on", "helped with", "assisted in", "was involved in", "duties included", "tasks included"];
  const weakCount = weakVerbs.filter((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(text),
  ).length;
  if (weakCount >= 2) {
    allIssues.push({
      label: `Weak bullet openings (e.g. "Responsible for", "Worked on") — ${weakCount} found`,
      severity: "high",
    });
  } else if (weakCount === 1) {
    allIssues.push({
      label: `Weak bullet opening detected — replace with strong action verb`,
      severity: "medium",
    });
  }

  // 5. Tense inconsistency: mixing present and past tense action verbs
  const presentVerbRe = /\b(manage|develop|build|create|lead|design|implement|analyze|coordinate|maintain)\b/gi;
  const pastVerbRe = /\b(managed|developed|built|created|led|designed|implemented|analyzed|coordinated|maintained)\b/gi;
  const presentCount = countMatches(text, presentVerbRe);
  const pastCount = countMatches(text, pastVerbRe);
  if (presentCount > 1 && pastCount > 1) {
    allIssues.push({
      label: "Mixed tense — present and past tense action verbs used together",
      severity: "high",
    });
  }

  // 6. Capitalization inconsistencies — section headings that differ in case
  const headingLike = lines.filter((l) => l.length < 40 && /^[A-Z]/.test(l) && !/^[-•*]/.test(l));
  const allCaps = headingLike.filter((l) => l === l.toUpperCase() && l.length > 2);
  const mixedCase = headingLike.filter((l) => l !== l.toUpperCase() && /[A-Z]/.test(l));
  if (allCaps.length > 0 && mixedCase.length > 0) {
    allIssues.push({
      label: "Capitalization inconsistency — some headings all-caps, others mixed-case",
      severity: "low",
    });
  }

  // 7. Repeated words in close proximity
  const wordRepeatRe = /\b(\w{4,})\b(?:\W+\w+){0,4}\W+\b\1\b/gi;
  const repeats = countMatches(text, wordRepeatRe);
  if (repeats >= 3) {
    allIssues.push({
      label: `Repeated words in close proximity (${repeats} instance${repeats > 1 ? "s" : ""})`,
      severity: "medium",
    });
  }

  // 8. Very long sentences (>35 words) — hard to scan
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 35);
  if (longSentences.length >= 2) {
    allIssues.push({
      label: `${longSentences.length} overly long sentences — hard for ATS and recruiters to scan`,
      severity: "low",
    });
  }

  // 9. Missing action verbs on bullet lines entirely
  const actionVerbRe = /\b(managed|led|built|created|developed|designed|implemented|analyzed|increased|reduced|improved|delivered|launched|coordinated|mentored|optimized|architected|spearheaded|drove|negotiated|automated)\b/i;
  const bulletsWithNoAction = bulletLines.filter((l) => !actionVerbRe.test(l));
  if (bulletLines.length > 0 && bulletsWithNoAction.length > bulletLines.length * 0.4) {
    allIssues.push({
      label: `${bulletsWithNoAction.length} bullet point${bulletsWithNoAction.length > 1 ? "s" : ""} missing strong action verbs`,
      severity: "high",
    });
  }

  // ── Sort by severity (high → medium → low) ──────────────────────────────
  const order = { high: 0, medium: 1, low: 2 };
  allIssues.sort((a, b) => order[a.severity] - order[b.severity]);

  const issueCount = allIssues.length;

  // ── Clarity score ────────────────────────────────────────────────────────
  // Start at 100 and deduct: high issues cost more than low ones
  const penalty = allIssues.reduce((sum, issue) => {
    return sum + (issue.severity === "high" ? 8 : issue.severity === "medium" ? 5 : 3);
  }, 0);
  const clarityScore = Math.max(10, 100 - penalty);

  // ── ATS gain estimate ────────────────────────────────────────────────────
  // High issues contribute 2 pts each, medium 1, low 0.5 — cap at 6
  const rawGain = allIssues.reduce((sum, issue) => {
    return sum + (issue.severity === "high" ? 2 : issue.severity === "medium" ? 1 : 0.5);
  }, 0);
  const estimatedAtsGain = Math.min(6, Math.round(rawGain));

  return {
    issueCount,
    clarityScore,
    estimatedAtsGain,
    issues: allIssues.slice(0, 5), // expose top 5 for consumers that want more
  };
}
