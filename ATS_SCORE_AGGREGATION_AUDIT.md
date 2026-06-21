# ATS Score Aggregation Formula Audit

## Executive Summary

The final ATS score sometimes feels unreliable compared to the visible breakdown because:
1. **Weight mismatch**: Keyword Match has 40% weight but AI sub-scores (Skills/Projects at 20% each) dominate the user's visual perception
2. **Scale distortion**: A single weak component can dramatically suppress the overall score even when 3 out of 4 components are strong
3. **Non-linear perception**: Users perceive the 4 bars as equally important, but the formula weights Keywords 2x more than Skills or Projects

---

## Current Aggregation Formula

### With Job Description (≥6 keywords detected)

```typescript
score = Math.round(
  atsCompatibility * 0.20 +
  keywordMatch     * 0.40 +  // ← Deterministic (TECHNICAL_KEYWORDS catalog)
  skillsScore      * 0.20 +  // ← AI-scored
  projectScore     * 0.20    // ← AI-scored
)
```

### Without Job Description (role-only mode)

```typescript
score = Math.round(
  atsCompatibility * 0.20 +
  keywordMatch     * 0.40 +  // ← AI-inferred from role requirements
  skillsScore      * 0.20 +  // ← AI-scored
  projectScore     * 0.20    // ← AI-scored
)
```

**Location:** `src/lib/ats/analyzer.ts` → `applyDeterministicJDMatch()` (JD mode) and AI prompt instructions (role-only mode)

---

## Problem Analysis

### Issue 1: Keyword Match Dominates Despite Equal UI Weight

**Scenario:**
```
ATS Compatibility: 90
Keyword Match:     45  ← Weak
Skills Score:      85
Project Score:     80

Final Score = 90*0.2 + 45*0.4 + 85*0.2 + 80*0.2
            = 18 + 18 + 17 + 16
            = 69
```

**User perception:** "3 out of 4 bars are strong (90, 85, 80), why is my score only 69?"

**Reality:** The single weak component (Keywords at 45) contributes 18 points instead of a potential 40, losing 22 points. The other strong scores only add 51 points combined.

---

### Issue 2: Balanced Mediocrity vs. Spiked Excellence

**Scenario A (Balanced Mediocre):**
```
ATS: 70, Keywords: 70, Skills: 70, Projects: 70
Score = 70*0.2 + 70*0.4 + 70*0.2 + 70*0.2 = 14 + 28 + 14 + 14 = 70
```

**Scenario B (Spiked Excellence):**
```
ATS: 95, Keywords: 50, Skills: 90, Projects: 85
Score = 95*0.2 + 50*0.4 + 90*0.2 + 85*0.2 = 19 + 20 + 18 + 17 = 74
```

Despite having **one failing component** (Keywords at 50), Scenario B only scores 4 points higher than balanced mediocrity. Users expect much more credit for the three excellent scores.

---

### Issue 3: Non-Obvious 40% Weight

The UI shows 4 equal bars:
```
┌─────────────────┐  90
│ ATS Compatibility│  ████████████████████
└─────────────────┘

┌─────────────────┐  45
│ Keyword Match   │  █████████
└─────────────────┘

┌─────────────────┐  85
│ Skills Section  │  █████████████████
└─────────────────┘

┌─────────────────┐  80
│ Project Section │  ████████████████
└─────────────────┘
```

Users intuitively average these: `(90+45+85+80)/4 = 75`, but the actual score is **69** due to hidden 40% keyword weight.

---

### Issue 4: Role-Only Mode Volatility

Without a JD, `keywordMatch` is AI-inferred. With 40% weight riding on an AI estimate that varies run-to-run (even at temperature=0 due to model non-determinism), the final score can swing ±5 points for identical inputs.

**Example (same resume, 2 runs):**
```
Run 1: Keywords 65 → Score = 90*0.2 + 65*0.4 + 80*0.2 + 75*0.2 = 77
Run 2: Keywords 55 → Score = 90*0.2 + 55*0.4 + 80*0.2 + 75*0.2 = 73
```

