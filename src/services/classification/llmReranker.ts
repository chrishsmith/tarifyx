/**
 * LLM Reranker for HTS Classification
 * 
 * Uses a fast LLM (gpt-4o-mini) to intelligently rerank the top candidates
 * from embedding search. This solves the "reasoning gap" where heuristic
 * scoring can't understand context like:
 * - "indoor planter" → household (not hotel/restaurant)
 * - "sneakers" → footwear (vocabulary gap)
 * 
 * Also includes LLM-guided classification for when retrieval fails.
 * 
 * @module llmReranker
 * @created January 2026
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/db';
import { 
  buildFewShotExamples,
  buildFewShotExamplesSync,
  buildCrossRulingsSystemPrompt,
  findSimilarRulings,
} from '@/services/crossRulingsService';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RerankerCandidate {
  code: string;
  codeFormatted: string;
  description: string;
  fullDescription: string;
  chapter: string;
  chapterDescription: string;
  confidence: number;
  // Optional context
  parentDescription?: string;
  material?: string;
}

export interface RerankerResult {
  success: boolean;
  rerankedCandidates: RerankerCandidate[];
  bestMatch: {
    code: string;
    confidence: number;
    reasoning: string;
  } | null;
  timing: number;
  tokensUsed?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LLM CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required for LLM reranker');
  }
  return new OpenAI({ apiKey });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the system prompt for HTS classification
 */
function buildSystemPrompt(): string {
  // Use CROSS rulings context for more accurate classification
  const crossRulingsContext = buildCrossRulingsSystemPrompt();
  
  return `${crossRulingsContext}

Your task is to select the BEST HTS code for a product from a list of candidates.

CLASSIFICATION PRINCIPLES (General Rules of Interpretation):
1. GRI 1: Classification is determined by the terms of headings and section/chapter notes
2. GRI 3(a): The most specific description takes precedence over general descriptions
3. The product's PRIMARY FUNCTION and ESSENTIAL CHARACTER determine classification

CRITICAL ANALYSIS - Before selecting a code:
1. What is this product's PRIMARY PURPOSE? (not secondary features)
2. Is it a FINISHED CONSUMER GOOD or a RAW MATERIAL/COMPONENT?
3. Do the candidate codes actually describe this type of product?
4. Are some candidates clearly WRONG MATCHES (e.g., raw material codes for finished goods)?
5. Could there be a BETTER chapter that isn't represented in these candidates?

VOCABULARY AWARENESS:
- The same word can have different meanings in HTS (e.g., "sheet" could mean bed linen OR a flat form of material)
- Match the CONTEXT of the user's product, not just keywords

CONFIDENCE SCORING:
- 80-100%: Clear, unambiguous match
- 50-79%: Reasonable match, but alternative interpretations possible
- 0-49%: Poor match OR candidates don't seem right for this product

RESPOND IN THIS EXACT JSON FORMAT:
{
  "best_code": "XXXX.XX.XX.XX",
  "confidence": 85,
  "reasoning": "Brief explanation of why this code is correct",
  "runner_up": "YYYY.YY.YY.YY",
  "runner_up_reason": "Why this alternative might also apply",
  "concerns": "Any concerns about whether these candidates are correct, or if a better chapter might exist"
}`;
}

/**
 * Build the user prompt with candidates
 */
