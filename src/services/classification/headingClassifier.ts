/**
 * Heading Classifier — Phase 0 of V10 Classification Pipeline
 * 
 * Predicts the top 3 HTS headings (4-digit) BEFORE full search begins.
 * This GATES the search — V10 only searches within predicted headings,
 * eliminating chapter-level errors (the most expensive type of mistake).
 * 
 * Three-tier prediction strategy:
 * 1. DETERMINISTIC: Pattern matching + chapter exclusion rules (~5ms, highest confidence)
 * 2. SETFIT: ML model heading prediction (~50-100ms, if available)
 * 3. AI FALLBACK: xAI/Grok heading prediction (~500ms, for unknown product types)
 * 
 * The heading classifier merges function-over-material routing logic from
 * productClassifier.ts with chapter exclusion rules and product-type-to-heading
 * mappings into a single fast path.
 * 
 * @module headingClassifier
 * @created February 2026
 */

import { getXAIClient } from '@/lib/xai';
import { classifyWithSetFit } from '@/services/setfitClassifier';
import {
  findExclusionRules,
  getPreferredChapters,
  getExcludedChapters,
} from '@/data/chapterExclusions';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface HeadingPrediction {
  /** 4-digit heading code (e.g., "6109") */
  heading: string;
  /** 2-digit chapter (e.g., "61") */
  chapter: string;
  /** Confidence in this heading prediction (0-100) */
  headingConfidence: number;
  /** Why this heading was predicted */
  reason: string;
  /** The prediction source */
  source: 'deterministic' | 'setfit' | 'ai' | 'exclusion_rule';
}