4-point swing on identical input damages trust.

---

## Proposed Aggregation Improvements

### Option A: Equal Weighting (Most Transparent)

```typescript
score = Math.round(
  (atsCompatibility + keywordMatch + skillsScore + projectScore) / 4
)
```

**Pros:**
- Matches user UI perception exactly
- No hidden bias toward any component
- Simple mental math: users can validate the score themselves
- Removes keyword volatility impact in role-only mode

**Cons:**
- Dilutes the importance of role-specific keyword alignment
- May over-reward resumes with great formatting but poor keyword match

**Example:**
```
Before: ATS 90, Kw 45, Skills 85, Projects 80 → Score 69
After:  (90+45+85+80)/4 = 75  (+6 points)

Before: ATS 70, Kw 70, Skills 70, Projects 70 → Score 70
After:  (70+70+70+70)/4 = 70  (no change)

Before: ATS 95, Kw 50, Skills 90, Projects 85 → Score 74
After:  (95+50+90+85)/4 = 80  (+6 points)
```

---

### Option B: Keyword-Centric with Reduced Weight (Conservative)

```typescript
score = Math.round(
  atsCompatibility * 0.20 +
  keywordMatch     * 0.30 +  // ← Reduced from 0.40
  skillsScore      * 0.25 +  // ← Increased from 0.20
  projectScore     * 0.25    // ← Increased from 0.20
)
```

**Pros:**
- Still prioritizes keyword match (most ATS-relevant factor)
- Reduces single-component dominance
- Gives more credit to Skills/Projects (actual work evidence)

**Cons:**
- Still has hidden weight mismatch vs. UI
- Keyword volatility in role-only mode still impacts 30% of score

**Example:**
```
Before: ATS 90, Kw 45, Skills 85, Projects 80 → Score 69
After:  90*0.2 + 45*0.3 + 85*0.25 + 80*0.25 = 72  (+3 points)

Before: ATS 70, Kw 70, Skills 70, Projects 70 → Score 70
After:  70*0.2 + 70*0.3 + 70*0.25 + 70*0.25 = 70  (no change)

Before: ATS 95, Kw 50, Skills 90, Projects 85 → Score 74
After:  95*0.2 + 50*0.3 + 90*0.25 + 85*0.25 = 77  (+3 points)
```

---

### Option C: Minimum Threshold + Average (Hybrid Safety Net)

```typescript
// If any component is below 50, apply penalty
const components = [atsCompatibility, keywordMatch, skillsScore, projectScore];
const hasFailingComponent = components.some(c => c < 50);

if (hasFailingComponent) {
  // Use weighted formula with heavier keyword emphasis
  score = Math.round(
    atsCompatibility * 0.20 +
    keywordMatch     * 0.40 +
    skillsScore      * 0.20 +
    projectScore     * 0.20
  );
} else {
  // All components passing → use equal weighting
  score = Math.round(
    (atsCompatibility + keywordMatch + skillsScore + projectScore) / 4
  );
}
```

**Pros:**
- Rewards well-rounded resumes with equal weighting
- Punishes critical gaps (any component <50) with keyword-heavy formula
- Aligns with ATS reality: one major flaw = rejection

**Cons:**
- More complex logic
- Threshold at 50 is arbitrary
- Edge case instability: a resume scoring 49/70/80/80 gets penalized, but 51/70/80/80 gets rewarded

**Example:**
```
Before: ATS 90, Kw 45, Skills 85, Projects 80 → Score 69
After:  (hasFailingComponent=true) → 69  (no change, Keywords<50)

Before: ATS 70, Kw 70, Skills 70, Projects 70 → Score 70
After:  (hasFailingComponent=false) → 70  (no change, equal avg)

Before: ATS 95, Kw 50, Skills 90, Projects 85 → Score 74
After:  (hasFailingComponent=false) → 80  (+6 points, all≥50)

Before: ATS 95, Kw 49, Skills 90, Projects 85 → Score 73
After:  (hasFailingComponent=true) → 73  (no change, Keywords<50)
```

