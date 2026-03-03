/**
 * CROSS Rulings Service for HTS Classification
 * 
 * Integrates the flexifyai/cross_rulings_hts_dataset_for_tariffs dataset
 * from Hugging Face to improve HTS classification accuracy.
 * 
 * Dataset: https://huggingface.co/datasets/flexifyai/cross_rulings_hts_dataset_for_tariffs
 * - 4,093+ rulings with vector embeddings
 * - 51 HTS chapters covered
 * - MIT license
 * 
 * Paper: ATLAS (arXiv 2509.18400)
 * 
 * Features:
 * - Semantic search for similar rulings (vector embeddings)
 * - Few-shot prompting with real CBP rulings
 * - Keyword-based fallback retrieval
 * - Reasoning chains from official customs decisions
 * 
 * @module crossRulingsService
 * @created January 2026
 */

import crossRulingsData from '@/data/crossRulings.json';
import { 
  searchRulingsBySemantic, 
  buildSemanticFewShotExamples,
  isSemanticSearchAvailable,
} from './rulingsSemanticSearch';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CrossRuling {
  id: string;
  productDescription: string;
  htsCodes: string[];
  reasoning: string;
  chapter: string;
}

export interface LegacyCrossRuling {
  id: string;
  productDescription: string;
  htsCode: string;
  htsCode6Digit: string;
  reasoning: string;
  chapter: string;
  embedding?: number[];
}

