/**
 * GET /api/cost-map
 *
 * Dedicated endpoint for the Global Cost Map.
 * Pulls USITC DataWeb import stats directly by HTS code, enriches with
 * the full tariff registry (MFN + FTA + IEEPA + 301 + 232 + AD/CVD).
 *
 * NO FILTERING — every country USITC returns is included.
 * The customs value per unit IS the invoice/FOB price from real trade data.
 *
 * Query params:
 *   hts  — HTS code (required, 4-10 digits)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getImportStatsByHTS } from '@/services/usitcDataWeb';
import { getEffectiveTariff } from '@/services/tariff/registry';
import { getBaseMfnRate } from '@/services/hts/database';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Minimum USITC import quantity — set to 1 to get ALL countries from the API */
const MIN_QUANTITY = 1;

const COUNTRY_FLAGS: Record<string, string> = {
    CN:'🇨🇳',MX:'🇲🇽',CA:'🇨🇦',VN:'🇻🇳',IN:'🇮🇳',BD:'🇧🇩',TH:'🇹🇭',ID:'🇮🇩',
    TW:'🇹🇼',KR:'🇰🇷',JP:'🇯🇵',DE:'🇩🇪',IT:'🇮🇹',TR:'🇹🇷',MY:'🇲🇾',PH:'🇵🇭',
    PK:'🇵🇰',KH:'🇰🇭',AU:'🇦🇺',SG:'🇸🇬',GB:'🇬🇧',FR:'🇫🇷',ES:'🇪🇸',NL:'🇳🇱',
    PL:'🇵🇱',CH:'🇨🇭',SE:'🇸🇪',IE:'🇮🇪',BR:'🇧🇷',CO:'🇨🇴',CL:'🇨🇱',PE:'🇵🇪',
    AR:'🇦🇷',CR:'🇨🇷',GT:'🇬🇹',HN:'🇭🇳',SV:'🇸🇻',NI:'🇳🇮',DO:'🇩🇴',NZ:'🇳🇿',
    ZA:'🇿🇦',EG:'🇪🇬',MA:'🇲🇦',IL:'🇮🇱',AE:'🇦🇪',SA:'🇸🇦',JO:'🇯🇴',LK:'🇱🇰',
    MM:'🇲🇲',PT:'🇵🇹',CZ:'🇨🇿',RO:'🇷🇴',HU:'🇭🇺',AT:'🇦🇹',BE:'🇧🇪',DK:'🇩🇰',
    FI:'🇫🇮',NO:'🇳🇴',GR:'🇬🇷',BG:'🇧🇬',HR:'🇭🇷',SK:'🇸🇰',UA:'🇺🇦',RS:'🇷🇸',
    HK:'🇭🇰',LT:'🇱🇹',LV:'🇱🇻',EE:'🇪🇪',SI:'🇸🇮',LU:'🇱🇺',CY:'🇨🇾',BA:'🇧🇦',
    GE:'🇬🇪',AM:'🇦🇲',AZ:'🇦🇿',KZ:'🇰🇿',UZ:'🇺🇿',NG:'🇳🇬',GH:'🇬🇭',KE:'🇰🇪',
    TZ:'🇹🇿',ET:'🇪🇹',MU:'🇲🇺',MG:'🇲🇬',TN:'🇹🇳',EC:'🇪🇨',UY:'🇺🇾',PY:'🇵🇾',
    BO:'🇧🇴',PA:'🇵🇦',HT:'🇭🇹',JM:'🇯🇲',TT:'🇹🇹',FJ:'🇫🇯',BH:'🇧🇭',QA:'🇶🇦',
    OM:'🇴🇲',KW:'🇰🇼',NP:'🇳🇵',MN:'🇲🇳',RU:'🇷🇺',BY:'🇧🇾',MD:'🇲🇩',
};

