/**
 * Script to download and ingest CROSS rulings from HuggingFace
 * 
 * Dataset: flexifyai/cross_rulings_hts_dataset_for_tariffs
 * - 18,731 total rulings (train: 18,254, validation: 200, test: 277)
 * - ~2,992 unique HTS codes
 * - MIT license
 * 
 * Usage: npx ts-node scripts/ingest-cross-rulings.ts [split]
 * - split: 'train' (default), 'validation', 'test', or 'all'
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_API = 'https://datasets-server.huggingface.co/rows';
const DATASET_ID = 'flexifyai/cross_rulings_hts_dataset_for_tariffs';
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const BATCH_SIZE = 100;
const MAX_RULINGS = 20000; // Download full dataset
const DELAY_BETWEEN_BATCHES = 2000; // 2 second delay to avoid rate limiting
const MAX_RETRIES = 3;
const RETRY_DELAY = 30000; // 30 second wait on rate limit

// Get split from command line args (default: 'all')
const SPLIT_ARG = process.argv[2] || 'all';
const VALID_SPLITS = ['train', 'validation', 'test', 'all'];

interface HFMessage {
  role: string;
  content: string;
}

interface HFRow {
  row: {
    messages: HFMessage[];
  };
}

interface CrossRuling {
  id: string;
  productDescription: string;
  htsCodes: string[];
  reasoning: string;
  chapter: string;
}

async function fetchBatch(split: string, offset: number, length: number, retryCount = 0): Promise<HFRow[]> {
  const url = `${DATASET_API}?dataset=${encodeURIComponent(DATASET_ID)}&config=default&split=${split}&offset=${offset}&length=${length}`;
  
  console.log(`Fetching ${split} batch: offset=${offset}, length=${length}`);
  
  const response = await fetch(url);
  
  if (response.status === 429) {
    // Rate limited - wait and retry
    if (retryCount < MAX_RETRIES) {
      console.log(`Rate limited! Waiting ${RETRY_DELAY/1000}s before retry ${retryCount + 1}/${MAX_RETRIES}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchBatch(split, offset, length, retryCount + 1);
    }
    throw new Error(`Rate limited after ${MAX_RETRIES} retries`);
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.rows || [];
}

function parseRuling(row: HFRow, index: number, split: string): CrossRuling | null {
  try {
    const messages = row.row.messages;
    const userMsg = messages.find(m => m.role === 'user');
    const assistantMsg = messages.find(m => m.role === 'assistant');
    
    if (!userMsg || !assistantMsg) return null;
    
    // Extract product description from user message
    const productMatch = userMsg.content.match(/What is the HTS US Code for (.+?)\??$/i);
    const productDescription = productMatch ? productMatch[1].trim() : userMsg.content;
    
    // Extract HTS codes from assistant message
    const htsMatch = assistantMsg.content.match(/HTS US Code ->\s*(.+?)(?:\n|$)/);
    if (!htsMatch) return null;
    
    // Handle multiple codes separated by semicolons or commas
    const htsCodes = htsMatch[1]
      .split(/[;,]/)
      .map(code => code.trim().replace(/\./g, ''))
      .filter(code => /^\d{4,10}$/.test(code));
    
    if (htsCodes.length === 0) return null;
    
    // Extract reasoning (everything after "Reasoning ->")
    const reasoningIdx = assistantMsg.content.indexOf('Reasoning ->');
    const reasoning = reasoningIdx >= 0 
      ? assistantMsg.content.slice(reasoningIdx + 12).trim() 
      : '';
    
    // Get chapter from first HTS code
    const chapter = htsCodes[0].slice(0, 2);
    
    return {
      id: `cross-${split}-${index}`,
      productDescription,
      htsCodes,
      reasoning,
      chapter,
    };
  } catch (error) {
    console.error(`Error parsing ruling ${index}:`, error);
    return null;
  }
}

async function downloadSplit(split: string): Promise<CrossRuling[]> {
  console.log(`\n=== Downloading ${split} split ===`);
  
  const OUTPUT_PATH = path.join(OUTPUT_DIR, `crossRulings-${split}.json`);
  let rulings: CrossRuling[] = [];
  let offset = 0;
  
  // Try to resume from existing file
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      rulings = existing.rulings || [];
      const maxId = Math.max(...rulings.map(r => {
        const parts = r.id.split('-');
        return parseInt(parts[parts.length - 1]);
      }));
      offset = Math.floor(maxId / BATCH_SIZE) * BATCH_SIZE + BATCH_SIZE;
      console.log(`Resuming from offset ${offset} (${rulings.length} existing rulings)`);
    } catch (e) {
      console.log('Starting fresh download');
    }
  }
  
  while (rulings.length < MAX_RULINGS) {
    try {
      const batch = await fetchBatch(split, offset, BATCH_SIZE);
      
      if (batch.length === 0) {
        console.log(`No more data available for ${split} split`);
        break;
      }
      
      for (let i = 0; i < batch.length; i++) {
        const ruling = parseRuling(batch[i], offset + i, split);
        if (ruling) {
          rulings.push(ruling);
        }
      }
      
      console.log(`Progress: ${rulings.length} rulings`);
      offset += BATCH_SIZE;
      
      // Rate limiting - wait between batches to avoid API limits
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      
    } catch (error) {
      console.error(`Error fetching ${split} batch:`, error);
      break;
    }
  }
  
  // Generate statistics
  const chapters = new Map<string, number>();
  for (const ruling of rulings) {
    chapters.set(ruling.chapter, (chapters.get(ruling.chapter) || 0) + 1);
  }
  
  console.log(`\n=== ${split} Statistics ===`);
  console.log(`Total rulings: ${rulings.length}`);
  console.log(`Unique chapters: ${chapters.size}`);
  
  // Save to file
  const output = {
    metadata: {
      source: 'flexifyai/cross_rulings_hts_dataset_for_tariffs',
      split,
      downloadedAt: new Date().toISOString(),
      totalRulings: rulings.length,
      uniqueChapters: chapters.size,
    },
    rulings,
  };
  
  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Saved to: ${OUTPUT_PATH}`);
  
  return rulings;
}

async function main() {
  console.log('=== CROSS Rulings Dataset Ingestion ===');
  console.log(`Split: ${SPLIT_ARG}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);
  
  if (!VALID_SPLITS.includes(SPLIT_ARG)) {
    console.error(`Invalid split: ${SPLIT_ARG}`);
    console.error(`Valid splits: ${VALID_SPLITS.join(', ')}`);
    process.exit(1);
  }
  
  const splitsToDownload = SPLIT_ARG === 'all' 
    ? ['train', 'validation', 'test'] 
    : [SPLIT_ARG];
  
  const allRulings: CrossRuling[] = [];
  
  for (const split of splitsToDownload) {
    const rulings = await downloadSplit(split);
    allRulings.push(...rulings);
  }
  
  // If downloading all splits, create a combined file
  if (SPLIT_ARG === 'all') {
    console.log('\n=== Creating combined dataset ===');
    const chapters = new Map<string, number>();
    for (const ruling of allRulings) {
      chapters.set(ruling.chapter, (chapters.get(ruling.chapter) || 0) + 1);
    }
    
    console.log(`Total rulings across all splits: ${allRulings.length}`);
    console.log(`Unique chapters: ${chapters.size}`);
    console.log(`Top chapters:`);
    
    const sortedChapters = Array.from(chapters.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [chapter, count] of sortedChapters) {
      console.log(`  Chapter ${chapter}: ${count} rulings`);
    }
    
    const combinedOutput = {
      metadata: {
        source: 'flexifyai/cross_rulings_hts_dataset_for_tariffs',
        splits: ['train', 'validation', 'test'],
        downloadedAt: new Date().toISOString(),
        totalRulings: allRulings.length,
        uniqueChapters: chapters.size,
      },
      rulings: allRulings,
    };
    
    const combinedPath = path.join(OUTPUT_DIR, 'crossRulings.json');
    fs.writeFileSync(combinedPath, JSON.stringify(combinedOutput, null, 2));
    console.log(`\nSaved combined dataset to: ${combinedPath}`);
  }
  
  console.log('\n=== Download complete ===');
}

main().catch(console.error);
