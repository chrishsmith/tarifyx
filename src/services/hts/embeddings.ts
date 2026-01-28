/**
 * HTS Embeddings Service
 * 
 * Generates and manages hierarchical embeddings for HTS codes.
 * Uses OpenAI's text-embedding-3-small (1536 dimensions) for semantic search.
 * 
 * Key Innovation: Hierarchical Context
 * Instead of just embedding "Mugs and steins", we embed:
 * "CERAMIC PRODUCTS | Tableware, kitchenware, household articles | Mugs and steins | 
 *  drinking, cup, mug, coffee, tea, beverage"
 * 
 * This captures material, function, AND specific product in one embedding.
 * 
 * @module htsEmbeddings
 * @created December 30, 2025
 */

import { prisma } from '@/lib/db';
import OpenAI from 'openai';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 100; // Process 100 codes at a time

// Chapter descriptions for context (top-level of HTS)
const CHAPTER_CONTEXT: Record<string, string> = {
  '39': 'PLASTICS AND ARTICLES THEREOF',
  '40': 'RUBBER AND ARTICLES THEREOF',
  '42': 'LEATHER ARTICLES, SADDLERY, TRAVEL GOODS, HANDBAGS',
  '44': 'WOOD AND ARTICLES OF WOOD',
  '48': 'PAPER AND PAPERBOARD',
  '50': 'SILK',
  '51': 'WOOL AND FINE ANIMAL HAIR',
  '52': 'COTTON',
  '54': 'MAN-MADE FILAMENTS',
  '55': 'MAN-MADE STAPLE FIBERS',
  '61': 'KNITTED OR CROCHETED APPAREL',
  '62': 'WOVEN APPAREL (NOT KNITTED)',
  '63': 'TEXTILE ARTICLES, WORN CLOTHING',
  '64': 'FOOTWEAR, GAITERS',
  '69': 'CERAMIC PRODUCTS',
  '70': 'GLASS AND GLASSWARE',
  '71': 'JEWELRY, PRECIOUS METALS',
  '72': 'IRON AND STEEL',
  '73': 'ARTICLES OF IRON OR STEEL',
  '74': 'COPPER AND ARTICLES THEREOF',
  '76': 'ALUMINUM AND ARTICLES THEREOF',
  '84': 'MACHINERY, MECHANICAL APPLIANCES',
  '85': 'ELECTRICAL MACHINERY AND EQUIPMENT',
  '87': 'VEHICLES',
  '90': 'OPTICAL, MEASURING, MEDICAL INSTRUMENTS',
  '94': 'FURNITURE, BEDDING, LIGHTING',
  '95': 'TOYS, GAMES, SPORTS EQUIPMENT',
  '96': 'MISCELLANEOUS MANUFACTURED ARTICLES',
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface HtsCodeForEmbedding {
  code: string;
  codeFormatted: string;
  level: string;
  description: string;
  chapter: string;
  heading: string | null;
  keywords: string[];
  parentGroupings: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// HIERARCHICAL CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build rich hierarchical context for an HTS code
 * This is the KEY INNOVATION - we embed the full semantic context, not just the description
 */
export async function buildHierarchicalContext(code: HtsCodeForEmbedding): Promise<string> {
  const parts: string[] = [];
  
  // 1. Chapter context (material/category)
  const chapterDesc = CHAPTER_CONTEXT[code.chapter];
  if (chapterDesc) {
    parts.push(chapterDesc);
  }
  
  // 2. Parent groupings (inherited descriptions from HTS structure)
  if (code.parentGroupings && code.parentGroupings.length > 0) {
    // Filter out very short groupings and "Other:"
    const meaningfulGroupings = code.parentGroupings.filter(g => 
      g.length > 5 && !g.toLowerCase().startsWith('other')
    );
    if (meaningfulGroupings.length > 0) {
      parts.push(meaningfulGroupings.join(', '));
    }
  }
  
  // 3. Heading description (if we have it)
  if (code.heading) {
    const headingCode = await prisma.htsCode.findFirst({
      where: { code: code.heading, level: 'heading' },
      select: { description: true },
    });
    if (headingCode?.description) {
      parts.push(headingCode.description);
    }
  }
  
  // 4. The code's own description
  parts.push(code.description);
  
  // 5. Keywords (synonyms and related terms)
  if (code.keywords && code.keywords.length > 0) {
    parts.push(code.keywords.join(', '));
  }
  
  // Combine into a rich context string
  const context = parts.join(' | ');
  
  return context;
}

/**
 * Get or create OpenAI client
 */
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required for embeddings');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate embedding for a single text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 */
async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data.map(d => d.embedding);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EMBEDDING GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate embeddings for all HTS codes that don't have them yet
 */
export async function generateAllEmbeddings(options: {
  forceRegenerate?: boolean;
  onProgress?: (processed: number, total: number) => void;
} = {}): Promise<{ processed: number; errors: number }> {
  const { forceRegenerate = false, onProgress } = options;
  
  console.log('[Embeddings] Starting embedding generation with OpenAI...');
  
  // Get codes that need embeddings
  // Note: embeddingGeneratedAt is managed via raw SQL, so we check for null embedding
  const totalCodes = await prisma.htsCode.count({
    where: { level: { in: ['tariff_line', 'statistical'] } },
  });
  
  // Check how many already have embeddings
  const withEmbeddings = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM hts_code 
    WHERE embedding IS NOT NULL 
    AND level IN ('tariff_line', 'statistical')
  `.then(r => Number(r[0].count));
  
  const needsEmbeddings = forceRegenerate ? totalCodes : totalCodes - withEmbeddings;
  console.log(`[Embeddings] Total codes: ${totalCodes}, Already embedded: ${withEmbeddings}, Need embeddings: ${needsEmbeddings}`);
  
  if (needsEmbeddings === 0) {
    console.log('[Embeddings] All codes already have embeddings!');
    return { processed: 0, errors: 0 };
  }
  
  let processed = 0;
  let errors = 0;
  
  // Process in batches
  while (processed < needsEmbeddings) {
    // Get batch of codes without embeddings
    let batch: HtsCodeForEmbedding[];
    
    if (forceRegenerate) {
      batch = await prisma.htsCode.findMany({
        where: { level: { in: ['tariff_line', 'statistical'] } },
        select: {
          code: true,
          codeFormatted: true,
          level: true,
          description: true,
          chapter: true,
          heading: true,
          keywords: true,
          parentGroupings: true,
        },
        take: BATCH_SIZE,
        skip: processed,
      }) as HtsCodeForEmbedding[];
    } else {
      // Get codes without embeddings using raw SQL
      const codesWithoutEmbeddings = await prisma.$queryRaw<{ code: string }[]>`
        SELECT code FROM hts_code 
        WHERE embedding IS NULL 
        AND level IN ('tariff_line', 'statistical')
        LIMIT ${BATCH_SIZE}
      `;
      
      if (codesWithoutEmbeddings.length === 0) break;
      
      batch = await prisma.htsCode.findMany({
        where: { code: { in: codesWithoutEmbeddings.map(c => c.code) } },
        select: {
          code: true,
          codeFormatted: true,
          level: true,
          description: true,
          chapter: true,
          heading: true,
          keywords: true,
          parentGroupings: true,
        },
      }) as HtsCodeForEmbedding[];
    }
    
    if (batch.length === 0) break;
    
    // Build contexts for batch
    const contexts: string[] = [];
    for (const code of batch) {
      try {
        const context = await buildHierarchicalContext(code);
        contexts.push(context);
      } catch (err) {
        console.error(`[Embeddings] Error building context for ${code.code}:`, err);
        contexts.push(code.description); // Fallback to just description
      }
    }
    
    // Generate embeddings for batch
    try {
      const embeddings = await generateEmbeddingsBatch(contexts);
      
      // Store embeddings in database
      for (let i = 0; i < batch.length; i++) {
        const code = batch[i];
        const embedding = embeddings[i];
        const context = contexts[i];
        
        // Use raw SQL to store vector (Prisma doesn't support pgvector natively)
        await prisma.$executeRaw`
          UPDATE hts_code 
          SET 
            embedding = ${embedding}::vector,
            embedding_context = ${context},
            embedding_generated_at = NOW()
          WHERE code = ${code.code}
        `;
      }
      
      processed += batch.length;
      
      if (onProgress) {
        onProgress(processed, needsEmbeddings);
      }
      
      console.log(`[Embeddings] Processed ${processed}/${needsEmbeddings} (${Math.round(processed/needsEmbeddings*100)}%)`);
      
    } catch (err) {
      console.error(`[Embeddings] Batch error:`, err);
      errors += batch.length;
      processed += batch.length;
    }
    
    // Rate limiting - OpenAI allows ~3000 requests/minute for embeddings
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`[Embeddings] Complete! Processed: ${processed}, Errors: ${errors}`);
  
  return { processed, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SemanticSearchResult {
  code: string;
  codeFormatted: string;
  level: string;
  description: string;
  chapter: string;
  heading: string | null;
  generalRate: string | null;
  adValoremRate: number | null;
  parentGroupings: string[];
  similarity: number;
  // For hybrid search - tracks which method found this result
  searchMethod?: 'semantic' | 'lexical' | 'both';
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEXICAL/BM25 SEARCH (PostgreSQL Full-Text Search)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prepare search query for PostgreSQL full-text search
 * Converts user input to a proper tsquery format
 * 
 * "cotton t-shirt boys" → "cotton & tshirt & boys | cotton & t-shirt & boys"
 */
function prepareSearchQuery(query: string): string {
  const words = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
    .split(/\s+/)
    .filter(w => w.length > 1);
  
  if (words.length === 0) return '';
  
  // Create variations for hyphenated terms
  const variations: string[][] = [];
  
  for (const word of words) {
    const wordVariants = [word];
    
    // Handle hyphenated words
    if (word.includes('-')) {
      wordVariants.push(word.replace(/-/g, '')); // t-shirt → tshirt
      wordVariants.push(word.replace(/-/g, ' ')); // t-shirt → t shirt
    } else if (word.length > 2) {
      // Try adding hyphen after first letter for common patterns
      // tshirt → t-shirt
      wordVariants.push(word[0] + '-' + word.slice(1));
    }
    
    variations.push([...new Set(wordVariants)]);
  }
  
  // Build OR groups for each word position
  const orGroups = variations.map(vars => 
    vars.length > 1 ? `(${vars.join(' | ')})` : vars[0]
  );
  
  // Join with AND - all words must match
  return orGroups.join(' & ');
}

/**
 * Search HTS codes using PostgreSQL full-text search (BM25-like ranking)
 * This catches exact matches that embeddings might miss
 * 
 * Key advantage: "confetti paper spirals" will EXACTLY match 
 * HTS description "Confetti, paper spirals..." with very high score
 */
export async function searchHtsByLexical(
  query: string,
  options: {
    limit?: number;
    chapters?: string[];
    minRank?: number;
  } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 30, chapters, minRank = 0.001 } = options;
  
  const searchQuery = prepareSearchQuery(query);
  if (!searchQuery) return [];
  
  console.log(`[Lexical Search] Query: "${query}" → tsquery: "${searchQuery}"`);
  
  try {
    let results: SemanticSearchResult[];
    
    if (chapters && chapters.length > 0) {
      results = await prisma.$queryRaw<SemanticSearchResult[]>`
        SELECT 
          code,
          "codeFormatted",
          level::TEXT,
          description,
          chapter,
          heading,
          "generalRate",
          "adValoremRate",
          "parentGroupings",
          ts_rank(
            setweight(to_tsvector('english', description), 'A') ||
            setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
            setweight(to_tsvector('english', coalesce(embedding_context, '')), 'C'),
            to_tsquery('english', ${searchQuery})
          ) AS similarity
        FROM hts_code
        WHERE level IN ('tariff_line', 'statistical')
          AND chapter = ANY(${chapters})
          AND (
            to_tsvector('english', description) @@ to_tsquery('english', ${searchQuery})
            OR to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')) @@ to_tsquery('english', ${searchQuery})
            OR to_tsvector('english', coalesce(embedding_context, '')) @@ to_tsquery('english', ${searchQuery})
          )
        ORDER BY similarity DESC
        LIMIT ${limit}
      `;
    } else {
      results = await prisma.$queryRaw<SemanticSearchResult[]>`
        SELECT 
          code,
          "codeFormatted",
          level::TEXT,
          description,
          chapter,
          heading,
          "generalRate",
          "adValoremRate",
          "parentGroupings",
          ts_rank(
            setweight(to_tsvector('english', description), 'A') ||
            setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
            setweight(to_tsvector('english', coalesce(embedding_context, '')), 'C'),
            to_tsquery('english', ${searchQuery})
          ) AS similarity
        FROM hts_code
        WHERE level IN ('tariff_line', 'statistical')
          AND (
            to_tsvector('english', description) @@ to_tsquery('english', ${searchQuery})
            OR to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')) @@ to_tsquery('english', ${searchQuery})
            OR to_tsvector('english', coalesce(embedding_context, '')) @@ to_tsquery('english', ${searchQuery})
          )
        ORDER BY similarity DESC
        LIMIT ${limit}
      `;
    }
    
    // Normalize lexical scores to 0-1 range (ts_rank typically returns 0-0.5)
    // and mark search method
    const normalizedResults = results
      .filter(r => r.similarity >= minRank)
      .map(r => ({
        ...r,
        similarity: Math.min(1, r.similarity * 2), // Scale up for comparison with semantic
        searchMethod: 'lexical' as const,
      }));
    
    console.log(`[Lexical Search] Found ${normalizedResults.length} results (from ${results.length} raw)`);
    
    return normalizedResults;
  } catch (err) {
    console.error('[Lexical Search] Error:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID SEARCH (Semantic + Lexical)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hybrid search combining semantic embeddings and lexical/BM25 search
 * 
 * This is THE KEY IMPROVEMENT:
 * - Semantic: Understands "sneakers" = "footwear" (vocabulary gap)
 * - Lexical: Catches exact matches like "confetti" = "Confetti, paper spirals"
 * 
 * Results are merged with configurable weights
 */
export async function hybridSearch(
  query: string,
  options: {
    limit?: number;
    chapters?: string[];
    semanticWeight?: number;  // 0-1, default 0.6
    lexicalWeight?: number;   // 0-1, default 0.4
    minSimilarity?: number;
  } = {}
): Promise<SemanticSearchResult[]> {
  const { 
    limit = 30, 
    chapters, 
    semanticWeight = 0.6, 
    lexicalWeight = 0.4,
    minSimilarity = 0.2 
  } = options;
  
  console.log(`[Hybrid Search] Query: "${query}", weights: semantic=${semanticWeight}, lexical=${lexicalWeight}`);
  
  // Run both searches in parallel for speed
  const [semanticResults, lexicalResults] = await Promise.all([
    searchHtsBySemantic(query, { 
      limit: limit * 2, 
      chapters, 
      minSimilarity: minSimilarity * 0.5 // Lower threshold for semantic
    }),
    searchHtsByLexical(query, { 
      limit: limit * 2, 
      chapters,
      minRank: 0.0001 // Very low threshold to catch all lexical matches
    }),
  ]);
  
  console.log(`[Hybrid Search] Semantic: ${semanticResults.length}, Lexical: ${lexicalResults.length}`);
  
  // Merge results with weighted scoring
  const mergedMap = new Map<string, SemanticSearchResult & { 
    semanticScore: number; 
    lexicalScore: number;
    combinedScore: number;
  }>();
  
  // Add semantic results
  for (const result of semanticResults) {
    mergedMap.set(result.code, {
      ...result,
      semanticScore: result.similarity,
      lexicalScore: 0,
      combinedScore: result.similarity * semanticWeight,
      searchMethod: 'semantic',
    });
  }
  
  // Add/merge lexical results
  for (const result of lexicalResults) {
    const existing = mergedMap.get(result.code);
    if (existing) {
      // Found by BOTH methods - boost significantly!
      existing.lexicalScore = result.similarity;
      existing.combinedScore = 
        (existing.semanticScore * semanticWeight) + 
        (result.similarity * lexicalWeight) +
        0.1; // Bonus for appearing in both
      existing.searchMethod = 'both';
    } else {
      // Only found by lexical
      mergedMap.set(result.code, {
        ...result,
        semanticScore: 0,
        lexicalScore: result.similarity,
        combinedScore: result.similarity * lexicalWeight,
        searchMethod: 'lexical',
      });
    }
  }
  
  // Sort by combined score
  const merged = Array.from(mergedMap.values())
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);
  
  // Log search method distribution
  const methodCounts = merged.reduce((acc, r) => {
    acc[r.searchMethod || 'unknown'] = (acc[r.searchMethod || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`[Hybrid Search] Merged: ${merged.length} results`, methodCounts);
  
  // Return with combined score as similarity
  return merged.map(r => ({
    ...r,
    similarity: r.combinedScore,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Search HTS codes by semantic similarity to a query
 */
export async function searchHtsBySemantic(
  query: string,
  options: {
    limit?: number;
    minSimilarity?: number;
    chapters?: string[];
  } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 20, minSimilarity = 0.3, chapters } = options;
  
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  // Use pgvector for similarity search
  let results: SemanticSearchResult[];
  
  if (chapters && chapters.length > 0) {
    results = await prisma.$queryRaw<SemanticSearchResult[]>`
      SELECT 
        code,
        "codeFormatted",
        level::TEXT,
        description,
        chapter,
        heading,
        "generalRate",
        "adValoremRate",
        "parentGroupings",
        1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
      FROM hts_code
      WHERE embedding IS NOT NULL
        AND level IN ('tariff_line', 'statistical')
        AND chapter = ANY(${chapters})
        AND 1 - (embedding <=> ${queryEmbedding}::vector) > ${minSimilarity}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;
  } else {
    results = await prisma.$queryRaw<SemanticSearchResult[]>`
      SELECT 
        code,
        "codeFormatted",
        level::TEXT,
        description,
        chapter,
        heading,
        "generalRate",
        "adValoremRate",
        "parentGroupings",
        1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
      FROM hts_code
      WHERE embedding IS NOT NULL
        AND level IN ('tariff_line', 'statistical')
        AND 1 - (embedding <=> ${queryEmbedding}::vector) > ${minSimilarity}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;
  }
  
  return results;
}

/**
 * Dual-path search: Material + Function using HYBRID search
 * Runs semantic + lexical in parallel and finds the intersection
 * 
 * KEY IMPROVEMENT: Now uses hybrid search (embeddings + BM25) for better accuracy
 * - Semantic: Handles vocabulary gaps ("sneakers" = "footwear")
 * - Lexical: Catches exact matches ("confetti" = "Confetti, paper spirals...")
 * 
 * When preferredHeadings are provided, prioritize results from those headings
 * This helps guide classification to ARTICLES (containers, tableware) not RAW MATERIALS (vegetables, plants)
 */
export async function dualPathSearch(
  materialQuery: string | null,
  functionQuery: string,
  options: { limit?: number; preferredHeadings?: string[]; useHybrid?: boolean } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 20, preferredHeadings = [], useHybrid = true } = options;
  
  // Choose search function based on useHybrid flag
  const searchFn = useHybrid ? hybridSearch : searchHtsBySemantic;
  const searchName = useHybrid ? 'HYBRID' : 'SEMANTIC';
  
  console.log(`[dualPathSearch] Using ${searchName} search`);
  
  // If we have preferred headings, search within those first
  if (preferredHeadings.length > 0) {
    // Convert headings to chapters for filtering (e.g., "3924" → "39")
    const preferredChapters = [...new Set(preferredHeadings.map(h => h.slice(0, 2)))];
    
    console.log(`[dualPathSearch] Searching in preferred chapters: ${preferredChapters.join(', ')}`);
    
    // Search with chapter restriction - use LOW threshold to get diverse results
    // Scoring/filtering at the V10 level will handle quality control
    const headingResults = await searchFn(functionQuery, {
      limit: limit * 3, // Get many candidates for diversity
      minSimilarity: 0.15, // Low threshold - we want at least one result per chapter
      chapters: preferredChapters,
    });
    
    // If we got good results from preferred headings, filter further
    if (headingResults.length > 0) {
      // Ensure chapter diversity - get best result from EACH chapter
      const bestPerChapter = new Map<string, typeof headingResults[0]>();
      for (const r of headingResults) {
        const chapter = r.code.slice(0, 2);
        const existing = bestPerChapter.get(chapter);
        if (!existing || r.similarity > existing.similarity) {
          bestPerChapter.set(chapter, r);
        }
      }
      
      // Boost results that are in the exact preferred headings
      const boostedResults = headingResults.map(r => {
        const heading = r.code.slice(0, 4);
        const isPreferred = preferredHeadings.some(ph => heading.startsWith(ph.slice(0, 4)));
        
        // Extra boost for results found by BOTH semantic and lexical
        const hybridBonus = r.searchMethod === 'both' ? 1.15 : 1.0;
        
        return {
          ...r,
          similarity: isPreferred 
            ? r.similarity * 1.2 * hybridBonus  // 20% boost for preferred heading + hybrid bonus
            : r.similarity * hybridBonus,
        };
      });
      
      // Sort by boosted similarity
      boostedResults.sort((a, b) => b.similarity - a.similarity);
      
      // Ensure we have at least one from each chapter
      const result: typeof boostedResults = [];
      const includedChapters = new Set<string>();
      
      // First, add all boosted results
      for (const r of boostedResults) {
        result.push(r);
        includedChapters.add(r.code.slice(0, 2));
      }
      
      // Add best from missing chapters
      for (const [chapter, r] of bestPerChapter) {
        if (!includedChapters.has(chapter) && !result.some(x => x.code === r.code)) {
          result.push(r);
          includedChapters.add(chapter);
        }
      }
      
      // Re-sort and limit
      result.sort((a, b) => b.similarity - a.similarity);
      
      // Log search method distribution
      const methodCounts = result.reduce((acc, r) => {
        acc[r.searchMethod || 'unknown'] = (acc[r.searchMethod || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`[dualPathSearch] Found ${result.length} results across ${includedChapters.size} chapters`, methodCounts);
      return result.slice(0, limit);
    }
  }
  
  // Standard dual-path search with hybrid
  const [materialResults, functionResults] = await Promise.all([
    materialQuery 
      ? searchFn(`${materialQuery} material products`, { limit: 30 })
      : Promise.resolve([]),
    searchFn(functionQuery, { limit: 30 }),
  ]);
  
  // If we have material results, find intersection with function results
  if (materialResults.length > 0) {
    const materialChapters = [...new Set(materialResults.map(r => r.chapter))];
    
    // Re-search function query limited to material-relevant chapters
    const intersectionResults = await searchFn(functionQuery, {
      limit,
      chapters: materialChapters,
    });
    
    if (intersectionResults.length > 0) {
      return intersectionResults;
    }
  }
  
  // Fallback to function-only results
  return functionResults.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING STATS & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if full-text search is available on the HTS table
 * This validates our lexical search capability
 */
export async function checkFullTextSearchAvailable(): Promise<boolean> {
  try {
    // Try a simple full-text search query
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM hts_code 
      WHERE to_tsvector('english', description) @@ to_tsquery('english', 'test')
      LIMIT 1
    `;
    return true;
  } catch (err) {
    console.warn('[Embeddings] Full-text search not available:', err);
    return false;
  }
}

export async function getEmbeddingStats(): Promise<{
  totalCodes: number;
  withEmbeddings: number;
  pendingEmbeddings: number;
  coverage: string;
  hybridSearchAvailable?: boolean;
}> {
  const [total, withEmbeddings, hybridAvailable] = await Promise.all([
    prisma.htsCode.count({
      where: { level: { in: ['tariff_line', 'statistical'] } },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM hts_code 
      WHERE embedding IS NOT NULL 
      AND level IN ('tariff_line', 'statistical')
    `.then(r => Number(r[0].count)),
    checkFullTextSearchAvailable(),
  ]);
  
  const pending = total - withEmbeddings;
  const coverage = total > 0 ? `${Math.round(withEmbeddings / total * 100)}%` : '0%';
  
  return {
    totalCodes: total,
    withEmbeddings,
    pendingEmbeddings: pending,
    coverage,
    hybridSearchAvailable: hybridAvailable,
  };
}
