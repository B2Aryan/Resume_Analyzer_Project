#!/usr/bin/env ts-node
/**
 * Benchmark Runner Script
 * 
 * Run this script to compare current vs Option B scoring formulas:
 * 
 * Usage:
 *   ts-node benchmark/run-benchmark.ts
 * 
 * Or if ts-node is not available:
 *   npx ts-node benchmark/run-benchmark.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { runBenchmark, generateMarkdownReport, generateCSVReport } from './ats-benchmark';
import { SAMPLE_RESUMES } from './sample-resumes';

function main() {
  console.log('🔬 Running ATS Scoring Formula Benchmark...\n');
  console.log(`📊 Testing ${SAMPLE_RESUMES.length} resume scenarios\n`);
  
  // Run the benchmark
  const { results, summary } = runBenchmark(SAMPLE_RESUMES);
  
  // Generate reports
  const markdownReport = generateMarkdownReport(results, summary);
  const csvReport = generateCSVReport(results);
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Save reports with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const markdownPath = path.join(reportsDir, `benchmark-report-${timestamp}.md`);
  const csvPath = path.join(reportsDir, `benchmark-report-${timestamp}.csv`);
  const latestMarkdownPath = path.join(reportsDir, 'benchmark-report-latest.md');
  const latestCsvPath = path.join(reportsDir, 'benchmark-report-latest.csv');
  
  fs.writeFileSync(markdownPath, markdownReport);
  fs.writeFileSync(csvPath, csvReport);
  fs.writeFileSync(latestMarkdownPath, markdownReport);
  fs.writeFileSync(latestCsvPath, csvReport);
  
  console.log('✅ Benchmark complete!\n');
  console.log('📄 Reports generated:');
  console.log(`   - ${markdownPath}`);
  console.log(`   - ${csvPath}`);
  console.log(`   - ${latestMarkdownPath}`);
  console.log(`   - ${latestCsvPath}\n`);
  
  // Print summary to console
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('                  SUMMARY                      ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Total Test Cases: ${summary.totalResumes}\n`);
  
  console.log('Current Formula (20/40/20/20):');
  console.log(`  ✓ In Expected Range: ${summary.currentFormula.inRangeCount}/${summary.totalResumes} (${summary.currentFormula.inRangePercent.toFixed(1)}%)`);
  console.log(`  ✓ Avg Deviation: ${summary.currentFormula.avgDeviation.toFixed(2)} points`);
  console.log(`  ✓ Better Matches: ${summary.currentFormula.betterCount}\n`);
  
  console.log('Option B Formula (20/30/25/25):');
  console.log(`  ✓ In Expected Range: ${summary.optionBFormula.inRangeCount}/${summary.totalResumes} (${summary.optionBFormula.inRangePercent.toFixed(1)}%)`);
  console.log(`  ✓ Avg Deviation: ${summary.optionBFormula.avgDeviation.toFixed(2)} points`);
  console.log(`  ✓ Better Matches: ${summary.optionBFormula.betterCount}\n`);
  
  console.log(`Tie Cases: ${summary.tieCount}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (summary.recommendation === 'optionB') {
    console.log('🎯 RECOMMENDATION: Deploy Option B Formula');
    console.log('   Option B better matches human evaluation expectations.\n');
  } else if (summary.recommendation === 'current') {
    console.log('⚠️  RECOMMENDATION: Keep Current Formula');
    console.log('   Current formula performs better for these test cases.\n');
  } else {
    console.log('⚖️  RECOMMENDATION: Neutral');
    console.log('   Both formulas perform similarly. Consider other factors.\n');
  }
  
  console.log('📖 See full report for detailed analysis:');
  console.log(`   ${latestMarkdownPath}\n`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };
