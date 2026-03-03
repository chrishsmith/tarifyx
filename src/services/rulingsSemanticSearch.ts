/**
 * Semantic Search for CROSS Rulings
 * 
 * Uses vector embeddings to find the most relevant CBP rulings
 * for a given product description. This provides better few-shot
 * examples than keyword matching alone.
 * 
 * @module rulingsSemanticSearch
 * @created January 2026
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmbeddedRuling {
  id: string;
  productDescription: string;
  htsCodes: string[];
  reasoning: string;
  chapter: string;
  embedding: number[];
}

export interface SemanticSearchResult {
  ruling: EmbeddedRuling;
  similarity: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD EMBEDDED RULINGS
// ═══════════════════════════════════════════════════════════════════════════════

let embeddedRulings: EmbeddedRuling[] | null = null;
let loadError: string | null = null;
let loadAttempted = false;

async function loadEmbeddedRulings(): Promise<EmbeddedRuling[]> {
  if (embeddedRulings) return embeddedRulings;
  if (loadAttempted && loadError) return [];
  
  loadAttempted = true;
  
  try {
    // Try multiple paths to find the embedded rulings file
    const possiblePaths = [
      path.join(process.cwd(), 'src/data/crossRulingsEmbedded.json'),
      path.join(__dirname, '../data/crossRulingsEmbedded.json'),
      path.join(__dirname, '../../data/crossRulingsEmbedded.json'),
    ];
    
    let filePath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }
    
    if (!filePath) {
      loadError = 'Embedded rulings file not found';
      console.warn(`[Semantic Search] ${loadError}`);
      return [];
    }
    
    console.log(`[Semantic Search] Loading embedded rulings from ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    embeddedRulings = (data.rulings || []).filter((r: any) => r.embedding && r.embedding.length > 0);
    console.log(`[Semantic Search] Loaded ${embeddedRulings.length} embedded rulings`);
    return embeddedRulings;
  } catch (error) {
    loadError = `Failed to load embedded rulings: ${error}`;
    console.warn(`[Semantic Search] ${loadError}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Get embedding for a query string
 */
async function getQueryEmbedding(query: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  return response.data[0].embedding;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMILARITY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find the most semantically similar CROSS rulings for a product description
 */
export async function searchRulingsBySemantic(
  query: string,
  limit: number = 5
): Promise<SemanticSearchResult[]> {
  const startTime = Date.now();
  
  try {
    // Load embedded rulings
    const rulings = await loadEmbeddedRulings();
    if (rulings.length === 0) {
      console.log('[Semantic Search] No embedded rulings available');
      return [];
    }
    
    // Get query embedding
    const queryEmbedding = await getQueryEmbedding(query);
    
    // Calculate similarities
    const scored = rulings.map(ruling => ({
      ruling,
      similarity: cosineSimilarity(queryEmbedding, ruling.embedding),
    }));
    
    // Sort and return top results
    const results = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    const elapsed = Date.now() - startTime;
    console.log(`[Semantic Search] Found ${results.length} rulings in ${elapsed}ms (best similarity: ${results[0]?.similarity.toFixed(3)})`);
    
    return results;
  } catch (error) {
    console.error('[Semantic Search] Error:', error);
    return [];
  }
}

/**
 * Build few-shot examples from semantically similar rulings
 */
export async function buildSemanticFewShotExamples(
  query: string,
  maxExamples: number = 3
): Promise<string> {
  const results = await searchRulingsBySemantic(query, maxExamples);
  
  if (results.length === 0) {
    return '';
  }
  
  return results.map((result, idx) => {
    const ruling = result.ruling;
    const shortReasoning = ruling.reasoning.length > 400 
      ? ruling.reasoning.slice(0, 400) + '...'
      : ruling.reasoning;
    
    return `
Example ${idx + 1} (${(result.similarity * 100).toFixed(1)}% match):
Product: "${ruling.productDescription}"
HTS Code: ${ruling.htsCodes[0]}
Reasoning: ${shortReasoning}
`;
  }).join('\n');
}

/**
 * Check if semantic search is available
 */
export async function isSemanticSearchAvailable(): Promise<boolean> {
  const rulings = await loadEmbeddedRulings();
  return rulings.length > 0;
}

/**
 * Get statistics about loaded rulings
 */
export async function getSemanticSearchStats(): Promise<{
  available: boolean;
  rulingCount: number;
  error?: string;
}> {
  if (loadError) {
    return { available: false, rulingCount: 0, error: loadError };
  }
  
  const rulings = await loadEmbeddedRulings();
  return {
    available: rulings.length > 0,
    rulingCount: rulings.length,
  };
}

export default {
  searchRulingsBySemantic,
  buildSemanticFewShotExamples,
  isSemanticSearchAvailable,
  getSemanticSearchStats,
};