export interface HeadingClassifierResult {
  /** Top heading predictions, ordered by confidence */
  predictions: HeadingPrediction[];
  /** Whether the heading classifier has high enough confidence to gate the search */
  shouldConstrain: boolean;
  /** Chapters to EXCLUDE from search (from exclusion rules) */
  excludedChapters: Set<string>;
  /** Overall heading confidence (used for split confidence calculation) */
  headingConfidence: number;
  /** Time taken in ms */
  timing: number;
  /** Which method was used */
  method: 'deterministic' | 'setfit' | 'ai' | 'mixed';
  /** Detected product characteristics */
  detected: {
    productType: string | null;
    material: string | null;
    isFunctionDriven: boolean;
    functionRule: string | null;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETERMINISTIC HEADING RULES
// Merges productClassifier.ts function-over-material routing with heading maps
// ═══════════════════════════════════════════════════════════════════════════════

/** Minimum confidence to gate search (skip full-spectrum search) */
const CONSTRAIN_THRESHOLD = 70;

/** Minimum confidence for SetFit heading prediction to be trusted */
const SETFIT_HEADING_CONFIDENCE = 60;

/**
 * Function-over-material rules: product type → forced heading(s).
 * These products are ALWAYS classified by function, regardless of material.
 * Derived from GRI 3(a) and HTS Chapter Notes.
 */
interface FunctionRule {
  patterns: string[];
  headings: string[];
  chapter: string;
  rule: string;
  confidence: number;
}

const FUNCTION_OVER_MATERIAL_RULES: FunctionRule[] = [
  // CASES & BAGS → 4202 (Chapter 42) — ANY material
  {
    patterns: [
      'phone case', 'phone cover', 'phone protector',
      'laptop bag', 'laptop case', 'laptop sleeve',
      'camera case', 'camera bag', 'tablet case', 'tablet cover',
      'suitcase', 'luggage', 'travel bag',
      'briefcase', 'messenger bag', 'backpack',
      'handbag', 'purse', 'wallet', 'clutch',
      'pencil case', 'cosmetic bag', 'makeup bag',
      'tool bag', 'tool case',
      'glasses case', 'eyeglass case', 'sunglasses case',
      'watch case', 'jewelry case', 'jewelry box',
      'gun case', 'instrument case', 'violin case', 'guitar case',
      'tote bag', 'duffel bag', 'duffle bag', 'duffel',
      'fanny pack', 'waist bag', 'crossbody bag',
    ],
    headings: ['4202'],
    chapter: '42',
    rule: 'GRI 3(a): Cases and containers for carrying items → 4202',
    confidence: 95,
  },

  // TOYS → 9503 (Chapter 95) — ANY material
  {
    patterns: [
      'toy car', 'toy truck', 'toy train', 'toy airplane',
      'action figure', 'doll', 'stuffed animal', 'plush toy',
      'building blocks', 'lego', 'construction toy',
      'board game', 'puzzle', 'jigsaw',
      'toy gun', 'water gun', 'nerf',
      'play set', 'playset', 'dollhouse',
      'toy robot', 'remote control car', 'rc car',
      'toy soldier', 'figurine',
      "children's toy", 'kids toy',
    ],
    headings: ['9503'],
    chapter: '95',
    rule: 'Chapter 95: Toys and games → 9503',
    confidence: 95,
  },

  // JEWELRY → 7113 (precious) or 7117 (imitation) — ANY material
  {
    patterns: [
      'ring', 'finger ring', 'band ring',
      'necklace', 'pendant', 'chain necklace',
      'bracelet', 'bangle', 'wristband',
      'earring', 'ear ring', 'stud earring',
      'brooch', 'pin badge',
      'anklet', 'ankle bracelet',
      'body jewelry', 'belly ring', 'nose ring',
      'costume jewelry', 'fashion jewelry', 'imitation jewelry',
    ],
    headings: ['7117', '7113'],
    chapter: '71',
    rule: 'Chapter 71: Jewelry/adornment → 7117 (imitation) or 7113 (precious)',
    confidence: 90,
  },

  // FURNITURE → Chapter 94 — ANY material
  {
    patterns: [
      'chair', 'office chair', 'dining chair', 'folding chair',
      'table', 'desk', 'dining table', 'coffee table',
      'bed', 'bed frame', 'bunk bed',
      'sofa', 'couch', 'loveseat', 'futon',
      'shelf', 'bookshelf', 'bookcase', 'shelving unit',
      'cabinet', 'dresser', 'wardrobe', 'nightstand',
      'bench', 'stool', 'bar stool',
    ],
    headings: ['9401', '9403'],
    chapter: '94',
    rule: 'Chapter 94: Furniture → 9401 (seats) or 9403 (other)',
    confidence: 90,
  },

  // LIGHTING → Chapter 85 (electric lamps) or 94 (fixtures) — ANY material
  {
    patterns: [
      'light bulb', 'lightbulb', 'led bulb', 'bulb',
      'lamp', 'table lamp', 'floor lamp', 'desk lamp',
      'ceiling light', 'pendant light', 'chandelier',
      'flashlight', 'torch', 'headlamp',
      'led strip', 'light strip', 'rope light',
      'floodlight', 'spotlight', 'work light',
    ],
    headings: ['8539', '9405'],
    chapter: '85',
    rule: 'Lighting: 8539 (electric lamps) or 9405 (fixtures)',
    confidence: 88,
  },

  // CABLES → 8544 (Chapter 85) — ANY material
  {
    patterns: [
      'usb cable', 'usb-c cable', 'lightning cable',
      'charging cable', 'charger cable',
      'hdmi cable', 'displayport cable',
      'ethernet cable', 'network cable',
      'power cord', 'extension cord',
      'audio cable', 'aux cable',
      'data cable', 'sync cable',
    ],
    headings: ['8544'],
    chapter: '85',
    rule: 'Heading 8544: Insulated wire and cables',
    confidence: 92,
  },

  // MONITORS / DISPLAYS → 8528 — ANY material
  {
    patterns: [
      'monitor', 'computer monitor', 'gaming monitor',
      'television', 'tv', 'smart tv', 'led tv', 'oled tv',
      'display', 'screen',
    ],
    headings: ['8528'],
    chapter: '85',
    rule: 'Heading 8528: Monitors and reception apparatus',
    confidence: 90,
  },

  // FOOTWEAR → Chapter 64 — upper material determines subheading
  {
    patterns: [
      'shoe', 'shoes', 'boot', 'boots', 'sandal', 'sandals',
      'sneaker', 'sneakers', 'slipper', 'slippers',
      'flip flop', 'flip flops', 'clog', 'clogs',
      'loafer', 'loafers', 'mule', 'mules',
      'athletic footwear', 'running shoe',
      'hiking boot', 'rain boot', 'wellington',
    ],
    headings: ['6402', '6403', '6404'],
    chapter: '64',
    rule: 'Chapter 64: Footwear (upper material determines subheading)',
    confidence: 92,
  },

  // EXERCISE / SPORTS EQUIPMENT → 9506 — ANY material
  {
    patterns: [
      'yoga mat', 'exercise mat', 'fitness mat', 'gym mat',
      'resistance band', 'exercise band', 'dumbbell', 'kettlebell',
      'jump rope', 'foam roller', 'exercise ball', 'medicine ball',
      'treadmill', 'stationary bike', 'elliptical',
      'weight plate', 'barbell',
    ],
    headings: ['9506'],
    chapter: '95',
    rule: 'Heading 9506: Exercise and sports equipment',
    confidence: 90,
  },

  // VACUUM INSULATED CONTAINERS → 9617
  {
    patterns: [
      'vacuum flask', 'thermos', 'insulated bottle', 'vacuum insulated',
      'thermal bottle', 'insulated tumbler', 'vacuum cup',
    ],
    headings: ['9617'],
    chapter: '96',
    rule: 'Heading 9617: Vacuum flasks and vessels',
    confidence: 92,
  },

  // BRUSHES → 9603
  {
    patterns: [
      'toothbrush', 'hairbrush', 'paintbrush', 'broom', 'mop',
      'cleaning brush', 'scrub brush',
    ],
    headings: ['9603'],
    chapter: '96',
    rule: 'Heading 9603: Brushes',
    confidence: 88,
  },
];

/**
 * Product-type-to-heading mappings for material-driven products.
 * These are used when no function-over-material rule applies.
 * The heading depends on both product type AND material.
 */
interface ProductHeadingMap {
  patterns: string[];
  /** Headings by material. Key '*' is the default. */
  headingsByMaterial: Record<string, string[]>;
  confidence: number;
}

const PRODUCT_HEADING_MAP: ProductHeadingMap[] = [
  // APPAREL — Knit (Chapter 61)
  {
    patterns: [
      't-shirt', 'tshirt', 'tank top', 'singlet',
      'hoodie', 'sweatshirt', 'sweater', 'pullover', 'cardigan',
      'polo shirt', 'jersey',
    ],
    headingsByMaterial: {
      '*': ['6109', '6110'], // Default: knit t-shirts/sweaters
      'cotton': ['6109'],
      'polyester': ['6109'],
      'wool': ['6110'],
    },
    confidence: 88,
  },
  {
    patterns: ['socks', 'sock', 'stockings', 'tights', 'pantyhose'],
    headingsByMaterial: { '*': ['6115'] },
    confidence: 90,
  },
  {
    patterns: ['underwear', 'boxer', 'brief', 'panties', 'bra', 'undershirt'],
    headingsByMaterial: { '*': ['6107', '6108', '6212'] },
    confidence: 85,
  },

  // APPAREL — Woven (Chapter 62)
  {
    patterns: ['dress shirt', 'button shirt', 'blouse'],
    headingsByMaterial: {
      '*': ['6205', '6206'],
      'cotton': ['6205'],
      'polyester': ['6205'],
      'silk': ['6206'],
    },
    confidence: 85,
  },
  {
    patterns: ['pants', 'trousers', 'jeans', 'shorts', 'chinos'],
    headingsByMaterial: { '*': ['6203', '6204'] },
    confidence: 85,
  },
  {
    patterns: ['jacket', 'coat', 'blazer', 'overcoat', 'parka', 'windbreaker'],
    headingsByMaterial: { '*': ['6201', '6202'] },
    confidence: 85,
  },
  {
    patterns: ['dress', 'skirt', 'gown'],
    headingsByMaterial: { '*': ['6204'] },
    confidence: 85,
  },
  {
    patterns: ['suit', 'ensemble'],
    headingsByMaterial: { '*': ['6203', '6204'] },
    confidence: 83,
  },

  // TEXTILE HOME GOODS (Chapter 63)
  {
    patterns: ['blanket', 'throw blanket', 'fleece blanket'],
    headingsByMaterial: { '*': ['6301'] },
    confidence: 88,
  },
  {
    patterns: ['towel', 'bath towel', 'hand towel', 'kitchen towel'],
    headingsByMaterial: { '*': ['6302'] },
    confidence: 88,
  },
  {
    patterns: ['bed sheet', 'bed linen', 'fitted sheet', 'flat sheet', 'pillowcase'],
    headingsByMaterial: { '*': ['6302'] },
    confidence: 88,
  },
  {
    patterns: ['curtain', 'drape', 'window treatment', 'blind'],
    headingsByMaterial: { '*': ['6303'] },
    confidence: 85,
  },

  // HOUSEHOLD ITEMS — Material-dependent
  {
    patterns: ['planter', 'flower pot', 'plant pot'],
    headingsByMaterial: {
      '*': ['6914', '3924'],  // Default: ceramic or plastic
      'plastic': ['3924'],
      'ceramic': ['6914'],
      'terracotta': ['6914'],
      'glass': ['7013'],
      'metal': ['7326'],
      'steel': ['7323'],
      'wood': ['4419'],
    },
    confidence: 80,
  },
  {
    patterns: ['cup', 'mug', 'drinking cup'],
    headingsByMaterial: {
      '*': ['6912', '3924', '7323'],
      'ceramic': ['6912'],
      'glass': ['7013'],
      'plastic': ['3924'],
      'steel': ['7323'],
      'stainless': ['7323'],
    },
    confidence: 78,
  },
  {
    patterns: ['bottle', 'water bottle'],
    headingsByMaterial: {
      '*': ['3923', '7010', '7612'],
      'plastic': ['3923'],
      'glass': ['7010'],
      'aluminum': ['7612'],
      'steel': ['7310'],
      'stainless': ['7310'],
    },
    confidence: 78,
  },
  {
    patterns: ['plate', 'dish', 'bowl'],
    headingsByMaterial: {
      '*': ['6912', '3924', '7323'],
      'ceramic': ['6912'],
      'porcelain': ['6912'],
      'glass': ['7013'],
      'plastic': ['3924'],
      'steel': ['7323'],
      'wood': ['4419'],
    },
    confidence: 78,
  },

  // ELECTRONICS
  {
    patterns: ['phone', 'smartphone', 'mobile phone', 'cellular phone'],
    headingsByMaterial: { '*': ['8517'] },
    confidence: 92,
  },
  {
    patterns: ['laptop', 'notebook computer', 'computer', 'desktop computer', 'server'],
    headingsByMaterial: { '*': ['8471'] },
    confidence: 90,
  },
  {
    patterns: ['headphone', 'earphone', 'earbud', 'earbuds', 'speaker', 'bluetooth speaker'],
    headingsByMaterial: { '*': ['8518'] },
    confidence: 90,
  },
  {
    patterns: ['battery', 'power bank', 'lithium battery'],
    headingsByMaterial: { '*': ['8506', '8507'] },
    confidence: 85,
  },
  {
    patterns: ['charger', 'power adapter', 'power supply', 'ac adapter'],
    headingsByMaterial: { '*': ['8504'] },
    confidence: 85,
  },
  {
    patterns: ['printer', '3d printer', 'laser printer', 'inkjet printer'],
    headingsByMaterial: { '*': ['8443'] },
    confidence: 88,
  },

  // CAMERAS
  {
    patterns: ['camera', 'digital camera', 'webcam', 'camcorder', 'action camera'],
    headingsByMaterial: { '*': ['9006'] },
    confidence: 88,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MATERIAL DETECTION (lightweight, no AI call)
// ═══════════════════════════════════════════════════════════════════════════════

const MATERIAL_KEYWORDS: Record<string, string> = {
  'cotton': 'cotton',
  'polyester': 'polyester',
  'nylon': 'nylon',
  'wool': 'wool',
  'silk': 'silk',
  'linen': 'linen',
  'plastic': 'plastic',
  'silicone': 'silicone',
  'rubber': 'rubber',
  'latex': 'latex',
  'steel': 'steel',
  'stainless steel': 'stainless',
  'stainless': 'stainless',
  'iron': 'iron',
  'aluminum': 'aluminum',
  'aluminium': 'aluminum',
  'copper': 'copper',
  'brass': 'brass',
  'bronze': 'bronze',
  'glass': 'glass',
  'crystal': 'glass',
  'ceramic': 'ceramic',
  'porcelain': 'ceramic',
  'terracotta': 'terracotta',
  'earthenware': 'ceramic',
  'wood': 'wood',
  'bamboo': 'bamboo',
  'leather': 'leather',
  'synthetic leather': 'leather',
  'faux leather': 'leather',
  'fleece': 'polyester',
  'acrylic': 'acrylic',
  'rayon': 'rayon',
  'spandex': 'spandex',
};

function detectMaterialFast(description: string): string | null {
  const descLower = description.toLowerCase();
  
  // Check multi-word materials first (longest match)
  const sortedMaterials = Object.entries(MATERIAL_KEYWORDS)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [keyword, material] of sortedMaterials) {
    if (descLower.includes(keyword)) {
      return material;
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HEADING CLASSIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Predict the top HTS headings (4-digit) for a product description.
 * 
 * This is Phase 0 of the classification pipeline — it runs BEFORE search
 * and constrains which headings the engine searches within.
 * 
 * @param description - Product description
 * @param options - Optional material hint and SetFit toggle
 * @returns Heading predictions with confidence scores
 */
export async function predictHeadings(
  description: string,
  options: {
    material?: string;
    useSetFit?: boolean;
    useAI?: boolean;
  } = {}
): Promise<HeadingClassifierResult> {
  const startTime = Date.now();
  const descLower = description.toLowerCase();
  
  // Detect material from description or explicit input
  const detectedMaterial = options.material || detectMaterialFast(description);
  
  // Get chapter exclusion rules
  const excludedChapters = getExcludedChapters(description);
  const preferredFromExclusions = getPreferredChapters(description);
  
  const predictions: HeadingPrediction[] = [];
  let method: HeadingClassifierResult['method'] = 'deterministic';
  let isFunctionDriven = false;
  let functionRule: string | null = null;
  let detectedProductType: string | null = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // TIER 1: DETERMINISTIC — Pattern matching (fastest, ~1-5ms)
  // ─────────────────────────────────────────────────────────────────────────────

  // Check function-over-material rules first (highest priority)
  for (const rule of FUNCTION_OVER_MATERIAL_RULES) {
    const matchedPattern = rule.patterns.find(p => descLower.includes(p));
    if (matchedPattern) {
      isFunctionDriven = true;
      functionRule = rule.rule;
      detectedProductType = matchedPattern;

      for (const heading of rule.headings) {
        predictions.push({
          heading,
          chapter: heading.slice(0, 2),
          headingConfidence: rule.confidence,
          reason: rule.rule,
          source: 'deterministic',
        });
      }
      
      console.log(`[HeadingClassifier] Function-over-material: "${matchedPattern}" → ${rule.headings.join(', ')} (${rule.confidence}%)`);
      break; // First match wins for function rules
    }
  }

  // If no function rule matched, try product-heading maps
  if (predictions.length === 0) {
    // Sort by pattern length (longest first) for specificity
    const sortedMaps = [...PRODUCT_HEADING_MAP].sort((a, b) => {
      const aMax = Math.max(...a.patterns.map(p => p.length));
      const bMax = Math.max(...b.patterns.map(p => p.length));
      return bMax - aMax;
    });

    for (const map of sortedMaps) {
      const matchedPattern = map.patterns.find(p => descLower.includes(p));
      if (matchedPattern) {
        detectedProductType = matchedPattern;
        
        // Get headings based on material
        const materialKey = detectedMaterial || '*';
        const headings = map.headingsByMaterial[materialKey] || map.headingsByMaterial['*'] || [];
        
        for (const heading of headings) {
          // Skip headings in excluded chapters
          const headingChapter = heading.slice(0, 2);
          if (excludedChapters.has(headingChapter)) {
            console.log(`[HeadingClassifier] Skipping ${heading} — Chapter ${headingChapter} excluded by rule`);
            continue;
          }
          
          predictions.push({
            heading,
            chapter: headingChapter,
            headingConfidence: map.confidence,
            reason: `Product "${matchedPattern}" ${detectedMaterial ? `(${detectedMaterial})` : ''} → heading ${heading}`,
            source: 'deterministic',
          });
        }
        
        console.log(`[HeadingClassifier] Product type: "${matchedPattern}" → ${headings.join(', ')} (${map.confidence}%)`);
        break; // First match wins
      }
    }
  }

  // Add predictions from exclusion rules (if not already represented)
  for (const preferred of preferredFromExclusions) {
    const alreadyPredicted = predictions.some(p => 
      p.chapter === preferred.chapter || 
      (preferred.heading && p.heading === preferred.heading)
    );
    
    if (!alreadyPredicted && preferred.heading) {
      predictions.push({
        heading: preferred.heading,
        chapter: preferred.chapter,
        headingConfidence: preferred.confidence,
        reason: `Exclusion rule redirect → ${preferred.heading}`,
        source: 'exclusion_rule',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TIER 2: SETFIT — ML model heading prediction (~50-100ms)
  // Only used if deterministic prediction is low-confidence or absent
  // ─────────────────────────────────────────────────────────────────────────────

  const bestDeterministicConfidence = predictions.length > 0 
    ? Math.max(...predictions.map(p => p.headingConfidence))
    : 0;

  const useSetFit = options.useSetFit !== false;
  
  if (useSetFit && bestDeterministicConfidence < CONSTRAIN_THRESHOLD) {
    try {
      console.log('[HeadingClassifier] Trying SetFit heading prediction...');
      const setfitResult = await classifyWithSetFit(description);
      
      if (setfitResult && setfitResult.predictions[0]) {
        const predictedCode = setfitResult.predictions[0].code;
        const predictedHeading = predictedCode.slice(0, 4);
        const predictedChapter = predictedCode.slice(0, 2);
        const setfitConfidence = Math.round(setfitResult.predictions[0].confidence * 100);
        
        // Only use SetFit if it's not in an excluded chapter
        if (!excludedChapters.has(predictedChapter) && setfitConfidence >= SETFIT_HEADING_CONFIDENCE) {
          // Check if this heading is already predicted
          const existingPrediction = predictions.find(p => p.heading === predictedHeading);
          
          if (existingPrediction) {
            // Boost existing prediction confidence if SetFit agrees
            existingPrediction.headingConfidence = Math.min(98,
              Math.max(existingPrediction.headingConfidence, setfitConfidence)
            );
            existingPrediction.reason += ` (confirmed by SetFit: ${setfitConfidence}%)`;
          } else {
            predictions.push({
              heading: predictedHeading,
              chapter: predictedChapter,
              headingConfidence: setfitConfidence,
              reason: `SetFit ML prediction → ${predictedHeading} (${setfitConfidence}%)`,
              source: 'setfit',
            });
          }
          
          method = predictions.some(p => p.source === 'deterministic') ? 'mixed' : 'setfit';
          console.log(`[HeadingClassifier] SetFit predicted heading ${predictedHeading} (${setfitConfidence}%)`);
        } else if (excludedChapters.has(predictedChapter)) {
          console.log(`[HeadingClassifier] SetFit predicted ${predictedHeading} but Chapter ${predictedChapter} is excluded`);
        }
      }
    } catch (error) {
      console.log('[HeadingClassifier] SetFit unavailable:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TIER 3: AI FALLBACK — xAI/Grok heading prediction (~500ms)
  // Only used if we still have no high-confidence prediction
  // ─────────────────────────────────────────────────────────────────────────────

  const bestConfidenceAfterSetFit = predictions.length > 0
    ? Math.max(...predictions.map(p => p.headingConfidence))
    : 0;

  const useAI = options.useAI !== false;
  
  if (useAI && bestConfidenceAfterSetFit < CONSTRAIN_THRESHOLD && predictions.length < 3) {
    try {
      console.log('[HeadingClassifier] Using AI fallback for heading prediction...');
      const aiPredictions = await predictHeadingsWithAI(description, detectedMaterial);
      
      for (const aiPred of aiPredictions) {
        // Skip headings in excluded chapters
        if (excludedChapters.has(aiPred.chapter)) continue;
        
        // Check if already predicted
        const existingPrediction = predictions.find(p => p.heading === aiPred.heading);
        if (existingPrediction) {
          existingPrediction.headingConfidence = Math.min(98,
            Math.max(existingPrediction.headingConfidence, aiPred.headingConfidence)
          );
          existingPrediction.reason += ` (confirmed by AI)`;
        } else {
          predictions.push(aiPred);
        }
      }
      
      method = 'ai';
    } catch (error) {
      console.error('[HeadingClassifier] AI fallback error:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SORT & LIMIT
  // ─────────────────────────────────────────────────────────────────────────────

  // Sort by confidence descending
  predictions.sort((a, b) => b.headingConfidence - a.headingConfidence);
  
  // Keep top 3
  const topPredictions = predictions.slice(0, 3);
  
  // Calculate overall heading confidence (best prediction)
  const headingConfidence = topPredictions.length > 0 ? topPredictions[0].headingConfidence : 0;
  
  // Determine if we should constrain the search
  const shouldConstrain = headingConfidence >= CONSTRAIN_THRESHOLD;
  
  const timing = Date.now() - startTime;
  console.log(`[HeadingClassifier] ${topPredictions.length} predictions in ${timing}ms, shouldConstrain=${shouldConstrain}, confidence=${headingConfidence}%`);
  
  return {
    predictions: topPredictions,
    shouldConstrain,
    excludedChapters,
    headingConfidence,
    timing,
    method,
    detected: {
      productType: detectedProductType,
      material: detectedMaterial,
      isFunctionDriven,
      functionRule,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI HEADING PREDICTION (Tier 3 — only when needed)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Use AI (xAI/Grok) to predict the most likely HTS heading for a product.
 * This is the slowest tier but handles unknown/unusual product types.
 */
async function predictHeadingsWithAI(
  description: string,
  detectedMaterial: string | null,
): Promise<HeadingPrediction[]> {
  const xai = getXAIClient();
  
  const prompt = `You are a US Customs classification expert. Identify the top 3 most likely HTS HEADINGS (4-digit codes) for this product.

PRODUCT: "${description}"
${detectedMaterial ? `MATERIAL: ${detectedMaterial}` : ''}

RULES:
- Function-over-material: classify by FUNCTION first, material second
- Cases/bags → 4202 regardless of material
- Toys → 9503 regardless of material  
- Jewelry/adornment → 7117 (imitation) or 7113 (precious) regardless of material
- Furniture → 9401-9403 regardless of material
- Footwear → 6402-6404 regardless of material
- Exercise equipment → 9506 regardless of material
- For apparel: knit → Ch61, woven → Ch62

Return ONLY valid JSON array:
[
  {"heading": "XXXX", "confidence": 85, "reason": "brief reason"},
  {"heading": "YYYY", "confidence": 60, "reason": "alternative reason"},
  {"heading": "ZZZZ", "confidence": 40, "reason": "another possibility"}
]`;

  try {
    const response = await xai.chat.completions.create({
      model: 'grok-3-mini',
      messages: [
        { role: 'system', content: 'You are an HTS classification expert. Return ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });
    
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      heading: string;
      confidence: number;
      reason: string;
    }>;
    
    return parsed.slice(0, 3).map(p => ({
      heading: p.heading.replace(/\./g, ''),
      chapter: p.heading.replace(/\./g, '').slice(0, 2),
      headingConfidence: Math.min(85, p.confidence), // Cap AI confidence at 85
      reason: `AI: ${p.reason}`,
      source: 'ai' as const,
    }));
  } catch (error) {
    console.error('[HeadingClassifier] AI prediction error:', error);
    return [];
  }
}
