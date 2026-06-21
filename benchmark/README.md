# ATS Benchmark Testing Framework

A comprehensive testing framework to evaluate and compare ATS scoring formulas without modifying production code.

## Overview

This framework allows you to:
- Test scoring formulas against realistic resume scenarios
- Compare current formula vs proposed alternatives
- Generate detailed reports showing which formula better matches human evaluation
- Make data-driven decisions about formula changes

## Files

```
benchmark/
├── ats-benchmark.ts       # Core benchmark logic and scoring formulas
├── sample-resumes.ts      # 20 realistic test cases with expected score ranges
├── run-benchmark.ts       # CLI script to run benchmarks and generate reports
├── README.md              # This file
└── reports/               # Generated reports (created on first run)
    ├── benchmark-report-YYYY-MM-DDTHH-MM-SS.md
    ├── benchmark-report-YYYY-MM-DDTHH-MM-SS.csv
    ├── benchmark-report-latest.md
    └── benchmark-report-latest.csv
```

## Quick Start

### 1. Run the Benchmark

```bash
# Using ts-node
ts-node benchmark/run-benchmark.ts

# Or using npx
npx ts-node benchmark/run-benchmark.ts

# Or compile and run
tsc benchmark/run-benchmark.ts
node benchmark/run-benchmark.js
```

### 2. View the Results

The script generates two report formats:

**Markdown Report** (`reports/benchmark-report-latest.md`):
- Human-readable analysis
- Detailed breakdown for each test case
- Executive summary with recommendations
- Visualizations and insights

**CSV Report** (`reports/benchmark-report-latest.csv`):
- Spreadsheet-friendly format
- Easy to import into Excel/Google Sheets
- Pivot tables and custom analysis

## Test Case Structure

Each test case includes:

```typescript
{
  name: 'Strong All-Around Senior Engineer',
  targetRole: 'Senior Full-Stack Engineer',
  atsCompatibility: 90,
  keywordMatch: 85,
  skillsScore: 88,
  projectScore: 87,
  expectedRange: [85, 92],  // What human evaluators expect
  notes: 'Excellent resume, all components strong.'
}
```

## Scoring Formulas Compared

### Current Formula (Production)
```
ATS: 20% | Keywords: 40% | Skills: 20% | Projects: 20%

score = round(
  atsCompatibility * 0.20 +
  keywordMatch     * 0.40 +
  skillsScore      * 0.20 +
  projectScore     * 0.20
)
```

### Option B Formula (Proposed)
```
ATS: 20% | Keywords: 30% | Skills: 25% | Projects: 25%

score = round(
  atsCompatibility * 0.20 +
  keywordMatch     * 0.30 +
  skillsScore      * 0.25 +
  projectScore     * 0.25
)
```

## Evaluation Metrics

For each test case, the framework calculates:

1. **In Range**: Does the score fall within the expected range?
2. **Deviation**: How far is the score from the expected range?
3. **Better Formula**: Which formula produces a more accurate score?

Summary metrics:
- **In Range Percentage**: % of scores within expected ranges
- **Average Deviation**: Average distance from expected ranges
- **Better Match Count**: Number of cases where formula performed better

## Adding Custom Test Cases

Edit `benchmark/sample-resumes.ts`:

```typescript
export const SAMPLE_RESUMES: BenchmarkResume[] = [
  // ... existing cases
  {
    name: 'Your Test Case Name',
    targetRole: 'Target Role',
    atsCompatibility: 80,  // 0-100
    keywordMatch: 75,      // 0-100
    skillsScore: 70,       // 0-100
    projectScore: 85,      // 0-100
    expectedRange: [72, 78], // [min, max] based on human eval
    notes: 'Context about this resume',
  },
];
```

Then re-run the benchmark to see updated results.

## Adding New Formulas

Edit `benchmark/ats-benchmark.ts`:

```typescript
export const OPTION_C_FORMULA: ScoringFormula = {
  name: 'Option C (25/25/25/25)',
  weights: {
    atsCompatibility: 0.25,
    keywordMatch: 0.25,
    skillsScore: 0.25,
    projectScore: 0.25,
  },
  calculate: (resume: BenchmarkResume) => {
    return Math.round(
      resume.atsCompatibility * 0.25 +
      resume.keywordMatch * 0.25 +
      resume.skillsScore * 0.25 +
      resume.projectScore * 0.25
    );
  },
};
```

Then update `runBenchmark()` to include your new formula.

## Sample Test Cases Included

The framework includes 20 diverse scenarios:

