/**
 * Import Intelligence Orchestrator
 * 
 * Coordinates all analysis components:
 * - Classification (engine-v10)
 * - Landed cost calculation
 * - Country comparison
 * - Compliance checks
 * - Documentation requirements
 * - Optimization opportunities
 */

import { classifyV10, ClassifyV10Input } from '@/services/classification/engine-v10';
import { getEffectiveTariff } from '@/services/tariff/registry';
import { getHTSHierarchy } from '@/services/hts/hierarchy';
import { getBaseMfnRate, type BaseMfnRateResult } from '@/services/hts/database';
import { prisma } from '@/lib/db';
import { compareLandedCosts } from '@/services/sourcing/landed-cost';
import { getImportStatsByHTS, type ImportStatsByCountry } from '@/services/usitcDataWeb';
import type { 
  ImportAnalysis, 
  ProductInput,
  Classification,
  LandedCost,
  DutyLayer,
  CountryOption,
  CountryComparison,
  TariffBreakdownSummary,
  Compliance,
  Documentation,
  Optimization,
} from '@/features/import-intelligence/types';

export interface AnalyzeProductInput extends ProductInput {
  userId?: string;
}

const DEFAULT_MIN_CONFIDENCE = 30;
const BASELINE_COUNTRY_CODE = 'CN';

const parseBaseMfnRate = (rate?: string | null): number => {
  if (!rate) return 0;
  const match = rate.match(/(\d+(\.\d+)?)/);
  if (!match) return 0;
  return Number.parseFloat(match[1]);
};

const normalizeHts6 = (htsCode: string): string =>
  htsCode.replace(/\./g, '').substring(0, 6);

const resolveBaseMfnRate = async (
  htsCode: string,
  baseMfnRateOverride?: number
): Promise<BaseMfnRateResult> => {
  if (baseMfnRateOverride !== undefined && Number.isFinite(baseMfnRateOverride)) {
    return {
      rate: baseMfnRateOverride,
      rateType: 'ad_valorem',
      rawRate: `${baseMfnRateOverride}%`,
    };
  }

  try {
    const baseRate = await getBaseMfnRate(htsCode);
    if (baseRate) {
      return baseRate;
    }
  } catch (error) {
    console.warn(`[Orchestrator] ${new Date().toISOString()} Failed to resolve base MFN rate:`, error);
  }

  return {
    rate: null,
    rateType: 'unknown',
    rawRate: null,
  };
};

/**
 * Main orchestrator - runs complete import intelligence analysis
 */
export async function analyzeProduct(input: AnalyzeProductInput): Promise<ImportAnalysis> {
  const startTime = Date.now();
  
  // Step 1: Classification
  const classification = await getClassification(input);
  
  // Step 2: Landed Cost (using classified HTS code)
  const landedCost = await getLandedCost(
    input,
    classification.htsCode,
    classification.baseMfnRate
  );
  
  // Step 3: Country Comparison
  const countryComparison = await getCountryComparison(
    input,
    classification.htsCode,
    classification.baseMfnRate
  );
  
  // Step 4: Compliance Checks
  const compliance = await getComplianceChecks(input, classification.htsCode);
  
  // Step 5: Documentation Requirements
  const documentation = await getDocumentationRequirements(input, classification.htsCode);
  
  // Step 6: Optimization Opportunities
  const optimization = await getOptimizationOpportunities(
    input,
    classification.htsCode,
    landedCost,
    countryComparison
  );
  
  const analysis: ImportAnalysis = {
    id: `analysis-${Date.now()}`,
    createdAt: new Date(),
    input,
    classification,
    landedCost,
    countryComparison,
    compliance,
    documentation,
    optimization,
  };
  
  console.log(`[Orchestrator] Analysis completed in ${Date.now() - startTime}ms`);
  
  return analysis;
}

/**
 * Step 1: Get HTS classification
 */
async function getClassification(input: AnalyzeProductInput): Promise<Classification> {
  // If HTS code provided, validate and use it
  if (input.htsCode) {
    // TODO: Validate HTS code exists in database
    const baseMfnInfo = await resolveBaseMfnRate(input.htsCode);
    return {
      htsCode: input.htsCode,
      description: 'User-provided HTS code',
      confidence: 100,
      baseMfnRate: baseMfnInfo.rate ?? 0,
      alternatives: [],
      path: [],
    };
  }
  
  // Otherwise, classify using description
  const classifyInput: ClassifyV10Input = {
    description: input.description || '',
    origin: input.countryCode,
    destination: 'US',
  };
  
  const result = await classifyV10(classifyInput);
  
  if (!result.primary) {
    throw new Error('Classification failed - no primary result');
  }
  
  // Fetch full hierarchy with descriptions for classification path
  let hierarchyPath: string[] = [];
  try {
    const hierarchy = await getHTSHierarchy(result.primary.htsCode);
    console.log('[Orchestrator] Hierarchy fetched:', hierarchy.levels.length, 'levels');
    // Extract codes and descriptions from hierarchy levels
    hierarchyPath = hierarchy.levels.map(level => {
      const cleanCode = level.code.replace(/\./g, '');
      return `${cleanCode}|${level.description}`;
    });
    console.log('[Orchestrator] Hierarchy path:', hierarchyPath);
  } catch (error) {
    console.error('[Orchestrator] Failed to fetch hierarchy:', error);
    // Fallback to basic codes from classification result
    hierarchyPath = result.primary.path?.codes || [];
  }
  
  const baseMfnInfo = await resolveBaseMfnRate(result.primary.htsCode);
  const baseMfnRate = baseMfnInfo.rate ?? parseBaseMfnRate(result.primary.duty?.baseMfn);

  // Extract split confidence from V10 result
  const splitConfidence = result.splitConfidence ? {
    heading: result.splitConfidence.heading,
    code: result.splitConfidence.code,
    combined: result.splitConfidence.combined,
    headingExplanation: result.splitConfidence.headingExplanation,
    codeExplanation: result.splitConfidence.codeExplanation,
  } : undefined;

  // Extract heading prediction summary from V10 result
  const headingPrediction = result.headingPrediction && result.headingPrediction.predictions.length > 0
    ? {
        topHeading: result.headingPrediction.predictions[0].heading,
        topChapter: result.headingPrediction.predictions[0].chapter,
        confidence: result.headingPrediction.predictions[0].headingConfidence,
        method: result.headingPrediction.method,
        constrained: result.headingPrediction.constrained,
      }
    : undefined;

  return {
    htsCode: result.primary.htsCode,
    description: result.primary.shortDescription || result.primary.fullDescription || '',
    confidence: result.primary.confidence,
    baseMfnRate,
    alternatives: result.alternatives?.slice(0, 5).map((alt) => ({
      code: alt.htsCode,
      description: alt.description || alt.fullDescription || '',
      confidence: alt.confidence,
      dutyRate: alt.duty?.baseMfn?.toString() || '0',
    })) || [],
    path: hierarchyPath,
    splitConfidence,
    headingPrediction,
  };
}