export interface SimilarRuling {
  ruling: CrossRuling;
  similarity: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD CROSS RULINGS FROM DATA FILE
// ═══════════════════════════════════════════════════════════════════════════════

const CROSS_RULINGS: CrossRuling[] = crossRulingsData.rulings as CrossRuling[];

console.log(`[CROSS Rulings] Loaded ${CROSS_RULINGS.length} rulings from dataset`);

// ═══════════════════════════════════════════════════════════════════════════════
// CURATED RULINGS (Key examples for common product types)
// These are curated examples for products that often cause classification issues
// ═══════════════════════════════════════════════════════════════════════════════

export const CURATED_RULINGS: CrossRuling[] = [
  {
    id: 'curated-1',
    productDescription: 'ceramic planter for indoor use, household decoration',
    htsCodes: ['6914908000'],
    reasoning: 'Ceramic planters for household use are classified as "other ceramic articles" under 6914.90 when they are decorative/functional articles not covered by more specific headings like tableware (6911/6912). The planter is not tableware, kitchenware, or toilet articles, so it falls under "other" ceramic articles.',
    chapter: '69',
  },
  {
    id: 'curated-2',
    productDescription: 'waterproof mattress protector with fitted elastic edges',
    htsCodes: ['9404909522'],
    reasoning: 'Waterproof mattress protectors with fitted elastic edges are classified under 9404.90 (articles of bedding) rather than 6302 (bed linen) because their PRIMARY FUNCTION is mattress protection, not covering. The waterproof membrane/layer gives them protective character.',
    chapter: '94',
  },
  {
    id: 'curated-3',
    productDescription: 'stainless steel water bottle insulated vacuum thermos',
    htsCodes: ['9617004000'],
    reasoning: 'Vacuum insulated stainless steel bottles are classified under 9617 (vacuum flasks) rather than Chapter 73 (iron/steel articles). The vacuum insulation feature is the essential character - classification is by function (thermal insulation via vacuum) not material.',
    chapter: '96',
  },
  {
    id: 'curated-4',
    productDescription: 'yoga mat foam exercise fitness pilates',
    htsCodes: ['9506910030'],
    reasoning: 'Yoga mats are classified under 9506.91 as articles for general physical exercise. Classification is based on PRIMARY FUNCTION (exercise) not material (foam/plastic). Even though made of foam or PVC, yoga mats fall under Chapter 95 sporting goods, not Chapter 39 plastics.',
    chapter: '95',
  },
  {
    id: 'curated-5',
    productDescription: 'plastic storage container household kitchen lid',
    htsCodes: ['3924905650'],
    reasoning: 'Plastic storage containers for household use are classified under 3924.90 as "other household articles of plastics." Storage containers with lids fall under "other household articles" when designed for home organization.',
    chapter: '39',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FEW-SHOT PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find similar rulings using keyword matching
 * Searches both the downloaded CROSS rulings and curated examples
 */
export function findSimilarRulingsByKeywords(
  query: string,
  maxResults: number = 5
): CrossRuling[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  // Score all rulings by keyword match
  const scored = [...CROSS_RULINGS, ...CURATED_RULINGS].map(ruling => {
    const text = ruling.productDescription.toLowerCase();
    const matches = keywords.filter(kw => text.includes(kw));
    return {
      ruling,
      score: matches.length / keywords.length,
    };
  });
  
  // Return top matches with score > 0
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.ruling);
}

/**
 * Build few-shot examples for LLM classification
 * Uses semantic search (vector embeddings) with keyword fallback
 */
export async function buildFewShotExamples(
  targetDescription: string,
  targetChapter?: string,
  maxExamples: number = 3
): Promise<string> {
  // Try semantic search first (best quality)
  const semanticAvailable = await isSemanticSearchAvailable();
  if (semanticAvailable) {
    const semanticExamples = await buildSemanticFewShotExamples(targetDescription, maxExamples);
    if (semanticExamples) {
      return semanticExamples;
    }
  }
  
  // Fall back to keyword matching
  const similarRulings = findSimilarRulingsByKeywords(targetDescription, maxExamples);
  
  if (similarRulings.length > 0) {
    return similarRulings.map((ruling, idx) => `
Example ${idx + 1}:
Product: "${ruling.productDescription}"
HTS Code: ${ruling.htsCodes[0]}
Reasoning: ${ruling.reasoning.slice(0, 500)}...
`).join('\n');
  }
  
  // Last resort: curated rulings prioritized by chapter
  let relevantRulings = CURATED_RULINGS;
  
  if (targetChapter) {
    const chapterRulings = CURATED_RULINGS.filter(r => r.chapter === targetChapter);
    const otherRulings = CURATED_RULINGS.filter(r => r.chapter !== targetChapter);
    relevantRulings = [...chapterRulings, ...otherRulings];
  }
  
  const examples = relevantRulings.slice(0, maxExamples);
  
  return examples.map((ruling, idx) => `
Example ${idx + 1}:
Product: "${ruling.productDescription}"
HTS Code: ${ruling.htsCodes[0]}
Reasoning: ${ruling.reasoning}
`).join('\n');
}

/**
 * Synchronous version for backward compatibility
 */
export function buildFewShotExamplesSync(
  targetDescription: string,
  targetChapter?: string,
  maxExamples: number = 3
): string {
  // Keyword matching only (synchronous)
  const similarRulings = findSimilarRulingsByKeywords(targetDescription, maxExamples);
  
  if (similarRulings.length > 0) {
    return similarRulings.map((ruling, idx) => `
Example ${idx + 1}:
Product: "${ruling.productDescription}"
HTS Code: ${ruling.htsCodes[0]}
Reasoning: ${ruling.reasoning.slice(0, 500)}...
`).join('\n');
  }
  
  let relevantRulings = CURATED_RULINGS;
  
  if (targetChapter) {
    const chapterRulings = CURATED_RULINGS.filter(r => r.chapter === targetChapter);
    const otherRulings = CURATED_RULINGS.filter(r => r.chapter !== targetChapter);
    relevantRulings = [...chapterRulings, ...otherRulings];
  }
  
  return relevantRulings.slice(0, maxExamples).map((ruling, idx) => `
Example ${idx + 1}:
Product: "${ruling.productDescription}"
HTS Code: ${ruling.htsCodes[0]}
Reasoning: ${ruling.reasoning}
`).join('\n');
}

/**
 * Build a system prompt with CROSS rulings context
 */
export function buildCrossRulingsSystemPrompt(): string {
  return `You are an expert US Customs broker with access to official CBP CROSS rulings.

When classifying products, you should:
1. Consider the product's PRIMARY FUNCTION (essential character)
2. Identify the correct MATERIAL classification (plastics, textiles, ceramics, metals, etc.)
3. Apply General Rules of Interpretation (GRI) systematically
4. Look for specific HTS provisions before general "other" categories

KEY CLASSIFICATION PRINCIPLES FROM CBP RULINGS:
- Waterproof mattress protectors → 9404.90 (bedding articles, not bed linen)
- Vacuum insulated bottles → 9617 (vacuum flasks, not by material)
- Exercise/fitness equipment → 9506.91 (gym equipment)
- LED bulbs → 8539.50 (LED lamps specifically)

CRITICAL - CERAMIC ARTICLES (Chapter 69):
- 6911 = Tableware, kitchenware of porcelain/china
- 6912 = Ceramic tableware, kitchenware (non-porcelain)
  - 6912.00.20 = "Hotel or restaurant ware and other ware NOT HOUSEHOLD ware" - ONLY for commercial/industrial use
  - 6912.00.50 = "Other" ceramic tableware = HOUSEHOLD tableware
- 6914 = Other ceramic articles (NOT tableware/kitchenware)
  - 6914.90 = "Other" = decorative items, planters, vases, figurines
  
PLANTERS/POTS for home use:
- Ceramic planters → 6914.90 (other ceramic articles) NOT 6912 (tableware)
- Plastic planters → 3924.90 (household articles of plastic)
- Metal planters → 7323.99 or 7615.10 (household articles by metal type)

IMPORTANT: Read HTS descriptions carefully! "NOT household ware" means it EXCLUDES household items.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RULING RETRIEVAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find similar CROSS rulings based on product description
 * Uses keyword matching against 2000+ downloaded rulings
 */
export async function findSimilarRulings(
  productDescription: string,
  limit: number = 3
): Promise<SimilarRuling[]> {
  const keywords = productDescription.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = CROSS_RULINGS.map(ruling => {
    const rulingText = ruling.productDescription.toLowerCase();
    const matches = keywords.filter(kw => rulingText.includes(kw));
    return {
      ruling,
      similarity: matches.length / keywords.length,
    };
  });
  
  return scored
    .filter(s => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Get rulings for a specific HTS chapter
 */
export function getRulingsByChapter(chapter: string, limit: number = 10): CrossRuling[] {
  return CROSS_RULINGS
    .filter(r => r.chapter === chapter)
    .slice(0, limit);
}

/**
 * Get total statistics about loaded rulings
 */
export function getRulingsStats(): { total: number; chapters: number } {
  const chapters = new Set(CROSS_RULINGS.map(r => r.chapter));
  return {
    total: CROSS_RULINGS.length,
    chapters: chapters.size,
  };
}

/**
 * Get classification guidance from CROSS rulings
 */
export async function getClassificationGuidance(
  productDescription: string,
  detectedMaterial?: string,
  detectedChapter?: string
): Promise<{
  fewShotExamples: string;
  systemPrompt: string;
  relevantRulings: SimilarRuling[];
}> {
  const relevantRulings = await findSimilarRulings(productDescription);
  const fewShotExamples = buildFewShotExamples(productDescription, detectedChapter);
  const systemPrompt = buildCrossRulingsSystemPrompt();
  
  return {
    fewShotExamples,
    systemPrompt,
    relevantRulings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  CROSS_RULINGS,
  CURATED_RULINGS,
};

export default {
  CROSS_RULINGS,
  CURATED_RULINGS,
  buildFewShotExamples,
  buildFewShotExamplesSync,
  buildCrossRulingsSystemPrompt,
  findSimilarRulings,
  findSimilarRulingsByKeywords,
  getRulingsByChapter,
  getRulingsStats,
  getClassificationGuidance,
};