function buildUserPrompt(
  query: string,
  candidates: RerankerCandidate[],
  detectedMaterial: string | null
): string {
  const candidateList = candidates
    .slice(0, 15) // Limit to top 15 for token efficiency
    .map((c, i) => {
      const materialNote = c.material ? ` [Material: ${c.material}]` : '';
      
      return `${i + 1}. ${c.codeFormatted}
   DESCRIPTION: "${c.description}"
   FULL PATH: ${c.fullDescription}${materialNote}
   Chapter ${c.chapter}: ${c.chapterDescription}`;
    })
    .join('\n\n');

  const materialContext = detectedMaterial 
    ? `\nDetected material: ${detectedMaterial}`
    : '';

  return `PRODUCT TO CLASSIFY: "${query}"${materialContext}

CANDIDATE HTS CODES:
${candidateList}

Analyze these candidates and select the BEST match.

Consider:
1. What is this product's PRIMARY FUNCTION?
2. Does the HTS description match this product type?
3. Are some candidates clearly wrong (e.g., raw materials vs finished goods)?
4. Is there a chapter that SHOULD contain this product but isn't represented?

If none of the candidates seem right, give LOW confidence and explain your concerns.

Return your answer as JSON.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN RERANKER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rerank candidates using LLM reasoning
 * 
 * @param query - The user's product description
 * @param candidates - Top candidates from embedding search
 * @param detectedMaterial - Material detected from query (optional)
 * @returns Reranked candidates with best match and reasoning
 */
export async function rerankerWithLLM(
  query: string,
  candidates: RerankerCandidate[],
  detectedMaterial: string | null = null
): Promise<RerankerResult> {
  const startTime = Date.now();
  
  if (candidates.length === 0) {
    return {
      success: false,
      rerankedCandidates: [],
      bestMatch: null,
      timing: Date.now() - startTime,
    };
  }

  try {
    const openai = getOpenAIClient();
    
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(query, candidates, detectedMaterial);
    
    console.log(`[LLM Reranker] Reranking ${candidates.length} candidates for: "${query}"`);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cheap
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // Low temperature for consistent results
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    const tokensUsed = response.usage?.total_tokens;
    
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    // Parse the JSON response
    const result = JSON.parse(content) as {
      best_code: string;
      confidence: number;
      reasoning: string;
      runner_up?: string;
      runner_up_reason?: string;
    };

    console.log(`[LLM Reranker] Best match: ${result.best_code} (${result.confidence}%) - ${result.reasoning}`);

    // Reorder candidates based on LLM selection
    const bestCode = result.best_code.replace(/\./g, '');
    const rerankedCandidates = [...candidates];
    
    // Move best match to front
    const bestIndex = rerankedCandidates.findIndex(c => c.code === bestCode);
    if (bestIndex > 0) {
      const [best] = rerankedCandidates.splice(bestIndex, 1);
      best.confidence = result.confidence;
      rerankedCandidates.unshift(best);
    } else if (bestIndex === 0) {
      // Already first, just update confidence
      rerankedCandidates[0].confidence = result.confidence;
    }

    // Move runner-up to second position if provided
    if (result.runner_up) {
      const runnerUpCode = result.runner_up.replace(/\./g, '');
      const runnerUpIndex = rerankedCandidates.findIndex(c => c.code === runnerUpCode);
      if (runnerUpIndex > 1) {
        const [runnerUp] = rerankedCandidates.splice(runnerUpIndex, 1);
        rerankedCandidates.splice(1, 0, runnerUp);
      }
    }

    const timing = Date.now() - startTime;
    console.log(`[LLM Reranker] Complete in ${timing}ms, tokens: ${tokensUsed}`);

    return {
      success: true,
      rerankedCandidates,
      bestMatch: {
        code: bestCode,
        confidence: result.confidence,
        reasoning: result.reasoning,
      },
      timing,
      tokensUsed,
    };

  } catch (error) {
    const timing = Date.now() - startTime;
    console.error('[LLM Reranker] Error:', error);
    
    // Return original candidates on error
    return {
      success: false,
      rerankedCandidates: candidates,
      bestMatch: null,
      timing,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE-BASED RERANKING (Main Entry Point)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Conditionally rerank candidates if confidence is below threshold
 * 
 * This is the main entry point used by V10 engine.
 * Only calls LLM when primary result confidence is low, saving cost/latency.
 * 
 * @param query - User's product description  
 * @param candidates - Scored candidates from V10
 * @param primaryConfidence - Confidence of the current best match
 * @param threshold - Confidence threshold below which to trigger reranking (default: 60)
 * @param detectedMaterial - Material detected from query
 */
export async function conditionalRerank(
  query: string,
  candidates: RerankerCandidate[],
  primaryConfidence: number,
  options: {
    threshold?: number;
    detectedMaterial?: string | null;
    forceRerank?: boolean;
  } = {}
): Promise<RerankerResult | null> {
  const { 
    threshold = 60, 
    detectedMaterial = null,
    forceRerank = false 
  } = options;
  
  // Skip reranking if confidence is high enough (saves cost)
  if (!forceRerank && primaryConfidence >= threshold) {
    console.log(`[LLM Reranker] Skipping - confidence ${primaryConfidence}% >= threshold ${threshold}%`);
    return null;
  }
  
  console.log(`[LLM Reranker] Triggering - confidence ${primaryConfidence}% < threshold ${threshold}%`);
  
  return rerankerWithLLM(query, candidates, detectedMaterial);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LLM-GUIDED CLASSIFICATION (For when retrieval fails)
// ═══════════════════════════════════════════════════════════════════════════════

interface LLMGuidedResult {
  success: boolean;
  suggestedChapter: string;
  suggestedHeading: string;
  reasoning: string;
  searchTerms: string[];
  candidates: RerankerCandidate[];
  bestMatch: {
    code: string;
    confidence: number;
    reasoning: string;
  } | null;
  timing: number;
}

/**
 * Use LLM to identify the correct HTS chapter/heading, then search within it.
 * This is more expensive but handles cases where embedding search fails.
 */
export async function llmGuidedClassification(
  query: string,
  detectedMaterial: string | null = null,
  suggestedCode?: string // Optional: if reranker already identified the right code
): Promise<LLMGuidedResult> {
  const startTime = Date.now();
  
  try {
    const openai = getOpenAIClient();
    
    // Define guidance info structure that we'll populate in both code paths
    let guidance: {
      chapter: string;
      heading: string;
      reasoning: string;
      search_terms: string[];
    };
    
    // If we already have a suggested code from the reranker, use its subheading directly
    // Use 6 digits (subheading) for more precise search, e.g., 9506.91 for exercise equipment
    if (suggestedCode && suggestedCode.length >= 4) {
      const cleanCode = suggestedCode.replace(/\./g, '');
      const subheadingPrefix = cleanCode.slice(0, 6); // Use 6 digits for subheading (more specific)
      const headingPrefix = cleanCode.slice(0, 4);    // 4 digits for heading (fallback)
      const chapter = cleanCode.slice(0, 2);
      guidance = {
        chapter: chapter,
        heading: subheadingPrefix, // Use subheading for more precise search
        reasoning: `Using subheading ${subheadingPrefix} from reranker suggestion (${suggestedCode})`,
        search_terms: [],
      };
      console.log(`[LLM Guided] Using reranker suggestion: subheading ${subheadingPrefix}`);
    } else {
      // Get few-shot examples from CROSS rulings (semantic search if available)
      const fewShotExamples = await buildFewShotExamples(query, undefined, 3);
      
      // Step 1: Ask LLM to identify the correct chapter/heading
      const guidancePrompt = `You are an expert US Customs broker with access to official CBP CROSS rulings.

PRODUCT TO CLASSIFY: "${query}"
${detectedMaterial ? `DETECTED MATERIAL: ${detectedMaterial}` : ''}

Here are examples of real CBP classification rulings for reference:
${fewShotExamples}

Based on these examples and your expertise, identify the most appropriate HTS Chapter (2-digit) and Heading (4-digit) for this product.

Think step by step:
1. What IS this product? (its essential character and primary function)
2. What MATERIAL is it made of? (if not specified, what's most common for this product?)
3. What CHAPTER covers this type of product?
4. What HEADING within that chapter is most specific?
5. Do any of the example rulings above apply to a similar product?

Key considerations from CBP rulings:
- Classification is based on PRIMARY FUNCTION, not secondary features
- Waterproof/protective textiles may be bedding (94) not bed linen (63)
- Vacuum insulated containers go by function (9617) not material
- Decorative ceramic articles go to 6914, not 6912
- Exercise/fitness equipment (yoga mats, etc.) go to 9506.91, not by material

RESPOND IN JSON:
{
  "chapter": "XX",
  "heading": "XXXX", 
  "reasoning": "Brief explanation of why this chapter/heading",
  "search_terms": ["term1", "term2", "term3"]
}`;

      console.log(`[LLM Guided] Step 1: Identifying chapter/heading for "${query}"`);
      
      const guidanceResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: guidancePrompt },
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const guidanceContent = guidanceResponse.choices[0]?.message?.content;
      if (!guidanceContent) {
        throw new Error('Empty guidance response from LLM');
      }

      const guidanceResult = JSON.parse(guidanceContent) as {
        chapter: string;
        heading: string;
        reasoning: string;
        search_terms: string[];
      };

      console.log(`[LLM Guided] Suggested: Chapter ${guidanceResult.chapter}, Heading ${guidanceResult.heading}`);
      console.log(`[LLM Guided] Reasoning: ${guidanceResult.reasoning}`);

      guidance = guidanceResult;
    }

    // Step 2: Search for codes within the suggested heading/subheading
    // The guidance.heading can be 4 digits (heading) or 6 digits (subheading)
    const searchPrefix = guidance.heading.replace(/\./g, '').padEnd(6, '0').slice(0, 6); // Ensure 6 digits
    const headingPrefix = searchPrefix.slice(0, 4); // 4-digit heading for fallback
    
    console.log(`[LLM Guided] Searching for subheading=${searchPrefix}, heading=${headingPrefix}`);
    
    // First try exact subheading match (most specific)
    let codes = await prisma.htsCode.findMany({
      where: {
        subheading: searchPrefix,
        level: { in: ['statistical', 'tariff_line'] },
      },
      orderBy: { code: 'asc' },
      take: 30,
    });
    
    console.log(`[LLM Guided] Found ${codes.length} codes in subheading ${searchPrefix}`);
    
    // If no codes found at subheading level, fallback to heading
    if (codes.length === 0) {
      codes = await prisma.htsCode.findMany({
        where: {
          heading: headingPrefix,
          level: { in: ['statistical', 'tariff_line'] },
        },
        orderBy: { code: 'asc' },
        take: 30,
      });
      console.log(`[LLM Guided] Fallback: Found ${codes.length} codes in heading ${headingPrefix}`);
    }

    if (codes.length === 0) {
      // Fallback: search by chapter
      const chapterCodes = await prisma.htsCode.findMany({
        where: {
          chapter: guidance.chapter,
          level: { in: ['statistical', 'tariff_line'] },
        },
        orderBy: { code: 'asc' },
        take: 50,
      });
      codes.push(...chapterCodes);
      console.log(`[LLM Guided] Fallback: Found ${chapterCodes.length} codes in chapter ${guidance.chapter}`);
    }

    // Step 3: Build candidates for reranking
    const candidates: RerankerCandidate[] = codes.map(c => ({
      code: c.code,
      codeFormatted: c.code.replace(/(\d{4})(\d{2})(\d{2})(\d{2})?/, '$1.$2.$3.$4').replace(/\.$/, ''),
      description: c.description,
      fullDescription: c.parentGroupings?.join(' > ') + ' > ' + c.description || c.description,
      chapter: c.chapter,
      chapterDescription: `Chapter ${c.chapter}`,
      confidence: 50, // Base confidence
      material: detectedMaterial || undefined,
    }));

    if (candidates.length === 0) {
      return {
        success: false,
        suggestedChapter: guidance.chapter,
        suggestedHeading: guidance.heading,
        reasoning: guidance.reasoning,
        searchTerms: guidance.search_terms,
        candidates: [],
        bestMatch: null,
        timing: Date.now() - startTime,
      };
    }

    // Step 4: Use LLM to pick the best code from the guided candidates
    const rerankerResult = await rerankerWithLLM(query, candidates, detectedMaterial);

    return {
      success: rerankerResult.success,
      suggestedChapter: guidance.chapter,
      suggestedHeading: guidance.heading,
      reasoning: guidance.reasoning,
      searchTerms: guidance.search_terms,
      candidates: rerankerResult.rerankedCandidates,
      bestMatch: rerankerResult.bestMatch,
      timing: Date.now() - startTime,
    };

  } catch (error) {
    console.error('[LLM Guided] Error:', error);
    return {
      success: false,
      suggestedChapter: '',
      suggestedHeading: '',
      reasoning: '',
      searchTerms: [],
      candidates: [],
      bestMatch: null,
      timing: Date.now() - startTime,
    };
  }
}