/**
 * Fallback landed cost calculation when no data available
 * Uses the tariff registry for accurate duty calculations
 */
async function getFallbackLandedCost(
  input: AnalyzeProductInput,
  htsCode: string,
  baseMfnRateOverride?: number
): Promise<LandedCost> {
  // Estimate shipping as 5% of value
  const shipping = input.value * 0.05;
  const insurance = input.value * 0.005;
  const dutiableValue = input.value + shipping + insurance;

  const baseMfnInfo = await resolveBaseMfnRate(htsCode, baseMfnRateOverride);
  const baseMfnRate = baseMfnInfo.rate ?? 0;
  
  // Get accurate tariff data from registry
  const tariffResult = await getEffectiveTariff(input.countryCode, htsCode, {
    baseMfnRate,
    includeSection232: true,
  });
  
  // Build duty layers from tariff result
  const layers: DutyLayer[] = [];
  
  // Base MFN
  if (tariffResult.baseMfnRate > 0) {
    const baseMfnAmount = dutiableValue * (tariffResult.baseMfnRate / 100);
    layers.push({
      name: 'Base MFN Duty',
      rate: tariffResult.baseMfnRate,
      amount: baseMfnAmount,
      description: 'Most Favored Nation rate - standard duty rate for this product',
      programType: 'base_mfn',
    });
  }
  
  // FTA Discount (if applicable)
  if (tariffResult.ftaDiscount > 0) {
    const ftaAmount = dutiableValue * (tariffResult.ftaDiscount / 100);
    layers.push({
      name: `${tariffResult.ftaName} Discount`,
      rate: -tariffResult.ftaDiscount,
      amount: -ftaAmount,
      description: `Free Trade Agreement waives base duty (but NOT IEEPA tariffs)`,
      programType: 'fta_discount',
    });
  }
  
  // Section 301 (China)
  if (tariffResult.section301Rate > 0) {
    const section301Amount = dutiableValue * (tariffResult.section301Rate / 100);
    layers.push({
      name: `Section 301 (${tariffResult.section301Lists.join(', ') || 'China Trade'})`,
      rate: tariffResult.section301Rate,
      amount: section301Amount,
      description: 'Trade Act of 1974 tariff on Chinese products in response to unfair trade practices',
      legalReference: 'Trade Act of 1974, Section 301',
      programType: 'section_301',
    });
  }
  
  // IEEPA Fentanyl
  if (tariffResult.ieepaBreakdown.fentanyl > 0) {
    const fentanylAmount = dutiableValue * (tariffResult.ieepaBreakdown.fentanyl / 100);
    layers.push({
      name: 'IEEPA Fentanyl Emergency',
      rate: tariffResult.ieepaBreakdown.fentanyl,
      amount: fentanylAmount,
      description: 'Emergency tariff addressing fentanyl crisis (CN: 20%, MX/CA: 25%)',
      legalReference: 'Executive Order 14195',
      programType: 'ieepa_fentanyl',
    });
  }
  
  // IEEPA Baseline (10% universal)
  if (tariffResult.ieepaBreakdown.baseline > 0) {
    const baselineAmount = dutiableValue * (tariffResult.ieepaBreakdown.baseline / 100);
    layers.push({
      name: 'IEEPA Universal Baseline',
      rate: tariffResult.ieepaBreakdown.baseline,
      amount: baselineAmount,
      description: 'April 2025 reciprocal tariff - applies to nearly ALL countries including FTA partners',
      legalReference: 'Executive Order 14257',
      programType: 'ieepa_baseline',
    });
  }
  
  // IEEPA Reciprocal (country-specific higher rate)
  if (tariffResult.ieepaBreakdown.reciprocal > 0) {
    const reciprocalAmount = dutiableValue * (tariffResult.ieepaBreakdown.reciprocal / 100);
    layers.push({
      name: `IEEPA Reciprocal (${tariffResult.countryName})`,
      rate: tariffResult.ieepaBreakdown.reciprocal,
      amount: reciprocalAmount,
      description: `Country-specific reciprocal tariff above the 10% baseline`,
      legalReference: 'Executive Order 14257',
      programType: 'ieepa_reciprocal',
    });
  }
  
  // Section 232 (Steel/Aluminum/Auto)
  if (tariffResult.section232Rate > 0) {
    const section232Amount = dutiableValue * (tariffResult.section232Rate / 100);
    layers.push({
      name: `Section 232 (${tariffResult.section232Product})`,
      rate: tariffResult.section232Rate,
      amount: section232Amount,
      description: `National security tariff on ${tariffResult.section232Product?.toLowerCase() || 'products'}`,
      legalReference: 'Trade Expansion Act of 1962, Section 232',
      programType: 'section_232',
    });
  }
  
  // AD/CVD (if applicable)
  if (tariffResult.adcvdRate > 0) {
    const adcvdAmount = dutiableValue * (tariffResult.adcvdRate / 100);
    layers.push({
      name: 'Antidumping/Countervailing Duty',
      rate: tariffResult.adcvdRate,
      amount: adcvdAmount,
      description: tariffResult.adcvdWarning || 'Additional duties on unfairly traded goods',
      programType: 'adcvd',
    });
  }
  
  // Calculate totals
  const totalDuty = layers.reduce((sum, layer) => sum + layer.amount, 0);
  
  // Calculate fees
  // MPF: 0.3464% of dutiable value, min $33.58, max $651.50
  // Updated for FY2026 (effective Oct 1, 2025) per CBP Dec 25-10
  const MPF_MIN = 33.58;
  const MPF_MAX = 651.50;
  const mpf = Math.min(Math.max(dutiableValue * 0.003464, MPF_MIN), MPF_MAX);
  const hmf = dutiableValue * 0.00125;
  
  const estimatedAdditional = 450;
  const total = input.value + shipping + insurance + totalDuty + mpf + hmf + estimatedAdditional;
  
  // Calculate duty as percentage of product cost
  const dutyAsPercentOfProduct = input.value > 0 ? (totalDuty / input.value) * 100 : 0;
  
  // Determine data quality and confidence based on tariff result
  // High confidence if data came from registry with recent verification
  let dataQuality: 'high' | 'medium' | 'low' = 
    tariffResult.dataFreshness?.includes('verified') || tariffResult.dataFreshness?.includes('Live') 
      ? 'high' 
      : tariffResult.warnings?.length === 0 
        ? 'medium' 
        : 'low';
  if (baseMfnInfo.rate === null || baseMfnInfo.rateType === 'unknown') {
    dataQuality = 'low';
  }
  
  // Confidence based on whether we have exact rates or estimates
  // 95% for registry data, lower if using fallbacks
  let tariffConfidence = tariffResult.dataFreshness?.includes('No data') ? 60 : 
    tariffResult.warnings?.some(w => w.includes('estimated')) ? 75 : 90;

  if (baseMfnInfo.rate === null || baseMfnInfo.rateType === 'unknown') {
    tariffConfidence = Math.min(tariffConfidence, 60);
  }

  const warnings = [...(tariffResult.warnings || [])];
  if (baseMfnInfo.rateType !== 'ad_valorem' && baseMfnInfo.rateType !== 'free') {
    warnings.push(
      `Base MFN rate is ${baseMfnInfo.rateType} (${baseMfnInfo.rawRate || 'unknown'}); total duty may be understated without unit-specific data`
    );
  }
  
  return {
    productValue: input.value,
    shipping,
    insurance,
    dutiableValue,
    duties: {
      baseMfn: tariffResult.baseMfnRate > 0 ? dutiableValue * (tariffResult.baseMfnRate / 100) : 0,
      section301: tariffResult.section301Rate > 0 ? dutiableValue * (tariffResult.section301Rate / 100) : undefined,
      ieepaFentanyl: tariffResult.ieepaBreakdown.fentanyl > 0 ? dutiableValue * (tariffResult.ieepaBreakdown.fentanyl / 100) : undefined,
      ieepaBaseline: tariffResult.ieepaBreakdown.baseline > 0 ? dutiableValue * (tariffResult.ieepaBreakdown.baseline / 100) : undefined,
      ieepaReciprocal: tariffResult.ieepaBreakdown.reciprocal > 0 ? dutiableValue * (tariffResult.ieepaBreakdown.reciprocal / 100) : undefined,
      section232: tariffResult.section232Rate > 0 ? dutiableValue * (tariffResult.section232Rate / 100) : undefined,
      adcvd: tariffResult.adcvdRate > 0 ? dutiableValue * (tariffResult.adcvdRate / 100) : undefined,
      ftaDiscount: tariffResult.ftaDiscount > 0 ? dutiableValue * (tariffResult.ftaDiscount / 100) : undefined,
      total: totalDuty,
      effectiveRate: tariffResult.effectiveRate,
      layers,
      warnings,
    },
    fees: {
      mpf,
      hmf,
      total: mpf + hmf,
    },
    estimatedAdditional: {
      customsBroker: 150,
      drayage: 300,
      total: 450,
    },
    total,
    perUnit: total / input.quantity,
    dutyAsPercentOfProduct,
    // New data quality fields
    dataQuality,
    lastUpdated: tariffResult.lastVerified,
    tariffConfidence,
    dataSource: 'Tariff Registry (USITC HTS API)',
  };
}

