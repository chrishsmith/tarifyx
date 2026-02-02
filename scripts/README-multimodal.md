# Multimodal HTS Classification

Experimental: Use product images + text for improved classification accuracy.

## Overview

Multimodal classification combines:
- **Text**: Product description
- **Image**: Product photo

This can improve accuracy for products where visual features matter:
- Textiles (weave pattern, material visible)
- Furniture (construction details)
- Decorative vs functional items

## Approach

### Option 1: CLIP-based Classification

Use OpenAI's CLIP model to create joint embeddings of text + image:

```python
from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image

# Load CLIP model
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Process inputs
image = Image.open("product.jpg")
text = "cotton t-shirt"

inputs = processor(
    text=[text],
    images=image,
    return_tensors="pt",
    padding=True
)

# Get embeddings
with torch.no_grad():
    outputs = model(**inputs)
    image_embeds = outputs.image_embeds
    text_embeds = outputs.text_embeds
    
# Combine embeddings for classification
combined = torch.cat([image_embeds, text_embeds], dim=1)
```

### Option 2: Fine-tune Vision-Language Model

Fine-tune a multimodal model on CROSS rulings + product images:

```python
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer

model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
# Fine-tune on HTS classification task
```

## Data Requirements

### HSCodeComp Dataset

The HSCodeComp dataset includes image references:

```bash
python scripts/ingest-hscodecomp-images.py
```

This downloads:
- 632 product records
- Associated product images
- Noisy e-commerce descriptions

### Training Data Format

```json
{
  "text": "cotton t-shirt men's crew neck",
  "image_url": "https://example.com/product.jpg",
  "hts_code": "6109100012"
}
```

## Implementation Status

**Status**: Framework only (not fully implemented)

**Why optional**:
- Requires image data (not always available)
- More complex infrastructure (image storage, processing)
- Marginal accuracy improvement for most products
- Text-only classification already achieves 90%+ accuracy

**When to implement**:
- If you have product images available
- For specific categories where visual features matter
- After text-based classification is optimized

## Future Work

If implementing multimodal classification:

1. **Data Collection**
   - Download HSCodeComp images
   - Scrape product images from e-commerce sites
   - User-uploaded images

2. **Model Training**
   - Fine-tune CLIP on HTS classification
   - Or train custom vision-language model
   - Benchmark against text-only baseline

3. **Infrastructure**
   - Image storage (S3, CDN)
   - Image preprocessing pipeline
   - Inference API with image support

4. **Integration**
   - Update classification UI to accept images
   - Modify classification engine to use multimodal model
   - A/B test vs text-only classification

## Estimated Impact

Based on research papers:
- **Accuracy improvement**: +2-5% for ambiguous products
- **Cost**: Higher (image processing, storage)
- **Latency**: +200-500ms (image encoding)
- **Complexity**: Significantly higher

**Recommendation**: Focus on text-based classification first. Add multimodal only if:
1. You have image data available
2. Text-only accuracy plateaus
3. Specific product categories need it

## References

- CLIP paper: https://arxiv.org/abs/2103.00020
- HSCodeComp dataset: https://huggingface.co/datasets/AIDC-AI/HSCodeComp
- Vision-language models: https://huggingface.co/models?pipeline_tag=image-to-text