const TRANSIT_DAYS: Record<string, number> = {
    CN:28,VN:30,IN:35,BD:38,TH:32,ID:35,MY:30,TW:22,KR:20,JP:18,
    MX:5,CA:3,DE:18,IT:20,FR:18,ES:20,GB:16,NL:18,PL:20,CH:18,
    SE:20,IE:16,BR:22,CO:14,CL:20,PE:18,AR:25,CR:8,GT:7,HN:7,
    SV:7,NI:8,DO:6,AU:25,NZ:28,ZA:28,EG:22,MA:18,IL:20,AE:25,
    SA:25,JO:22,LK:30,PH:28,PK:32,KH:32,SG:22,TR:20,
    MM:35,PT:18,CZ:20,RO:22,HU:20,AT:18,BE:18,DK:18,
    FI:22,NO:20,GR:22,BG:22,HR:22,SK:20,UA:25,RS:22,
    HK:22,LT:20,LV:20,EE:22,SI:20,BA:22,GE:25,AM:28,
    AZ:28,KZ:30,UZ:32,NG:28,GH:25,KE:30,TZ:30,ET:32,
    MU:30,MG:32,TN:20,EC:16,UY:22,PY:24,BO:24,PA:8,
    HT:6,JM:6,TT:6,FJ:30,BH:25,QA:25,OM:25,KW:25,
    NP:38,MN:35,RU:25,BY:22,MD:22,
};

const DEFAULT_TRANSIT_DAYS = 28;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Full tariff breakdown per layer — so the UI can show exactly what's applied */
interface TariffBreakdown {
    baseMfnRate: number;
    ftaDiscount: number;
    ieepaRate: number;
    ieepaBaseline: number;
    ieepaFentanyl: number;
    ieepaReciprocal: number;
    section301Rate: number;
    section232Rate: number;
    section232Product: string | null;
    adcvdRate: number;
    adcvdWarning: string | null;
    totalAdditionalDuties: number;
    /** Final effective rate: baseMFN - FTA + all additional */
    effectiveRate: number;
    hasFTA: boolean;
    ftaName: string | null;
    /** Human-readable breakdown items */
    layers: Array<{ program: string; rate: number; description: string }>;
    warnings: string[];
}

/** Data confidence level based on import volume and quantity */
type DataConfidence = 'high' | 'medium' | 'low';

