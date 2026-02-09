/**
 * GET /api/sourcing/quick
 * 
 * Returns country-level cost comparisons for a given HTS code.
 * Used by: sourcing preview cards (limit=10), cost map (limit=200).
 * 
 * Query params:
 *   hts       — HTS code (required, 4-10 digits)
 *   from      — current country ISO alpha-2 (optional)
 *   quantity  — order quantity (default 1000)
 *   units     — annual units for savings calc (default 10000)
 *   value     — total order value for tariff-only fallback (default 10000)
 *   weightPerUnitKg — weight per unit in kg (default 0.5)
 *   limit     — max countries in alternatives (default 10, use 200 for cost map)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveTariff } from '@/services/tariff/registry';
import { getBaseMfnRate } from '@/services/hts/database';
import { getImportStatsByHTS, type ImportStatsByCountry } from '@/services/usitcDataWeb';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_ANNUAL_UNITS = 10000;
const DEFAULT_ORDER_QUANTITY = 1000;
const DEFAULT_WEIGHT_PER_UNIT_KG = 0.5;
const DEFAULT_FEES_PER_UNIT = 0.05;
const DEFAULT_MIN_CONFIDENCE = 25;
const DEFAULT_ALTERNATIVES_LIMIT = 10;
const MAX_ALTERNATIVES_LIMIT = 200;
const DATAWEB_MIN_QUANTITY = 1000;
const DATAWEB_CONFIDENCE_BASE = 50;
const DATAWEB_CONFIDENCE_HIGH_VALUE = 10000000;
const DATAWEB_CONFIDENCE_MED_VALUE = 1000000;
const DATAWEB_CONFIDENCE_HIGH_QTY = 1000000;
const DATAWEB_CONFIDENCE_TWO_YEARS = 2;
const BASELINE_COUNTRY_CODE = 'CN';
const DEFAULT_BASE_TARIFF_RATE = 5.0;
const RECOMMENDED_SAVINGS_PERCENT = 5;

// Country metadata — flags, shipping, transit for 50+ countries
const COUNTRY_FLAGS: Record<string, string> = {
    CN:'🇨🇳',MX:'🇲🇽',CA:'🇨🇦',VN:'🇻🇳',IN:'🇮🇳',BD:'🇧🇩',TH:'🇹🇭',ID:'🇮🇩',
    TW:'🇹🇼',KR:'🇰🇷',JP:'🇯🇵',DE:'🇩🇪',IT:'🇮🇹',TR:'🇹🇷',MY:'🇲🇾',PH:'🇵🇭',
    PK:'🇵🇰',KH:'🇰🇭',AU:'🇦🇺',SG:'🇸🇬',GB:'🇬🇧',FR:'🇫🇷',ES:'🇪🇸',NL:'🇳🇱',
    PL:'🇵🇱',CH:'🇨🇭',SE:'🇸🇪',IE:'🇮🇪',BR:'🇧🇷',CO:'🇨🇴',CL:'🇨🇱',PE:'🇵🇪',
    AR:'🇦🇷',CR:'🇨🇷',GT:'🇬🇹',HN:'🇭🇳',SV:'🇸🇻',NI:'🇳🇮',DO:'🇩🇴',NZ:'🇳🇿',
    ZA:'🇿🇦',EG:'🇪🇬',MA:'🇲🇦',IL:'🇮🇱',AE:'🇦🇪',SA:'🇸🇦',JO:'🇯🇴',LK:'🇱🇰',
    MM:'🇲🇲',PT:'🇵🇹',CZ:'🇨🇿',RO:'🇷🇴',HU:'🇭🇺',AT:'🇦🇹',BE:'🇧🇪',DK:'🇩🇰',
    FI:'🇫🇮',NO:'🇳🇴',GR:'🇬🇷',BG:'🇧🇬',HR:'🇭🇷',SK:'🇸🇰',UA:'🇺🇦',RS:'🇷🇸',
};

const SHIPPING_PER_KG: Record<string, number> = {
    CN:0.80,VN:0.90,IN:1.10,BD:1.20,TH:0.95,ID:1.00,MY:0.90,TW:0.85,
    KR:0.80,JP:0.75,MX:0.40,CA:0.35,DE:1.20,IT:1.25,FR:1.20,ES:1.25,
    GB:1.15,NL:1.20,PL:1.30,CH:1.20,SE:1.25,IE:1.15,BR:1.40,CO:1.30,
    CL:1.35,PE:1.35,AR:1.45,CR:0.90,GT:0.85,HN:0.85,SV:0.85,NI:0.90,
    DO:0.80,AU:1.10,NZ:1.15,ZA:1.40,EG:1.30,MA:1.25,IL:1.20,AE:1.10,
    SA:1.15,JO:1.25,LK:1.15,PH:1.00,PK:1.15,KH:1.00,SG:0.85,TR:1.20,
    MM:1.10,PT:1.25,CZ:1.30,RO:1.35,HU:1.30,AT:1.20,BE:1.20,DK:1.25,
    FI:1.30,NO:1.30,GR:1.30,BG:1.35,HR:1.35,SK:1.30,UA:1.40,RS:1.40,
    default:1.00,
};

const TRANSIT_DAYS: Record<string, number> = {
    CN:28,VN:30,IN:35,BD:38,TH:32,ID:35,MY:30,TW:22,KR:20,JP:18,
    MX:5,CA:3,DE:18,IT:20,FR:18,ES:20,GB:16,NL:18,PL:20,CH:18,
    SE:20,IE:16,BR:22,CO:14,CL:20,PE:18,AR:25,CR:8,GT:7,HN:7,
    SV:7,NI:8,DO:6,AU:25,NZ:28,ZA:28,EG:22,MA:18,IL:20,AE:25,
    SA:25,JO:22,LK:30,PH:28,PK:32,KH:32,SG:22,TR:20,
    MM:35,PT:18,CZ:20,RO:22,HU:20,AT:18,BE:18,DK:18,
    FI:22,NO:20,GR:22,BG:22,HR:22,SK:20,UA:25,RS:22,
    default:30,
};

const COUNTRY_NAMES: Record<string, string> = {
    CN:'China',VN:'Vietnam',MX:'Mexico',IN:'India',BD:'Bangladesh',TH:'Thailand',
    ID:'Indonesia',TW:'Taiwan',KR:'South Korea',JP:'Japan',DE:'Germany',IT:'Italy',
    MY:'Malaysia',CA:'Canada',PH:'Philippines',TR:'Turkey',PK:'Pakistan',KH:'Cambodia',
    SG:'Singapore',AU:'Australia',GB:'United Kingdom',FR:'France',ES:'Spain',NL:'Netherlands',
    PL:'Poland',CH:'Switzerland',SE:'Sweden',IE:'Ireland',BR:'Brazil',CO:'Colombia',
    CL:'Chile',PE:'Peru',AR:'Argentina',CR:'Costa Rica',GT:'Guatemala',HN:'Honduras',
    SV:'El Salvador',NI:'Nicaragua',DO:'Dominican Republic',NZ:'New Zealand',ZA:'South Africa',
    EG:'Egypt',MA:'Morocco',IL:'Israel',AE:'UAE',SA:'Saudi Arabia',JO:'Jordan',LK:'Sri Lanka',
    MM:'Myanmar',PT:'Portugal',CZ:'Czech Republic',RO:'Romania',HU:'Hungary',AT:'Austria',
    BE:'Belgium',DK:'Denmark',FI:'Finland',NO:'Norway',GR:'Greece',BG:'Bulgaria',
    HR:'Croatia',SK:'Slovakia',UA:'Ukraine',RS:'Serbia',
};

/** All countries available for tariff-only fallback (50+) */
const ALL_FALLBACK_COUNTRIES = Object.keys(COUNTRY_NAMES);

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getDataQuality = (confidenceScore: number): 'high' | 'medium' | 'low' => {
    if (confidenceScore >= 70) return 'high';
    if (confidenceScore >= 40) return 'medium';
    return 'low';
};

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const parsePositiveNumber = (value: string | null, fallback: number): number => {
    try {
        if (!value) return fallback;
        const parsed = Number.parseFloat(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
        return parsed;
    } catch (error) {
        console.warn(`[QuickSourcing] Invalid number param: ${value}`, error);
        return fallback;
    }
};

const estimateDataWebConfidence = (stat: ImportStatsByCountry): number => {
    let score = DATAWEB_CONFIDENCE_BASE;
    if (stat.totalValue > DATAWEB_CONFIDENCE_HIGH_VALUE) score += 20;
    else if (stat.totalValue > DATAWEB_CONFIDENCE_MED_VALUE) score += 10;
    if (stat.totalQuantity > DATAWEB_CONFIDENCE_HIGH_QTY) score += 10;
    if (stat.dataYears.length >= DATAWEB_CONFIDENCE_TWO_YEARS) score += 10;
    return Math.min(95, score);
};

/**
 * Remove countries whose baseUnitValue is a statistical outlier.
 * Uses IQR (interquartile range) method: anything above Q3 + 3×IQR is dropped.
 * The 3× multiplier (vs typical 1.5×) is lenient — only removes extreme outliers
 * like $400 t-shirts while keeping legitimate cost variation.
 * Mutates the array in place.
 */
const IQR_MULTIPLIER = 3;
const MIN_COUNTRIES_FOR_OUTLIER_FILTER = 10;

function filterOutlierCountries(results: CountryResult[]): void {
    if (results.length < MIN_COUNTRIES_FOR_OUTLIER_FILTER) return;

    const values = results.map(r => r.baseUnitValue).filter(v => v > 0).sort((a, b) => a - b);
    if (values.length < MIN_COUNTRIES_FOR_OUTLIER_FILTER) return;

    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const upperFence = q3 + IQR_MULTIPLIER * iqr;

    // Only filter if the fence is meaningful (avoids removing everything when data is uniform)
    if (upperFence <= 0 || iqr === 0) return;

    const beforeCount = results.length;
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < results.length; readIdx++) {
        if (results[readIdx].baseUnitValue <= upperFence) {
            results[writeIdx++] = results[readIdx];
        }
    }
    results.length = writeIdx;

    if (writeIdx < beforeCount) {
        console.log(`[QuickSourcing] Outlier filter removed ${beforeCount - writeIdx} countries (fence=$${upperFence.toFixed(2)}, IQR=$${iqr.toFixed(2)})`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Per-country cost breakdown returned in the response */
interface CountryResult {
    code: string;
    name: string;
    flag: string;
    /** Raw import price per unit (USITC customs value or estimate) */
    baseUnitValue: number;
    /** Duty amount per unit (tariff rate × base value) */
    dutyPerUnit: number;
    /** Estimated shipping per unit */
    shippingPerUnit: number;
    /** Fees per unit (MPF/HMF estimate) */
    feesPerUnit: number;
    /** Total landed cost per unit (base + duty + shipping + fees) */
    landedCostPerUnit: number;
    /** Total landed cost for the full order quantity */
    landedCostTotal: number;
    /** Effective tariff rate (%) including all layers */
    effectiveTariff: number;
    supplierCount: number;
    transitDays: number;
    confidenceScore: number;
    dataQuality: 'high' | 'medium' | 'low';
    hasFTA: boolean;
    ftaName?: string;
    /** Source of the base unit value */
    dataSource: 'database' | 'dataweb' | 'tariff-only';
}

export interface QuickSourcingPreview {
    htsCode: string;
    baseMfnRate: number;
    baseMfnRateType: 'ad_valorem' | 'specific' | 'compound' | 'free' | 'unknown';
    currentCountry: (CountryResult & { savingsPercent?: number }) | null;
    alternatives: Array<CountryResult & {
        savingsPercent: number;
        savingsAmountPerUnit: number;
        savingsAmountTotal: number;
        isRecommended: boolean;
    }>;
    totalCountries: number;
    quantity: number;
    potentialSavings: {
        percent: number;
        perUnit: number;
        total: number;
        annual?: number;
    } | null;
    baseline: {
        code: string;
        name: string;
        landedCostPerUnit: number;
        landedCostTotal: number;
    } | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
    const requestTimestamp = new Date().toISOString();
    try {
        const { searchParams } = new URL(request.url);
        const htsCode = searchParams.get('hts');
        const currentCountry = searchParams.get('from');
        const annualUnits = Math.round(parsePositiveNumber(searchParams.get('units'), DEFAULT_ANNUAL_UNITS));
        const quantity = Math.max(1, Math.round(parsePositiveNumber(searchParams.get('quantity'), DEFAULT_ORDER_QUANTITY)));
        const weightPerUnitKg = parsePositiveNumber(searchParams.get('weightPerUnitKg'), DEFAULT_WEIGHT_PER_UNIT_KG);
        const limit = Math.min(
            Math.max(1, Math.round(parsePositiveNumber(searchParams.get('limit'), DEFAULT_ALTERNATIVES_LIMIT))),
            MAX_ALTERNATIVES_LIMIT
        );
        
        if (!htsCode) {
            return NextResponse.json(
                { success: false, error: 'hts parameter is required' },
                { status: 400 }
            );
        }
        
        console.log(`[QuickSourcing] ${requestTimestamp} hts=${htsCode} from=${currentCountry || 'n/a'} qty=${quantity} limit=${limit}`);
        
        const hts6 = htsCode.replace(/\./g, '').substring(0, 6);
        
        const baseMfnInfo = await getBaseMfnRate(hts6);
        const baseMfnRate = baseMfnInfo?.rate ?? 0;
        const baseMfnRateType = baseMfnInfo?.rateType ?? 'unknown';

        // Supplier counts by country
        const htsChapter = hts6.substring(0, 2);
        const supplierCounts = await prisma.supplier.groupBy({
            by: ['countryCode'],
            where: {
                htsChapters: { has: htsChapter },
                isVerified: true,
            },
            _count: { id: true },
        });
        const supplierCountMap = new Map(
            supplierCounts.map(s => [s.countryCode, s._count.id])
        );

        // ── Build country results from best available data source ────────
        const countryResults: CountryResult[] = [];
        /** Track which country codes already have real data */
        const coveredCountries = new Set<string>();

        /** Helper: compute landed cost breakdown for a country */
        const buildCountryResult = async (
            countryCode: string,
            countryName: string,
            baseUnitValue: number,
            confidenceScore: number,
            dataSource: CountryResult['dataSource'],
        ): Promise<CountryResult | null> => {
            try {
                const baseTariff = baseMfnRate || DEFAULT_BASE_TARIFF_RATE;
                const tariffs = await getEffectiveTariff(countryCode, hts6, {
                    baseMfnRate: baseTariff,
                });

                const shippingPerKg = SHIPPING_PER_KG[countryCode] || SHIPPING_PER_KG['default'];
                const shippingPerUnit = roundCurrency(shippingPerKg * weightPerUnitKg);
                const dutyPerUnit = roundCurrency(baseUnitValue * (tariffs.effectiveRate / 100));
                const feesPerUnit = DEFAULT_FEES_PER_UNIT;
                const landedCostPerUnit = roundCurrency(baseUnitValue + dutyPerUnit + shippingPerUnit + feesPerUnit);
                const landedCostTotal = roundCurrency(landedCostPerUnit * quantity);

                return {
                    code: countryCode,
                    name: countryName,
                    flag: COUNTRY_FLAGS[countryCode] || '🌍',
                    baseUnitValue: roundCurrency(baseUnitValue),
                    dutyPerUnit,
                    shippingPerUnit,
                    feesPerUnit,
                    landedCostPerUnit,
                    landedCostTotal,
                    effectiveTariff: tariffs.effectiveRate,
                    supplierCount: supplierCountMap.get(countryCode) || 0,
                    transitDays: TRANSIT_DAYS[countryCode] || TRANSIT_DAYS['default'],
                    confidenceScore,
                    dataQuality: getDataQuality(confidenceScore),
                    hasFTA: tariffs.hasFta,
                    ftaName: tariffs.ftaName || undefined,
                    dataSource,
                };
            } catch (error) {
                console.warn(`[QuickSourcing] Failed to compute for ${countryCode}:`, error);
                return null;
            }
        };

        // Path 1: DB cost data (real per-country import prices)
        const costData = await prisma.htsCostByCountry.findMany({
            where: {
                htsCode: hts6,
                confidenceScore: { gte: DEFAULT_MIN_CONFIDENCE },
            },
            orderBy: { avgUnitValue: 'asc' },
        });

        if (costData.length > 0) {
            const results = await Promise.all(
                costData.map(record =>
                    buildCountryResult(
                        record.countryCode,
                        record.countryName,
                        record.avgUnitValue,
                        record.confidenceScore ?? 50,
                        'database',
                    )
                )
            );
            for (const r of results) {
                if (r) {
                    countryResults.push(r);
                    coveredCountries.add(r.code);
                }
            }
        }

        // Path 2: USITC DataWeb (supplement — add countries not already in DB)
        if (countryResults.length < limit) {
            try {
                const stats = await getImportStatsByHTS(hts6, { minQuantity: DATAWEB_MIN_QUANTITY });
                const uncoveredStats = stats.filter(s => s.avgUnitValue > 0 && !coveredCountries.has(s.countryCode));

                // Basic sanity check: reject obviously wrong data
                // For consumer goods like clothing, extremely high unit values are likely data errors
                const chapter = hts6.substring(0, 2);
                const isConsumerGoods = ['61', '62', '63', '64', '65'].includes(chapter); // Apparel, footwear, textiles
                const reasonableMaxUnitValue = isConsumerGoods ? 50 : 10000; // $50 max for consumer goods, $10K for industrial

                const filteredStats = uncoveredStats.filter(stat => stat.avgUnitValue <= reasonableMaxUnitValue);

                if (filteredStats.length !== uncoveredStats.length) {
                    const rejected = uncoveredStats.length - filteredStats.length;
                    console.log(`[QuickSourcing] Rejected ${rejected} DataWeb records with suspiciously high unit values (>$${reasonableMaxUnitValue}) for HTS ${hts6}`);
                }

                if (filteredStats.length > 0) {
                    const results = await Promise.all(
                        filteredStats.map(stat =>
                            buildCountryResult(
                                stat.countryCode,
                                stat.countryName,
                                stat.avgUnitValue,
                                estimateDataWebConfidence(stat),
                                'dataweb',
                            )
                        )
                    );
                    for (const r of results) {
                        if (r && r.confidenceScore >= DEFAULT_MIN_CONFIDENCE) {
                            countryResults.push(r);
                            coveredCountries.add(r.code);
                        }
                    }
                }
            } catch (err) {
                console.warn('[QuickSourcing] DataWeb supplement failed:', err);
            }
        }

        // Path 3: Tariff-only supplement for remaining countries
        // Uses the median unit value from real data (DB/DataWeb) as the base estimate.
        // This gives every country a realistic cost figure even without direct import data.
        if (countryResults.length < limit) {
            const realValues = countryResults.map(r => r.baseUnitValue).filter(v => v > 0);
            const estimatedPerUnit = realValues.length > 0
                ? realValues.sort((a, b) => a - b)[Math.floor(realValues.length / 2)] // median
                : (quantity > 0
                    ? parsePositiveNumber(searchParams.get('value'), 10) / quantity
                    : parsePositiveNumber(searchParams.get('value'), 10));

            const uncoveredCountries = ALL_FALLBACK_COUNTRIES.filter(cc => !coveredCountries.has(cc));
            const results = await Promise.all(
                uncoveredCountries.map(cc =>
                    buildCountryResult(
                        cc,
                        COUNTRY_NAMES[cc] || cc,
                        estimatedPerUnit,
                        30, // Low confidence — tariff-only estimate
                        'tariff-only',
                    )
                )
            );
            for (const r of results) {
                if (r) countryResults.push(r);
            }
        }

        // ── Filter outlier unit values ─────────────────────────────────────
        // USITC DataWeb avgUnitValue can be wildly inflated for low-volume
        // countries (e.g. $400/unit for t-shirts in Albania). Use IQR to
        // detect and remove statistical outliers before returning results.
        filterOutlierCountries(countryResults);

        // Empty result
        if (countryResults.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    htsCode: hts6,
                    baseMfnRate,
                    baseMfnRateType,
                    currentCountry: null,
                    alternatives: [],
                    totalCountries: 0,
                    quantity,
                    potentialSavings: null,
                    baseline: null,
                } as QuickSourcingPreview,
            });
        }
        
        // Sort by landed cost
        countryResults.sort((a, b) => a.landedCostPerUnit - b.landedCostPerUnit);
        
        // Current country
        const currentData = currentCountry
            ? countryResults.find(c => c.code === currentCountry)
            : null;
        
        // Baseline for savings calc
        const baseline = currentData || countryResults.find(c => c.code === BASELINE_COUNTRY_CODE) || countryResults[0];
        
        // Build alternatives — apply limit
        const alternatives = countryResults
            .filter(c => c.code !== currentCountry)
            .slice(0, limit)
            .map((c, index) => {
                const savingsAmountPerUnit = baseline ? baseline.landedCostPerUnit - c.landedCostPerUnit : 0;
                const savingsAmountTotal = baseline ? baseline.landedCostTotal - c.landedCostTotal : 0;
                const savingsPercent = baseline ? Math.round((savingsAmountPerUnit / baseline.landedCostPerUnit) * 100) : 0;
                
                return {
                    ...c,
                    savingsPercent,
                    savingsAmountPerUnit: roundCurrency(savingsAmountPerUnit),
                    savingsAmountTotal: roundCurrency(savingsAmountTotal),
                    isRecommended: index === 0 && savingsPercent > RECOMMENDED_SAVINGS_PERCENT,
                };
            });
        
        const bestAlternative = alternatives.find(a => a.savingsPercent > 0);
        const potentialSavings = bestAlternative && baseline ? {
            percent: bestAlternative.savingsPercent,
            perUnit: bestAlternative.savingsAmountPerUnit,
            total: bestAlternative.savingsAmountTotal,
            annual: Math.round(bestAlternative.savingsAmountPerUnit * annualUnits),
        } : null;
        
        const response: QuickSourcingPreview = {
            htsCode: hts6,
            baseMfnRate,
            baseMfnRateType,
            currentCountry: currentData ? { ...currentData, savingsPercent: 0 } : null,
            alternatives,
            totalCountries: countryResults.length,
            quantity,
            potentialSavings,
            baseline: baseline ? {
                code: baseline.code,
                name: baseline.name,
                landedCostPerUnit: baseline.landedCostPerUnit,
                landedCostTotal: baseline.landedCostTotal,
            } : null,
        };
        
        return NextResponse.json({
            success: true,
            data: response,
        });
        
    } catch (error) {
        console.error(`[QuickSourcing] ${requestTimestamp} error:`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sourcing preview' },
            { status: 500 }
        );
    }
}
