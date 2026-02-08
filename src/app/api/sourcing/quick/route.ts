/**
 * GET /api/sourcing/quick
 * 
 * Lightweight endpoint for sourcing preview cards.
 * Returns top 3-5 country alternatives with cost savings and supplier counts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveTariff } from '@/services/tariff/registry';
import { getBaseMfnRate } from '@/services/hts/database';
import { getImportStatsByHTS, type ImportStatsByCountry } from '@/services/usitcDataWeb';

// Country flags
const COUNTRY_FLAGS: Record<string, string> = {
    'CN': '🇨🇳', 'MX': '🇲🇽', 'CA': '🇨🇦', 'VN': '🇻🇳', 'IN': '🇮🇳',
    'BD': '🇧🇩', 'TH': '🇹🇭', 'ID': '🇮🇩', 'TW': '🇹🇼', 'KR': '🇰🇷',
    'JP': '🇯🇵', 'DE': '🇩🇪', 'IT': '🇮🇹', 'TR': '🇹🇷', 'MY': '🇲🇾',
    'PH': '🇵🇭', 'PK': '🇵🇰', 'KH': '🇰🇭', 'AU': '🇦🇺', 'SG': '🇸🇬',
};

const DEFAULT_ANNUAL_UNITS = 10000;
const DEFAULT_ORDER_QUANTITY = 1000;
const DEFAULT_WEIGHT_PER_UNIT_KG = 0.5;
const DEFAULT_FEES_PER_UNIT = 0.05;
const DEFAULT_MIN_CONFIDENCE = 25;
const DATAWEB_MIN_QUANTITY = 1000;
// No upper cap on unit value — industrial goods (CNC machines, semiconductors) can exceed $10k/unit
const DATAWEB_CONFIDENCE_BASE = 50;
const DATAWEB_CONFIDENCE_HIGH_VALUE = 10000000;
const DATAWEB_CONFIDENCE_MED_VALUE = 1000000;
const DATAWEB_CONFIDENCE_HIGH_QTY = 1000000;
const DATAWEB_CONFIDENCE_TWO_YEARS = 2;
const BASELINE_COUNTRY_CODE = 'CN';
const DEFAULT_BASE_TARIFF_RATE = 5.0;
const RECOMMENDED_SAVINGS_PERCENT = 5;

// Shipping cost estimates ($ per kg, from country to US West Coast)
const SHIPPING_PER_KG: Record<string, number> = {
    'CN': 0.80, 'VN': 0.90, 'IN': 1.10, 'BD': 1.20, 'TH': 0.95,
    'ID': 1.00, 'MY': 0.90, 'TW': 0.85, 'KR': 0.80, 'JP': 0.75,
    'MX': 0.40, 'CA': 0.35, 'DE': 1.20, 'IT': 1.25, 'default': 1.00,
};

const TRANSIT_DAYS: Record<string, number> = {
    'CN': 28, 'VN': 30, 'IN': 35, 'BD': 38, 'TH': 32,
    'ID': 35, 'MY': 30, 'TW': 22, 'KR': 20, 'JP': 18,
    'MX': 5, 'CA': 3, 'DE': 18, 'IT': 20, 'default': 30,
};

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

export interface QuickSourcingPreview {
    htsCode: string;
    baseMfnRate: number;
    baseMfnRateType: 'ad_valorem' | 'specific' | 'compound' | 'free' | 'unknown';
    currentCountry: {
        code: string;
        name: string;
        flag: string;
        landedCostPerUnit: number;
        landedCostTotal: number;
        effectiveTariff: number;
        supplierCount: number;
        transitDays: number;
        confidenceScore: number;
        dataQuality: 'high' | 'medium' | 'low';
    } | null;
    alternatives: Array<{
        code: string;
        name: string;
        flag: string;
        landedCostPerUnit: number;
        landedCostTotal: number;
        effectiveTariff: number;
        savingsPercent: number;
        savingsAmountPerUnit: number;
        savingsAmountTotal: number;
        supplierCount: number;
        transitDays: number;
        confidenceScore: number;
        dataQuality: 'high' | 'medium' | 'low';
        hasFTA: boolean;
        ftaName?: string;
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

export async function GET(request: NextRequest) {
    const requestTimestamp = new Date().toISOString();
    try {
        const { searchParams } = new URL(request.url);
        const htsCode = searchParams.get('hts');
        const currentCountry = searchParams.get('from');
        const annualUnits = Math.round(parsePositiveNumber(searchParams.get('units'), DEFAULT_ANNUAL_UNITS));
        const quantity = Math.max(1, Math.round(parsePositiveNumber(searchParams.get('quantity'), DEFAULT_ORDER_QUANTITY)));
        const weightPerUnitKg = parsePositiveNumber(searchParams.get('weightPerUnitKg'), DEFAULT_WEIGHT_PER_UNIT_KG);
        
        if (!htsCode) {
            return NextResponse.json(
                { success: false, error: 'hts parameter is required' },
                { status: 400 }
            );
        }
        
        console.log(`[QuickSourcing] ${requestTimestamp} hts=${htsCode} from=${currentCountry || 'n/a'} qty=${quantity}`);
        
        // Normalize HTS code to 6 digits
        const hts6 = htsCode.replace(/\./g, '').substring(0, 6);
        
        const baseMfnInfo = await getBaseMfnRate(hts6);
        const baseMfnRate = baseMfnInfo?.rate ?? 0;
        const baseMfnRateType = baseMfnInfo?.rateType ?? 'unknown';

        // Get supplier counts by country for this HTS chapter
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

        // Get all cost data for this HTS
        const costData = await prisma.htsCostByCountry.findMany({
            where: {
                htsCode: hts6,
                confidenceScore: { gte: DEFAULT_MIN_CONFIDENCE },
            },
            orderBy: { avgUnitValue: 'asc' },
        });
        
        // Calculate landed costs for each country
        const countryResults: Array<{
            code: string;
            name: string;
            flag: string;
            landedCostPerUnit: number;
            landedCostTotal: number;
            effectiveTariff: number;
            supplierCount: number;
            transitDays: number;
            confidenceScore: number;
            dataQuality: 'high' | 'medium' | 'low';
            hasFTA: boolean;
            ftaName?: string;
        }> = [];
        
        if (costData.length > 0) {
            for (const record of costData) {
                const baseTariff = baseMfnRate || record.baseTariffRate || DEFAULT_BASE_TARIFF_RATE;
                const tariffs = await getEffectiveTariff(record.countryCode, hts6, {
                    baseMfnRate: baseTariff,
                });
                
                // Estimate shipping cost
                const shippingPerKg = SHIPPING_PER_KG[record.countryCode] || SHIPPING_PER_KG['default'];
                const shippingPerUnit = shippingPerKg * weightPerUnitKg;
                
                // Calculate landed cost
                const tariffAmount = record.avgUnitValue * (tariffs.effectiveRate / 100);
                const landedCostPerUnit = record.avgUnitValue + shippingPerUnit + tariffAmount + DEFAULT_FEES_PER_UNIT;
                const landedCostTotal = landedCostPerUnit * quantity;
                const confidenceScore = record.confidenceScore ?? 0;
                
                countryResults.push({
                    code: record.countryCode,
                    name: record.countryName,
                    flag: COUNTRY_FLAGS[record.countryCode] || '🌍',
                    landedCostPerUnit: roundCurrency(landedCostPerUnit),
                    landedCostTotal: roundCurrency(landedCostTotal),
                    effectiveTariff: tariffs.effectiveRate,
                    supplierCount: supplierCountMap.get(record.countryCode) || 0,
                    transitDays: TRANSIT_DAYS[record.countryCode] || TRANSIT_DAYS['default'],
                    confidenceScore,
                    dataQuality: getDataQuality(confidenceScore),
                    hasFTA: tariffs.hasFta,
                    ftaName: tariffs.ftaName || undefined,
                });
            }
        } else {
            const stats = await getImportStatsByHTS(hts6, { minQuantity: DATAWEB_MIN_QUANTITY });
            for (const stat of stats) {
                if (!stat.avgUnitValue || stat.avgUnitValue <= 0) {
                    continue;
                }

                const baseTariff = baseMfnRate || DEFAULT_BASE_TARIFF_RATE;
                const tariffs = await getEffectiveTariff(stat.countryCode, hts6, {
                    baseMfnRate: baseTariff,
                });

                const shippingPerKg = SHIPPING_PER_KG[stat.countryCode] || SHIPPING_PER_KG['default'];
                const shippingPerUnit = shippingPerKg * weightPerUnitKg;
                const tariffAmount = stat.avgUnitValue * (tariffs.effectiveRate / 100);
                const landedCostPerUnit = stat.avgUnitValue + shippingPerUnit + tariffAmount + DEFAULT_FEES_PER_UNIT;
                const landedCostTotal = landedCostPerUnit * quantity;
                const confidenceScore = estimateDataWebConfidence(stat);

                if (confidenceScore < DEFAULT_MIN_CONFIDENCE) {
                    continue;
                }

                countryResults.push({
                    code: stat.countryCode,
                    name: stat.countryName,
                    flag: COUNTRY_FLAGS[stat.countryCode] || '🌍',
                    landedCostPerUnit: roundCurrency(landedCostPerUnit),
                    landedCostTotal: roundCurrency(landedCostTotal),
                    effectiveTariff: tariffs.effectiveRate,
                    supplierCount: supplierCountMap.get(stat.countryCode) || 0,
                    transitDays: TRANSIT_DAYS[stat.countryCode] || TRANSIT_DAYS['default'],
                    confidenceScore,
                    dataQuality: getDataQuality(confidenceScore),
                    hasFTA: tariffs.hasFta,
                    ftaName: tariffs.ftaName || undefined,
                });
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // TARIFF-ONLY FALLBACK: When no cost data exists, generate 
        // comparisons using the user's input value + accurate tariff rates.
        // This ensures we ALWAYS show meaningful alternatives.
        // ──────────────────────────────────────────────────────────────────
        if (countryResults.length === 0) {
            const TOP_FALLBACK_COUNTRIES = [
                'CN', 'VN', 'MX', 'IN', 'BD', 'TH', 'ID', 'TW', 'KR', 'JP',
                'DE', 'IT', 'MY', 'CA', 'PH', 'TR', 'PK', 'KH', 'SG', 'AU',
            ];

            // Estimate per-unit value from total/quantity
            const estimatedPerUnit = quantity > 0
                ? parsePositiveNumber(searchParams.get('value'), 10) / quantity
                : parsePositiveNumber(searchParams.get('value'), 10);

            const COUNTRY_NAMES: Record<string, string> = {
                CN: 'China', VN: 'Vietnam', MX: 'Mexico', IN: 'India', BD: 'Bangladesh',
                TH: 'Thailand', ID: 'Indonesia', TW: 'Taiwan', KR: 'South Korea',
                JP: 'Japan', DE: 'Germany', IT: 'Italy', MY: 'Malaysia', CA: 'Canada',
                PH: 'Philippines', TR: 'Turkey', PK: 'Pakistan', KH: 'Cambodia',
                SG: 'Singapore', AU: 'Australia',
            };

            for (const cc of TOP_FALLBACK_COUNTRIES) {
                try {
                    const baseTariff = baseMfnRate || DEFAULT_BASE_TARIFF_RATE;
                    const tariffs = await getEffectiveTariff(cc, hts6, {
                        baseMfnRate: baseTariff,
                    });

                    const shippingPerKg = SHIPPING_PER_KG[cc] || SHIPPING_PER_KG['default'];
                    const shippingPerUnit = shippingPerKg * weightPerUnitKg;
                    const tariffAmount = estimatedPerUnit * (tariffs.effectiveRate / 100);
                    const landedCostPerUnit = estimatedPerUnit + shippingPerUnit + tariffAmount + DEFAULT_FEES_PER_UNIT;
                    const landedCostTotal = landedCostPerUnit * quantity;

                    countryResults.push({
                        code: cc,
                        name: COUNTRY_NAMES[cc] || cc,
                        flag: COUNTRY_FLAGS[cc] || '🌍',
                        landedCostPerUnit: roundCurrency(landedCostPerUnit),
                        landedCostTotal: roundCurrency(landedCostTotal),
                        effectiveTariff: tariffs.effectiveRate,
                        supplierCount: supplierCountMap.get(cc) || 0,
                        transitDays: TRANSIT_DAYS[cc] || TRANSIT_DAYS['default'],
                        confidenceScore: 30, // Low confidence — tariff-only estimate
                        dataQuality: 'low',
                        hasFTA: tariffs.hasFta,
                        ftaName: tariffs.ftaName || undefined,
                    });
                } catch (error) {
                    console.warn(`[QuickSourcing] Tariff-only fallback failed for ${cc}:`, error);
                }
            }

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
        }
        
        // Sort by landed cost
        countryResults.sort((a, b) => a.landedCostPerUnit - b.landedCostPerUnit);
        
        // Find current country data
        const currentData = currentCountry
            ? countryResults.find(c => c.code === currentCountry)
            : null;
        
        // Calculate baseline for savings (use current country or China if not specified)
        const baseline = currentData || countryResults.find(c => c.code === BASELINE_COUNTRY_CODE) || countryResults[0];
        
        // Build alternatives (exclude current country, top 10)
        const alternatives = countryResults
            .filter(c => c.code !== currentCountry)
            .slice(0, 10)
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
        
        // Calculate potential savings
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
            currentCountry: currentData ? {
                code: currentData.code,
                name: currentData.name,
                flag: currentData.flag,
                landedCostPerUnit: currentData.landedCostPerUnit,
                landedCostTotal: currentData.landedCostTotal,
                effectiveTariff: currentData.effectiveTariff,
                supplierCount: currentData.supplierCount,
                transitDays: currentData.transitDays,
                confidenceScore: currentData.confidenceScore,
                dataQuality: currentData.dataQuality,
            } : null,
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





