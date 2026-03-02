/**
 * POST /api/sourcing/analyze
 * 
 * Generate comprehensive sourcing recommendations for a product.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateSourcingRecommendations, SourcingAnalysisInput } from '@/services/sourcing/advisor';

const RATE_LIMIT_PER_HOUR = 20;

export async function POST(request: NextRequest) {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const { allowed, remaining, resetMs } = checkRateLimit(`sourcing:${authResult.userId}`, RATE_LIMIT_PER_HOUR);
    if (!allowed) {
        return NextResponse.json(
            { success: false, error: 'Rate limit exceeded. Try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)), 'X-RateLimit-Remaining': String(remaining) } }
        );
    }

    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.htsCode) {
            return NextResponse.json(
                { error: 'htsCode is required' },
                { status: 400 }
            );
        }
        
        const input: SourcingAnalysisInput = {
            htsCode: body.htsCode,
            productDescription: body.productDescription,
            currentCountry: body.currentCountry,
            materials: body.materials,
            requiredCertifications: body.requiredCertifications,
            annualVolume: body.annualVolume,
            prioritizeFTA: body.prioritizeFTA ?? true,
            excludeCountries: body.excludeCountries,
        };
        
        console.log('[API] Sourcing analysis request:', input.htsCode);
        
        const recommendations = await generateSourcingRecommendations(input);
        
        return NextResponse.json({
            success: true,
            data: recommendations,
        });
        
    } catch (error) {
        console.error('[API] Sourcing analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to generate sourcing recommendations' },
            { status: 500 }
        );
    }
}





