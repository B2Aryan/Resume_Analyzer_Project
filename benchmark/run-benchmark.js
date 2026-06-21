/**
 * Benchmark Runner Script (JavaScript version)
 * 
 * Run this script to compare current vs Option B scoring formulas:
 * 
 * Usage:
 *   node benchmark/run-benchmark.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample resumes test data
const SAMPLE_RESUMES = [
  {
    name: 'Strong All-Around Senior Engineer',
    targetRole: 'Senior Full-Stack Engineer',
    atsCompatibility: 90,
    keywordMatch: 85,
    skillsScore: 88,
    projectScore: 87,
    expectedRange: [85, 92],
    notes: 'Excellent resume, all components strong. Should score in high 80s.',
  },
  {
    name: 'Great Skills, Weak Keywords',
    targetRole: 'Frontend Developer',
    atsCompatibility: 90,
    keywordMatch: 45,
    skillsScore: 85,
    projectScore: 80,
    expectedRange: [72, 78],
    notes: '3 out of 4 components strong. Current formula may over-penalize the single weak keyword score.',
  },
  {
    name: 'Keyword-Heavy, Weak Experience',
    targetRole: 'React Developer',
    atsCompatibility: 70,
    keywordMatch: 95,
    skillsScore: 60,
    projectScore: 55,
    expectedRange: [65, 72],
    notes: 'Resume stuffed with keywords but lacking real project depth. Should be mid-range.',
  },
  {
    name: 'Balanced Mediocre Resume',
    targetRole: 'Java Developer',
    atsCompatibility: 70,
    keywordMatch: 70,
    skillsScore: 70,
    projectScore: 70,
    expectedRange: [68, 72],
    notes: 'Consistently average across all dimensions. Should score around 70.',
  },
  {
    name: 'Junior with Potential',
    targetRole: 'Software Engineer Intern',
    atsCompatibility: 75,
    keywordMatch: 60,
    skillsScore: 70,
    projectScore: 68,
    expectedRange: [66, 72],
    notes: 'Decent junior resume. Skills/projects should carry more weight than keyword gaps.',
  },
  {
    name: 'Career Switcher - Different Domain',
    targetRole: 'Frontend Developer',
    atsCompatibility: 85,
    keywordMatch: 35,
    skillsScore: 55,
    projectScore: 50,
    expectedRange: [50, 58],
    notes: 'Data analyst switching to frontend. Good formatting, but skills not aligned. Should be low-mid range.',
  },
  {
    name: 'Excellent Student Projects',
    targetRole: 'Entry-Level Software Engineer',
    atsCompatibility: 80,
    keywordMatch: 65,
    skillsScore: 78,
    projectScore: 82,
    expectedRange: [72, 78],
    notes: 'Strong student with great projects. Projects should be valued highly for entry-level.',
  },
  {
    name: 'Senior Engineer, Minimal Keywords',
    targetRole: 'Staff Engineer',
    atsCompatibility: 95,
    keywordMatch: 50,
    skillsScore: 90,
    projectScore: 85,
    expectedRange: [74, 80],
    notes: 'Very experienced but resume lacks keyword optimization. Experience should outweigh keyword gaps.',
  },
  {
    name: 'Perfect Keyword Match',
    targetRole: 'DevOps Engineer',
    atsCompatibility: 85,
    keywordMatch: 100,
    skillsScore: 80,
    projectScore: 75,
    expectedRange: [83, 89],
    notes: 'Resume perfectly aligned with JD keywords. Should score high but not ignore moderate project score.',
  },
  {
    name: 'Weak Formatting, Strong Content',
    targetRole: 'Backend Developer',
    atsCompatibility: 55,
    keywordMatch: 80,
    skillsScore: 85,
    projectScore: 82,
    expectedRange: [73, 79],
    notes: 'Poor formatting but strong technical content. Real work should matter more than formatting issues.',
  },
  {
    name: 'One Critical Gap - Keywords',
    targetRole: 'Data Scientist',
    atsCompatibility: 88,
    keywordMatch: 30,
    skillsScore: 80,
    projectScore: 75,
    expectedRange: [60, 68],
    notes: 'Major keyword mismatch is a red flag. Current formula may be harsh, but gap is real.',
  },
  {
    name: 'One Critical Gap - Projects',
    targetRole: 'ML Engineer',
    atsCompatibility: 85,
    keywordMatch: 80,
    skillsScore: 78,
    projectScore: 30,
    expectedRange: [62, 70],
    notes: 'Lists ML keywords but no projects to back them up. Should be penalized.',
  },
  {
    name: 'Spiked Excellence',
    targetRole: 'Full-Stack Developer',
    atsCompatibility: 95,
    keywordMatch: 50,
    skillsScore: 90,
    projectScore: 85,
    expectedRange: [76, 82],
    notes: 'Exceptional skills/projects with decent keyword coverage. Should score mid-to-high 70s.',
  },
  {
    name: 'Fresh Graduate - CS Major',
    targetRole: 'Frontend Developer Intern',
    atsCompatibility: 70,
    keywordMatch: 55,
    skillsScore: 65,
    projectScore: 60,
    expectedRange: [60, 66],
    notes: 'Typical fresh grad resume. Modest across all dimensions. Should be in low 60s.',
  },
  {
    name: 'Over-Qualified Senior',
    targetRole: 'Junior Developer',
    atsCompatibility: 90,
    keywordMatch: 95,
    skillsScore: 92,
    projectScore: 88,
    expectedRange: [88, 94],
    notes: 'Senior applying for junior role. Perfect fit on paper. Should score very high.',
  },
  {
    name: 'Bootcamp Graduate',
    targetRole: 'Full-Stack Developer',
    atsCompatibility: 75,
    keywordMatch: 70,
    skillsScore: 72,
    projectScore: 75,
    expectedRange: [70, 76],
    notes: 'Bootcamp grad with solid portfolio projects. Projects should be weighted meaningfully.',
  },
  {
    name: 'Freelancer with Diverse Experience',
    targetRole: 'React Developer',
    atsCompatibility: 80,
    keywordMatch: 75,
    skillsScore: 80,
    projectScore: 85,
    expectedRange: [78, 84],
    notes: 'Strong project portfolio from freelance work. Should score in high 70s to low 80s.',
  },
  {
    name: 'Technical Writer Pivoting to Dev',
    targetRole: 'Frontend Developer',
    atsCompatibility: 85,
    keywordMatch: 40,
    skillsScore: 50,
    projectScore: 45,
    expectedRange: [48, 56],
    notes: 'Well-formatted but minimal technical skills. Should score low due to weak fundamentals.',
  },
  {
    name: 'Open Source Contributor',
    targetRole: 'Software Engineer',
    atsCompatibility: 88,
    keywordMatch: 72,
    skillsScore: 82,
    projectScore: 90,
    expectedRange: [80, 86],
    notes: 'Excellent open source projects. Strong projects should lift overall score significantly.',
  },
  {
    name: 'FAANG Veteran - Minimal Resume',
    targetRole: 'Staff Engineer',
    atsCompatibility: 70,
    keywordMatch: 60,
    skillsScore: 85,
    projectScore: 82,
    expectedRange: [72, 78],
    notes: 'Experienced engineer with sparse resume. Experience quality matters more than keyword density.',
  },
];

// Scoring functions
function calculateCurrentScore(resume) {
  return Math.round(
    resume.atsCompatibility * 0.20 +
    resume.keywordMatch * 0.40 +
    resume.skillsScore * 0.20 +
    resume.projectScore * 0.20
  );
}

function calculateOptionBScore(resume) {
  return Math.round(
    resume.atsCompatibility * 0.20 +
    resume.keywordMatch * 0.30 +
    resume.skillsScore * 0.25 +
    resume.projectScore * 0.25
  );
}

function isInRange(score, expectedRange) {
  return score >= expectedRange[0] && score <= expectedRange[1];
}

function calculateDeviation(score, expectedRange) {
  if (score < expectedRange[0]) return score - expectedRange[0];
  if (score > expectedRange[1]) return score - expectedRange[1];
  return 0;
}

// Run benchmark
function runBenchmark() {
  const results = SAMPLE_RESUMES.map(resume => {
    const currentScore = calculateCurrentScore(resume);
    const optionBScore = calculateOptionBScore(resume);
    
    const currentInRange = isInRange(currentScore, resume.expectedRange);
    const optionBInRange = isInRange(optionBScore, resume.expectedRange);
    
    const currentDeviation = calculateDeviation(currentScore, resume.expectedRange);
    const optionBDeviation = calculateDeviation(optionBScore, resume.expectedRange);
    
    let betterFormula;
    if (currentInRange && !optionBInRange) {
      betterFormula = 'current';
    } else if (!currentInRange && optionBInRange) {
      betterFormula = 'optionB';
    } else if (currentInRange && optionBInRange) {
      betterFormula = 'tie';
    } else {
      const currentMag = Math.abs(currentDeviation);
      const optionBMag = Math.abs(optionBDeviation);
      if (currentMag < optionBMag) betterFormula = 'current';
      else if (optionBMag < currentMag) betterFormula = 'optionB';
      else betterFormula = 'tie';
    }
    
    return {
      resume,
      currentScore,
      optionBScore,
      currentInRange,
      optionBInRange,
      currentDeviation,
      optionBDeviation,
      betterFormula
    };
  });
  
  // Calculate summary
  const currentInRangeCount = results.filter(r => r.currentInRange).length;
  const optionBInRangeCount = results.filter(r => r.optionBInRange).length;
  const currentBetterCount = results.filter(r => r.betterFormula === 'current').length;
  const optionBBetterCount = results.filter(r => r.betterFormula === 'optionB').length;
  const tieCount = results.filter(r => r.betterFormula === 'tie').length;
  
  const currentAvgDev = results.reduce((sum, r) => sum + Math.abs(r.currentDeviation), 0) / results.length;
  const optionBAvgDev = results.reduce((sum, r) => sum + Math.abs(r.optionBDeviation), 0) / results.length;
  
  let recommendation;
  if (optionBInRangeCount > currentInRangeCount) recommendation = 'optionB';
  else if (currentInRangeCount > optionBInRangeCount) recommendation = 'current';
  else if (optionBAvgDev < currentAvgDev) recommendation = 'optionB';
  else if (currentAvgDev < optionBAvgDev) recommendation = 'current';
  else recommendation = 'neutral';
  
  return {
    results,
    summary: {
      totalResumes: results.length,
      currentFormula: {
        inRangeCount: currentInRangeCount,
        inRangePercent: (currentInRangeCount / results.length) * 100,
        avgDeviation: currentAvgDev,
        betterCount: currentBetterCount
      },
      optionBFormula: {
        inRangeCount: optionBInRangeCount,
        inRangePercent: (optionBInRangeCount / results.length) * 100,
        avgDeviation: optionBAvgDev,
        betterCount: optionBBetterCount
      },
      tieCount,
      recommendation
    }
  };
}

// Generate report
function generateReport(results, summary) {
  let report = '# ATS Scoring Formula Benchmark Report\n\n';
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  report += `**Total Test Cases:** ${summary.totalResumes}\n\n`;
  report += '---\n\n## Executive Summary\n\n';
  
  report += '| Metric | Current (20/40/20/20) | Option B (20/30/25/25) | Winner |\n';
  report += '|--------|---------------------|----------------------|--------|\n';
  report += `| In Range | ${summary.currentFormula.inRangeCount}/${summary.totalResumes} (${summary.currentFormula.inRangePercent.toFixed(1)}%) | ${summary.optionBFormula.inRangeCount}/${summary.totalResumes} (${summary.optionBFormula.inRangePercent.toFixed(1)}%) | ${summary.optionBFormula.inRangeCount > summary.currentFormula.inRangeCount ? '**Option B**' : summary.currentFormula.inRangeCount > summary.optionBFormula.inRangeCount ? '**Current**' : 'Tie'} |\n`;
  report += `| Avg Deviation | ${summary.currentFormula.avgDeviation.toFixed(2)} pts | ${summary.optionBFormula.avgDeviation.toFixed(2)} pts | ${summary.optionBFormula.avgDeviation < summary.currentFormula.avgDeviation ? '**Option B**' : summary.currentFormula.avgDeviation < summary.optionBFormula.avgDeviation ? '**Current**' : 'Tie'} |\n`;
  report += `| Better Matches | ${summary.currentFormula.betterCount} | ${summary.optionBFormula.betterCount} | ${summary.optionBFormula.betterCount > summary.currentFormula.betterCount ? '**Option B**' : summary.currentFormula.betterCount > summary.optionBFormula.betterCount ? '**Current**' : 'Tie'} |\n\n`;
  
  report += `**Recommendation:** `;
  if (summary.recommendation === 'optionB') {
    report += '✅ **Deploy Option B** - Better matches human evaluation\n\n';
  } else if (summary.recommendation === 'current') {
    report += '⚠️ **Keep Current** - Current performs better\n\n';
  } else {
    report += '⚖️ **Neutral** - Both similar\n\n';
  }
  
  report += '---\n\n## Quick Comparison Table\n\n';
  report += '| Resume | Expected | Current | Option B | Better |\n';
  report += '|--------|----------|---------|----------|--------|\n';
  
  results.forEach(r => {
    const exp = `${r.resume.expectedRange[0]}-${r.resume.expectedRange[1]}`;
    const better = r.betterFormula === 'optionB' ? 'Option B' : r.betterFormula === 'current' ? 'Current' : 'Tie';
    const currentMark = r.currentInRange ? '✅' : '❌';
    const optionBMark = r.optionBInRange ? '✅' : '❌';
    report += `| ${r.resume.name} | ${exp} | ${currentMark} ${r.currentScore} | ${optionBMark} ${r.optionBScore} | ${better} |\n`;
  });
  
  report += '\n---\n\n## Conclusion\n\n';
  if (summary.recommendation === 'optionB') {
    report += `Option B performs better:\n`;
    report += `- ${summary.optionBFormula.inRangePercent.toFixed(1)}% in range vs ${summary.currentFormula.inRangePercent.toFixed(1)}%\n`;
    report += `- ${summary.optionBFormula.avgDeviation.toFixed(2)} avg deviation vs ${summary.currentFormula.avgDeviation.toFixed(2)}\n`;
    report += `- Better in ${summary.optionBFormula.betterCount} cases vs ${summary.currentFormula.betterCount}\n\n`;
    report += '**✅ Recommendation: Deploy Option B formula**\n';
  }
  
  return report;
}

// Main
function main() {
  console.log('🔬 Running ATS Benchmark...\n');
  
  const { results, summary } = runBenchmark();
  const report = generateReport(results, summary);
  
  // Create reports directory
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Save report
  const reportPath = path.join(reportsDir, 'benchmark-report-latest.md');
  fs.writeFileSync(reportPath, report);
  
  console.log('✅ Benchmark complete!\n');
  console.log(`📄 Report: ${reportPath}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Total: ${summary.totalResumes} cases\n`);
  console.log(`Current: ${summary.currentFormula.inRangeCount}/${summary.totalResumes} in range (${summary.currentFormula.inRangePercent.toFixed(1)}%), ${summary.currentFormula.avgDeviation.toFixed(2)} avg dev\n`);
  console.log(`Option B: ${summary.optionBFormula.inRangeCount}/${summary.totalResumes} in range (${summary.optionBFormula.inRangePercent.toFixed(1)}%), ${summary.optionBFormula.avgDeviation.toFixed(2)} avg dev\n`);
  
  if (summary.recommendation === 'optionB') {
    console.log('🎯 RECOMMENDATION: Deploy Option B Formula\n');
  } else if (summary.recommendation === 'current') {
    console.log('⚠️  RECOMMENDATION: Keep Current Formula\n');
  } else {
    console.log('⚖️  RECOMMENDATION: Neutral\n');
  }
}

main();
