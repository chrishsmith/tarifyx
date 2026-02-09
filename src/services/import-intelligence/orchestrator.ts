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
import { getPGARequirements, PGA_AGENCIES } from '@/data/pgaFlags';
import { checkADCVDWarning, getADCVDOrdersByHTS } from '@/data/adcvdOrders';
import { isSection232Product } from '@/data/tariffPrograms';
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
  ComplianceAlert,
  CompliancePassedCheck,
  PGARequirement,
  Documentation,
  Optimization,
  OptimizationOpportunity,
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
  
  // Step 4: Compliance Checks (uses landed cost tariff stack for context)
  const compliance = await getComplianceChecks(input, classification.htsCode, landedCost);
  
  // Step 5: Documentation Requirements (uses PGA data + compliance context)
  const documentation = await getDocumentationRequirements(input, classification.htsCode, compliance);
  
  // Step 6: Optimization Opportunities (uses ALL prior step data)
  const optimization = await getOptimizationOpportunities(
    input,
    classification,
    landedCost,
    countryComparison,
    compliance
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

/** Sanctioned / embargoed countries that require special warnings */
const SANCTIONED_COUNTRIES: Record<string, { name: string; level: 'full' | 'partial'; programs: string[] }> = {
  CU: { name: 'Cuba', level: 'full', programs: ['OFAC - Cuban Assets Control Regulations'] },
  IR: { name: 'Iran', level: 'full', programs: ['OFAC - Iranian Transactions and Sanctions Regulations'] },
  KP: { name: 'North Korea', level: 'full', programs: ['OFAC - North Korea Sanctions Regulations'] },
  SY: { name: 'Syria', level: 'full', programs: ['OFAC - Syrian Sanctions Regulations'] },
  RU: { name: 'Russia', level: 'partial', programs: ['OFAC - Russian Harmful Foreign Activities Sanctions', 'BIS Entity List restrictions'] },
  BY: { name: 'Belarus', level: 'partial', programs: ['OFAC - Belarus Sanctions Regulations'] },
  VE: { name: 'Venezuela', level: 'partial', programs: ['OFAC - Venezuela Sanctions Regulations'] },
  MM: { name: 'Myanmar', level: 'partial', programs: ['OFAC - Burma Sanctions'] },
};

/**
 * Step 4: Run compliance checks
 * 
 * Pulls from real data sources:
 * - PGA requirements by HTS chapter
 * - AD/CVD order database
 * - UFLPA forced labor risk
 * - Section 232/301/IEEPA tariff program warnings (from landed cost data)
 * - Sanctioned country checks
 * - Denied party risk flagging (by country risk level)
 */
async function getComplianceChecks(
  input: AnalyzeProductInput,
  htsCode: string,
  landedCost: LandedCost
): Promise<Compliance> {
  const requestTimestamp = new Date().toISOString();
  const alerts: ComplianceAlert[] = [];
  const passedChecks: CompliancePassedCheck[] = [];
  const pgaRequirements: PGARequirement[] = [];

  const cleanCode = htsCode.replace(/\./g, '');
  const chapter = cleanCode.substring(0, 2);

  // ─── 1. Sanctions / Embargo Check ───────────────────────────────────
  const sanctionInfo = SANCTIONED_COUNTRIES[input.countryCode];
  if (sanctionInfo) {
    alerts.push({
      level: 'high',
      category: 'sanctions',
      title: `${sanctionInfo.name} — ${sanctionInfo.level === 'full' ? 'Comprehensive' : 'Partial'} Sanctions`,
      description: sanctionInfo.level === 'full'
        ? `${sanctionInfo.name} is subject to comprehensive US sanctions. Most imports are prohibited without a specific OFAC license.`
        : `${sanctionInfo.name} is subject to partial US sanctions. Certain transactions may be restricted. Verify your specific product and end-use.`,
      requiredActions: sanctionInfo.level === 'full'
        ? ['Obtain OFAC specific license before importing', 'Consult trade compliance counsel', 'Verify no prohibited end-uses']
        : ['Screen transaction against current OFAC restrictions', 'Verify product is not on restricted list', 'Document compliance due diligence'],
      risk: sanctionInfo.level === 'full' ? 'Criminal penalties up to $1M and 20 years imprisonment' : 'Civil penalties up to $330,000 per violation',
      learnMoreUrl: 'https://ofac.treasury.gov/sanctions-programs-and-country-information',
    });
  } else {
    passedChecks.push({
      category: 'sanctions',
      label: 'Sanctions screening: No country-level sanctions',
      detail: `${getCountryName(input.countryCode)} is not subject to US comprehensive or sectoral sanctions`,
    });
  }

  // ─── 2. UFLPA / Forced Labor Check ─────────────────────────────────
  // Cotton, textiles, apparel, polysilicon, tomatoes from China/Xinjiang
  const uflpaChapters = ['52', '54', '55', '61', '62', '63']; // cotton, man-made filaments, man-made staple, knit apparel, woven apparel, other textiles
  const uflpaTomatoes = chapter === '20' || cleanCode.startsWith('0702'); // prepared vegetables or fresh tomatoes
  const uflpaPolysilicon = cleanCode.startsWith('2804') || cleanCode.startsWith('854140'); // silicon or solar cells

  if (input.countryCode === 'CN') {
    if (uflpaChapters.includes(chapter)) {
      alerts.push({
        level: 'high',
        category: 'forced_labor',
        title: 'UFLPA — Forced Labor Risk (Textiles)',
        description: 'Cotton and textile products from China face heightened scrutiny under the Uyghur Forced Labor Prevention Act. CBP applies a rebuttable presumption that goods from Xinjiang are made with forced labor.',
        requiredActions: [
          'Verify cotton is NOT sourced from Xinjiang Uyghur Autonomous Region',
          'Obtain supplier declaration of compliance with UFLPA',
          'Document complete supply chain traceability (farm → mill → factory)',
          'Prepare forced labor due diligence records for CBP review',
        ],
        risk: 'Shipment detention, seizure, and potential Withhold Release Order (WRO)',
        learnMoreUrl: 'https://www.cbp.gov/trade/forced-labor/UFLPA',
      });
    } else if (uflpaPolysilicon) {
      alerts.push({
        level: 'high',
        category: 'forced_labor',
        title: 'UFLPA — Forced Labor Risk (Polysilicon/Solar)',
        description: 'Polysilicon and solar products from China are a UFLPA enforcement priority. CBP has detained significant volumes of solar panels and polysilicon.',
        requiredActions: [
          'Map complete polysilicon supply chain',
          'Verify no Xinjiang-region polysilicon in product',
          'Prepare supply chain traceability documentation',
        ],
        risk: 'Shipment detention and seizure — solar products are a top CBP enforcement priority',
        learnMoreUrl: 'https://www.cbp.gov/trade/forced-labor/UFLPA',
      });
    } else if (uflpaTomatoes) {
      alerts.push({
        level: 'medium',
        category: 'forced_labor',
        title: 'UFLPA — Forced Labor Risk (Tomato Products)',
        description: 'Tomato products from China may face UFLPA scrutiny. Xinjiang is a major tomato-producing region.',
        requiredActions: [
          'Verify tomato sourcing is outside Xinjiang region',
          'Obtain supplier declarations',
        ],
        risk: 'Potential detention if supply chain links to Xinjiang',
        learnMoreUrl: 'https://www.cbp.gov/trade/forced-labor/UFLPA',
      });
    } else {
      passedChecks.push({
        category: 'forced_labor',
        label: 'UFLPA: Product not in high-priority enforcement categories',
        detail: 'This HTS chapter is not a primary UFLPA enforcement target, but general forced labor due diligence is recommended for all China imports',
      });
    }
  } else {
    passedChecks.push({
      category: 'forced_labor',
      label: 'UFLPA: Not applicable',
      detail: 'UFLPA applies primarily to goods from China',
    });
  }

  // ─── 3. AD/CVD Check (Real data from adcvdOrders.ts) ───────────────
  const adcvdResult = checkADCVDWarning(cleanCode, input.countryCode);
  let adcvdWarningData: Compliance['adcvdWarning'] | undefined;

  if (adcvdResult.hasWarning && adcvdResult.warning) {
    const w = adcvdResult.warning;
    // Find matching orders for duty range
    const matchingOrders = getADCVDOrdersByHTS(cleanCode);
    const dutyRange = matchingOrders.length > 0 ? matchingOrders[0].dutyRange : undefined;
    const orderCount = matchingOrders.reduce((sum, o) => sum + o.orderCount, 0);

    adcvdWarningData = {
      productCategory: w.productCategory,
      affectedCountries: w.affectedCountries,
      isCountryAffected: w.isCountryAffected,
      dutyRange,
      orderCount,
      lookupUrl: w.lookupUrl,
    };

    alerts.push({
      level: w.isCountryAffected ? 'high' : 'medium',
      category: 'adcvd',
      title: `AD/CVD Risk — ${w.productCategory}`,
      description: w.message,
      requiredActions: w.isCountryAffected
        ? [
            'Check CBP AD/CVD database for manufacturer-specific duty rates',
            'Obtain AD/CVD case number from your customs broker',
            'Budget for potential additional duties of ' + (dutyRange || '10%-500%+'),
            'Consider bonding requirements for AD/CVD entries',
          ]
        : [
            'Be aware of AD/CVD orders if sourcing changes to affected countries',
            'Monitor ITC and Commerce Department for new investigations',
          ],
      risk: w.isCountryAffected
        ? `Additional duties of ${dutyRange || '10%-500%+'} may apply on top of base MFN rate`
        : 'No current exposure, but monitor if sourcing strategy changes',
      financialExposure: w.isCountryAffected ? dutyRange : undefined,
      learnMoreUrl: w.lookupUrl,
    });
  } else {
    passedChecks.push({
      category: 'adcvd',
      label: 'AD/CVD: No active orders for this HTS code/country combination',
      detail: `No antidumping or countervailing duty orders found matching ${cleanCode} from ${getCountryName(input.countryCode)}`,
    });
  }

  // ─── 4. Section 232 Check (Steel/Aluminum/Auto) ────────────────────
  const s232 = isSection232Product(cleanCode);
  if (s232.steel || s232.aluminum) {
    const product = s232.steel ? 'steel' : 'aluminum';
    alerts.push({
      level: 'high',
      category: 'tariff_program',
      title: `Section 232 — 25% ${product.charAt(0).toUpperCase() + product.slice(1)} Tariff`,
      description: `This product is classified as a ${product} product subject to Section 232 national security tariffs. A 25% ad valorem tariff applies to all imports regardless of country of origin.`,
      requiredActions: [
        `Confirm product is correctly classified under ${product} headings`,
        'Check for applicable Section 232 exclusions (product-specific)',
        'File exclusion request if product qualifies (via Commerce Department)',
      ],
      risk: '25% tariff on dutiable value — applies in addition to base MFN rate',
      financialExposure: '25%',
      learnMoreUrl: 'https://www.commerce.gov/section-232-investigations',
    });
  } else if (s232.auto) {
    alerts.push({
      level: 'high',
      category: 'tariff_program',
      title: 'Section 232 — 25% Automobile Tariff',
      description: 'This product is classified as an automobile or automobile part subject to Section 232 tariffs.',
      requiredActions: [
        'Verify product classification under Chapter 87',
        'Check USMCA content requirements for potential exemption',
      ],
      risk: '25% tariff on dutiable value',
      financialExposure: '25%',
      learnMoreUrl: 'https://www.commerce.gov/section-232-investigations',
    });
  } else {
    passedChecks.push({
      category: 'tariff_program',
      label: 'Section 232: Not applicable',
      detail: 'This product is not classified as steel, aluminum, or automobile — no Section 232 tariff applies',
    });
  }

  // ─── 5. Tariff Program Warnings (from landed cost data) ────────────
  // Use the actual tariff layers calculated in Step 2 to warn about active programs
  const activeLayers = landedCost.duties.layers.filter(l => l.rate > 0);
  
  for (const layer of activeLayers) {
    if (layer.programType === 'section_301') {
      alerts.push({
        level: 'medium',
        category: 'tariff_program',
        title: `Section 301 — ${layer.rate}% China Tariff`,
        description: `${layer.description}. This tariff applies to products of Chinese origin under the Trade Act of 1974.`,
        financialExposure: `${layer.rate}%`,
        learnMoreUrl: 'https://ustr.gov/issue-areas/enforcement/section-301-investigations',
      });
    } else if (layer.programType === 'ieepa_fentanyl' || layer.programType === 'ieepa_baseline' || layer.programType === 'ieepa_reciprocal') {
      // Only show IEEPA warning for rates > 10% (baseline is expected)
      if (layer.rate > 10) {
        alerts.push({
          level: 'medium',
          category: 'tariff_program',
          title: `IEEPA Emergency Tariff — ${layer.rate}%`,
          description: `${layer.description}. Emergency tariff under the International Emergency Economic Powers Act.`,
          financialExposure: `${layer.rate}%`,
          learnMoreUrl: 'https://www.whitehouse.gov/briefing-room/presidential-actions/',
        });
      }
    }
  }

  // If total effective duty rate > 50%, add high tariff exposure warning
  const effectiveRate = landedCost.duties.effectiveRate;
  if (effectiveRate > 50) {
    alerts.push({
      level: 'medium',
      category: 'tariff_program',
      title: `High Tariff Exposure — ${effectiveRate.toFixed(1)}% Effective Rate`,
      description: `The combined effective duty rate for this product exceeds 50%. This significantly impacts landed cost and may warrant sourcing optimization.`,
      requiredActions: [
        'Review classification for accuracy — small differences can change rates',
        'Explore alternative sourcing countries with lower tariff exposure',
        'Consider FTA qualification if applicable',
        'Evaluate duty drawback opportunities if re-exporting',
      ],
      financialExposure: `${effectiveRate.toFixed(1)}% of dutiable value`,
    });
  }

  // ─── 6. PGA Requirements (from pgaFlags.ts) ────────────────────────
  const pgaResult = getPGARequirements(cleanCode);
  if (pgaResult && pgaResult.flags.length > 0) {
    // Build PGA requirement objects for the UI
    const agencyMap = new Map<string, PGARequirement>();
    for (const flag of pgaResult.flags) {
      const agency = PGA_AGENCIES[flag.agency];
      if (!agency) continue;
      
      if (!agencyMap.has(flag.agency)) {
        agencyMap.set(flag.agency, {
          agencyCode: agency.code,
          agencyName: agency.name,
          flags: [],
          website: agency.website,
        });
      }
      agencyMap.get(flag.agency)!.flags.push({
        code: flag.code,
        name: flag.name,
        description: flag.description,
        requirements: flag.requirements,
      });
    }

    pgaRequirements.push(...agencyMap.values());

    // Determine if PGA requirements are worth alerting about
    const hasLicense = pgaResult.flags.some(f =>
      f.requirements.some(r =>
        r.toLowerCase().includes('license') ||
        r.toLowerCase().includes('permit') ||
        r.toLowerCase().includes('registration')
      )
    );

    if (hasLicense) {
      alerts.push({
        level: pgaResult.flags.length >= 3 ? 'high' : 'medium',
        category: 'pga',
        title: `${pgaResult.flags.length} PGA Requirement${pgaResult.flags.length > 1 ? 's' : ''} — License/Permit Required`,
        description: `Products in Chapter ${chapter} (${pgaResult.chapterName}) require compliance with ${pgaRequirements.map(p => p.agencyCode).join(', ')}. Licenses or permits must be obtained before import.`,
        requiredActions: pgaResult.flags.flatMap(f => f.requirements).slice(0, 5),
        risk: 'Shipment may be refused entry or detained at port without proper documentation',
        learnMoreUrl: 'https://www.cbp.gov/trade/partner-government-agencies',
      });
    } else {
      alerts.push({
        level: 'low',
        category: 'pga',
        title: `${pgaResult.flags.length} PGA Filing Requirement${pgaResult.flags.length > 1 ? 's' : ''}`,
        description: `Products in Chapter ${chapter} (${pgaResult.chapterName}) require filings with ${pgaRequirements.map(p => p.agencyCode).join(', ')}.${pgaResult.notes ? ' ' + pgaResult.notes : ''}`,
        learnMoreUrl: 'https://www.cbp.gov/trade/partner-government-agencies',
      });
    }
  } else {
    passedChecks.push({
      category: 'pga',
      label: 'PGA requirements: None identified for this HTS chapter',
      detail: `Chapter ${chapter} does not have common PGA filing requirements`,
    });
  }

  // ─── 7. FTA Opportunity (if current country has no FTA) ────────────
  // Check if the tariff result shows an FTA is available for the current country
  const currentTariffLayers = landedCost.duties.layers;
  const hasFtaLayer = currentTariffLayers.some(l => l.programType === 'fta_discount' && l.rate < 0);
  if (hasFtaLayer) {
    passedChecks.push({
      category: 'fta',
      label: 'FTA benefit: Active for this country',
      detail: 'A free trade agreement discount is already applied to your duty calculation',
    });
  } else {
    // No FTA for current country — check if FTA countries exist as potential alternatives
    // We don't have country comparison data here, so provide a general note
    const ftaPartnerCountries = ['MX', 'CA', 'KR', 'AU', 'SG', 'CL', 'CO', 'PE', 'MA', 'JO', 'BH', 'OM', 'IL',
      'CR', 'DO', 'SV', 'GT', 'HN', 'NI', 'PA'];
    if (!ftaPartnerCountries.includes(input.countryCode) && effectiveRate > 10) {
      alerts.push({
        level: 'low',
        category: 'fta',
        title: 'No FTA Benefit Available',
        description: `${getCountryName(input.countryCode)} does not have a US free trade agreement. Consider sourcing from FTA partner countries (Mexico, Canada, South Korea, etc.) to potentially eliminate the base MFN duty.`,
        requiredActions: [
          'Review alternative sourcing countries with FTA access',
          'Use the FTA Calculator to check qualification requirements',
        ],
        learnMoreUrl: '/dashboard/compliance/fta-calculator',
      });
    } else if (ftaPartnerCountries.includes(input.countryCode)) {
      alerts.push({
        level: 'low',
        category: 'fta',
        title: 'FTA Available — Check Qualification',
        description: `${getCountryName(input.countryCode)} has a US free trade agreement but no FTA discount is currently applied. Your product may qualify for preferential rates if it meets the rules of origin.`,
        requiredActions: [
          'Use the FTA Calculator to verify your product qualifies',
          'Ensure supplier can provide a certificate of origin',
        ],
        learnMoreUrl: '/dashboard/compliance/fta-calculator',
      });
    }
  }

  // ─── 8. Denied Party Risk (country-level risk indicator) ───────────
  // Full screening requires a specific party name, which we don't have in the 
  // general flow. Flag if the country has high denied party activity.
  const highDeniedPartyCountries = ['CN', 'RU', 'IR', 'SY', 'KP', 'PK', 'AE', 'MY'];
  if (highDeniedPartyCountries.includes(input.countryCode)) {
    alerts.push({
      level: 'low',
      category: 'general',
      title: 'Elevated Denied Party Risk — Screen Your Supplier',
      description: `${getCountryName(input.countryCode)} has a high concentration of entities on OFAC SDN and BIS Entity Lists. Screen your specific supplier before transacting.`,
      requiredActions: [
        'Screen supplier name against OFAC SDN List',
        'Screen against BIS Entity List and Denied Persons List',
        'Document screening results for compliance records',
      ],
      learnMoreUrl: '/dashboard/compliance/denied-party',
    });
  } else {
    passedChecks.push({
      category: 'general',
      label: 'Denied party risk: Standard — screen supplier before transacting',
      detail: 'Country does not have elevated denied party concentration',
    });
  }

  // ─── Calculate Risk Score ──────────────────────────────────────────
  let riskScore = 0;
  for (const alert of alerts) {
    if (alert.level === 'high') riskScore += 30;
    else if (alert.level === 'medium') riskScore += 15;
    else riskScore += 5;
  }
  riskScore = Math.min(100, riskScore);

  const riskLevel: Compliance['riskLevel'] =
    riskScore >= 50 ? 'high' : riskScore >= 20 ? 'medium' : 'low';

  console.log(`[Orchestrator] ${requestTimestamp} Compliance: ${alerts.length} alerts, ${passedChecks.length} passed, risk=${riskLevel} (${riskScore})`);

  return {
    alerts,
    passedChecks,
    riskLevel,
    riskScore,
    pgaRequirements,
    adcvdWarning: adcvdWarningData,
    toolLinks: {
      deniedPartySearch: '/dashboard/compliance/denied-party',
      adcvdLookup: '/dashboard/compliance/addcvd',
      pgaLookup: '/dashboard/compliance/pga',
      ftaCalculator: '/dashboard/compliance/fta-calculator',
    },
  };
}

/**
 * Step 5: Determine documentation requirements
 * 
 * Generates a comprehensive documentation checklist based on:
 * - Universal CBP requirements (always: commercial invoice, packing list, bill of lading)
 * - PGA-driven requirements (from compliance step — CPSC, FDA, FCC, EPA, etc.)
 * - Product attribute-driven requirements (batteries, chemicals, children's products, etc.)
 * - Country-driven requirements (UFLPA for China, COO labeling)
 * - HTS chapter-specific requirements (textiles → fiber content, food → prior notice, etc.)
 */
async function getDocumentationRequirements(
  input: AnalyzeProductInput,
  htsCode: string,
  compliance: Compliance
): Promise<Documentation> {
  const cleanCode = htsCode.replace(/\./g, '');
  const chapter = cleanCode.substring(0, 2);
  const countryName = getCountryName(input.countryCode);

  // ─── CRITICAL: Universal CBP requirements (shipment held without these) ──
  const critical: Documentation['critical'] = [
    {
      name: 'Commercial Invoice',
      criticality: 'critical',
      description: 'Required for every import entry. Establishes transaction value for duty assessment.',
      mustInclude: [
        'Seller and buyer names/addresses',
        'Detailed product description',
        'Unit price, quantity, and total value',
        'Currency and terms of sale (FOB/CIF)',
        'Country of origin',
        'HTS classification (recommended)',
      ],
    },
    {
      name: 'Packing List',
      criticality: 'critical',
      description: 'Required for all shipments. Used by CBP to verify contents match invoice.',
      mustInclude: [
        'Number of cartons/pallets',
        'Gross and net weights per carton',
        'Dimensions per carton',
        'Contents description per carton',
      ],
    },
    {
      name: 'Bill of Lading / Airway Bill',
      criticality: 'critical',
      description: 'Carrier document proving goods are in transit. Required for customs release.',
      mustInclude: [
        'Shipper and consignee details',
        'Port of loading and discharge',
        'Number of packages and weight',
        'Freight terms (prepaid/collect)',
      ],
    },
  ];

  // ─── REQUIRED: PGA-driven + attribute-driven docs ────────────────────────
  const required: Documentation['required'] = [];

  // --- PGA-driven requirements (from compliance step) ---
  if (compliance.pgaRequirements.length > 0) {
    for (const pga of compliance.pgaRequirements) {
      for (const flag of pga.flags) {
        // Each PGA flag maps to specific documentation
        const pgaDoc = getPGADocumentation(pga.agencyCode, flag.code, flag.name);
        if (pgaDoc) {
          // Avoid duplicates
          if (!required.some(d => d.name === pgaDoc.name)) {
            required.push(pgaDoc);
          }
        }
      }
    }
  }

  // --- Textiles (Chapters 50-63): Fiber content labels + COO labels ---
  const chapterNum = parseInt(chapter, 10);
  if (chapterNum >= 50 && chapterNum <= 63) {
    if (!required.some(d => d.name === 'Fiber Content Labels')) {
      required.push({
        name: 'Fiber Content Labels',
        criticality: 'required',
        description: 'Textile Fiber Products Identification Act requires fiber composition on every garment.',
        agency: 'FTC',
        mustInclude: [
          'Generic fiber names and percentages (e.g., "100% Cotton")',
          'Manufacturer or importer name (RN number accepted)',
          'Country of origin',
        ],
        learnMoreUrl: 'https://www.ftc.gov/legal-library/browse/rules/textile-fiber-products-identification-act',
      });
    }
    if (!required.some(d => d.name === 'Country of Origin Labels')) {
      required.push({
        name: 'Country of Origin Labels',
        criticality: 'required',
        description: `All textile products must be labeled with country of origin. Each garment requires "Made in ${countryName}" permanently affixed.`,
        agency: 'CBP / FTC',
        mustInclude: [
          `"Made in ${countryName}" on each garment`,
          'Label must be conspicuous, legible, and not easily removed',
          'Must survive ordinary use and cleaning',
        ],
        learnMoreUrl: 'https://www.cbp.gov/trade/rulings/country-origin-marking',
      });
    }
  }

  // --- Children's products: CPSIA compliance ---
  if (input.attributes.forChildren) {
    if (!required.some(d => d.name === "Children's Product Certificate (CPC)")) {
      required.push({
        name: "Children's Product Certificate (CPC)",
        criticality: 'required',
        description: 'CPSIA requires third-party testing and certification for all products designed for children 12 and under.',
        agency: 'CPSC',
        mustInclude: [
          'Third-party test report from CPSC-accepted lab',
          'Lead content test results (≤100 ppm)',
          'Phthalate test results (if applicable)',
          'Tracking label information',
          'Small parts test (if for children under 3)',
        ],
        learnMoreUrl: 'https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/Childrens-Product-Certificate',
      });
    }
  }

  // --- Wireless / RF devices: FCC authorization ---
  if (input.attributes.wireless) {
    if (!required.some(d => d.name === 'FCC Equipment Authorization')) {
      required.push({
        name: 'FCC Equipment Authorization',
        criticality: 'required',
        description: 'All radio frequency devices must have FCC authorization before import. CBP may detain non-compliant RF devices.',
        agency: 'FCC',
        mustInclude: [
          'FCC ID number (on product and packaging)',
          'Grant of equipment authorization',
          'Test report from accredited lab',
        ],
        learnMoreUrl: 'https://www.fcc.gov/oet/equipment-authorization',
      });
    }
  }

  // --- Medical devices: FDA registration ---
  if (input.attributes.medicalDevice) {
    if (!required.some(d => d.name === 'FDA Device Registration & Listing')) {
      required.push({
        name: 'FDA Device Registration & Listing',
        criticality: 'required',
        description: 'Medical devices must be registered with FDA and listed before import. Class II/III devices may need 510(k) or PMA clearance.',
        agency: 'FDA',
        mustInclude: [
          'FDA establishment registration number',
          'Device listing number',
          '510(k) clearance or PMA number (if applicable)',
          'Labeling in English with intended use',
        ],
        learnMoreUrl: 'https://www.fda.gov/medical-devices/how-study-and-market-your-device/device-registration-and-listing',
      });
    }
  }

  // --- Food contact materials ---
  if (input.attributes.foodContact) {
    if (!required.some(d => d.name === 'FDA Food Contact Notification')) {
      required.push({
        name: 'FDA Food Contact Notification',
        criticality: 'required',
        description: 'Materials that contact food must comply with FDA food contact substance regulations (21 CFR 174-186).',
        agency: 'FDA',
        mustInclude: [
          'Food Contact Notification (FCN) number if new substance',
          'Compliance statement referencing 21 CFR section',
          'Migration testing results (if applicable)',
        ],
        learnMoreUrl: 'https://www.fda.gov/food/food-ingredients-packaging/food-contact-substances-fcs',
      });
    }
  }

  // --- Chemicals: TSCA compliance ---
  if (input.attributes.containsChemicals) {
    if (!required.some(d => d.name === 'TSCA Import Certification')) {
      required.push({
        name: 'TSCA Import Certification',
        criticality: 'required',
        description: 'Chemical substances must be certified as compliant with TSCA. Positive or negative certification required at entry.',
        agency: 'EPA',
        mustInclude: [
          'TSCA certification statement (positive or negative)',
          'CAS number for each chemical substance',
          'Confirmation substance is on TSCA Inventory',
        ],
        learnMoreUrl: 'https://www.epa.gov/tsca-import-export',
      });
    }
  }

  // --- Country of origin marking (non-textiles, universal CBP requirement) ---
  if (chapterNum < 50 || chapterNum > 63) {
    // Non-textiles: general 19 USC 1304 marking requirement
    if (!required.some(d => d.name === 'Country of Origin Marking')) {
      required.push({
        name: 'Country of Origin Marking',
        criticality: 'required',
        description: `19 USC §1304 requires every article of foreign origin to be marked with country of origin in English. Products must show "Made in ${countryName}" or equivalent.`,
        agency: 'CBP',
        mustInclude: [
          `"Made in ${countryName}" or "Product of ${countryName}" marking`,
          'Marking must be legible, permanent, and in a conspicuous location',
          'Marking must survive to ultimate purchaser',
        ],
        learnMoreUrl: 'https://www.cbp.gov/trade/rulings/country-origin-marking',
      });
    }
  }

  // ─── RECOMMENDED: Best practices that speed clearance ────────────────────
  const recommended: Documentation['recommended'] = [];

  // --- UFLPA compliance documentation (China + high-risk products) ---
  const uflpaChapters = ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '85'];
  const uflpaKeywords = ['cotton', 'polysilicon', 'solar', 'tomato', 'viscose', 'uyghur'];
  const isUflpaRisk = input.countryCode === 'CN' && (
    uflpaChapters.includes(chapter) ||
    uflpaKeywords.some(kw => (input.description || '').toLowerCase().includes(kw))
  );
  if (isUflpaRisk) {
    recommended.push({
      name: 'UFLPA Compliance Documentation',
      criticality: 'recommended',
      description: 'Uyghur Forced Labor Prevention Act (UFLPA) creates a rebuttable presumption that goods from Xinjiang involve forced labor. Proactive documentation significantly reduces detention risk.',
      mustInclude: [
        'Supplier declaration of no forced labor',
        'Supply chain map showing origin of raw materials',
        'Factory audit reports or social compliance certificates',
        'Purchase orders and invoices tracing material origin',
      ],
      learnMoreUrl: 'https://www.cbp.gov/trade/forced-labor/UFLPA',
    });
  }

  // --- Product photos (always recommended) ---
  recommended.push({
    name: 'Product Photos',
    criticality: 'recommended',
    description: 'Clear photos of product, labels, markings, and packaging. Helps CBP resolve questions without physical exam, reducing clearance delays.',
    mustInclude: [
      'Product from multiple angles',
      'Close-up of all labels and markings',
      'Packaging (inner and outer)',
      'Country of origin marking visible',
    ],
  });

  // --- Quality / inspection certificate ---
  recommended.push({
    name: 'Pre-Shipment Inspection Certificate',
    criticality: 'recommended',
    description: 'Third-party inspection report documenting product quality and specification compliance. Reduces likelihood of CBP intensive exam.',
  });

  // --- Certificate of origin for FTA-eligible countries ---
  const ftaCountries: Record<string, string> = {
    MX: 'USMCA', CA: 'USMCA',
    AU: 'AUSFTA', SG: 'USFTA', CL: 'USCFTA', KR: 'KORUS',
    CO: 'TPA', PA: 'TPA', PE: 'TPA',
    IL: 'USIFTA', JO: 'USJFTA', BH: 'USBFTA', OM: 'USOFTA', MA: 'USSFTA',
    GT: 'CAFTA-DR', HN: 'CAFTA-DR', SV: 'CAFTA-DR', CR: 'CAFTA-DR', DO: 'CAFTA-DR',
  };
  const ftaName = ftaCountries[input.countryCode];
  if (ftaName) {
    recommended.push({
      name: `${ftaName} Certificate of Origin`,
      criticality: 'recommended',
      description: `If your product qualifies under ${ftaName}, a certificate of origin can eliminate the base MFN duty. Requires meeting rules of origin.`,
      mustInclude: [
        'Certified origin declaration (producer or exporter)',
        'HS classification and description',
        'Origin criterion met (tariff shift, RVC, etc.)',
        `Blanket period (if applicable)`,
      ],
      learnMoreUrl: '/dashboard/compliance/fta-calculator',
    });
  }

  // --- ISF (Importer Security Filing) for ocean shipments ---
  recommended.push({
    name: 'Importer Security Filing (ISF / "10+2")',
    criticality: 'recommended',
    description: 'Required for all ocean shipments 24 hours before vessel loading. Late filing results in $5,000+ penalty per violation.',
    mustInclude: [
      'Manufacturer name and address',
      'Seller name and address',
      'Container stuffing location',
      'Consolidator name and address',
      'HTS number(s)',
    ],
  });

  // ─── DANGEROUS GOODS ─────────────────────────────────────────────────────
  let dangerousGoods: Documentation['dangerousGoods'] = undefined;

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
          criticality: 'critical',
          description: 'Proves batteries passed UN transport safety tests. Required by all carriers and customs.',
        },
        {
          name: 'MSDS / Safety Data Sheet',
          criticality: 'required',
          description: 'Material Safety Data Sheet for battery chemistry. Required for hazardous materials transport.',
        },
      ],
      carrierRestrictions: [
        {
          carrier: 'Air Freight',
          restriction: 'Watt-hour rating determines restrictions',
          details: '≤100 Wh: Standard shipping with proper documentation. >100 Wh: Restricted, cargo aircraft only.',
        },
        {
          carrier: 'Ocean Freight',
          restriction: 'IMDG Code compliance required',
          details: 'Must comply with IMDG Code special provision 188. Proper shipping name and UN number on outer packaging.',
        },
      ],
      packagingRequirements: [
        'Batteries must be protected from short circuit',
        'Equipment must be protected from accidental activation',
        'Strong outer packaging (drop test compliant)',
        'Each package ≤ 5 kg net weight for lithium ion',
      ],
      labelingRequirements: [
        'Lithium battery handling label (Class 9A) on outer packaging',
        'UN number on packaging (UN3481)',
        '"Cargo Aircraft Only" label if >100 Wh per cell',
      ],
    };
  }

  if (input.attributes.pressurized && !dangerousGoods) {
    dangerousGoods = {
      unClass: 'Class 2',
      unNumber: 'UN1950',
      properShippingName: 'Aerosols / Pressurized containers',
      hazardClass: 'Class 2: Gases (compressed, liquefied, dissolved)',
      packingGroup: undefined,
      packingInstruction: 'Per DOT 49 CFR 173.306',
      documents: [
        {
          name: 'DOT Hazardous Materials Certificate',
          criticality: 'critical',
          description: 'Certificate of compliance with DOT hazmat shipping requirements.',
        },
      ],
      carrierRestrictions: [
        {
          carrier: 'Air Freight',
          restriction: 'Limited quantities may apply',
          details: 'Aerosols ≤ 500 mL: limited quantity provisions. > 500 mL: full hazmat regulations.',
        },
      ],
      packagingRequirements: [
        'DOT-approved containers',
        'Pressure test certification',
        'Proper cushioning and orientation',
      ],
      labelingRequirements: [
        'Flammable gas or non-flammable gas label',
        'Proper shipping name and UN number',
      ],
    };
  }

  if (input.attributes.flammable && !dangerousGoods) {
    dangerousGoods = {
      unClass: 'Class 3',
      unNumber: 'UN1993',
      properShippingName: 'Flammable liquid, N.O.S.',
      hazardClass: 'Class 3: Flammable liquids',
      packingGroup: 'II',
      packingInstruction: 'Per DOT 49 CFR 173.150',
      documents: [
        {
          name: 'DOT Hazardous Materials Certificate',
          criticality: 'critical',
          description: 'Certificate of compliance with DOT hazmat shipping requirements for flammable liquids.',
        },
        {
          name: 'MSDS / Safety Data Sheet',
          criticality: 'required',
          description: 'Safety Data Sheet with flash point, flammability class, and handling procedures.',
        },
      ],
      carrierRestrictions: [
        {
          carrier: 'Air Freight',
          restriction: 'Flash point determines restrictions',
          details: 'Flash point ≤ 60°C: requires full hazmat documentation. Some carriers refuse flammable cargo.',
        },
        {
          carrier: 'Ocean Freight',
          restriction: 'IMDG Code Class 3 requirements',
          details: 'Must comply with IMDG packing, labeling, and stowage requirements.',
        },
      ],
      packagingRequirements: [
        'UN-certified packaging with proper closure',
        'Inner containers must not exceed 5L (Packing Group II)',
        'Absorbent material between inner and outer packaging',
      ],
      labelingRequirements: [
        'Class 3 flammable liquid diamond label',
        'UN number and proper shipping name',
        'Orientation arrows on outer packaging',
      ],
    };
  }

  console.log(`[Orchestrator] Documentation: ${critical.length} critical, ${required.length} required, ${recommended.length} recommended${dangerousGoods ? ', +DG' : ''}`);

  return {
    critical,
    required,
    recommended,
    dangerousGoods,
  };
}

