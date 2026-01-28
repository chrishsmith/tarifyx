/**
 * Script to embed CROSS rulings for semantic search
 * 
 * Uses OpenAI text-embedding-3-small to create vectors for each ruling.
 * Stores embeddings in the crossRulings.json file for fast retrieval.
 * 
 * Usage: npx ts-node scripts/embed-cross-rulings.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../src/data/crossRulings.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/crossRulingsEmbedded.json');
const BATCH_SIZE = 100; // OpenAI allows up to 2048 inputs per batch

interface CrossRuling {
  id: string;
  productDescription: string;
  htsCodes: string[];
  reasoning: string;
  chapter: string;
  embedding?: number[];
}

interface CrossRulingsData {
  metadata: {
    source: string;
    downloadedAt: string;
    totalRulings: number;
    uniqueChapters: number;
    embeddedAt?: string;
  };
  rulings: CrossRuling[];
}

async function getOpenAI(): Promise<OpenAI> {
  // Try to load from .env.local
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match) {
      process.env.OPENAI_API_KEY = match[1].trim();
    }
  }
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment');
  }
  
  return new OpenAI({ apiKey });
}

async function embedBatch(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  
  return response.data.map(d => d.embedding);
}

async function main() {
  console.log('=== CROSS Rulings Embedding ===\n');
  
  // Load rulings
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    console.log('Run ingest-cross-rulings.ts first to download the dataset.');
    process.exit(1);
  }
  
  const data: CrossRulingsData = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  console.log(`Loaded ${data.rulings.length} rulings`);
  
  // Initialize OpenAI
  const openai = await getOpenAI();
  console.log('OpenAI client initialized');
  
  // Embed in batches
  let processed = 0;
  const totalBatches = Math.ceil(data.rulings.length / BATCH_SIZE);
  
  for (let i = 0; i < data.rulings.length; i += BATCH_SIZE) {
    const batch = data.rulings.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} rulings)`);
    
    // Create text for embedding: product description + chapter info
    const texts = batch.map(r => 
      `${r.productDescription} | Chapter ${r.chapter} | HTS ${r.htsCodes[0]}`
    );
    
    try {
      const embeddings = await embedBatch(openai, texts);
      
      // Assign embeddings to rulings
      for (let j = 0; j < batch.length; j++) {
        data.rulings[i + j].embedding = embeddings[j];
      }
      
      processed += batch.length;
      console.log(`  Embedded ${processed}/${data.rulings.length} rulings`);
      
      // Rate limiting - 3000 RPM for text-embedding-3-small
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error embedding batch ${batchNum}:`, error);
      // Continue with next batch
    }
  }
  
  // Update metadata
  data.metadata.embeddedAt = new Date().toISOString();
  
  // Count embedded rulings
  const embeddedCount = data.rulings.filter(r => r.embedding).length;
  console.log(`\nEmbedded ${embeddedCount}/${data.rulings.length} rulings`);
  
  // Save to file using streaming to handle large JSON
  console.log('\nSaving to file (streaming)...');
  const writeStream = fs.createWriteStream(OUTPUT_PATH);
  writeStream.write('{"metadata":');
  writeStream.write(JSON.stringify(data.metadata));
  writeStream.write(',"rulings":[');
  
  for (let i = 0; i < data.rulings.length; i++) {
    if (i > 0) writeStream.write(',');
    writeStream.write(JSON.stringify(data.rulings[i]));
  }
  
  writeStream.write(']}');
  writeStream.end();
  
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  
  console.log(`Saved to: ${OUTPUT_PATH}`);
  
  // File size info
  const stats = fs.statSync(OUTPUT_PATH);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
