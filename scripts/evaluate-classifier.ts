/**
 * Evaluation Benchmark for HTS Classification
 * 
 * Tests the classification engine against held-out test data from CROSS rulings.
 * Measures accuracy at different HTS code granularities (chapter, heading, subheading, full).
 * 
 * Usage: npx ts-node scripts/evaluate-classifier.ts [--limit N] [--engine v10|setfit]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CrossRuling {
  id: string;
  productDescription: string;
  htsCodes: string[];
  reasoning: string;
  chapter: string;
}

interface EvaluationResult {
  totalSamples: number;
  chapterAccuracy: number;
  headingAccuracy: number;
  subheadingAccuracy: number;
  fullCodeAccuracy: number;
  avgConfidence: number;
  avgLatency: number;
  results: Array<{
    id: string;
    query: string;
    expectedCode: string;
    predictedCode: string;
    confidence: number;
    latency: number;
    chapterMatch: boolean;
    headingMatch: boolean;
    subheadingMatch: boolean;
    fullMatch: boolean;
  }>;
}

/**
 * Load test data from validation or test split
 */
function loadTestData(split: 'validation' | 'test' = 'test', limit?: number): CrossRuling[] {
  const testPath = path.join(__dirname, `../src/data/crossRulings-${split}.json`);
  
  if (!fs.existsSync(testPath)) {
    throw new Error(`Test data not found: ${testPath}. Run ingest-cross-rulings-eval.ts first.`);
  }
  
  const data = JSON.parse(fs.readFileSync(testPath, 'utf-8'));
  const rulings = data.rulings as CrossRuling[];
  
  return limit ? rulings.slice(0, limit) : rulings;
}

/**
 * Normalize HTS code for comparison (remove dots, pad to consistent length)
 */
function normalizeCode(code: string): string {
  return code.replace(/\./g, '').padEnd(10, '0');
}

/**
 * Extract code at different granularities
 */
function extractCodeLevels(code: string) {
  const normalized = normalizeCode(code);
  return {
    chapter: normalized.slice(0, 2),
    heading: normalized.slice(0, 4),
    subheading: normalized.slice(0, 6),
    full: normalized,
  };
}

/**
 * Mock classification function - replace with actual engine call
 * This is a placeholder that returns random results for testing
 */
async function classifyProduct(description: string): Promise<{
  code: string;
  confidence: number;
  latency: number;
}> {
  const startTime = Date.now();
  
  // TODO: Replace with actual classification engine call
  // For now, return a mock result
  // Example: const result = await classifyV10({ description });
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const latency = Date.now() - startTime;
  
  // Mock result - in reality, call your classification engine here
  return {
    code: '6109100012', // Mock HTS code
    confidence: 50 + Math.random() * 50, // Random confidence 50-100%
    latency,
  };
}

/**
 * Evaluate the classifier on test data
 */