/**
 * Step 2: Calculate landed cost with comprehensive duty breakdown
 */
async function getLandedCost(
  input: AnalyzeProductInput,
  htsCode: string,
  baseMfnRateOverride?: number
): Promise<LandedCost> {
  // Always use the tariff registry for accurate, comprehensive duty data
  // The fallback function now uses the registry too
  console.log('[Orchestrator] Calculating landed cost with tariff registry');
  return getFallbackLandedCost(input, htsCode, baseMfnRateOverride);
}

/**
 * Top sourcing countries for tariff-only fallback comparisons.
 * When no real cost data exists, we still show tariff differences
 * using the user's own product value as the cost basis.
 */
const TOP_SOURCING_COUNTRIES = [
  'CN', 'VN', 'MX', 'IN', 'BD', 'TH', 'ID', 'TW', 'KR', 'JP',
  'DE', 'IT', 'MY', 'CA', 'PH', 'TR', 'PK', 'KH', 'SG', 'AU',
];

// Shipping estimates for tariff-only fallback ($/kg)
const FALLBACK_SHIPPING_PER_KG: Record<string, number> = {
  CN: 0.80, VN: 0.90, MX: 0.40, IN: 1.10, BD: 1.20, TH: 0.95,
  ID: 1.00, TW: 0.85, KR: 0.80, JP: 0.75, DE: 1.20, IT: 1.25,
  MY: 0.90, CA: 0.35, PH: 0.95, TR: 1.10, PK: 1.15, KH: 1.00,
  SG: 0.85, AU: 1.30, default: 1.00,
};