---

### Option D: Geometric Mean (Punishes Imbalance)

```typescript
score = Math.round(
  Math.pow(
    atsCompatibility * keywordMatch * skillsScore * projectScore,
    1/4
  )
)
```

**Pros:**
- Mathematically penalizes imbalanced profiles
- Encourages well-rounded improvement
- No arbitrary thresholds

**Cons:**
- Users cannot mentally calculate it
- A single zero component → score = 0 (catastrophic)
- Counter-intuitive: ATS 80, Kw 80, Skills 80, Projects 80 → Score 80, but ATS 100, Kw 50, Skills 100, Projects 100 → Score 79

**Example:**
```
Before: ATS 90, Kw 45, Skills 85, Projects 80 → Score 69
After:  (90*45*85*80)^(1/4) = 72  (+3 points)

Before: ATS 70, Kw 70, Skills 70, Projects 70 → Score 70
After:  (70*70*70*70)^(1/4) = 70  (no change)

Before: ATS 95, Kw 50, Skills 90, Projects 85 → Score 74
After:  (95*50*90*85)^(1/4) = 77  (+3 points)
```

---

## Recommendation

**Implement Option B (Keyword-Centric with Reduced Weight) as the next iteration.**

**Rationale:**
1. Maintains keyword priority (ATS systems DO filter on keywords first)
2. Reduces single-component tyranny
3. More forgiving of keyword gaps when Skills/Projects are strong
4. Minimal code change risk
5. Preserves all sub-score calculations (no UI or component changes)

**Future path:** After collecting user feedback on Option B, consider A/B testing Option A (equal weighting) for specific user segments (e.g., students with limited experience where Skills/Projects matter more than keyword density).

---

## Implementation Impact

### Files to Modify (Option B)

**Only 1 file:**
- `src/lib/ats/analyzer.ts` → `applyDeterministicJDMatch()` (line ~530)
  ```typescript
  // OLD:
  const score = Math.round(
    result.atsCompatibility * 0.2 +
    keywordMatch * 0.4 +
    result.skillsScore * 0.2 +
    result.projectScore * 0.2,
  );
  
  // NEW:
  const score = Math.round(
    result.atsCompatibility * 0.20 +
    keywordMatch * 0.30 +
    result.skillsScore * 0.25 +
    result.projectScore * 0.25,
  );
  ```