/**
 * Map PGA flag codes to specific documentation requirements.
 * Returns a DocumentRequirement for known flag patterns, or null for generic flags.
 */
function getPGADocumentation(
  agencyCode: string,
  flagCode: string,
  flagName: string
): Documentation['required'][number] | null {
  // Map well-known PGA flags to specific documentation
  const pgaDocMap: Record<string, Documentation['required'][number]> = {
    CP1: {
      name: "CPSC Children's Product Certificate",
      criticality: 'required',
      description: "Third-party tested certification that children's product meets all applicable CPSC safety rules.",
      agency: 'CPSC',
      mustInclude: [
        'Test report from CPSC-accepted laboratory',
        'Lead content and phthalate test results',
        'Tracking label information',
        'Applicable ASTM/CPSIA standard references',
      ],
      learnMoreUrl: 'https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/Childrens-Product-Certificate',
    },
    CP2: {
      name: 'CPSC General Conformity Certificate',
      criticality: 'required',
      description: 'Certification that consumer product complies with applicable CPSC safety standards.',
      agency: 'CPSC',
      mustInclude: [
        'Applicable safety standard (e.g., 16 CFR Part 1633 for mattresses)',
        'Test results from CPSC-accepted lab',
        'Manufacturer/importer contact information',
      ],
      learnMoreUrl: 'https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/General-Conformity-Certificate',
    },
    FC1: {
      name: 'FCC Equipment Authorization',
      criticality: 'required',
      description: 'FCC grant of equipment authorization for radio frequency devices. Required before import.',
      agency: 'FCC',
      mustInclude: [
        'FCC ID number',
        'Grant of equipment authorization document',
        'Test report from accredited laboratory',
        'FCC label on product',
      ],
      learnMoreUrl: 'https://www.fcc.gov/oet/equipment-authorization',
    },
    FD1: {
      name: 'FDA Prior Notice',
      criticality: 'required',
      description: 'Food products require advance notification to FDA before arrival. Must be submitted via ACE or FDA Industry Systems.',
      agency: 'FDA',
      mustInclude: [
        'Product description and FDA Product Code',
        'Manufacturer and shipper information',
        'Prior Notice confirmation number',
        'Anticipated arrival information',
      ],
      learnMoreUrl: 'https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods',
    },
    FD2: {
      name: 'FDA Medical Device Registration',
      criticality: 'required',
      description: 'Medical devices require FDA establishment registration and device listing before import.',
      agency: 'FDA',
      mustInclude: [
        'FDA establishment registration number',
        'Device listing number',
        '510(k) clearance or PMA approval number (Class II/III)',
        'Labeling in English',
      ],
      learnMoreUrl: 'https://www.fda.gov/medical-devices/how-study-and-market-your-device/device-registration-and-listing',
    },
    FD3: {
      name: 'FDA Drug Import Documentation',
      criticality: 'required',
      description: 'Drug products require FDA establishment registration, drug listing, and applicable approvals.',
      agency: 'FDA',
      mustInclude: [
        'FDA drug establishment registration',
        'Drug listing with National Drug Code (NDC)',
        'NDA/ANDA approval (if applicable)',
        'Current Good Manufacturing Practice (cGMP) compliance',
      ],
      learnMoreUrl: 'https://www.fda.gov/drugs/drug-imports-exports',
    },
    FD4: {
      name: 'FDA Cosmetics Compliance',
      criticality: 'required',
      description: 'Cosmetic products must comply with FDA labeling and safety requirements.',
      agency: 'FDA',
      mustInclude: [
        'Product ingredient list (INCI names)',
        'English-language labeling',
        'No banned color additives',
        'Facility registration (voluntary but recommended)',
      ],
      learnMoreUrl: 'https://www.fda.gov/cosmetics/cosmetics-guidance-regulation',
    },
    FD5: {
      name: 'FDA Radiation Performance Standard Report',
      criticality: 'required',
      description: 'Products that emit radiation (lasers, microwaves, monitors) require compliance with FDA performance standards.',
      agency: 'FDA',
      mustInclude: [
        'Accession number from FDA',
        'Radiation performance standard test report',
        'Product labeling with safety information',
      ],
      learnMoreUrl: 'https://www.fda.gov/radiation-emitting-products/importing-and-exporting-electronic-products',
    },
    EP1: {
      name: 'EPA Pesticide Registration',
      criticality: 'required',
      description: 'Pesticides require EPA registration and Notice of Arrival before import under FIFRA.',
      agency: 'EPA',
      mustInclude: [
        'EPA registration number',
        'Foreign producer establishment number',
        'Notice of Arrival to EPA',
        'English-language labeling',
      ],
      learnMoreUrl: 'https://www.epa.gov/pesticide-registration/importing-pesticides',
    },
    EP2: {
      name: 'TSCA Import Certification',
      criticality: 'required',
      description: 'Chemical substances require TSCA certification at import — either positive or negative certification.',
      agency: 'EPA',
      mustInclude: [
        'TSCA import certification statement',
        'CAS number for chemical substance',
        'Confirmation on TSCA Inventory (or exempt)',
      ],
      learnMoreUrl: 'https://www.epa.gov/tsca-import-export',
    },
    EP3: {
      name: 'EPA Vehicle/Engine Emissions Certificate',
      criticality: 'required',
      description: 'Vehicles and engines must meet EPA emission standards. Certificate of conformity required.',
      agency: 'EPA',
      mustInclude: [
        'EPA certificate of conformity',
        'Emissions test results',
        'Import Code/ICI form (EPA 3520-1)',
      ],
      learnMoreUrl: 'https://www.epa.gov/importing-vehicles-and-engines',
    },
    AQ1: {
      name: 'Phytosanitary Certificate',
      criticality: 'required',
      description: 'Plants and plant products require a phytosanitary certificate from the origin country NPPO.',
      agency: 'USDA/APHIS',
      mustInclude: [
        'Phytosanitary certificate from origin country',
        'APHIS import permit (if required)',
        'Treatment certification (if applicable)',
      ],
      learnMoreUrl: 'https://www.aphis.usda.gov/aphis/ourfocus/importexport',
    },
    AQ3: {
      name: 'Lacey Act Declaration',
      criticality: 'required',
      description: 'Wood and plant products require a Lacey Act declaration identifying species and country of harvest.',
      agency: 'USDA/APHIS',
      mustInclude: [
        'Scientific name of species (genus + species)',
        'Country of harvest',
        'Quantity and unit of measure',
        'Value of the plant/plant product',
      ],
      learnMoreUrl: 'https://www.aphis.usda.gov/aphis/ourfocus/planthealth/import-information/lacey-act',
    },
    DT1: {
      name: 'DOT/NHTSA Motor Vehicle Import Compliance',
      criticality: 'required',
      description: 'Motor vehicles must comply with Federal Motor Vehicle Safety Standards (FMVSS).',
      agency: 'DOT/NHTSA',
      mustInclude: [
        'HS-7 Declaration Form (DOT)',
        'FMVSS compliance certification',
        'VIN documentation',
      ],
      learnMoreUrl: 'https://www.nhtsa.gov/importing-vehicle',
    },
    AT1: {
      name: 'ATF Import Permit',
      criticality: 'required',
      description: 'Firearms and ammunition require ATF Form 6 import permit before shipment.',
      agency: 'ATF',
      mustInclude: [
        'ATF Form 6 (approved)',
        'Federal Firearms License (FFL) number',
        'Detailed description of items',
      ],
      learnMoreUrl: 'https://www.atf.gov/firearms/import-firearms-ammunition-and-implements-war',
    },
  };

  if (pgaDocMap[flagCode]) {
    return pgaDocMap[flagCode];
  }

  // Fallback: generate a generic doc requirement from the flag name
  return {
    name: `${flagName} Compliance Documentation`,
    criticality: 'required',
    description: `Compliance documentation required by ${agencyCode} for this product category.`,
    agency: agencyCode,
  };
}