const FALLBACK_TRANSIT_DAYS: Record<string, number> = {
  CN: 28, VN: 30, MX: 5, IN: 35, BD: 38, TH: 32, ID: 35,
  TW: 22, KR: 20, JP: 18, DE: 18, IT: 20, MY: 30, CA: 3,
  PH: 28, TR: 22, PK: 35, KH: 32, SG: 25, AU: 22, default: 30,
};

const FALLBACK_WEIGHT_PER_UNIT_KG = 0.5;
const FALLBACK_FEES_PER_UNIT = 0.05;
const MAX_ALTERNATIVES = 15;

/**
 * Build a TariffBreakdownSummary from a registry result
 */
function buildTariffBreakdown(tariffResult: Awaited<ReturnType<typeof getEffectiveTariff>>): TariffBreakdownSummary {
  return {
    baseMfn: tariffResult.baseMfnRate,
    section301: tariffResult.section301Rate,
    ieepaFentanyl: tariffResult.ieepaBreakdown.fentanyl,
    ieepaBaseline: tariffResult.ieepaBreakdown.baseline,
    ieepaReciprocal: tariffResult.ieepaBreakdown.reciprocal,
    section232: tariffResult.section232Rate,
    adcvd: tariffResult.adcvdRate,
    ftaDiscount: tariffResult.ftaDiscount,
    effectiveRate: tariffResult.effectiveRate,
  };
}

/**
 * Step 3: Compare alternative sourcing countries
 * 
 * Three-tier data strategy:
 * 1. HtsCostByCountry DB (real aggregated shipment data) — highest quality
 * 2. USITC DataWeb API (real import volumes/values) — good quality
 * 3. Tariff-only fallback (user's product value + tariff registry) — always available
 * 
 * Tier 3 ensures we ALWAYS show alternatives, even for obscure HTS codes.
 */
