# HTS Classification Training Data

This directory contains training data for the HTS classification engine.

## Files (Not Committed - Too Large)

| File | Size | Purpose |
|------|------|---------|
| `crossRulings.json` | 21 MB | 16,978 CBP CROSS rulings (train split) |
| `crossRulings-validation.json` | 0.5 MB | 180 validation rulings |
| `crossRulings-test.json` | 0.5 MB | 189 test rulings |
| `crossRulingsEmbedded.json` | 549 MB | Train rulings with vector embeddings |
| `hsCodeComp.json` | 1.7 MB | 632 e-commerce test records (optional) |

**Total CROSS Rulings**: 17,347 (train: 16,978, validation: 180, test: 189)

## How to Download

### 1. Download CROSS Rulings (Train Split)
```bash
npx ts-node scripts/ingest-cross-rulings.ts train
```

This will download ~16,978 rulings from HuggingFace:
- Source: `flexifyai/cross_rulings_hts_dataset_for_tariffs`
- Time: ~5-10 minutes (with rate limiting)
- Output: `src/data/crossRulings.json`

### 1b. Download Evaluation Splits (Validation + Test)
```bash
npx ts-node scripts/ingest-cross-rulings-eval.ts
```

This will download validation (180) and test (189) splits:
- Time: ~30 seconds
- Output: `src/data/crossRulings-validation.json` and `src/data/crossRulings-test.json`
- Use these for benchmarking and evaluation

### 2. Generate Embeddings
```bash
npx ts-node scripts/embed-cross-rulings.ts
```

This will create vector embeddings for semantic search:
- Model: OpenAI `text-embedding-3-small`
- Time: ~3-5 minutes
- Cost: ~$2
- Output: `src/data/crossRulingsEmbedded.json`

**Note**: Requires `OPENAI_API_KEY` in `.env.local`

### 3. Download HSCodeComp (Optional)
```bash
npx ts-node scripts/ingest-hscodecomp.ts
```

This downloads e-commerce test data:
- Source: `AIDC-AI/HSCodeComp`
- Time: ~1 minute
- Output: `src/data/hsCodeComp.json`

## Dataset Information

### CROSS Rulings
- **Source**: U.S. Customs and Border Protection
- **Format**: Product description → HTS code + reasoning
- **License**: MIT
- **Coverage**: 65 HTS chapters
- **Quality**: Official, legally binding classifications

### HSCodeComp
- **Source**: AIDC-AI research dataset
- **Format**: E-commerce product data → HS code
- **Purpose**: Robustness testing on noisy inputs
- **Coverage**: 27 chapters

## Usage in Classification

The classification engine automatically uses these datasets when available:

1. **Semantic Search**: Finds similar rulings for few-shot prompting
2. **LLM Reranker**: Uses rulings as context for better decisions
3. **System Prompts**: Enhanced with patterns from real rulings

If the files are missing, the engine falls back to:
- Keyword-based ruling search
- Curated examples (hardcoded in `crossRulingsService.ts`)
- Generic system prompts

## File Sizes

These files are large and excluded from git:
- Total: ~570 MB
- Embeddings alone: 549 MB (16,978 × 1536 dimensions × 4 bytes)

## References

- CROSS Rulings Dataset: https://huggingface.co/datasets/flexifyai/cross_rulings_hts_dataset_for_tariffs
- HSCodeComp Dataset: https://huggingface.co/datasets/AIDC-AI/HSCodeComp
- ATLAS Paper: arXiv 2509.18400
- Documentation: `docs/classification-improvements.md`
