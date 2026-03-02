/**
 * Tariff Registry Rate Update API
 * 
 * POST /api/tariff-registry/update-rate
 *   Manually update a country's reciprocal tariff rate.
 *   Use when trade deals change rates (e.g., India 26% → 18%).
 * 
 * Body:
 *   - countryCode: ISO 2-letter code (required)
 *   - reciprocalRate: New rate as number (required)
 *   - reason: Why the rate changed (required)
 *   - effectiveDate: When the new rate takes effect (optional, defaults to now)
 *   - source: Legal reference or news source (optional)
 * 
 * GET /api/tariff-registry/update-rate
 *   Returns all country profiles with their current rates.
 *   Query params:
 *     - country: Filter to specific country code
 *     - elevated: 'true' to only show elevated-rate countries
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { recalculateTotalRate } from '@/services/tariff/registry';

export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    try {
        const body = await request.json();
        const { countryCode, reciprocalRate, reason, effectiveDate, source } = body;

        // Validate required fields
        if (!countryCode || typeof countryCode !== 'string') {
            return NextResponse.json(
                { success: false, error: 'countryCode is required (ISO 2-letter code)' },
                { status: 400 }
            );
        }
        if (reciprocalRate === undefined || typeof reciprocalRate !== 'number' || reciprocalRate < 0) {
            return NextResponse.json(
                { success: false, error: 'reciprocalRate is required (number >= 0)' },
                { status: 400 }
            );
        }
        if (!reason || typeof reason !== 'string') {
            return NextResponse.json(
                { success: false, error: 'reason is required (explain why the rate changed)' },
                { status: 400 }
            );
        }

        const upperCode = countryCode.toUpperCase();

        // Find existing profile
        const existing = await prisma.countryTariffProfile.findUnique({
            where: { countryCode: upperCode },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: `No country profile found for ${upperCode}. Run /api/tariff-registry/sync?type=countries first.` },
                { status: 404 }
            );
        }

        const previousRate = existing.reciprocalRate ?? existing.ieepaBaselineRate ?? 10;
        const changeDirection = reciprocalRate > previousRate ? 'increased' : reciprocalRate < previousRate ? 'decreased' : 'unchanged';

        // Determine trade status based on new rate
        let tradeStatus = existing.tradeStatus;
        if (reciprocalRate > 10 && tradeStatus === 'normal') {
            tradeStatus = 'elevated';
        } else if (reciprocalRate <= 10 && tradeStatus === 'elevated') {
            tradeStatus = existing.hasFta ? 'fta' : 'normal';
        }

        // Build source string
        const sourceEntry = [
            `Manual update: ${previousRate}% → ${reciprocalRate}%`,
            reason,
            source ? `Source: ${source}` : null,
            effectiveDate ? `Effective: ${effectiveDate}` : null,
            `Updated: ${new Date().toISOString()}`,
        ].filter(Boolean).join(' | ');

        // Update the profile
        const updated = await prisma.countryTariffProfile.update({
            where: { countryCode: upperCode },
            data: {
                reciprocalRate,
                tradeStatus: tradeStatus as 'normal' | 'fta' | 'elevated' | 'sanctioned',
                notes: `${reason} (${new Date().toISOString().split('T')[0]})`,
                sources: { push: sourceEntry },
                lastVerified: new Date(),
            },
        });

        // Recalculate total rate
        const newTotal = await recalculateTotalRate(upperCode);

        console.log(`[TariffRegistry] Rate updated: ${upperCode} ${previousRate}% → ${reciprocalRate}% (${reason})`);

        return NextResponse.json({
            success: true,
            update: {
                countryCode: upperCode,
                countryName: updated.countryName,
                previousRate,
                newRate: reciprocalRate,
                changeDirection,
                totalAdditionalRate: newTotal,
                tradeStatus: updated.tradeStatus,
                reason,
                effectiveDate: effectiveDate || 'immediate',
                updatedAt: updated.lastVerified.toISOString(),
            },
        });

    } catch (error) {
        console.error('[API] Rate update error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get('country');
        const elevated = searchParams.get('elevated');

        const whereClause: Record<string, unknown> = {};
        if (country) {
            whereClause.countryCode = country.toUpperCase();
        }
        if (elevated === 'true') {
            whereClause.tradeStatus = 'elevated';
        }

        const profiles = await prisma.countryTariffProfile.findMany({
            where: whereClause,
            select: {
                countryCode: true,
                countryName: true,
                tradeStatus: true,
                reciprocalRate: true,
                ieepaBaselineRate: true,
                fentanylRate: true,
                fentanylActive: true,
                totalAdditionalRate: true,
                hasFta: true,
                ftaName: true,
                lastVerified: true,
                notes: true,
            },
            orderBy: [
                { totalAdditionalRate: 'desc' },
                { countryName: 'asc' },
            ],
        });

        return NextResponse.json({
            success: true,
            count: profiles.length,
            profiles: profiles.map(p => ({
                ...p,
                effectiveReciprocalRate: p.reciprocalRate ?? p.ieepaBaselineRate ?? 10,
                lastVerified: p.lastVerified.toISOString(),
            })),
        });

    } catch (error) {
        console.error('[API] Rate list error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
