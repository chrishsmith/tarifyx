/**
 * Landed Cost Calculator
 * 
 * Calculates total cost to import products from different countries.
 * Uses REAL cost data from HtsCostByCountry combined with ACCURATE tariff data.
 * 
 * UPDATED: Now integrates with the centralized Country Tariff Registry
 * when available, falling back to local data when not.
 * 
 * IMPORTANT: As of December 2025, tariff calculations include:
 * - Base MFN rate (from HTS code)
 * - Section 301 (China products)
 * - IEEPA Universal Baseline (10%+ for nearly ALL countries including FTA partners!)
 * - IEEPA Fentanyl (CN, MX, CA)
 * - IEEPA Reciprocal (country-specific higher rates)
 * - Section 232 (steel/aluminum)
 * 
 * NOTE: USITC DataWeb provides import VOLUME statistics, not tariff rates.
 * Tariff rates come from Chapter 99 codes which we calculate separately.
 * 
 * @see docs/ARCHITECTURE_TARIFF_REGISTRY.md
 * @see src/services/tariffRegistry.ts
 */

import { prisma } from '@/lib/db';
import { 
    getSection301Rate as getSection301RateFromData 
} from '@/data/section301Lists';
import { 
    getCountryReciprocalRate,
    isSection232Product,
    IEEPA_PROGRAMS,
    getCountryProfile,
} from '@/data/tariffPrograms';
import { 
    getEffectiveTariff as getEffectiveTariffFromRegistry,
    getTariffProfile,
} from '@/services/tariff/registry';
import { getBaseMfnRate } from '@/services/hts/database';
import { getImportStatsByHTS, type ImportStatsByCountry } from '@/services/usitcDataWeb';

// ═══════════════════════════════════════════════════════════════════════════════
// TARIFF HELPERS - Using centralized data sources for accuracy
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get Section 301 rate for China products
 * Uses the centralized section301Lists data
 */
function getSection301Rate(htsCode: string, countryCode: string): number {
    if (countryCode !== 'CN' && countryCode !== 'HK') return 0;
    
    const section301 = getSection301RateFromData(htsCode);
    if (section301) {
        return section301.rate;
    }
    
    // Fallback to chapter-based estimate
    const chapter = htsCode.substring(0, 2);
    const list3Chapters = ['84', '85', '90', '94', '95']; // Electronics, machinery
    const list4AChapters = ['39', '61', '62', '63', '64', '42']; // Consumer goods
    
    if (list3Chapters.includes(chapter)) return 25;
    if (list4AChapters.includes(chapter)) return 7.5;
    return 7.5; // Default assumption for China
}

/**
 * Get IEEPA rate for a country
 * 
 * As of April 2025:
 * - Universal 10% baseline applies to NEARLY ALL countries (including FTA partners!)
 * - Some countries have HIGHER reciprocal rates (e.g., Vietnam 46%)
 * - China/Mexico/Canada have additional Fentanyl tariffs
 */
function getIEEPARate(countryCode: string): number {
    // Get the country-specific reciprocal rate
    // This includes the 10% baseline + any country-specific additions
    return getCountryReciprocalRate(countryCode);
}

/**
 * Check if IEEPA rates may be exempt for USMCA-compliant goods
 * Note: 25% fentanyl tariff is active since March 2025, but USMCA-compliant goods are largely exempt
 */