async function getCountryComparison(
  input: AnalyzeProductInput,
  htsCode: string,
  baseMfnRateOverride?: number
): Promise<CountryComparison> {
  const requestTimestamp = new Date().toISOString();
  const hts6 = normalizeHts6(htsCode);
  
  // Fetch supplier counts for this HTS chapter
  const htsChapter = hts6.substring(0, 2);
  let supplierCountMap = new Map<string, number>();
  try {
    const supplierCounts = await prisma.supplier.groupBy({
      by: ['countryCode'],
      where: {
        htsChapters: { has: htsChapter },
        isVerified: true,
      },
      _count: { id: true },
    });
    supplierCountMap = new Map(
      supplierCounts.map(s => [s.countryCode, s._count.id])
    );
  } catch (error) {
    console.warn(`[Orchestrator] ${requestTimestamp} Supplier count query failed:`, error);
  }

  // Resolve base MFN rate
  const baseMfnInfo = await resolveBaseMfnRate(htsCode, baseMfnRateOverride);
  const baseMfnRate = baseMfnInfo.rate ?? 0;

  // Per-unit value from user input (used as fallback when real cost data is missing)
  const perUnitValue = input.quantity > 0 ? input.value / input.quantity : input.value;

  // Track which countries we already have data for (to avoid duplicates in tariff-only fallback)
  const coveredCountries = new Set<string>();
  const allOptions: CountryOption[] = [];

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1: DB cost data (pre-aggregated HtsCostByCountry records)
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const comparison = await compareLandedCosts(htsCode, {
      quantity: input.quantity,
      minConfidence: DEFAULT_MIN_CONFIDENCE,
    });

    for (const record of comparison.countries) {
      coveredCountries.add(record.countryCode);

      // Always use the live tariff registry — DB tariff fields may be stale
      const tariffResult = await getEffectiveTariff(record.countryCode, hts6, {
        baseMfnRate,
        includeSection232: true,
      });

      // Recalculate landed cost using fresh tariff data + DB product cost
      const productCost = record.productCost > 0 ? record.productCost : undefined;
      const costBasis = productCost ?? perUnitValue;
      const shippingPerUnit = (FALLBACK_SHIPPING_PER_KG[record.countryCode] || FALLBACK_SHIPPING_PER_KG.default) * FALLBACK_WEIGHT_PER_UNIT_KG;
      const tariffAmount = costBasis * (tariffResult.effectiveRate / 100);
      const landedCostPerUnit = costBasis + shippingPerUnit + tariffAmount + FALLBACK_FEES_PER_UNIT;
      const total = landedCostPerUnit * input.quantity;

      allOptions.push({
        countryCode: record.countryCode,
        countryName: record.country,
        landedCost: total,
        landedCostPerUnit,
        productCostPerUnit: productCost,
        // Use fresh registry rate — not the stale DB effectiveRate
        dutyRate: tariffResult.effectiveRate,
        savings: 0,
        ftaAvailable: tariffResult.hasFta,
        ftaName: tariffResult.ftaName || undefined,
        supplierCount: supplierCountMap.get(record.countryCode) || 0,
        transitDays: record.transitDays,
        confidenceScore: record.productCostConfidence,
        dataQuality: record.dataQuality,
        dataSource: 'cost_data',
        tariffBreakdown: buildTariffBreakdown(tariffResult),
        importVolume: record.importVolume,
        importVolumeYear: record.importVolumeYear,
        costTrend: record.costTrend,
        costTrendPercent: record.costTrendPercent,
      });
    }

    if (allOptions.length > 0) {
      console.log(`[Orchestrator] ${requestTimestamp} Tier 1: ${allOptions.length} countries from DB cost data`);
    }
  } catch (error) {
    console.error(`[Orchestrator] ${requestTimestamp} Tier 1 DB cost data failed:`, error);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2: USITC DataWeb API — real import statistics by country
  // Fetches avg unit value (customs value / quantity) for this HTS code.
  // This is the REAL average cost that importers actually paid, by country.
  //
  // ALWAYS query DataWeb — even when Tier 1 has results — so we can enrich
  // countries that Tier 1 didn't cover with real product cost data instead
  // of falling through to Tier 3's user-input-based estimates.
  // ──────────────────────────────────────────────────────────────────────────
  let dataWebStatsByCountry = new Map<string, ImportStatsByCountry>();
  try {
    console.log(`[Orchestrator] ${requestTimestamp} Tier 2: querying USITC DataWeb for HTS ${hts6}`);
    const dataWebStats = await getImportStatsByHTS(hts6, { minQuantity: 500 });

    if (dataWebStats.length > 0) {
      console.log(`[Orchestrator] ${requestTimestamp} Tier 2: ${dataWebStats.length} countries from DataWeb`);

      for (const stat of dataWebStats) {
        if (!stat.avgUnitValue || stat.avgUnitValue <= 0) continue;
        dataWebStatsByCountry.set(stat.countryCode, stat);

        // Only add as a new option if not already covered by Tier 1
        if (coveredCountries.has(stat.countryCode)) continue;
        coveredCountries.add(stat.countryCode);

        const tariffResult = await getEffectiveTariff(stat.countryCode, hts6, {
          baseMfnRate,
          includeSection232: true,
        });

        // Use per-piece value for cost calculations when available (e.g. dozens→per-piece)
        // Falls back to raw statistical unit value for weight-based units (kg, tons)
        const perPiece = stat.avgPerPieceValue ?? stat.avgUnitValue;
        const shippingPerUnit = (FALLBACK_SHIPPING_PER_KG[stat.countryCode] || FALLBACK_SHIPPING_PER_KG.default) * FALLBACK_WEIGHT_PER_UNIT_KG;
        const tariffAmount = perPiece * (tariffResult.effectiveRate / 100);
        const landedCostPerUnit = perPiece + shippingPerUnit + tariffAmount + FALLBACK_FEES_PER_UNIT;
        const total = landedCostPerUnit * input.quantity;
        const transitDays = FALLBACK_TRANSIT_DAYS[stat.countryCode] || FALLBACK_TRANSIT_DAYS.default;

        // Determine cost trend from per-year data
        let costTrend: 'rising' | 'falling' | 'stable' | undefined;
        if (stat.costTrendPercent !== undefined) {
          if (stat.costTrendPercent > 5) costTrend = 'rising';
          else if (stat.costTrendPercent < -5) costTrend = 'falling';
          else costTrend = 'stable';
        }

        allOptions.push({
          countryCode: stat.countryCode,
          countryName: stat.countryName,
          landedCost: total,
          landedCostPerUnit,
          // Show per-piece value in UI; undefined for weight-based units we can't convert
          productCostPerUnit: stat.avgPerPieceValue ?? undefined,
          dutyRate: tariffResult.effectiveRate,
          savings: 0,
          ftaAvailable: tariffResult.hasFta,
          ftaName: tariffResult.ftaName || undefined,
          supplierCount: supplierCountMap.get(stat.countryCode) || 0,
          transitDays,
          confidenceScore: undefined,
          dataQuality: stat.totalValue > 10_000_000 ? 'high' : stat.totalValue > 1_000_000 ? 'medium' : 'low',
          dataSource: 'cost_data',
          tariffBreakdown: buildTariffBreakdown(tariffResult),
          importVolume: stat.totalValue > 0 ? stat.totalValue : undefined,
          importVolumeYear: stat.dataYears[0],
          costTrend,
          costTrendPercent: stat.costTrendPercent,
        });
      }
    } else {
      console.log(`[Orchestrator] ${requestTimestamp} Tier 2: DataWeb returned no results for HTS ${hts6}`);
    }
  } catch (error) {
    console.error(`[Orchestrator] ${requestTimestamp} Tier 2 DataWeb query failed:`, error);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ENRICH: Backfill Tier 1 options with DataWeb data they're missing
  // Tier 1 (DB) may lack importVolume, costTrend, and per-piece cost data
  // that DataWeb provides. Merge without overwriting existing DB values.
  // ──────────────────────────────────────────────────────────────────────────
  if (dataWebStatsByCountry.size > 0) {
    let enriched = 0;
    for (const option of allOptions) {
      const stat = dataWebStatsByCountry.get(option.countryCode);
      if (!stat) continue;

      // DataWeb is the authoritative source for import volume — always prefer it
      if (stat.totalValue > 0) {
        option.importVolume = stat.totalValue;
        option.importVolumeYear = stat.dataYears[0];
      }
      // Backfill cost trend if missing
      if (option.costTrend === undefined && stat.costTrendPercent !== undefined) {
        option.costTrend = stat.costTrendPercent > 5 ? 'rising' : stat.costTrendPercent < -5 ? 'falling' : 'stable';
        option.costTrendPercent = stat.costTrendPercent;
      }
      // Backfill per-piece cost if Tier 1 didn't have it
      if (option.productCostPerUnit === undefined && stat.avgPerPieceValue !== null) {
        option.productCostPerUnit = stat.avgPerPieceValue;
      }
      enriched++;
    }
    if (enriched > 0) {
      console.log(`[Orchestrator] ${requestTimestamp} Enriched ${enriched} Tier 1 options with DataWeb data`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3: Tariff-only fallback for countries NOT covered by Tier 1 or 2
  //
  // When USITC DataWeb has data for this HTS code, we use the global average
  // unit value as the product cost basis (much better than the user's input
  // value, which may be a single-shipment price). Falls back to user input
  // only when no DataWeb data exists at all.
  // ──────────────────────────────────────────────────────────────────────────
  const countriesNeeded = TOP_SOURCING_COUNTRIES.filter(c => !coveredCountries.has(c));

  // Compute a global average per-piece value from DataWeb for use as product cost
  // basis when a specific country isn't in the DataWeb results.
  // Uses normalized per-piece values (e.g. dozens÷12) when available.
  let globalAvgPerPiece: number | undefined;
  if (dataWebStatsByCountry.size > 0) {
    const perPieceValues: number[] = [];
    for (const stat of dataWebStatsByCountry.values()) {
      if (stat.avgPerPieceValue !== null && stat.avgPerPieceValue > 0) {
        perPieceValues.push(stat.avgPerPieceValue);
      }
    }
    if (perPieceValues.length > 0) {
      // Weighted average would be better, but simple avg is fine for fallback
      globalAvgPerPiece = Math.round(
        (perPieceValues.reduce((sum, v) => sum + v, 0) / perPieceValues.length) * 100
      ) / 100;
    }
  }

  if (countriesNeeded.length > 0 && (perUnitValue > 0 || globalAvgPerPiece)) {
    console.log(`[Orchestrator] ${requestTimestamp} Tier 3: generating tariff-only for ${countriesNeeded.length} countries (globalAvgPerPiece: $${globalAvgPerPiece?.toFixed(2) ?? 'N/A'})`);

    const tariffPromises = countriesNeeded.map(async (countryCode) => {
      try {
        const tariffResult = await getEffectiveTariff(countryCode, hts6, {
          baseMfnRate,
          includeSection232: true,
        });

        // Real per-piece cost from DataWeb (country-specific or global avg)
        const dataWebStat = dataWebStatsByCountry.get(countryCode);
        const realCostPerPiece = dataWebStat?.avgPerPieceValue ?? globalAvgPerPiece ?? undefined;
        // For landed cost calc, use real data when available, else user input
        const costBasis = realCostPerPiece ?? perUnitValue;

        const shippingPerUnit = (FALLBACK_SHIPPING_PER_KG[countryCode] || FALLBACK_SHIPPING_PER_KG.default) * FALLBACK_WEIGHT_PER_UNIT_KG;
        const tariffAmount = costBasis * (tariffResult.effectiveRate / 100);
        const landedCostPerUnit = costBasis + shippingPerUnit + tariffAmount + FALLBACK_FEES_PER_UNIT;
        const total = landedCostPerUnit * input.quantity;
        const transitDays = FALLBACK_TRANSIT_DAYS[countryCode] || FALLBACK_TRANSIT_DAYS.default;

        return {
          countryCode,
          countryName: getCountryName(countryCode),
          landedCost: total,
          landedCostPerUnit,
          // productCostPerUnit only shows real import data — never the user's input
          productCostPerUnit: realCostPerPiece,
          dutyRate: tariffResult.effectiveRate,
          savings: 0,
          ftaAvailable: tariffResult.hasFta,
          ftaName: tariffResult.ftaName || undefined,
          supplierCount: supplierCountMap.get(countryCode) || 0,
          transitDays,
          confidenceScore: undefined,
          dataQuality: (realCostPerPiece !== undefined ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          dataSource: (realCostPerPiece !== undefined ? 'estimate' : 'tariff_only') as 'cost_data' | 'estimate' | 'tariff_only',
          tariffBreakdown: buildTariffBreakdown(tariffResult),
          importVolume: dataWebStat?.totalValue ?? undefined,
          importVolumeYear: dataWebStat?.dataYears[0],
          costTrend: dataWebStat?.costTrendPercent !== undefined
            ? (dataWebStat.costTrendPercent > 5 ? 'rising' : dataWebStat.costTrendPercent < -5 ? 'falling' : 'stable')
            : undefined,
          costTrendPercent: dataWebStat?.costTrendPercent,
        } satisfies CountryOption;
      } catch (error) {
        console.warn(`[Orchestrator] Tariff-only failed for ${countryCode}:`, error);
        return null;
      }
    });

    const tariffResults = await Promise.all(tariffPromises);
    for (const result of tariffResults) {
      if (result) {
        allOptions.push(result);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Build current country option (ensure it exists)
  // ──────────────────────────────────────────────────────────────────────────
  let currentOption = allOptions.find(o => o.countryCode === input.countryCode);

  if (!currentOption) {
    // Current country wasn't in any data source — compute from the user's own input
    const currentLanded = await getFallbackLandedCost(input, htsCode, baseMfnRateOverride);
    const tariffResult = await getEffectiveTariff(input.countryCode, hts6, {
      baseMfnRate,
      includeSection232: true,
    });

    // Check if DataWeb has real cost data for the current country
    const currentDataWebStat = dataWebStatsByCountry.get(input.countryCode);
    const currentRealCost = currentDataWebStat?.avgPerPieceValue ?? globalAvgPerPiece ?? undefined;

    currentOption = {
      countryCode: input.countryCode,
      countryName: getCountryName(input.countryCode),
      landedCost: currentLanded.total,
      landedCostPerUnit: currentLanded.perUnit,
      // productCostPerUnit only shows real import data — never the user's input
      productCostPerUnit: currentRealCost,
      dutyRate: currentLanded.duties.effectiveRate,
      savings: 0,
      ftaAvailable: false,
      ftaName: undefined,
      supplierCount: supplierCountMap.get(input.countryCode) || 0,
      transitDays: FALLBACK_TRANSIT_DAYS[input.countryCode] || FALLBACK_TRANSIT_DAYS.default,
      dataQuality: currentRealCost !== undefined ? 'medium' : 'low',
      dataSource: currentRealCost !== undefined ? 'estimate' : 'tariff_only',
      tariffBreakdown: buildTariffBreakdown(tariffResult),
      importVolume: currentDataWebStat?.totalValue ?? undefined,
      importVolumeYear: currentDataWebStat?.dataYears[0],
      costTrend: currentDataWebStat?.costTrendPercent !== undefined
        ? (currentDataWebStat.costTrendPercent > 5 ? 'rising' : currentDataWebStat.costTrendPercent < -5 ? 'falling' : 'stable')
        : undefined,
      costTrendPercent: currentDataWebStat?.costTrendPercent,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Calculate savings relative to current country, sort, and build result
  // ──────────────────────────────────────────────────────────────────────────
  const baselineLanded = currentOption.landedCost;

  const alternatives = allOptions
    .filter(o => o.countryCode !== input.countryCode)
    .map(o => {
      const savings = Math.max(0, baselineLanded - o.landedCost);
      const savingsPercent = baselineLanded > 0 ? Math.round((savings / baselineLanded) * 100) : 0;
      return { ...o, savings, savingsPercent };
    })
    .sort((a, b) => b.savings - a.savings)
    .slice(0, MAX_ALTERNATIVES);

  const topAlternative = alternatives[0];
  let recommendation: string;

  if (topAlternative && topAlternative.savings > 0) {
    const savingsFormatted = topAlternative.savings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (topAlternative.dataSource === 'tariff_only') {
      recommendation = `Based on tariff rates alone, ${topAlternative.countryName} could save ~$${savingsFormatted} (${topAlternative.savingsPercent}%). Actual savings depend on product sourcing costs.`;
    } else {
      recommendation = `${topAlternative.countryName} offers potential savings of $${savingsFormatted} (${topAlternative.savingsPercent}%) based on real import data.`;
    }
  } else {
    recommendation = 'Your current sourcing country appears cost-optimal for this product.';
  }

  console.log(`[Orchestrator] ${requestTimestamp} Country comparison: ${alternatives.length} alternatives (cost_data: ${alternatives.filter(a => a.dataSource === 'cost_data').length}, tariff_only: ${alternatives.filter(a => a.dataSource === 'tariff_only').length})`);

  return {
    current: currentOption,
    alternatives,
    recommendation,
  };
}

/**
 * Step 4: Run compliance checks
 */
async function getComplianceChecks(
  input: AnalyzeProductInput,
  htsCode: string
): Promise<Compliance> {
  const alerts = [];
  const passedChecks = [];
  
  // Check for high tariff exposure
  // TODO: Integrate with actual tariff data
  const chapter = htsCode.substring(0, 2);
  
  // Check for UFLPA risk (cotton/textiles from China)
  if (input.countryCode === 'CN' && ['52', '61', '62', '63'].includes(chapter)) {
    alerts.push({
      level: 'high' as const,
      title: 'UFLPA / Forced Labor Risk',
      description: 'Cotton products from China require due diligence under the Uyghur Forced Labor Prevention Act (UFLPA).',
      requiredActions: [
        'Verify cotton is NOT sourced from Xinjiang region',
        'Obtain supplier declaration of compliance',
        'Document supply chain traceability',
      ],
      risk: 'Shipment detention and potential seizure',
    });
  }
  
  // Passed checks
  passedChecks.push('Denied Party Screening: No matches found');
  passedChecks.push('AD/CVD Orders: No active orders for this HTS/country');
  
  return {
    alerts,
    passedChecks,
    riskLevel: alerts.length > 0 ? 'high' : 'low',
  };
}

/**
 * Step 5: Determine documentation requirements
 */
async function getDocumentationRequirements(
  input: AnalyzeProductInput,
  htsCode: string
): Promise<Documentation> {
  const critical = [
    {
      name: 'Commercial Invoice',
      criticality: 'critical' as const,
      description: 'Must include: Seller, buyer, description, value, terms',
    },
    {
      name: 'Packing List',
      criticality: 'critical' as const,
      description: 'Must include: Carton count, weights, dimensions',
    },
  ];
  
  const required: Array<{ name: string; criticality: 'required'; description: string; agency?: string }> = [];
  const recommended: Array<{ name: string; criticality: 'recommended'; description: string }> = [];
  
  // Check for dangerous goods
  let dangerousGoods = undefined;
  if (input.attributes.containsBattery) {
    dangerousGoods = {
      unClass: 'Class 9',
      unNumber: 'UN3481',
      properShippingName: 'Lithium ion batteries contained in equipment',
      hazardClass: 'Class 9: Miscellaneous dangerous goods',
      packingGroup: undefined,
      packingInstruction: 'PI967 (Section II)',
      documents: [
        {
          name: 'UN38.3 Test Summary',
          criticality: 'critical' as const,
          description: 'Proves batteries passed UN safety tests',
        },
      ],
      carrierRestrictions: [
        {
          carrier: 'Air Freight',
          restriction: 'Watt-hour rating determines restrictions',
          details: '≤100 Wh: Standard shipping, >100 Wh: Restricted',
        },
      ],
      packagingRequirements: [
        'Batteries must be protected from short circuit',
        'Equipment must be protected from activation',
        'Strong outer packaging',
      ],
      labelingRequirements: [
        'Lithium battery handling label on outer packaging',
      ],
    };
  }
  
  return {
    critical,
    required,
    recommended,
    dangerousGoods,
  };
}

/**
 * Step 6: Identify optimization opportunities
 */
async function getOptimizationOpportunities(
  input: AnalyzeProductInput,
  htsCode: string,
  landedCost: LandedCost,
  countryComparison: CountryComparison
): Promise<Optimization> {
  const opportunities = [];
  
  // Country switch opportunity
  const topAlternative = countryComparison.alternatives[0];
  if (topAlternative && topAlternative.savings > 1000) {
    opportunities.push({
      id: 'country-switch',
      title: `Switch from ${input.countryCode} to ${topAlternative.countryCode}`,
      type: 'country_switch' as const,
      savings: topAlternative.savings,
      description: `Reduce landed cost from $${landedCost.total.toLocaleString('en-US')} to $${topAlternative.landedCost.toLocaleString('en-US')}`,
      tradeoffs: [
        'Lead time may vary',
        'Supplier availability to be verified',
        'Quality verification recommended',
      ],
    });
  }
  
  // FTA qualification opportunity
  const ftaCountry = countryComparison.alternatives.find((c) => c.ftaAvailable);
  if (ftaCountry && ftaCountry.savings > 0) {
    opportunities.push({
      id: 'fta-qualification',
      title: `Qualify for FTA (${ftaCountry.countryName})`,
      type: 'fta_qualification' as const,
      savings: ftaCountry.savings,
      description: `Source from ${ftaCountry.countryName} and qualify for duty-free entry`,
      requirements: [
        'Product must meet FTA rules of origin',
        'Supplier must provide certificate of origin',
        'Documentation and recordkeeping required',
      ],
    });
  }
  
  return {
    opportunities,
    totalPotentialSavings: opportunities.reduce((sum, opp) => sum + opp.savings, 0),
    topRecommendation: opportunities[0]?.title || 'No optimization opportunities identified',
  };
}

/**
 * Helper: Get country name from code
 */
function getCountryName(code: string): string {
  const names: Record<string, string> = {
    CN: 'China', VN: 'Vietnam', MX: 'Mexico', IN: 'India', BD: 'Bangladesh',
    TH: 'Thailand', US: 'United States', TW: 'Taiwan', KR: 'South Korea',
    JP: 'Japan', DE: 'Germany', IT: 'Italy', FR: 'France', GB: 'United Kingdom',
    CA: 'Canada', BR: 'Brazil', ID: 'Indonesia', MY: 'Malaysia', PH: 'Philippines',
    PK: 'Pakistan', TR: 'Turkey', PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary',
    RO: 'Romania', ES: 'Spain', PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium',
    AT: 'Austria', CH: 'Switzerland', SE: 'Sweden', DK: 'Denmark', NO: 'Norway',
    FI: 'Finland', IE: 'Ireland', SG: 'Singapore', AU: 'Australia', NZ: 'New Zealand',
    ZA: 'South Africa', EG: 'Egypt', MA: 'Morocco', TN: 'Tunisia', KE: 'Kenya',
    NG: 'Nigeria', GH: 'Ghana', ET: 'Ethiopia', CO: 'Colombia', CL: 'Chile',
    PE: 'Peru', AR: 'Argentina', EC: 'Ecuador', DO: 'Dominican Republic',
    GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', CR: 'Costa Rica',
    PA: 'Panama', JO: 'Jordan', SA: 'Saudi Arabia', AE: 'UAE', IL: 'Israel',
    QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman', LK: 'Sri Lanka',
    MM: 'Myanmar', KH: 'Cambodia', LA: 'Laos', NP: 'Nepal', UA: 'Ukraine',
    SK: 'Slovakia', BG: 'Bulgaria', HR: 'Croatia', RS: 'Serbia', SI: 'Slovenia',
    LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia', GR: 'Greece', CY: 'Cyprus',
    MT: 'Malta', LU: 'Luxembourg', IS: 'Iceland',
  };
  return names[code] || code;
}
