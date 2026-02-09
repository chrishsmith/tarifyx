# SetFit HTS Heading — Eval Notes

**Current test accuracy: ~53%** (exact match on 189 samples, 498 heading classes). Below the 92–95% target for heading level.

## Why it’s low
- **High label count:** 498 4-digit headings with ~12k training samples → ~24 samples/class on average and a long tail of rare headings.
- **Single-stage:** One model predicts among all headings; SetFit contrastive learning is harder with many classes.
- **Small test set:** 189 samples may be noisy or skewed.

## Levers to improve (next run)
1. **Report top-3 accuracy** — If correct heading is in top-3 often, that’s still useful for gating search; pipeline only needs “good enough” to constrain.
2. **Filter long-tail labels** — Train only on headings with ≥30 (or ≥50) samples; predict “other” or fall back to AI for rare headings.
3. **Two-stage:** Train chapter (2-digit) first, then train heading **within chapter** (smaller label set per model).
4. **More capacity:** More contrastive iterations (e.g. 15–20), 5 epochs, or larger base (e.g. `all-mpnet-base-v2`) if GPU allows.
5. **More data:** Use full CROSS set (no 12k cap) on a larger GPU, or add augmented/synthetic descriptions for tail headings.

Pipeline already protects: `SETFIT_HEADING_CONFIDENCE = 60` in `headingClassifier.ts`, so low-confidence SetFit predictions fall through to deterministic/AI.
