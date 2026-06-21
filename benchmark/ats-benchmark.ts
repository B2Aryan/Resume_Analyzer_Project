/**
 * ATS Benchmark Testing Framework
 * 
 * Tests and compares different scoring formulas without modifying production code.
 * Generates detailed reports comparing current vs proposed formulas.
 */

export interface BenchmarkResume {
  name: string;
  targetRole: string;
  atsCompatibility: number;
  keywordMatch: number;
  skillsScore: number;
  projectScore: number;
  expectedRange: [number, number]; // [min, max] expected by human evaluation
  notes?: string;
}

export interface ScoringFormula {
  name: string;
  calculate: (resume: BenchmarkResume) => number;
  weights: {
    atsCompatibility: number;
    keywordMatch: number;
    skillsScore: number;
    projectScore: number;
  };
}

export interface BenchmarkResult {
  resume: BenchmarkResume;
  currentScore: number;
  optionBScore: number;
  currentInRange: boolean;
  optionBInRange: boolean;
  currentDeviation: number;
  optionBDeviation: number;
  betterFormula: 'current' | 'optionB' | 'tie';
}

export interface BenchmarkSummary {
  totalResumes: number;
  currentFormula: {
    inRangeCount: number;
    inRangePercent: number;
    avgDeviation: number;
    betterCount: number;
  };
  optionBFormula: {
    inRangeCount: number;
    inRangePercent: number;
    avgDeviation: number;
    betterCount: number;
  };
  tieCount: number;
  recommendation: 'current' | 'optionB' | 'neutral';
}

/**
 * Current Production Formula
 * ATS: 20%, Keywords: 40%, Skills: 20%, Projects: 20%
 */
export const CURRENT_FORMULA: ScoringFormula = {
  name: 'Current (20/40/20/20)',
  weights: {
    atsCompatibility: 0.20,
    keywordMatch: 0.40,
    skillsScore: 0.20,
    projectScore: 0.20,
  },
  calculate: (resume: BenchmarkResume) => {
    return Math.round(
      resume.atsCompatibility * 0.20 +
      resume.keywordMatch * 0.40 +
      resume.skillsScore * 0.20 +
      resume.projectScore * 0.20
    );
  },
};

/**
 * Proposed Option B Formula
 * ATS: 20%, Keywords: 30%, Skills: 25%, Projects: 25%
 */
export const OPTION_B_FORMULA: ScoringFormula = {
  name: 'Option B (20/30/25/25)',
  weights: {
    atsCompatibility: 0.20,
    keywordMatch: 0.30,
    skillsScore: 0.25,
    projectScore: 0.25,
  },
  calculate: (resume: BenchmarkResume) => {
    return Math.round(
      resume.atsCompatibility * 0.20 +
      resume.keywordMatch * 0.30 +
      resume.skillsScore * 0.25 +
      resume.projectScore * 0.25
    );
  },
};

/**
 * Calculate deviation from expected range
 * Returns 0 if in range, positive if above, negative if below
 */
function calculateDeviation(score: number, expectedRange: [number, number]): number {
  const [min, max] = expectedRange;
  if (score < min) return score - min; // Negative deviation
  if (score > max) return score - max; // Positive deviation
  return 0; // In range
}

/**
 * Check if score is within expected range
 */
function isInRange(score: number, expectedRange: [number, number]): boolean {
  const [min, max] = expectedRange;
  return score >= min && score <= max;
}

/**
 * Run benchmark on a single resume
 */
export function benchmarkResume(resume: BenchmarkResume): BenchmarkResult {
  const currentScore = CURRENT_FORMULA.calculate(resume);
  const optionBScore = OPTION_B_FORMULA.calculate(resume);

  const currentInRange = isInRange(currentScore, resume.expectedRange);
  const optionBInRange = isInRange(optionBScore, resume.expectedRange);

  const currentDeviation = calculateDeviation(currentScore, resume.expectedRange);
  const optionBDeviation = calculateDeviation(optionBScore, resume.expectedRange);

  let betterFormula: 'current' | 'optionB' | 'tie';
  
  if (currentInRange && !optionBInRange) {
    betterFormula = 'current';
  } else if (!currentInRange && optionBInRange) {
    betterFormula = 'optionB';
  } else if (currentInRange && optionBInRange) {
    betterFormula = 'tie';
  } else {
    // Both out of range, compare deviation magnitude
    const currentMagnitude = Math.abs(currentDeviation);
    const optionBMagnitude = Math.abs(optionBDeviation);
    
    if (currentMagnitude < optionBMagnitude) {
      betterFormula = 'current';
    } else if (optionBMagnitude < currentMagnitude) {
      betterFormula = 'optionB';
    } else {
      betterFormula = 'tie';
    }
  }

  return {
    resume,
    currentScore,
    optionBScore,
    currentInRange,
    optionBInRange,
    currentDeviation,
    optionBDeviation,
    betterFormula,
  };
}