/**
 * Step 6: Identify optimization opportunities
 * 
 * Synthesizes data from ALL prior steps to generate actionable recommendations:
 * - Classification confidence & alternatives → classification review / tariff engineering
 * - Landed cost tariff layers → identifies biggest cost drivers
 * - Country comparison → country switch opportunities with data-driven tradeoffs
 * - Compliance alerts → Section 232 exclusion, AD/CVD mitigation, FTA qualification
 */
async function getOptimizationOpportunities(
  input: AnalyzeProductInput,
  classification: Classification,
  landedCost: LandedCost,
  countryComparison: CountryComparison,
  compliance: Compliance
): Promise<Optimization> {
  const opportunities: OptimizationOpportunity[] = [];
  const currentCountryName = getCountryName(input.countryCode);
  const currentTotal = landedCost.total;
  
  // Helper: calculate savings percentage relative to current landed cost
  const savingsPercent = (savings: number): number =>
    currentTotal > 0 ? Math.round((savings / currentTotal) * 100) : 0;

  // Minimum savings threshold: 2% of landed cost or $500, whichever is greater
  const MIN_SAVINGS_THRESHOLD = Math.max(currentTotal * 0.02, 500);

  // ─── 1. Country Switch (from country comparison data) ───────────────
  const topAlternative = countryComparison.alternatives[0];
  if (topAlternative && topAlternative.savings > MIN_SAVINGS_THRESHOLD) {
    // Build data-driven tradeoffs from the country comparison data we already have
    const tradeoffs: string[] = [];
    const currentTransit = countryComparison.current.transitDays;
    const altTransit = topAlternative.transitDays;
    if (currentTransit && altTransit) {
      if (altTransit > currentTransit) {
        tradeoffs.push(`Longer transit time: ~${altTransit} days vs ~${currentTransit} days currently`);
      } else if (altTransit < currentTransit) {
        tradeoffs.push(`Faster transit: ~${altTransit} days vs ~${currentTransit} days currently`);
      }
    }
    if (topAlternative.dataQuality === 'low') {
      tradeoffs.push('Cost estimate based on tariff rates only — verify with supplier quotes');
    }
    if ((topAlternative.supplierCount ?? 0) === 0) {
      tradeoffs.push('No verified suppliers in our database — sourcing research needed');
    } else if ((topAlternative.supplierCount ?? 0) < 5) {
      tradeoffs.push(`Limited supplier base (${topAlternative.supplierCount} known suppliers)`);
    }
    if (topAlternative.costTrend === 'rising') {
      tradeoffs.push('Import costs trending upward for this country — savings may decrease');
    }
    if (tradeoffs.length === 0) {
      tradeoffs.push('Verify product quality standards with new suppliers');
    }

    opportunities.push({
      id: 'country-switch',
      title: `Source from ${topAlternative.countryName} instead of ${currentCountryName}`,
      type: 'country_switch',
      savings: topAlternative.savings,
      savingsPercent: savingsPercent(topAlternative.savings),
      description: `Switching sourcing from ${currentCountryName} to ${topAlternative.countryName} could reduce your landed cost from $${currentTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })} to $${topAlternative.landedCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} — a ${savingsPercent(topAlternative.savings)}% reduction on this shipment.`,
      tradeoffs,
      actionLabel: 'Compare Countries',
      actionUrl: '/dashboard/sourcing',
      difficulty: 'hard',
      priority: 'high',
      relatedSection: 'countryComparison',
    });
  }

  // ─── 2. FTA Qualification (de-duplicated from country switch) ───────
  // Find best FTA country that isn't already the country_switch recommendation
  const ftaCountry = countryComparison.alternatives.find(
    (c) => c.ftaAvailable && c.savings > 0 && c.countryCode !== topAlternative?.countryCode
  );
  // Also check if the top alternative itself is an FTA country (avoid separate entry)
  const topAltIsFta = topAlternative?.ftaAvailable && topAlternative.savings > MIN_SAVINGS_THRESHOLD;
  
  if (ftaCountry && ftaCountry.savings > MIN_SAVINGS_THRESHOLD) {
    const ftaLabel = ftaCountry.ftaName || 'US Free Trade Agreement';
    opportunities.push({
      id: 'fta-qualification',
      title: `Qualify for ${ftaLabel} via ${ftaCountry.countryName}`,
      type: 'fta_qualification',
      savings: ftaCountry.savings,
      savingsPercent: savingsPercent(ftaCountry.savings),
      description: `Sourcing from ${ftaCountry.countryName} under ${ftaLabel} could eliminate the base MFN duty. Note: IEEPA tariffs still apply to most FTA partners.`,
      requirements: [
        `Product must meet ${ftaLabel} rules of origin (tariff shift or regional value content)`,
        'Supplier must provide a valid certificate of origin',
        'Maintain recordkeeping for 5 years per CBP requirements',
      ],
      tradeoffs: ftaCountry.costTrend === 'rising'
        ? ['Import costs from this country are trending upward']
        : undefined,
      actionLabel: 'Open FTA Calculator',
      actionUrl: `/dashboard/compliance/fta-calculator?htsCode=${classification.htsCode.replace(/\./g, '')}`,
      difficulty: 'medium',
      priority: 'high',
      relatedSection: 'countryComparison',
    });
  } else if (topAltIsFta && topAlternative) {
    // Top alternative IS the FTA country — add a note about FTA qualification to the existing entry
    // but don't create a separate opportunity (avoids double-counting)
    const existing = opportunities.find(o => o.id === 'country-switch');
    if (existing && topAlternative.ftaName) {
      existing.requirements = [
        ...(existing.requirements || []),
        `May qualify for ${topAlternative.ftaName} — use FTA Calculator to verify rules of origin`,
      ];
    }
  }

  // ─── 3. Classification Review (when alternatives have lower duty) ───
  if (classification.alternatives.length > 0 && classification.confidence < 85) {
    // Check if any alternative has a materially lower duty rate
    const currentRate = landedCost.duties.effectiveRate;
    const lowerDutyAlts = classification.alternatives.filter(alt => {
      const altRateStr = alt.dutyRate;
      const altRateMatch = altRateStr.match(/(\d+(\.\d+)?)/);
      if (!altRateMatch) return false;
      const altMfn = parseFloat(altRateMatch[1]);
      // Alternative MFN rate is materially lower (>3pp difference)
      return altMfn < (classification.baseMfnRate ?? currentRate) - 3;
    });

    if (lowerDutyAlts.length > 0) {
      const bestAlt = lowerDutyAlts[0];
      const altRateMatch = bestAlt.dutyRate.match(/(\d+(\.\d+)?)/);
      const altMfnRate = altRateMatch ? parseFloat(altRateMatch[1]) : 0;
      const rateDiff = (classification.baseMfnRate ?? currentRate) - altMfnRate;
      const estimatedSavings = Math.round(landedCost.dutiableValue * (rateDiff / 100));

      if (estimatedSavings > 100) {
        opportunities.push({
          id: 'classification-review',
          title: 'Review HTS Classification',
          type: 'classification_review',
          savings: estimatedSavings,
          savingsPercent: savingsPercent(estimatedSavings),
          description: `Classification confidence is ${classification.confidence}%. Alternative code ${bestAlt.code} (${bestAlt.description}) has a lower base duty rate of ${bestAlt.dutyRate} vs ${classification.baseMfnRate ?? currentRate}%. A customs ruling could confirm the correct classification.`,
          requirements: [
            'Consult with a licensed customs broker for binding ruling',
            'Consider filing CBP Binding Ruling request (Form 177)',
            'Review product specifications against HTS chapter notes',
          ],
          tradeoffs: [
            'Binding ruling process takes 30-90 days',
            'Incorrect reclassification carries penalty risk',
          ],
          actionLabel: 'View Alternatives',
          difficulty: 'medium',
          priority: classification.confidence < 70 ? 'high' : 'medium',
          relatedSection: 'classification',
        });
      }
    }
  }

  // ─── 4. Section 232 Exclusion Filing ────────────────────────────────
  const has232 = compliance.alerts.some(
    a => a.category === 'tariff_program' && a.title.includes('Section 232')
  );
  if (has232) {
    const s232Layer = landedCost.duties.layers.find(l => l.programType === 'section_232');
    const s232Amount = s232Layer?.amount ?? Math.round(landedCost.dutiableValue * 0.25);

    opportunities.push({
      id: 'section-232-exclusion',
      title: 'File Section 232 Exclusion Request',
      type: 'section_232_exclusion',
      savings: s232Amount,
      savingsPercent: savingsPercent(s232Amount),
      description: `This product is subject to a 25% Section 232 tariff ($${s232Amount.toLocaleString('en-US')} on this shipment). The Commerce Department allows product-specific exclusion requests if the product is not available domestically.`,
      requirements: [
        'File exclusion request via Commerce Department portal (BIS-232)',
        'Demonstrate product is not available from domestic sources',
        'Provide detailed product specifications and end-use information',
        'Exclusion process takes 90-120 days on average',
      ],
      tradeoffs: [
        'Application fee and compliance costs',
        'Exclusions are time-limited (typically 1 year) and must be renewed',
        'No guarantee of approval — success rate varies by product',
      ],
      actionLabel: 'Commerce 232 Portal',
      actionUrl: 'https://www.commerce.gov/section-232-investigations',
      difficulty: 'hard',
      priority: 'medium',
    });
  }

  // ─── 5. AD/CVD Mitigation ──────────────────────────────────────────
  if (compliance.adcvdWarning?.isCountryAffected) {
    const adcvdAlert = compliance.alerts.find(a => a.category === 'adcvd' && a.level === 'high');
    // Find an alternative country without AD/CVD exposure
    const adcvdFreeAlternative = countryComparison.alternatives.find(
      alt => !compliance.adcvdWarning?.affectedCountries.includes(alt.countryCode) && alt.savings > 0
    );

    if (adcvdFreeAlternative) {
      opportunities.push({
        id: 'adcvd-mitigation',
        title: `Avoid AD/CVD Duties — Source from ${adcvdFreeAlternative.countryName}`,
        type: 'adcvd_mitigation',
        savings: adcvdFreeAlternative.savings,
        savingsPercent: savingsPercent(adcvdFreeAlternative.savings),
        description: `${compliance.adcvdWarning.productCategory} from ${currentCountryName} is subject to AD/CVD duties${compliance.adcvdWarning.dutyRange ? ` (${compliance.adcvdWarning.dutyRange})` : ''}. ${adcvdFreeAlternative.countryName} is not subject to these orders.`,
        requirements: [
          'Verify the alternative country is not subject to any AD/CVD orders for this product',
          'Ensure no transshipment concerns (goods must be substantially transformed)',
        ],
        actionLabel: 'AD/CVD Lookup',
        actionUrl: `/dashboard/compliance/addcvd?htsCode=${classification.htsCode.replace(/\./g, '')}`,
        difficulty: 'hard',
        priority: 'high',
        relatedSection: 'compliance',
      });
    }
  }

  // ─── 6. High Tariff Exposure Alert (actionable summary) ────────────
  const effectiveRate = landedCost.duties.effectiveRate;
  if (effectiveRate > 50 && opportunities.length === 0) {
    // Only show this if no other opportunities were found — otherwise it's redundant
    const biggestLayer = [...landedCost.duties.layers]
      .filter(l => l.rate > 0)
      .sort((a, b) => b.amount - a.amount)[0];

    opportunities.push({
      id: 'high-tariff-alert',
      title: `High Tariff Exposure — ${effectiveRate.toFixed(1)}% Effective Rate`,
      type: 'high_tariff_alert',
      savings: 0,
      description: `Your combined duty rate of ${effectiveRate.toFixed(1)}% significantly impacts margins.${biggestLayer ? ` The largest component is ${biggestLayer.name} at ${biggestLayer.rate}%.` : ''} Consider exploring alternative sourcing countries or classification review.`,
      actionLabel: 'Explore Alternatives',
      actionUrl: '/dashboard/sourcing',
      difficulty: 'medium',
      priority: 'high',
      relatedSection: 'landedCost',
    });
  }

  // ─── 7. Duty Drawback (if product may be re-exported) ─────────────
  // Surface this as a low-priority opportunity for high-duty products
  if (effectiveRate > 30 && landedCost.duties.total > 5000) {
    opportunities.push({
      id: 'duty-drawback',
      title: 'Duty Drawback Eligibility',
      type: 'duty_drawback',
      savings: Math.round(landedCost.duties.total * 0.99), // 99% drawback for direct substitution
      savingsPercent: savingsPercent(Math.round(landedCost.duties.total * 0.99)),
      description: `If these goods (or substituted goods) are re-exported or destroyed, you may recover up to 99% of duties paid ($${Math.round(landedCost.duties.total * 0.99).toLocaleString('en-US')}). Applies to manufacturing drawback, unused merchandise, and rejected goods.`,
      requirements: [
        'Must re-export or destroy goods within 5 years of import',
        'File drawback claim with CBP (Form 7551)',
        'Maintain detailed import/export recordkeeping',
        'Consider working with a drawback specialist or customs broker',
      ],
      tradeoffs: [
        'Only applicable if goods are re-exported — not relevant for domestic sale',
        'Administrative overhead for tracking and filing claims',
      ],
      actionLabel: 'CBP Drawback Info',
      actionUrl: 'https://www.cbp.gov/trade/programs-administration/entry-summary/duty-drawback',
      difficulty: 'hard',
      priority: 'low',
    });
  }

  // ─── Sort by priority then savings ─────────────────────────────────
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  opportunities.sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority ?? 'medium'];
    const pb = PRIORITY_ORDER[b.priority ?? 'medium'];
    if (pa !== pb) return pa - pb;
    return b.savings - a.savings;
  });

  // ─── De-duplicated total savings ───────────────────────────────────
  // Country switch and FTA qualification may overlap (FTA country could be same region).
  // Duty drawback only applies to re-export, so exclude from total.
  // Section 232 exclusion and country switch overlap (both reduce same cost).
  // Take the max of overlapping opportunities, not the sum.
  const countrySwitchSavings = opportunities.find(o => o.type === 'country_switch')?.savings ?? 0;
  const ftaSavings = opportunities.find(o => o.type === 'fta_qualification')?.savings ?? 0;
  const classReviewSavings = opportunities.find(o => o.type === 'classification_review')?.savings ?? 0;
  const s232Savings = opportunities.find(o => o.type === 'section_232_exclusion')?.savings ?? 0;
  const adcvdSavings = opportunities.find(o => o.type === 'adcvd_mitigation')?.savings ?? 0;

  // Country switch, FTA, and AD/CVD are mutually exclusive sourcing strategies — take the max
  const sourcingSavings = Math.max(countrySwitchSavings, ftaSavings, adcvdSavings);
  // Classification review is independent (changes the rate for any country)
  // Section 232 exclusion is additive with sourcing switch (eliminates a layer)
  const totalPotentialSavings = sourcingSavings + classReviewSavings + s232Savings;

  const topOpp = opportunities[0];
  const topRecommendation = topOpp
    ? topOpp.savings > 0
      ? `${topOpp.title} — save $${topOpp.savings.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : topOpp.title
    : 'Your current import strategy appears cost-optimal';

  return {
    opportunities,
    totalPotentialSavings,
    topRecommendation,
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
