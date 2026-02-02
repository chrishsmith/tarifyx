/**
 * Script to download ONLY validation and test splits from CROSS rulings
 * 
 * Dataset: flexifyai/cross_rulings_hts_dataset_for_tariffs
 * - Validation: 200 rulings
 * - Test: 277 rulings
 * 
 * We already have 16,978 train rulings, so this just adds the eval splits.
 * 
 * Usage: npx ts-node scripts/ingest-cross-rulings-eval.ts
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
const DELAY_BETWEEN_BATCHES = 2000;

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

async function fetchBatch(split: string, offset: number, length: number): Promise<HFRow[]> {
  const url = `${DATASET_API}?dataset=${encodeURIComponent(DATASET_ID)}&config=default&split=${split}&offset=${offset}&length=${length}`;
  
  console.log(`Fetching ${split} batch: offset=${offset}, length=${length}`);
  
  const response = await fetch(url);
  
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
    
    const productMatch = userMsg.content.match(/What is the HTS US Code for (.+?)\??$/i);
    const productDescription = productMatch ? productMatch[1].trim() : userMsg.content;
    
    const htsMatch = assistantMsg.content.match(/HTS US Code ->\s*(.+?)(?:\n|$)/);
    if (!htsMatch) return null;
    
    const htsCodes = htsMatch[1]
      .split(/[;,]/)
      .map(code => code.trim().replace(/\./g, ''))
      .filter(code => /^\d{4,10}$/.test(code));
    
    if (htsCodes.length === 0) return null;
    
    const reasoningIdx = assistantMsg.content.indexOf('Reasoning ->');
    const reasoning = reasoningIdx >= 0 
      ? assistantMsg.content.slice(reasoningIdx + 12).trim() 
      : '';
    
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
  
  const rulings: CrossRuling[] = [];
  let offset = 0;
  
  while (true) {
    const batch = await fetchBatch(split, offset, BATCH_SIZE);
    
    if (batch.length === 0) {
      console.log(`Completed ${split} split`);
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
    
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
  }
  
  const chapters = new Map<string, number>();
  for (const ruling of rulings) {
    chapters.set(ruling.chapter, (chapters.get(ruling.chapter) || 0) + 1);
  }
  
  console.log(`Total ${split} rulings: ${rulings.length}`);
  console.log(`Unique chapters: ${chapters.size}`);
  
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
  
  const outputPath = path.join(OUTPUT_DIR, `crossRulings-${split}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Saved to: ${outputPath}`);
  
  return rulings;
}

async function main() {
  console.log('=== CROSS Rulings Evaluation Splits Download ===\n');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Download validation and test splits
  const validationRulings = await downloadSplit('validation');
  const testRulings = await downloadSplit('test');
  
  console.log('\n=== Summary ===');
  console.log(`Validation rulings: ${validationRulings.length}`);
  console.log(`Test rulings: ${testRulings.length}`);
  console.log(`Total new rulings: ${validationRulings.length + testRulings.length}`);
  console.log('\nThese can be used for evaluation benchmarking.');
}

main().catch(console.error);