/**
 * Run benchmark on multiple resumes
 */
export function runBenchmark(resumes: BenchmarkResume[]): {
  results: BenchmarkResult[];
  summary: BenchmarkSummary;
} {
  const results = resumes.map(benchmarkResume);

  const currentInRangeCount = results.filter(r => r.currentInRange).length;
  const optionBInRangeCount = results.filter(r => r.optionBInRange).length;
  
  const currentBetterCount = results.filter(r => r.betterFormula === 'current').length;
  const optionBBetterCount = results.filter(r => r.betterFormula === 'optionB').length;
  const tieCount = results.filter(r => r.betterFormula === 'tie').length;

  const currentAvgDeviation = results.reduce((sum, r) => sum + Math.abs(r.currentDeviation), 0) / results.length;
  const optionBAvgDeviation = results.reduce((sum, r) => sum + Math.abs(r.optionBDeviation), 0) / results.length;

  let recommendation: 'current' | 'optionB' | 'neutral';
  
  if (optionBInRangeCount > currentInRangeCount) {
    recommendation = 'optionB';
  } else if (currentInRangeCount > optionBInRangeCount) {
    recommendation = 'current';
  } else if (optionBAvgDeviation < currentAvgDeviation) {
    recommendation = 'optionB';
  } else if (currentAvgDeviation < optionBAvgDeviation) {
    recommendation = 'current';
  } else {
    recommendation = 'neutral';
  }

  const summary: BenchmarkSummary = {
    totalResumes: results.length,
    currentFormula: {
      inRangeCount: currentInRangeCount,
      inRangePercent: (currentInRangeCount / results.length) * 100,
      avgDeviation: currentAvgDeviation,
      betterCount: currentBetterCount,
    },
    optionBFormula: {
      inRangeCount: optionBInRangeCount,
      inRangePercent: (optionBInRangeCount / results.length) * 100,
      avgDeviation: optionBAvgDeviation,
      betterCount: optionBBetterCount,
    },
    tieCount,
    recommendation,
  };

  return { results, summary };
}

/**
 * Generate markdown report
 */
