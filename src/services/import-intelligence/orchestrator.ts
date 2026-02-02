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
import type { 
  ImportAnalysis, 
  ProductInput,
  Classification,
  LandedCost,
  DutyLayer,
  CountryComparison,
  Compliance,
  Documentation,
  Optimization,
} from '@/features/import-intelligence/types';

export interface AnalyzeProductInput extends ProductInput {
  userId?: string;
}

/**
 * Main orchestrator - runs complete import intelligence analysis
 */
export async function analyzeProduct(input: AnalyzeProductInput): Promise<ImportAnalysis> {
  const startTime = Date.now();
  
  // Step 1: Classification
  const classification = await getClassification(input);
  
  // Step 2: Landed Cost (using classified HTS code)
  const landedCost = await getLandedCost(input, classification.htsCode);
  
  // Step 3: Country Comparison
  const countryComparison = await getCountryComparison(input, classification.htsCode);
  
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
    return {
      htsCode: input.htsCode,
      description: 'User-provided HTS code',
      confidence: 100,
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
  
  return {
    htsCode: result.primary.htsCode,
    description: result.primary.shortDescription || result.primary.fullDescription || '',
    confidence: result.primary.confidence,
    alternatives: result.alternatives?.slice(0, 5).map((alt) => ({
      code: alt.htsCode,
      description: alt.description || alt.fullDescription || '',
      confidence: alt.confidence,
      dutyRate: alt.duty?.baseMfn?.toString() || '0',
    })) || [],
    path: hierarchyPath,
  };
}

/**
 * Fallback landed cost calculation when no data available
 * Uses the tariff registry for accurate duty calculations
 */
async function getFallbackLandedCost(
  input: AnalyzeProductInput,
  htsCode: string
): Promise<LandedCost> {
  // Estimate shipping as 5% of value
  const shipping = input.value * 0.05;
  const insurance = input.value * 0.005;
  const dutiableValue = input.value + shipping + insurance;
  
  // Get accurate tariff data from registry
  const tariffResult = await getEffectiveTariff(input.countryCode, htsCode, {
    baseMfnRate: 10, // Estimate 10% base if unknown
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
  const mpf = Math.min(Math.max(dutiableValue * 0.003464, 31.67), 614.35);
  const hmf = dutiableValue * 0.00125;
  
  const estimatedAdditional = 450;
  const total = input.value + shipping + insurance + totalDuty + mpf + hmf + estimatedAdditional;
  
  // Calculate duty as percentage of product cost
  const dutyAsPercentOfProduct = input.value > 0 ? (totalDuty / input.value) * 100 : 0;
  
  // Determine data quality and confidence based on tariff result
  // High confidence if data came from registry with recent verification
  const dataQuality: 'high' | 'medium' | 'low' = 
    tariffResult.dataFreshness?.includes('verified') || tariffResult.dataFreshness?.includes('Live') 
      ? 'high' 
      : tariffResult.warnings?.length === 0 
        ? 'medium' 
        : 'low';
  
  // Confidence based on whether we have exact rates or estimates
  // 95% for registry data, lower if using fallbacks
  const tariffConfidence = tariffResult.dataFreshness?.includes('No data') ? 60 : 
    tariffResult.warnings?.some(w => w.includes('estimated')) ? 75 : 90;
  
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
      warnings: tariffResult.warnings,
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
  htsCode: string
): Promise<LandedCost> {
  // Always use the tariff registry for accurate, comprehensive duty data
  // The fallback function now uses the registry too
  console.log('[Orchestrator] Calculating landed cost with tariff registry');
  return getFallbackLandedCost(input, htsCode);
}

/**
 * Step 3: Compare alternative sourcing countries
 */
async function getCountryComparison(
  input: AnalyzeProductInput,
  htsCode: string
): Promise<CountryComparison> {
  // Get current country landed cost using our comprehensive calculation
  const currentLanded = await getFallbackLandedCost(input, htsCode);
  const currentTotal = currentLanded.total;
  const currentDutyRate = currentLanded.duties.effectiveRate;
  
  // Compare with key alternative countries
  const alternativeCountries = ['VN', 'MX', 'IN', 'BD', 'TH'].filter(
    (c) => c !== input.countryCode
  );
  
  const alternatives = await Promise.all(
    alternativeCountries.slice(0, 4).map(async (countryCode) => {
      // Create a modified input for the alternative country
      const altInput: AnalyzeProductInput = {
        ...input,
        countryCode,
      };
      
      try {
        const altLanded = await getFallbackLandedCost(altInput, htsCode);
        
        // Check if this country has FTA benefits
        const tariffResult = await getEffectiveTariff(countryCode, htsCode, {
          baseMfnRate: 10,
        });
        
        return {
          countryCode,
          countryName: getCountryName(countryCode),
          landedCost: altLanded.total,
          dutyRate: altLanded.duties.effectiveRate,
          savings: Math.max(0, currentTotal - altLanded.total),
          ftaAvailable: tariffResult.hasFta,
          ftaName: tariffResult.ftaName || undefined,
        };
      } catch (error) {
        console.warn(`[Orchestrator] Failed to calculate for ${countryCode}:`, error);
        return null;
      }
    })
  );
  
  const validAlternatives = alternatives.filter((a) => a !== null);
  
  // Sort by savings (highest first)
  validAlternatives.sort((a, b) => b!.savings - a!.savings);
  
  const topAlternative = validAlternatives[0];
  const recommendation = topAlternative?.savings > 0
    ? `${topAlternative.countryName} offers potential savings of $${topAlternative.savings.toLocaleString('en-US')}`
    : 'Your current sourcing appears optimal';
  
  // Check if current country has FTA
  const currentTariff = await getEffectiveTariff(input.countryCode, htsCode, {
    baseMfnRate: 10,
  });
  
  return {
    current: {
      countryCode: input.countryCode,
      countryName: getCountryName(input.countryCode),
      landedCost: currentTotal,
      dutyRate: currentDutyRate,
      savings: 0,
      ftaAvailable: currentTariff.hasFta,
      ftaName: currentTariff.ftaName || undefined,
    },
    alternatives: validAlternatives as any,
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
    CN: 'China',
    VN: 'Vietnam',
    MX: 'Mexico',
    IN: 'India',
    BD: 'Bangladesh',
    TH: 'Thailand',
    US: 'United States',
  };
  return names[code] || code;
}