- `src/lib/ats/analyzer.ts` → AI prompts (2 locations)
  - `buildAnalysisPrompt()` line ~400: Update formula instruction to `0.20 + 0.30 + 0.25 + 0.25`
  - `buildJDAnalysisPrompt()` line ~470: Update temporary score instruction (or remove it entirely since it's recalculated anyway)

### No Changes Required
- All 4 sub-score calculations (ATS/Keyword/Skills/Projects) remain identical
- UI components unchanged
- Result page layout unchanged
- Action plan logic unchanged
- Breakdown bars unchanged

---

## Before/After Examples (Option B)

### Example 1: Strong Resume with Weak Keywords
```
Input: ATS 90, Keywords 45, Skills 85, Projects 80

Current:  90*0.2 + 45*0.4 + 85*0.2 + 80*0.2 = 69
Proposed: 90*0.2 + 45*0.3 + 85*0.25 + 80*0.25 = 72  (+3)

User perception improvement: "My strong skills/projects are now reflected better"
```

### Example 2: Balanced Solid Resume
```
Input: ATS 80, Keywords 80, Skills 80, Projects 80

Current:  80*0.2 + 80*0.4 + 80*0.2 + 80*0.2 = 80
Proposed: 80*0.2 + 80*0.3 + 80*0.25 + 80*0.25 = 80  (no change)

User perception: Consistent (expected)
```

### Example 3: Excellent Resume with Good (Not Great) Keywords
```
Input: ATS 95, Keywords 70, Skills 90, Projects 85

Current:  95*0.2 + 70*0.4 + 90*0.2 + 85*0.2 = 82
Proposed: 95*0.2 + 70*0.3 + 90*0.25 + 85*0.25 = 83  (+1)

User perception: Fairer — excellent work evidence gets more credit
```

### Example 4: Weak Overall Resume
```
Input: ATS 50, Keywords 40, Skills 55, Projects 50

Current:  50*0.2 + 40*0.4 + 55*0.2 + 50*0.2 = 47
Proposed: 50*0.2 + 40*0.3 + 55*0.25 + 50*0.25 = 48  (+1)

User perception: Accurately reflects weakness (expected)
```

### Example 5: Role-Only Mode (No JD) - AI Keywords Vary
```
Input: ATS 85, Keywords 60 (run 1) / 55 (run 2), Skills 75, Projects 70

Current Run 1:  85*0.2 + 60*0.4 + 75*0.2 + 70*0.2 = 76
Current Run 2:  85*0.2 + 55*0.4 + 75*0.2 + 70*0.2 = 74  (2-point swing)

Proposed Run 1: 85*0.2 + 60*0.3 + 75*0.25 + 70*0.25 = 76
Proposed Run 2: 85*0.2 + 55*0.3 + 75*0.25 + 70*0.25 = 75  (1-point swing)

User perception: More stable across runs (volatility reduced by 50%)
```

---

## Score Distribution Impact Analysis

Using Option B weights, here's how the score ranges shift:

### High-Keyword Resume (Keywords 90)
```
Scenario: ATS 85, Keywords 90, Skills 75, Projects 70

Current:  85*0.2 + 90*0.4 + 75*0.2 + 70*0.2 = 83
Proposed: 85*0.2 + 90*0.3 + 75*0.25 + 70*0.25 = 83  (no change)
```
**Strong keyword match is still rewarded appropriately.**

### Low-Keyword Resume (Keywords 30)
```
Scenario: ATS 85, Keywords 30, Skills 80, Projects 75

Current:  85*0.2 + 30*0.4 + 80*0.2 + 75*0.2 = 60
Proposed: 85*0.2 + 30*0.3 + 80*0.25 + 75*0.25 = 64  (+4)
```
**Critical gap still heavily penalizes, but genuine skills/projects provide some lift.**

---

## Next Steps

1. **Approval Required:** Choose aggregation formula (recommend Option B)
2. **Implementation:** Update 3 lines in `analyzer.ts`
3. **Testing:** Run against 10-20 sample resumes, compare before/after scores
4. **Documentation:** Update FEEDBACK_SETUP.md or create user-facing formula explanation
5. **Monitor:** Track user feedback on score "fairness" post-deployment

---

## Summary of Changes Already Implemented

✅ **Temperature set to 0** for both Groq and Gemini analysis calls  
✅ **isSufficientJD threshold increased from 3 to 6 keywords**  
✅ **TECHNICAL_KEYWORDS catalog expanded** from ~80 to ~200+ terms:
   - Added modern frameworks: Vite, Astro, Remix, Solid.js, SvelteKit
   - Added AI/ML tools: LangChain, Hugging Face, Scikit-learn, dbt, Snowflake
   - Added DevOps: Terraform, Ansible, Pulumi, ArgoCD, Helm
   - Added databases: Elasticsearch, DynamoDB, Cassandra, Neo4j, PlanetScale
   - Added testing: Vitest, Storybook, Puppeteer
   - Added package managers: pnpm, Bun
   - Added auth: OAuth, JWT, Auth0, Clerk, NextAuth.js
   - Added state management: Zustand, Recoil, Jotai, Pinia
   - Added monitoring: Datadog, Sentry, Grafana, Prometheus
   - And 100+ more modern technologies

✅ **TECHNICAL_ALIASES expanded** with better variant coverage (k8s→Kubernetes, sklearn→Scikit-learn, llm→Large Language Models, etc.)

**Pending approval:** Aggregation formula change (Option A/B/C/D above)