export function generateMarkdownReport(
  results: BenchmarkResult[],
  summary: BenchmarkSummary
): string {
  let report = '# ATS Scoring Formula Benchmark Report\n\n';
  
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  report += `**Total Test Cases:** ${summary.totalResumes}\n\n`;
  
  report += '---\n\n';
  report += '## Executive Summary\n\n';
  
  report += '| Metric | Current Formula (20/40/20/20) | Option B (20/30/25/25) | Winner |\n';
  report += '|--------|-------------------------------|------------------------|--------|\n';
  report += `| In Expected Range | ${summary.currentFormula.inRangeCount}/${summary.totalResumes} (${summary.currentFormula.inRangePercent.toFixed(1)}%) | ${summary.optionBFormula.inRangeCount}/${summary.totalResumes} (${summary.optionBFormula.inRangePercent.toFixed(1)}%) | ${summary.optionBFormula.inRangeCount > summary.currentFormula.inRangeCount ? '**Option B**' : summary.currentFormula.inRangeCount > summary.optionBFormula.inRangeCount ? '**Current**' : 'Tie'} |\n`;
  report += `| Avg Deviation | ${summary.currentFormula.avgDeviation.toFixed(2)} pts | ${summary.optionBFormula.avgDeviation.toFixed(2)} pts | ${summary.optionBFormula.avgDeviation < summary.currentFormula.avgDeviation ? '**Option B**' : summary.currentFormula.avgDeviation < summary.optionBFormula.avgDeviation ? '**Current**' : 'Tie'} |\n`;
  report += `| Better Matches | ${summary.currentFormula.betterCount} | ${summary.optionBFormula.betterCount} | ${summary.optionBFormula.betterCount > summary.currentFormula.betterCount ? '**Option B**' : summary.currentFormula.betterCount > summary.optionBFormula.betterCount ? '**Current**' : 'Tie'} |\n`;
  report += `| Tie Cases | - | - | ${summary.tieCount} |\n\n`;
  
  report += `**Recommendation:** `;
  if (summary.recommendation === 'optionB') {
    report += '✅ **Deploy Option B Formula** - Better matches human evaluation\n\n';
  } else if (summary.recommendation === 'current') {
    report += '⚠️ **Keep Current Formula** - Current performs better\n\n';
  } else {
    report += '⚖️ **Neutral** - Both formulas perform similarly\n\n';
  }
  
  report += '---\n\n';
  report += '## Detailed Results\n\n';
  
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const resume = r.resume;
    
    report += `### ${i + 1}. ${resume.name}\n\n`;
    report += `**Target Role:** ${resume.targetRole}\n\n`;
    
    if (resume.notes) {
      report += `**Notes:** ${resume.notes}\n\n`;
    }
    
    report += '#### Sub-Scores\n\n';
    report += '| Component | Score |\n';
    report += '|-----------|-------|\n';
    report += `| ATS Compatibility | ${resume.atsCompatibility} |\n`;
    report += `| Keyword Match | ${resume.keywordMatch} |\n`;
    report += `| Skills Score | ${resume.skillsScore} |\n`;
    report += `| Project Score | ${resume.projectScore} |\n\n`;
    
    report += '#### Final Scores\n\n';
    report += '| Formula | Calculation | Final Score | Expected Range | Status |\n';
    report += '|---------|-------------|-------------|----------------|--------|\n';
    
    const currentCalc = `${resume.atsCompatibility}×0.2 + ${resume.keywordMatch}×0.4 + ${resume.skillsScore}×0.2 + ${resume.projectScore}×0.2`;
    const currentStatus = r.currentInRange ? '✅ In Range' : `❌ Out (${r.currentDeviation > 0 ? '+' : ''}${r.currentDeviation})`;
    report += `| Current | ${currentCalc} | **${r.currentScore}** | ${resume.expectedRange[0]}-${resume.expectedRange[1]} | ${currentStatus} |\n`;
    
    const optionBCalc = `${resume.atsCompatibility}×0.2 + ${resume.keywordMatch}×0.3 + ${resume.skillsScore}×0.25 + ${resume.projectScore}×0.25`;
    const optionBStatus = r.optionBInRange ? '✅ In Range' : `❌ Out (${r.optionBDeviation > 0 ? '+' : ''}${r.optionBDeviation})`;
    report += `| Option B | ${optionBCalc} | **${r.optionBScore}** | ${resume.expectedRange[0]}-${resume.expectedRange[1]} | ${optionBStatus} |\n\n`;
    
    report += `**Better Formula:** `;
    if (r.betterFormula === 'optionB') {
      report += '✅ **Option B**\n\n';
    } else if (r.betterFormula === 'current') {
      report += '⚠️ **Current**\n\n';
    } else {
      report += '⚖️ **Tie**\n\n';
    }
    
    report += '---\n\n';
  }
  
  report += '## Visualization\n\n';
  
  report += '### Score Distribution\n\n';
  report += '```\n';
  report += 'Resume                  Expected    Current    Option B   Better\n';
  report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  for (const r of results) {
    const name = r.resume.name.padEnd(22);
    const expected = `${r.resume.expectedRange[0]}-${r.resume.expectedRange[1]}`.padEnd(11);
    const current = String(r.currentScore).padEnd(10);
    const optionB = String(r.optionBScore).padEnd(10);
    const better = r.betterFormula === 'optionB' ? 'Option B' : r.betterFormula === 'current' ? 'Current' : 'Tie';
    
    report += `${name} ${expected} ${current} ${optionB} ${better}\n`;
  }
  
  report += '```\n\n';
  
  report += '---\n\n';
  report += '## Analysis\n\n';
  
  const improvedCases = results.filter(r => r.betterFormula === 'optionB');
  const worsenedCases = results.filter(r => r.betterFormula === 'current');
  
  if (improvedCases.length > 0) {
    report += `### Cases Where Option B Performs Better (${improvedCases.length})\n\n`;
    for (const r of improvedCases) {
      report += `- **${r.resume.name}**: `;
      if (!r.currentInRange && r.optionBInRange) {
        report += `Brought score into expected range (${r.currentScore} → ${r.optionBScore})\n`;
      } else {
        report += `Reduced deviation by ${Math.abs(Math.abs(r.currentDeviation) - Math.abs(r.optionBDeviation)).toFixed(1)} points\n`;
      }
    }
    report += '\n';
  }
  
  if (worsenedCases.length > 0) {
    report += `### Cases Where Current Performs Better (${worsenedCases.length})\n\n`;
    for (const r of worsenedCases) {
      report += `- **${r.resume.name}**: `;
      if (r.currentInRange && !r.optionBInRange) {
        report += `Current keeps score in range, Option B moves out (${r.currentScore} vs ${r.optionBScore})\n`;
      } else {
        report += `Current has ${Math.abs(Math.abs(r.optionBDeviation) - Math.abs(r.currentDeviation)).toFixed(1)} points less deviation\n`;
      }
    }
    report += '\n';
  }
  
  report += '---\n\n';
  report += '## Conclusion\n\n';
  
  if (summary.recommendation === 'optionB') {
    report += 'Option B formula demonstrates superior alignment with human evaluation:\n\n';
    report += `- **${summary.optionBFormula.inRangePercent.toFixed(1)}%** of scores fall within expected ranges (vs ${summary.currentFormula.inRangePercent.toFixed(1)}% current)\n`;
    report += `- **${summary.optionBFormula.avgDeviation.toFixed(2)}** average deviation (vs ${summary.currentFormula.avgDeviation.toFixed(2)} current)\n`;
    report += `- Performs better in **${summary.optionBFormula.betterCount}** cases (vs ${summary.currentFormula.betterCount} current)\n\n`;
    report += '**Recommendation: Deploy Option B formula to production.**\n';
  } else if (summary.recommendation === 'current') {
    report += 'Current formula demonstrates better alignment with human evaluation:\n\n';
    report += `- **${summary.currentFormula.inRangePercent.toFixed(1)}%** of scores fall within expected ranges (vs ${summary.optionBFormula.inRangePercent.toFixed(1)}% Option B)\n`;
    report += `- **${summary.currentFormula.avgDeviation.toFixed(2)}** average deviation (vs ${summary.optionBFormula.avgDeviation.toFixed(2)} Option B)\n`;
    report += `- Performs better in **${summary.currentFormula.betterCount}** cases (vs ${summary.optionBFormula.betterCount} Option B)\n\n`;
    report += '**Recommendation: Keep current formula.**\n';
  } else {
    report += 'Both formulas show similar performance:\n\n';
    report += `- Current: ${summary.currentFormula.inRangePercent.toFixed(1)}% in range, ${summary.currentFormula.avgDeviation.toFixed(2)} avg deviation\n`;
    report += `- Option B: ${summary.optionBFormula.inRangePercent.toFixed(1)}% in range, ${summary.optionBFormula.avgDeviation.toFixed(2)} avg deviation\n\n`;
    report += '**Recommendation: Consider other factors (user feedback, business goals) for decision.**\n';
  }
  
  return report;
}

/**
 * Generate CSV report for spreadsheet analysis
 */
export function generateCSVReport(results: BenchmarkResult[]): string {
  let csv = 'Resume Name,Target Role,ATS Compatibility,Keyword Match,Skills Score,Project Score,Expected Min,Expected Max,Current Score,Current In Range,Current Deviation,Option B Score,Option B In Range,Option B Deviation,Better Formula,Notes\n';
  
  for (const r of results) {
    const resume = r.resume;
    const notes = (resume.notes || '').replace(/,/g, ';'); // Escape commas
    
    csv += `"${resume.name}","${resume.targetRole}",`;
    csv += `${resume.atsCompatibility},${resume.keywordMatch},${resume.skillsScore},${resume.projectScore},`;
    csv += `${resume.expectedRange[0]},${resume.expectedRange[1]},`;
    csv += `${r.currentScore},${r.currentInRange},${r.currentDeviation},`;
    csv += `${r.optionBScore},${r.optionBInRange},${r.optionBDeviation},`;
    csv += `${r.betterFormula},"${notes}"\n`;
  }
  
  return csv;
}