1. **Strong All-Around Senior Engineer** - Excellent across all dimensions
2. **Great Skills, Weak Keywords** - Tests keyword dominance issue
3. **Keyword-Heavy, Weak Experience** - Tests keyword stuffing detection
4. **Balanced Mediocre Resume** - Baseline average case
5. **Junior with Potential** - Entry-level with growth indicators
6. **Career Switcher** - Different domain, skill gaps
7. **Excellent Student Projects** - Strong portfolio, limited experience
8. **Senior Engineer, Minimal Keywords** - Experience vs. keyword tradeoff
9. **Perfect Keyword Match** - 100% keyword alignment
10. **Weak Formatting, Strong Content** - ATS vs. content quality
11. **One Critical Gap - Keywords** - Major keyword mismatch
12. **One Critical Gap - Projects** - Claims without evidence
13. **Spiked Excellence** - Exceptional in some areas, weak in others
14. **Fresh Graduate** - Typical new grad baseline
15. **Over-Qualified Senior** - Perfect fit on paper
16. **Bootcamp Graduate** - Project-heavy portfolio
17. **Freelancer** - Diverse project experience
18. **Technical Writer Pivoting** - Career change with minimal tech skills
19. **Open Source Contributor** - Strong public projects
20. **FAANG Veteran** - Minimal resume, strong background

## Interpreting Results

### In Range Percentage
- **Higher is better** - Formula aligns with human expectations
- Target: >80% in expected ranges

### Average Deviation
- **Lower is better** - Formula produces scores closer to expectations
- Target: <3 points average deviation

### Better Match Count
- **Higher is better** - Formula wins more head-to-head comparisons
- Target: Win majority of cases

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SUMMARY                      
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Test Cases: 20

Current Formula (20/40/20/20):
  ✓ In Expected Range: 12/20 (60.0%)
  ✓ Avg Deviation: 3.45 points
  ✓ Better Matches: 3

Option B Formula (20/30/25/25):
  ✓ In Expected Range: 16/20 (80.0%)
  ✓ Avg Deviation: 2.10 points
  ✓ Better Matches: 13

Tie Cases: 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 RECOMMENDATION: Deploy Option B Formula
   Option B better matches human evaluation expectations.
```

## Integration with Production

**This framework does NOT modify production code.**

After running benchmarks and reviewing results:

1. Review `reports/benchmark-report-latest.md` for detailed analysis
2. Examine specific test cases where formulas differ
3. If Option B performs better:
   - Update `src/lib/ats/analyzer.ts` → `applyDeterministicJDMatch()`
   - Update AI prompt formula instructions
4. Re-run benchmarks after deployment to verify

## Best Practices

### When to Run Benchmarks

- Before deploying formula changes
- After updating sub-score calculations
- When adding new evaluation criteria
- Monthly as part of quality assurance

### Expected Range Guidelines

Expected ranges should be based on:
- Human recruiter evaluation
- Historical ATS passing rates
- Industry standards for the role level
- Real-world resume screening outcomes

Keep ranges realistic (typically ±3-5 points) to allow for scoring variance while still providing meaningful validation.

### Interpreting Close Results

If both formulas perform similarly:
- Consider user feedback trends
- Analyze edge cases (very high/low scores)
- Review business priorities (false positive vs. false negative tolerance)
- Test with additional real-world resume samples

## Troubleshooting

### ts-node not found
```bash
npm install -g ts-node
# Or use npx
npx ts-node benchmark/run-benchmark.ts
```

### Permission denied
```bash
chmod +x benchmark/run-benchmark.ts
```

### Reports directory not created
The script automatically creates the `reports/` directory. If it fails, create it manually:
```bash
mkdir -p benchmark/reports
```

## Next Steps

1. ✅ Run the benchmark: `ts-node benchmark/run-benchmark.ts`
2. ✅ Review `reports/benchmark-report-latest.md`
3. ✅ Analyze cases where formulas differ significantly
4. ✅ Make decision based on data + user feedback
5. ✅ Update production formula if recommended
6. ✅ Re-run benchmarks post-deployment to validate

## Contributing

To add more test cases:
1. Add scenarios to `sample-resumes.ts`
2. Set realistic expected ranges based on human evaluation
3. Run benchmark and review impact on overall metrics
4. Consider edge cases and diverse resume types

## Questions?

- See detailed report: `reports/benchmark-report-latest.md`
- Review scoring logic: `ats-benchmark.ts`
- Check sample cases: `sample-resumes.ts`
- Refer to main audit: `ATS_SCORE_AGGREGATION_AUDIT.md`
