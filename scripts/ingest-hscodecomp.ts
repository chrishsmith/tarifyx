/**
 * Script to download HSCodeComp dataset from HuggingFace
 * 
 * Dataset: AIDC-AI/HSCodeComp
 * - Challenging benchmark for 10-digit HS/HTS prediction
 * - Noisy real-world e-commerce descriptions
 * - Rich product info (title, attributes, category)
 * 
 * Usage: npx ts-node scripts/ingest-hscodecomp.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_API = 'https://datasets-server.huggingface.co/rows';
const DATASET_ID = 'AIDC-AI/HSCodeComp';
const OUTPUT_PATH = path.join(__dirname, '../src/data/hsCodeComp.json');
const BATCH_SIZE = 100;
const MAX_RECORDS = 1000; // Dataset has 632 examples in test split

interface HSCodeCompRecord {
  id: string;
  productName: string;
  productAttributes: string;
  hsCode: string;
  category: string;
  question: string;
}

async function fetchBatch(offset: number, length: number): Promise<any[]> {
  // HSCodeComp only has a "test" split, not "train"
  const url = `${DATASET_API}?dataset=${encodeURIComponent(DATASET_ID)}&config=default&split=test&offset=${offset}&length=${length}`;
  
  console.log(`Fetching batch: offset=${offset}, length=${length}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.rows || [];
}

function parseRecord(row: any, index: number): HSCodeCompRecord | null {
  try {
    const data = row.row;
    
    // HSCodeComp structure: product_name, product_attributes, hs_code, cate_lv*_desc
    const productName = data.product_name || '';
    const productAttributes = data.product_attributes || '';
    const hsCode = (data.hs_code || '').toString().padStart(10, '0');
    
    if (!hsCode || hsCode.length < 4) return null;
    
    // Build category from hierarchy
    const categories = [
      data.cate_lv1_desc,
      data.cate_lv2_desc,
      data.cate_lv3_desc,
      data.cate_lv4_desc,
      data.cate_lv5_desc,
    ].filter(Boolean).join(' > ');
    
    return {
      id: `hsc-${index}`,
      productName,
      productAttributes,
      hsCode,
      category: categories,
      question: data.question || '',
    };
  } catch (error) {
    console.error(`Error parsing record ${index}:`, error);
    return null;
  }
}

async function main() {
  console.log('=== HSCodeComp Dataset Ingestion ===\n');
  console.log(`Target: ${MAX_RECORDS} records`);
  console.log(`Output: ${OUTPUT_PATH}\n`);
  
  const records: HSCodeCompRecord[] = [];
  let offset = 0;
  
  while (records.length < MAX_RECORDS) {
    try {
      const batch = await fetchBatch(offset, BATCH_SIZE);
      
      if (batch.length === 0) {
        console.log('No more data available');
        break;
      }
      
      for (let i = 0; i < batch.length; i++) {
        const record = parseRecord(batch[i], offset + i);
        if (record) {
          records.push(record);
        }
      }
      
      console.log(`Progress: ${records.length}/${MAX_RECORDS} records`);
      offset += BATCH_SIZE;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error fetching batch:', error);
      break;
    }
  }
  
  // Generate statistics
  const chapters = new Map<string, number>();
  for (const record of records) {
    const chapter = record.hsCode.slice(0, 2);
    chapters.set(chapter, (chapters.get(chapter) || 0) + 1);
  }
  
  console.log(`\n=== Statistics ===`);
  console.log(`Total records: ${records.length}`);
  console.log(`Unique chapters: ${chapters.size}`);
  
  // Save to file
  const output = {
    metadata: {
      source: 'AIDC-AI/HSCodeComp',
      downloadedAt: new Date().toISOString(),
      totalRecords: records.length,
      uniqueChapters: chapters.size,
    },
    records,
  };
  
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