function isUSMCACountry(countryCode: string): boolean {
    return countryCode === 'MX' || countryCode === 'CA';
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LandedCostBreakdown {
    country: string;
    countryCode: string;
    
    // Product cost from HtsCostByCountry (real import data)
    productCost: number;
    productCostConfidence: number;
    
    // Shipping estimates
    shippingCost: number;
    transitDays: number;
    
    // Tariff breakdown
    tariffs: {
        baseTariff: number;         // MFN rate %
        section301: number;         // Section 301 rate %
        ieepaRate: number;          // IEEPA reciprocal rate %
        adCvdRate: number;          // AD/CVD if applicable %
        ftaDiscount: number;        // FTA reduction %
        ftaName?: string | null;    // FTA name if applicable
        ftaNotes?: string | null;   // FTA notes for UI
        effectiveRate: number;      // Total tariff %
        tariffAmount: number;       // $ per unit
    };
    
    // Fees
    fees: {
        mpf: number;                // Merchandise Processing Fee
        hmf: number;                // Harbor Maintenance Fee
        totalFees: number;
    };
    
    // Totals
    totalLandedCost: number;
    
    // Comparison
    savingsVsChina: number | null;
    savingsPercent: number | null;
    
    // Metadata
    dataQuality: 'high' | 'medium' | 'low';
    lastUpdated: Date | null;
    
    // Import volume & trend (from DataWeb)
    importVolume?: number;          // Total import value (USD) for this HTS+country
    importVolumeYear?: number;      // Year the volume data represents
    costTrend?: 'rising' | 'falling' | 'stable';
    costTrendPercent?: number;      // YoY change in avg unit value
}

export interface LandedCostComparison {
    htsCode: string;
    htsDescription?: string;
    baseTariffRate: number;
    countries: LandedCostBreakdown[];
    cheapestCountry: string;
    mostExpensiveCountry: string;
    averageCost: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

// Merchandise Processing Fee (MPF): 0.3464% of value, min $33.58, max $651.50
// Updated for FY2026 (effective Oct 1, 2025) per CBP Dec 25-10
const MPF_RATE = 0.003464;
const MPF_MIN = 33.58;
const MPF_MAX = 651.50;

// Harbor Maintenance Fee (HMF): 0.125% of value (ocean shipments only)
const HMF_RATE = 0.00125;

// Shipping cost estimates ($ per kg, from country to US West Coast)
const SHIPPING_COSTS: Record<string, number> = {
    'CN': 0.80,  // China
    'VN': 0.90,  // Vietnam
    'IN': 1.10,  // India
    'BD': 1.20,  // Bangladesh
    'TH': 0.95,  // Thailand
    'ID': 1.00,  // Indonesia
    'MY': 0.90,  // Malaysia
    'PH': 0.95,  // Philippines
    'TW': 0.85,  // Taiwan
    'KR': 0.80,  // South Korea
    'JP': 0.75,  // Japan
    'MX': 0.40,  // Mexico (land/rail)
    'CA': 0.35,  // Canada
    'DE': 1.20,  // Germany
    'IT': 1.25,  // Italy
    'TR': 1.10,  // Turkey
    'default': 1.00,
};

// Transit times (days, to US)
const TRANSIT_DAYS: Record<string, number> = {
    'CN': 28,
    'VN': 30,
    'IN': 35,
    'BD': 38,
    'TH': 32,
    'ID': 35,
    'MY': 30,
    'PH': 28,
    'TW': 22,
    'KR': 20,
    'JP': 18,
    'MX': 5,
    'CA': 3,
    'DE': 18,
    'IT': 20,
    'TR': 22,
    'default': 30,
};

const DATAWEB_MIN_QUANTITY = 1000;
const DATAWEB_CONFIDENCE_BASE = 50;
const DATAWEB_CONFIDENCE_HIGH_VALUE = 10000000;
const DATAWEB_CONFIDENCE_MED_VALUE = 1000000;
const DATAWEB_CONFIDENCE_HIGH_QTY = 1000000;
const DATAWEB_CONFIDENCE_TWO_YEARS = 2;

/**
 * FTA countries - IMPORTANT NOTE:
 * 
 * As of April 2025, FTAs can waive the BASE MFN duty but:
 * - The 10% IEEPA universal baseline STILL APPLIES to most FTA countries!
 * - Only USMCA (MX/CA) may have exemptions when goods are fully compliant
 * - Singapore FTA, KORUS, etc. do NOT exempt from the 10% IEEPA tariff
 * 
 * The 'rate' here is what the FTA waives (the base duty), but we must
 * still add the IEEPA rate on top.
 */
const FTA_COUNTRIES: Record<string, { 
    name: string; 
    rate: number;  // Base duty waiver (NOT the effective rate!)
    ieepaExempt: boolean;  // Whether IEEPA may be waived
    notes: string;
}> = {
    'CA': { 
        name: 'USMCA', 
        rate: 0, 
        ieepaExempt: true,  // USMCA-compliant goods largely exempt from 25% fentanyl tariff
        notes: '25% fentanyl tariff active — USMCA-compliant goods exempt. Non-USMCA goods face full rate.'
    },
    'MX': { 
        name: 'USMCA', 
        rate: 0, 
        ieepaExempt: true,  // USMCA-compliant goods largely exempt from 25% fentanyl tariff
        notes: '25% fentanyl tariff active — USMCA-compliant goods exempt. Non-USMCA goods face full rate.'
    },
    'KR': { 
        name: 'KORUS FTA', 
        rate: 0, 
        ieepaExempt: false,  // 10% IEEPA STILL APPLIES!
        notes: 'FTA waives base duty but 10%+ IEEPA still applies'
    },
    'AU': { 
        name: 'Australia FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'SG': { 
        name: 'Singapore FTA', 
        rate: 0, 
        ieepaExempt: false,  // Per Enterprise Singapore FAQs
        notes: '⚠️ USSFTA does NOT exempt from 10% IEEPA as of April 2025'
    },
    'CL': { 
        name: 'Chile FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'CO': { 
        name: 'Colombia TPA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'PE': { 
        name: 'Peru TPA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'PA': { 
        name: 'Panama TPA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'IL': { 
        name: 'Israel FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'JO': { 
        name: 'Jordan FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'MA': { 
        name: 'Morocco FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'BH': { 
        name: 'Bahrain FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
    'OM': { 
        name: 'Oman FTA', 
        rate: 0, 
        ieepaExempt: false,
        notes: 'FTA waives base duty but 10% IEEPA still applies'
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TARIFF CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate effective tariff rate using the centralized Tariff Registry
 * 
 * This is the preferred method as it uses real-time data from official sources.
 * Falls back to local calculation if registry is unavailable.
 * 
 * @see docs/ARCHITECTURE_TARIFF_REGISTRY.md
 */
export async function calculateEffectiveTariffFromRegistryAsync(
    baseTariffRate: number,
    countryCode: string,
    htsCode: string
): Promise<{
    baseTariff: number;
    section301: number;
    ieepaRate: number;
    section232Rate: number;
    adCvdRate: number;
    ftaDiscount: number;
    ftaName: string | null;
    ftaNotes: string | null;
    effectiveRate: number;
    dataSource: 'registry' | 'fallback';
}> {
    try {
        // Try to get data from the centralized registry first
        const registryResult = await getEffectiveTariffFromRegistry(
            countryCode, 
            htsCode,
            { baseMfnRate: baseTariffRate }
        );
        
        // Map registry result to our expected format
        return {
            baseTariff: registryResult.baseMfnRate,
            section301: registryResult.section301Rate,
            ieepaRate: registryResult.ieepaRate,
            section232Rate: registryResult.section232Rate,
            adCvdRate: registryResult.adcvdRate,
            ftaDiscount: registryResult.ftaDiscount,
            ftaName: registryResult.ftaName,
            ftaNotes: registryResult.ftaWaivesIeepa 
                ? 'USMCA goods may be exempt from IEEPA when compliant' 
                : registryResult.hasFta 
                    ? `⚠️ ${registryResult.ftaName} waives base duty but ${registryResult.ieepaRate}% IEEPA still applies!`
                    : null,
            effectiveRate: registryResult.effectiveRate,
            dataSource: 'registry',
        };
    } catch (error) {
        console.warn('[LandedCost] Registry unavailable, using fallback:', error);
        
        // Fall back to local calculation
        const localResult = calculateEffectiveTariff(baseTariffRate, countryCode, htsCode);
        return {
            ...localResult,
            dataSource: 'fallback',
        };
    }
}

/**
 * Calculate effective tariff rate for HTS code from specific country (sync version)
 * 
 * IMPORTANT: This now properly accounts for the April 2025 tariff landscape:
 * - FTAs can waive BASE duty but NOT the IEEPA tariffs
 * - Only USMCA may fully exempt compliant goods
 * - All other FTA countries still face at least 10% IEEPA
 * 
 * NOTE: For the most accurate data, use calculateEffectiveTariffFromRegistryAsync
 * which pulls from the centralized tariff registry.
 */
export function calculateEffectiveTariff(
    baseTariffRate: number,
    countryCode: string,
    htsCode: string
): {
    baseTariff: number;
    section301: number;
    ieepaRate: number;
    section232Rate: number;
    adCvdRate: number;
    ftaDiscount: number;
    ftaName: string | null;
    ftaNotes: string | null;
    effectiveRate: number;
} {
    // Get additional duties
    const section301 = getSection301Rate(htsCode, countryCode);
    const adCvdRate = 0; // Would need AD/CVD lookup
    
    // Check Section 232 (steel/aluminum/auto)
    const section232Check = isSection232Product(htsCode);
    let section232Rate = 0;
    if (section232Check.steel || section232Check.aluminum || section232Check.auto) {
        section232Rate = 25;
    }
    
    // Check FTA status
    const ftaInfo = FTA_COUNTRIES[countryCode];
    let ftaDiscount = 0;
    let ftaName: string | null = null;
    let ftaNotes: string | null = null;
    
    if (ftaInfo) {
        ftaName = ftaInfo.name;
        ftaNotes = ftaInfo.notes;
        ftaDiscount = baseTariffRate; // FTA eliminates base tariff
    }
    
    // Get IEEPA rate
    // FTAs do NOT exempt from IEEPA unless specifically noted
    let ieepaRate = 0;
    
    if (ftaInfo && ftaInfo.ieepaExempt) {
        // USMCA may exempt - but we should still show a warning
        ieepaRate = 0;
    } else {
        // All other countries face IEEPA rates
        ieepaRate = getIEEPARate(countryCode);
    }
    
    // Calculate effective rate
    // Formula: (Base - FTA discount) + Section 301 + IEEPA + Section 232 + AD/CVD
    const effectiveRate = Math.max(0,
        baseTariffRate - ftaDiscount + section301 + ieepaRate + section232Rate + adCvdRate
    );
    
    return {
        baseTariff: baseTariffRate,
        section301,
        ieepaRate,
        section232Rate,
        adCvdRate,
        ftaDiscount,
        ftaName,
        ftaNotes,
        effectiveRate,
    };
}

/**
 * Calculate fees
 */
function calculateFees(productValue: number): {
    mpf: number;
    hmf: number;
    totalFees: number;
} {
    // MPF
    let mpf = productValue * MPF_RATE;
    mpf = Math.max(MPF_MIN, Math.min(MPF_MAX, mpf));
    
    // HMF (ocean shipments)
    const hmf = productValue * HMF_RATE;
    
    return {
        mpf,
        hmf,
        totalFees: mpf + hmf,
    };
}

function estimateDataWebConfidence(stat: ImportStatsByCountry): number {
    let score = DATAWEB_CONFIDENCE_BASE;
    if (stat.totalValue > DATAWEB_CONFIDENCE_HIGH_VALUE) score += 20;
    else if (stat.totalValue > DATAWEB_CONFIDENCE_MED_VALUE) score += 10;
    if (stat.totalQuantity > DATAWEB_CONFIDENCE_HIGH_QTY) score += 10;
    if (stat.dataYears.length >= DATAWEB_CONFIDENCE_TWO_YEARS) score += 10;
    return Math.min(95, score);
}

async function buildLandedCostFromStats(
    stat: ImportStatsByCountry,
    htsCode: string,
    quantity: number,
    weightPerUnitKg: number,
    baseTariffRate: number
): Promise<LandedCostBreakdown | null> {
    const requestTimestamp = new Date().toISOString();
    try {
        if (!stat.avgUnitValue || stat.avgUnitValue <= 0) {
            return null;
        }

        const tariffs = await calculateEffectiveTariffFromRegistryAsync(
            baseTariffRate,
            stat.countryCode,
            htsCode
        );

        const shippingRate = SHIPPING_COSTS[stat.countryCode] || SHIPPING_COSTS['default'];
        const shippingCostPerUnit = shippingRate * weightPerUnitKg;

        const tariffAmount = stat.avgUnitValue * (tariffs.effectiveRate / 100);
        const totalProductValue = stat.avgUnitValue * quantity;
        const fees = calculateFees(totalProductValue);
        const feesPerUnit = fees.totalFees / quantity;

        const totalLandedCost =
            stat.avgUnitValue +
            shippingCostPerUnit +
            tariffAmount +
            feesPerUnit;

        const confidence = estimateDataWebConfidence(stat);
        const dataQuality: 'high' | 'medium' | 'low' = confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low';

        // Determine cost trend from per-year data
        let costTrend: 'rising' | 'falling' | 'stable' | undefined;
        if (stat.costTrendPercent !== undefined) {
            if (stat.costTrendPercent > 5) costTrend = 'rising';
            else if (stat.costTrendPercent < -5) costTrend = 'falling';
            else costTrend = 'stable';
        }

        return {
            country: stat.countryName,
            countryCode: stat.countryCode,
            productCost: stat.avgUnitValue,
            productCostConfidence: confidence,
            shippingCost: shippingCostPerUnit,
            transitDays: TRANSIT_DAYS[stat.countryCode] || TRANSIT_DAYS['default'],
            tariffs: {
                baseTariff: tariffs.baseTariff,
                section301: tariffs.section301,
                ieepaRate: tariffs.ieepaRate,
                adCvdRate: tariffs.adCvdRate,
                ftaDiscount: tariffs.ftaDiscount,
                ftaName: tariffs.ftaName,
                ftaNotes: tariffs.ftaNotes,
                effectiveRate: tariffs.effectiveRate,
                tariffAmount,
            },
            fees: {
                mpf: fees.mpf / quantity,
                hmf: fees.hmf / quantity,
                totalFees: feesPerUnit,
            },
            totalLandedCost,
            savingsVsChina: null,
            savingsPercent: null,
            dataQuality,
            lastUpdated: new Date(),
            importVolume: stat.totalValue > 0 ? stat.totalValue : undefined,
            importVolumeYear: stat.dataYears[0],
            costTrend,
            costTrendPercent: stat.costTrendPercent,
        };
    } catch (error) {
        console.error(`[LandedCost] ${requestTimestamp} DataWeb fallback failed:`, error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate landed cost for a specific HTS code from a specific country
 * 
 * Uses the centralized Tariff Registry when available for accurate rates.
 */
export async function calculateLandedCost(
    htsCode: string,
    countryCode: string,
    quantity: number = 1000,
    weightPerUnitKg: number = 0.5,
    options: { useRegistry?: boolean; baseMfnRateOverride?: number; useDataWebFallback?: boolean } = {}
): Promise<LandedCostBreakdown | null> {
    const hts6 = htsCode.replace(/\./g, '').substring(0, 6);
    const useRegistry = options.useRegistry ?? true; // Default to using registry
    
    // Get cost data from our aggregated table
    const costData = await prisma.htsCostByCountry.findUnique({
        where: {
            htsCode_countryCode: {
                htsCode: hts6,
                countryCode,
            },
        },
    });
    
    if (!costData) {
        if (options.useDataWebFallback === false) {
            return null;
        }

        const stats = await getImportStatsByHTS(hts6, { minQuantity: DATAWEB_MIN_QUANTITY });
        const stat = stats.find(s => s.countryCode === countryCode);
        if (!stat) {
            return null;
        }

        const baseMfnInfo = await getBaseMfnRate(hts6);
        const baseTariffRate = options.baseMfnRateOverride ?? baseMfnInfo?.rate ?? 0;
        return buildLandedCostFromStats(stat, hts6, quantity, weightPerUnitKg, baseTariffRate);
    }
    
    // Get base tariff rate (prefer override / HTS database over cost data)
    const baseTariffRate = options.baseMfnRateOverride ?? costData.baseTariffRate ?? 0;
    if (!options.baseMfnRateOverride && !costData.baseTariffRate) {
        console.warn(`[LandedCost] No baseTariffRate for ${countryCode}/${hts6} - using 0`);
    }
    
    // Calculate tariffs - use registry if enabled for most accurate data
    const tariffs = useRegistry
        ? await calculateEffectiveTariffFromRegistryAsync(baseTariffRate, countryCode, hts6)
        : { ...calculateEffectiveTariff(baseTariffRate, countryCode, hts6), dataSource: 'fallback' as const };
    
    // Calculate shipping
    const shippingRate = SHIPPING_COSTS[countryCode] || SHIPPING_COSTS['default'];
    const shippingCostPerUnit = shippingRate * weightPerUnitKg;
    
    // Calculate tariff amount
    const tariffAmount = costData.avgUnitValue * (tariffs.effectiveRate / 100);
    
    // Calculate fees (based on total shipment value)
    const totalProductValue = costData.avgUnitValue * quantity;
    const fees = calculateFees(totalProductValue);
    const feesPerUnit = fees.totalFees / quantity;
    
    // Calculate total landed cost
    const totalLandedCost = 
        costData.avgUnitValue + 
        shippingCostPerUnit + 
        tariffAmount + 
        feesPerUnit;
    
    // Determine data quality
    let dataQuality: 'high' | 'medium' | 'low' = 'low';
    if (costData.confidenceScore >= 70) dataQuality = 'high';
    else if (costData.confidenceScore >= 40) dataQuality = 'medium';
    
    return {
        country: costData.countryName,
        countryCode,
        productCost: costData.avgUnitValue,
        productCostConfidence: costData.confidenceScore,
        shippingCost: shippingCostPerUnit,
        transitDays: TRANSIT_DAYS[countryCode] || TRANSIT_DAYS['default'],
        tariffs: {
            ...tariffs,
            tariffAmount,
        },
        fees: {
            mpf: fees.mpf / quantity,
            hmf: fees.hmf / quantity,
            totalFees: feesPerUnit,
        },
        totalLandedCost,
        savingsVsChina: null, // Calculated in comparison
        savingsPercent: null,
        dataQuality,
        lastUpdated: costData.lastCalculated,
    };
}

/**
 * Compare landed costs across all available countries for an HTS code
 */
export async function compareLandedCosts(
    htsCode: string,
    options: {
        quantity?: number;
        weightPerUnitKg?: number;
        minConfidence?: number;
        includeCountries?: string[];
        excludeCountries?: string[];
    } = {}
): Promise<LandedCostComparison> {
    const hts6 = htsCode.replace(/\./g, '').substring(0, 6);
    const quantity = options.quantity || 1000;
    const weightPerUnit = options.weightPerUnitKg || 0.5;
    const minConfidence = options.minConfidence || 20;
    
    // Get all cost data for this HTS
    const whereClause: Record<string, unknown> = {
        htsCode: hts6,
        confidenceScore: { gte: minConfidence },
    };
    
    if (options.includeCountries?.length) {
        whereClause.countryCode = { in: options.includeCountries };
    } else if (options.excludeCountries?.length) {
        whereClause.countryCode = { notIn: options.excludeCountries };
    }
    
    const costRecords = await prisma.htsCostByCountry.findMany({
        where: whereClause,
        orderBy: { avgUnitValue: 'asc' },
    });
    
    const baseMfnInfo = await getBaseMfnRate(hts6);
    const baseTariffRate = baseMfnInfo?.rate ?? 0;

    // Calculate landed cost for each country
    const countries: LandedCostBreakdown[] = [];
    
    if (costRecords.length > 0) {
        for (const record of costRecords) {
            const landed = await calculateLandedCost(
                hts6,
                record.countryCode,
                quantity,
                weightPerUnit,
                { baseMfnRateOverride: baseTariffRate }
            );
            
            if (landed) {
                countries.push(landed);
            }
        }
    } else {
        const stats = await getImportStatsByHTS(hts6, { minQuantity: DATAWEB_MIN_QUANTITY });
        const filtered = stats.filter(stat => {
            if (options.includeCountries?.length && !options.includeCountries.includes(stat.countryCode)) {
                return false;
            }
            if (options.excludeCountries?.length && options.excludeCountries.includes(stat.countryCode)) {
                return false;
            }
            return true;
        });

        for (const stat of filtered) {
            const landed = await buildLandedCostFromStats(
                stat,
                hts6,
                quantity,
                weightPerUnit,
                baseTariffRate
            );
            if (landed && landed.productCostConfidence >= minConfidence) {
                countries.push(landed);
            }
        }
    }
    
    // Sort by total landed cost
    countries.sort((a, b) => a.totalLandedCost - b.totalLandedCost);
    
    // Calculate China baseline for savings comparison
    const chinaLanded = countries.find(c => c.countryCode === 'CN');
    const chinaBaseline = chinaLanded?.totalLandedCost;
    
    // Add savings calculations
    for (const country of countries) {
        if (chinaBaseline && country.countryCode !== 'CN') {
            country.savingsVsChina = chinaBaseline - country.totalLandedCost;
            country.savingsPercent = Math.round(
                (country.savingsVsChina / chinaBaseline) * 100
            );
        }
    }
    
    return {
        htsCode: hts6,
        baseTariffRate,
        countries,
        cheapestCountry: countries[0]?.countryCode || 'N/A',
        mostExpensiveCountry: countries[countries.length - 1]?.countryCode || 'N/A',
        averageCost: countries.length > 0
            ? countries.reduce((sum, c) => sum + c.totalLandedCost, 0) / countries.length
            : 0,
    };
}

/**
 * Get quick cost comparison summary for display
 */
export async function getQuickCostComparison(
    htsCode: string,
    currentCountry?: string
): Promise<{
    current: { country: string; cost: number } | null;
    cheapest: { country: string; cost: number; savingsPercent: number } | null;
    ftaBest: { country: string; cost: number; ftaName: string; notes: string } | null;
    countries: Array<{
        code: string;
        name: string;
        cost: number;
        tariffRate: number;
        hasFTA: boolean;
        ftaNotes: string | null;
    }>;
}> {
    const comparison = await compareLandedCosts(htsCode, {
        minConfidence: 30,
    });
    
    // Current country cost
    const current = currentCountry
        ? comparison.countries.find(c => c.countryCode === currentCountry)
        : null;
    
    // Cheapest overall
    const cheapest = comparison.countries[0];
    
    // Best FTA country (but note: FTAs may not save as much as expected now!)
    const ftaCountries = comparison.countries.filter(c => c.tariffs.ftaName);
    const ftaBest = ftaCountries[0];
    
    return {
        current: current
            ? { country: current.countryCode, cost: current.totalLandedCost }
            : null,
        cheapest: cheapest
            ? {
                country: cheapest.countryCode,
                cost: cheapest.totalLandedCost,
                savingsPercent: current
                    ? Math.round((1 - cheapest.totalLandedCost / current.totalLandedCost) * 100)
                    : 0,
            }
            : null,
        ftaBest: ftaBest && ftaBest.tariffs.ftaName
            ? {
                country: ftaBest.countryCode,
                cost: ftaBest.totalLandedCost,
                ftaName: ftaBest.tariffs.ftaName,
                notes: ftaBest.tariffs.ftaNotes || '',
            }
            : null,
        countries: comparison.countries.slice(0, 10).map(c => {
            return {
                code: c.countryCode,
                name: c.country,
                cost: Math.round(c.totalLandedCost * 100) / 100,
                tariffRate: c.tariffs.effectiveRate,
                hasFTA: !!c.tariffs.ftaName,
                ftaNotes: c.tariffs.ftaNotes || null,
            };
        }),
    };
}

/**
 * Enrich HtsCostByCountry records with ACCURATE tariff data
 * 
 * This updates stored records with the latest tariff calculations,
 * properly accounting for the April 2025 IEEPA baseline that affects
 * even FTA countries.
 */
export async function enrichWithTariffData(
    htsCode?: string
): Promise<{ updated: number; summary: string }> {
    const whereClause = htsCode
        ? { htsCode: htsCode.replace(/\./g, '').substring(0, 6) }
        : {};
    
    const records = await prisma.htsCostByCountry.findMany({
        where: whereClause,
    });
    
    let updated = 0;
    let ftaCountriesUpdated = 0;
    
    for (const record of records) {
        const tariffs = calculateEffectiveTariff(
            record.baseTariffRate ?? 0, // NO hardcoded fallback
            record.countryCode,
            record.htsCode
        );
        
        const ftaInfo = FTA_COUNTRIES[record.countryCode];
        
        await prisma.htsCostByCountry.update({
            where: { id: record.id },
            data: {
                section301Rate: tariffs.section301,
                ieepaRate: tariffs.ieepaRate,
                effectiveTariff: tariffs.effectiveRate,
                hasFTA: !!ftaInfo,
                ftaName: ftaInfo?.name,
                ftaRate: ftaInfo?.rate ?? null,
            },
        });
        
        updated++;
        if (ftaInfo) ftaCountriesUpdated++;
    }
    
    const summary = `Updated ${updated} records. ${ftaCountriesUpdated} FTA countries now show IEEPA rates where applicable (FTAs only waive base duty, not IEEPA).`;
    
    return { updated, summary };
}