async function evaluate(
  testData: CrossRuling[],
  options: { verbose?: boolean } = {}
): Promise<EvaluationResult> {
  console.log(`\n=== Evaluating on ${testData.length} samples ===\n`);
  
  const results: EvaluationResult['results'] = [];
  let chapterCorrect = 0;
  let headingCorrect = 0;
  let subheadingCorrect = 0;
  let fullCorrect = 0;
  let totalConfidence = 0;
  let totalLatency = 0;
  
  for (let i = 0; i < testData.length; i++) {
    const ruling = testData[i];
    const expectedCode = ruling.htsCodes[0]; // Use first HTS code as ground truth
    
    if (options.verbose) {
      console.log(`[${i + 1}/${testData.length}] Testing: "${ruling.productDescription}"`);
    }
    
    try {
      // Classify the product
      const prediction = await classifyProduct(ruling.productDescription);
      
      // Extract code levels for comparison
      const expected = extractCodeLevels(expectedCode);
      const predicted = extractCodeLevels(prediction.code);
      
      // Check matches at each level
      const chapterMatch = expected.chapter === predicted.chapter;
      const headingMatch = expected.heading === predicted.heading;
      const subheadingMatch = expected.subheading === predicted.subheading;
      const fullMatch = expected.full === predicted.full;
      
      if (chapterMatch) chapterCorrect++;
      if (headingMatch) headingCorrect++;
      if (subheadingMatch) subheadingCorrect++;
      if (fullMatch) fullCorrect++;
      
      totalConfidence += prediction.confidence;
      totalLatency += prediction.latency;
      
      results.push({
        id: ruling.id,
        query: ruling.productDescription,
        expectedCode,
        predictedCode: prediction.code,
        confidence: prediction.confidence,
        latency: prediction.latency,
        chapterMatch,
        headingMatch,
        subheadingMatch,
        fullMatch,
      });
      
      if (options.verbose) {
        const status = fullMatch ? '✓' : (subheadingMatch ? '~' : '✗');
        console.log(`  ${status} Expected: ${expectedCode}, Got: ${prediction.code} (${prediction.confidence.toFixed(1)}%)`);
      }
      
    } catch (error) {
      console.error(`Error classifying "${ruling.productDescription}":`, error);
      results.push({
        id: ruling.id,
        query: ruling.productDescription,
        expectedCode,
        predictedCode: 'ERROR',
        confidence: 0,
        latency: 0,
        chapterMatch: false,
        headingMatch: false,
        subheadingMatch: false,
        fullMatch: false,
      });
    }
    
    // Progress indicator
    if (!options.verbose && (i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${testData.length} (${((i + 1) / testData.length * 100).toFixed(1)}%)`);
    }
  }
  
  const totalSamples = testData.length;
  
  return {
    totalSamples,
    chapterAccuracy: (chapterCorrect / totalSamples) * 100,
    headingAccuracy: (headingCorrect / totalSamples) * 100,
    subheadingAccuracy: (subheadingCorrect / totalSamples) * 100,
    fullCodeAccuracy: (fullCorrect / totalSamples) * 100,
    avgConfidence: totalConfidence / totalSamples,
    avgLatency: totalLatency / totalSamples,
    results,
  };
}

/**
 * Print evaluation results
 */
function printResults(result: EvaluationResult) {
  console.log('\n=== Evaluation Results ===\n');
  console.log(`Total Samples: ${result.totalSamples}`);
  console.log(`\nAccuracy by Granularity:`);
  console.log(`  Chapter (2-digit):     ${result.chapterAccuracy.toFixed(2)}%`);
  console.log(`  Heading (4-digit):     ${result.headingAccuracy.toFixed(2)}%`);
  console.log(`  Subheading (6-digit):  ${result.subheadingAccuracy.toFixed(2)}%`);
  console.log(`  Full Code (10-digit):  ${result.fullCodeAccuracy.toFixed(2)}%`);
  console.log(`\nPerformance:`);
  console.log(`  Avg Confidence: ${result.avgConfidence.toFixed(1)}%`);
  console.log(`  Avg Latency: ${result.avgLatency.toFixed(0)}ms`);
  
  // Show some examples of failures
  const failures = result.results.filter(r => !r.subheadingMatch).slice(0, 5);
  if (failures.length > 0) {
    console.log(`\n=== Sample Failures (first 5) ===\n`);
    for (const failure of failures) {
      console.log(`Query: "${failure.query}"`);
      console.log(`  Expected: ${failure.expectedCode}`);
      console.log(`  Got: ${failure.predictedCode} (${failure.confidence.toFixed(1)}%)`);
      console.log();
    }
  }
}

/**
 * Save detailed results to JSON file
 */
function saveResults(result: EvaluationResult, outputPath: string) {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nDetailed results saved to: ${outputPath}`);
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  console.log('=== HTS Classification Evaluation Benchmark ===');
  console.log('\nNOTE: This script currently uses a MOCK classifier.');
  console.log('To test the real engine, integrate with classificationEngineV10.ts\n');
  
  // Load test data
  const testData = loadTestData('test', limit);
  console.log(`Loaded ${testData.length} test samples`);
  
  // Run evaluation
  const result = await evaluate(testData, { verbose });
  
  // Print results
  printResults(result);
  
  // Save detailed results
  const outputPath = path.join(__dirname, '../evaluation-results.json');
  saveResults(result, outputPath);
}

main().catch(console.error);