interface CostMapCountry {
    code: string;
    name: string;
    flag: string;
    /** USITC customs value per unit — the invoice/FOB price from real trade data */
    unitValue: number;
    /** The USITC quantity unit (e.g. "dozens", "number", "kg") */
    rawQuantityUnit: string;
    /** Display unit after normalization ("each", "kg", etc.) */
    displayUnit: string;
    /** Whether the unit value was normalized (e.g. dozens→each) */
    wasNormalized: boolean;
    /** Full tariff breakdown with every layer */
    tariff: TariffBreakdown;
    /** Estimated duty per unit (unitValue × effectiveRate / 100) */
    dutyPerUnit: number;
    transitDays: number;
    /** Total USITC customs value (import volume in USD) */
    importVolume: number;
    /** Total USITC quantity imported */
    importQuantity: number;
    /** YoY cost trend percent (positive = rising) */
    costTrend?: number;
    /** Data years from USITC */
    dataYears: number[];
    /** Data confidence: high (>$1M volume), medium ($100K-$1M), low (<$100K) */
    dataConfidence: DataConfidence;
    /** Human-readable confidence reason */
    confidenceReason: string;
    /** Whether the price is reliable enough to quote. False = show "Insufficient data" instead of price. */
    priceReliable: boolean;
    /** Reason the price is unreliable (only set when priceReliable=false) */
    unreliableReason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Volume-based confidence: high (>$1M), medium ($100K-$1M), low (<$100K) */
const HIGH_VOLUME_THRESHOLD = 1_000_000;
const MEDIUM_VOLUME_THRESHOLD = 100_000;
const LOW_QUANTITY_THRESHOLD = 100;

/**
 * Minimum quantity to consider a price quotable.
 * Below this, the unit price is likely a single niche shipment and not representative.
 */
const MIN_QUOTABLE_QUANTITY = 10;

function getDataConfidence(volume: number, quantity: number): { level: DataConfidence; reason: string } {
    if (volume >= HIGH_VOLUME_THRESHOLD && quantity >= LOW_QUANTITY_THRESHOLD) {
        return { level: 'high', reason: 'High trade volume — price is well-established' };
    }
    if (volume >= MEDIUM_VOLUME_THRESHOLD) {
        return { level: 'medium', reason: 'Moderate trade volume — price is reasonably reliable' };
    }
    if (quantity < LOW_QUANTITY_THRESHOLD) {
        return { level: 'low', reason: `Only ${quantity.toLocaleString()} units imported — price may not be representative` };
    }
    return { level: 'low', reason: `Low trade volume ($${(volume / 1000).toFixed(0)}K) — price may reflect niche shipments` };
}

/**
 * Detect statistically unreliable prices using multiple heuristics.
 *
 * A price is unreliable if ANY of these are true:
 * 1. Quantity is below MIN_QUOTABLE_QUANTITY (too few units to be meaningful)
 * 2. Unit value is an IQR outlier (>1.5× IQR above Q3) AND confidence is not high
 * 3. Unit value is >5× the median AND confidence is not high (catches prices that are
 *    wildly off even when IQR is wide — e.g. $103 when median is $14)
 *
 * Returns a Set of country codes whose prices should be shown as "Insufficient data".
 */
function detectUnreliablePrices(
    countries: Array<{ code: string; unitValue: number; importQuantity: number; dataConfidence: DataConfidence }>
): Set<string> {
    const unreliable = new Set<string>();

    // 1. Flag countries with extremely low quantity — price is meaningless
    for (const c of countries) {
        if (c.importQuantity < MIN_QUOTABLE_QUANTITY) {
            unreliable.add(c.code);
        }
    }

    // Work with quotable countries only for statistical analysis
    const quotable = countries.filter(c => !unreliable.has(c.code));
    if (quotable.length < 4) return unreliable;

    const sorted = [...quotable].sort((a, b) => a.unitValue - b.unitValue);
    const q1 = sorted[Math.floor(sorted.length * 0.25)].unitValue;
    const q3 = sorted[Math.floor(sorted.length * 0.75)].unitValue;
    const median = sorted[Math.floor(sorted.length * 0.5)].unitValue;
    const iqr = q3 - q1;

    // 2. Standard IQR outlier fence (1.5× — the textbook definition)
    const upperFence = q3 + 1.5 * iqr;
    const lowerFence = Math.max(0, q1 - 1.5 * iqr);

    // 3. Median-relative threshold — catches values that are absurdly far from typical
    //    even when the IQR is wide. 5× median is generous enough to allow legitimate
    //    variation but catches $103 when most countries are $5-$30.
    const MEDIAN_MULTIPLIER = 5;
    const medianCeiling = median * MEDIAN_MULTIPLIER;

    for (const c of quotable) {
        // High-confidence outliers are real — large trade volumes don't lie
        if (c.dataConfidence === 'high') continue;

        const isIqrOutlier = c.unitValue > upperFence || (lowerFence > 0 && c.unitValue < lowerFence);
        const isMedianOutlier = median > 0 && c.unitValue > medianCeiling;

        if (isIqrOutlier || isMedianOutlier) {
            unreliable.add(c.code);
        }
    }

    return unreliable;
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
    const limited = rateLimitByIP(request, 30);
    if (limited) return limited;

    const ts = new Date().toISOString();
    try {
        const { searchParams } = new URL(request.url);
        const htsRaw = searchParams.get('hts');

        if (!htsRaw) {
            return NextResponse.json({ success: false, error: 'hts parameter is required' }, { status: 400 });
        }

        const htsFull = htsRaw.replace(/\./g, '');          // full code for rate lookup (e.g. "6109100027")
        const hts6 = htsFull.substring(0, 6);                 // 6-digit for USITC DataWeb queries
        if (!/^\d{4,10}$/.test(htsFull) || !/^\d{4,6}$/.test(hts6)) {
            return NextResponse.json({ success: false, error: 'Invalid HTS code' }, { status: 400 });
        }

        console.log(`[CostMap API] ${ts} Fetching HTS ${htsFull} (DataWeb: ${hts6})`);

        // 1. Get base MFN rate from HTS database — use full code so we hit the tariff_line record
        const baseMfnInfo = await getBaseMfnRate(htsFull);
        const baseMfnRate = baseMfnInfo?.rate ?? 0;

        // 2. Fetch ALL countries from USITC DataWeb — low threshold, NO filtering
        const stats = await getImportStatsByHTS(hts6, { minQuantity: MIN_QUANTITY });

        console.log(`[CostMap API] USITC returned ${stats.length} countries for HTS ${hts6}`);

        // 3. Enrich every country with full tariff breakdown — parallel
        const promises = stats.map(async (stat) => {
            // Use normalized per-piece value when available, raw otherwise
            const unitValue = stat.avgPerPieceValue ?? stat.avgUnitValue;
            if (unitValue <= 0) return null;

            const wasNormalized = stat.avgPerPieceValue !== null && stat.avgPerPieceValue !== stat.avgUnitValue;

            try {
                const tariffs = await getEffectiveTariff(stat.countryCode, htsFull, {
                    baseMfnRate: baseMfnRate || undefined,
                });

                const tariffBreakdown: TariffBreakdown = {
                    baseMfnRate: tariffs.baseMfnRate,
                    ftaDiscount: tariffs.ftaDiscount,
                    ieepaRate: tariffs.ieepaRate,
                    ieepaBaseline: tariffs.ieepaBreakdown.baseline,
                    ieepaFentanyl: tariffs.ieepaBreakdown.fentanyl,
                    ieepaReciprocal: tariffs.ieepaBreakdown.reciprocal,
                    section301Rate: tariffs.section301Rate,
                    section232Rate: tariffs.section232Rate,
                    section232Product: tariffs.section232Product,
                    adcvdRate: tariffs.adcvdRate,
                    adcvdWarning: tariffs.adcvdWarning,
                    totalAdditionalDuties: tariffs.totalAdditionalDuties,
                    effectiveRate: tariffs.effectiveRate,
                    hasFTA: tariffs.hasFta,
                    ftaName: tariffs.ftaName,
                    layers: tariffs.breakdown.map(b => ({
                        program: b.program,
                        rate: b.rate,
                        description: b.description,
                    })),
                    warnings: tariffs.warnings,
                };

                const dutyPerUnit = round2(unitValue * (tariffs.effectiveRate / 100));

                const confidence = getDataConfidence(stat.totalValue, stat.totalQuantity);

                const country: CostMapCountry = {
                    code: stat.countryCode,
                    name: stat.countryName,
                    flag: COUNTRY_FLAGS[stat.countryCode] || '🌍',
                    unitValue: round2(unitValue),
                    rawQuantityUnit: stat.quantityUnit,
                    displayUnit: stat.normalizedUnit,
                    wasNormalized,
                    tariff: tariffBreakdown,
                    dutyPerUnit,
                    transitDays: TRANSIT_DAYS[stat.countryCode] ?? DEFAULT_TRANSIT_DAYS,
                    importVolume: stat.totalValue,
                    importQuantity: stat.totalQuantity,
                    costTrend: stat.costTrendPercent,
                    dataYears: stat.dataYears,
                    dataConfidence: confidence.level,
                    confidenceReason: confidence.reason,
                    priceReliable: true, // will be overwritten by detectUnreliablePrices post-processing
                };
                return country;
            } catch (err) {
                console.warn(`[CostMap API] Tariff lookup failed for ${stat.countryCode}:`, err);
                return null;
            }
        });

        const resolved = await Promise.all(promises);
        const preliminary: CostMapCountry[] = [];
        for (const r of resolved) {
            if (r) preliminary.push(r);
        }

        // Detect unreliable prices using IQR + median outlier detection + minimum quantity
        const unreliableCodes = detectUnreliablePrices(preliminary);
        const results: CostMapCountry[] = preliminary.map(c => {
            if (unreliableCodes.has(c.code)) {
                let reason: string;
                if (c.importQuantity < MIN_QUOTABLE_QUANTITY) {
                    reason = `Only ${c.importQuantity} unit${c.importQuantity === 1 ? '' : 's'} imported — insufficient data to quote a reliable price`;
                } else {
                    reason = `Price appears unusually high for this product — likely reflects niche or non-representative shipments`;
                }
                return { ...c, priceReliable: false, unreliableReason: reason };
            }
            return { ...c, priceReliable: true };
        });

        // Sort by unit value (cheapest first)
        results.sort((a, b) => a.unitValue - b.unitValue);

        console.log(`[CostMap API] Returning ${results.length} countries for HTS ${htsFull}`);

        return NextResponse.json({
            success: true,
            data: {
                htsCode: htsFull,
                baseMfnRate,
                baseMfnRateType: baseMfnInfo?.rateType ?? 'unknown',
                countries: results,
                totalCountries: results.length,
                /** The USITC quantity unit for this HTS code */
                quantityUnit: stats[0]?.quantityUnit ?? 'units',
                /** Display unit after normalization */
                displayUnit: stats[0]?.normalizedUnit ?? 'each',
                dataYears: stats[0]?.dataYears ?? [],
            },
        });
    } catch (error) {
        console.error(`[CostMap API] ${ts} error:`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cost map data' },
            { status: 500 }
        );
    }
}
