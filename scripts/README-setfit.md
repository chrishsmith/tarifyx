# SetFit HTS Classifier

Fast, accurate HTS classification using SetFit (Sentence Transformer Fine-Tuning).

## Overview

SetFit provides a lightweight alternative to LLM-based classification:

- **10-50x faster**: 50-100ms vs 3-5s for LLM reranking
- **Zero cost**: No API calls, runs locally
- **Offline capable**: Works without internet
- **High accuracy**: 90%+ on 6-digit subheadings (per ATLAS paper)

## Quick Start

### 1. Install Python Dependencies

```bash
pip install setfit datasets torch scikit-learn flask
```

Or use the requirements file:

```bash
pip install -r scripts/requirements-ml.txt
```

### 2. Train the Model

Train on CROSS rulings (takes ~30 minutes on CPU):

```bash
# Test mode (100 samples, fast)
python scripts/train-setfit-classifier.py --test

# Full training (16,978 samples)
python scripts/train-setfit-classifier.py --level subheading --epochs 1
```

Options:
- `--level`: `chapter`, `heading`, `subheading` (recommended), or `full`
- `--epochs`: Number of training epochs (default: 1)
- `--max-samples`: Limit training samples for testing
- `--model`: Base sentence transformer model (default: `all-MiniLM-L6-v2`)

### 3. Start the Inference Server

```bash
python scripts/setfit-inference-server.py --model models/setfit-hts-subheading --port 5001
```

The server runs on `http://127.0.0.1:5001` by default.

### 4. Use from TypeScript

```typescript
import { classifyWithSetFit } from '@/services/setfitClassifier';

// Classify a product
const result = await classifyWithSetFit('cotton t-shirt');

if (result) {
  console.log(`HTS Code: ${result.predictions[0].code}`);
  console.log(`Latency: ${result.latency_ms}ms`);
}
```

## API Endpoints

### Health Check

```bash
curl http://127.0.0.1:5001/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_info": {
    "accuracy": 0.92,
    "inference_time_ms": 45
  }
}
```

### Classify Single Product

```bash
curl -X POST http://127.0.0.1:5001/classify \
  -H "Content-Type: application/json" \
  -d '{"description": "cotton t-shirt men'\''s crew neck"}'
```

Response:
```json
{
  "predictions": [
    {"code": "610910", "confidence": 0.95}
  ],
  "latency_ms": 45
}
```

### Batch Classification

```bash
curl -X POST http://127.0.0.1:5001/batch-classify \
  -H "Content-Type: application/json" \
  -d '{"descriptions": ["cotton t-shirt", "yoga mat", "ceramic planter"]}'
```

Response:
```json
{
  "results": [
    {"code": "610910", "confidence": 0.95},
    {"code": "950691", "confidence": 0.88},
    {"code": "691490", "confidence": 0.92}
  ],
  "latency_ms": 120,
  "count": 3
}
```

## Integration with V10 Engine

SetFit can be integrated as a fast first-pass classifier before LLM reranking:

```typescript
// In classificationEngineV10.ts

import { classifyWithSetFit } from '@/services/setfitClassifier';

// Try SetFit first (fast, offline)
const setfitResult = await classifyWithSetFit(query);

if (setfitResult && setfitResult.predictions[0].confidence > 0.8) {
  // High confidence from SetFit - use it directly
  return setfitResult.predictions[0].code;
}

// Fall back to semantic search + LLM reranking
const candidates = await searchHtsBySemantic(query);
// ... existing V10 logic
```

## Model Variants

### Subheading (6-digit) - Recommended

```bash
python scripts/train-setfit-classifier.py --level subheading
```

- **Accuracy**: ~90-92%
- **Use case**: General classification, then refine to 10-digit
- **Classes**: ~1,200 unique subheadings

### Heading (4-digit)

```bash
python scripts/train-setfit-classifier.py --level heading
```

- **Accuracy**: ~93-95%
- **Use case**: Coarse classification, faster training
- **Classes**: ~300 unique headings

### Chapter (2-digit)

```bash
python scripts/train-setfit-classifier.py --level chapter
```

- **Accuracy**: ~96-98%
- **Use case**: Initial chapter detection
- **Classes**: 65 chapters

### Full (10-digit)

```bash
python scripts/train-setfit-classifier.py --level full
```

- **Accuracy**: ~60-70% (many classes, harder)
- **Use case**: Direct full code prediction
- **Classes**: ~2,900 unique codes

## Performance Benchmarks

| Model | Training Time | Inference Time | Accuracy (6-digit) |
|-------|---------------|----------------|-------------------|
| SetFit (all-MiniLM-L6-v2) | 30 min | 50ms | 90-92% |
| LLM Reranking (gpt-4o-mini) | N/A | 3-5s | 85-95% |
| V10 Semantic Search | N/A | 100-200ms | 70-80% |

## Troubleshooting

### Server not starting

- Check Python dependencies: `pip list | grep setfit`
- Verify model exists: `ls -lh models/setfit-hts-subheading/`

### Low accuracy

- Train on more data: Remove `--max-samples` flag
- Increase epochs: `--epochs 3`
- Try different base model: `--model sentence-transformers/all-mpnet-base-v2`

### TypeScript can't connect

- Verify server is running: `curl http://127.0.0.1:5001/health`
- Check port: Default is 5001, change with `--port`
- Firewall: Ensure localhost connections allowed

## Production Deployment

### Option 1: Run as Background Service

```bash
# Start server in background
nohup python scripts/setfit-inference-server.py \
  --model models/setfit-hts-subheading \
  --port 5001 > setfit.log 2>&1 &

# Check logs
tail -f setfit.log
```

### Option 2: Docker Container

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY scripts/requirements-ml.txt .
RUN pip install -r requirements-ml.txt

COPY scripts/setfit-inference-server.py .
COPY models/setfit-hts-subheading ./models/setfit-hts-subheading

EXPOSE 5001

CMD ["python", "setfit-inference-server.py", "--model", "models/setfit-hts-subheading", "--host", "0.0.0.0"]
```

### Option 3: Serverless (AWS Lambda)

Use AWS Lambda with custom runtime for Python + PyTorch. Model must be < 250MB uncompressed.

## Next Steps

1. **Integrate with V10**: Add SetFit as first-pass classifier
2. **A/B Testing**: Compare SetFit vs LLM accuracy on production queries
3. **Active Learning**: Retrain monthly with user corrections
4. **Ensemble**: Combine SetFit + LLM for best results
