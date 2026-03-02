/**
 * Import Intelligence Analysis API
 * 
 * POST /api/import-intelligence/analyze
 * 
 * Orchestrates complete import analysis:
 * - Classification
 * - Landed cost calculation
 * - Country comparison
 * - Compliance checks
 * - Documentation requirements
 * - Optimization opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeProduct, AnalyzeProductInput } from '@/services/import-intelligence/orchestrator';

export const maxDuration = 60; // seconds - longer for comprehensive analysis
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.countryCode || !body.value || !body.quantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: countryCode, value, quantity' 
        },
        { status: 400 }
      );
    }
    
    if (!body.description && !body.htsCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either description or htsCode is required' 
        },
        { status: 400 }
      );
    }
    
    // Get user session (optional)
    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      userId = session?.user?.id;
      
      // Fallback: check for dev session cookie directly
      if (!userId) {
        const cookieHeader = request.headers.get('cookie') || '';
        const sessionTokenMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
        if (sessionTokenMatch) {
          const dbSession = await prisma.session.findUnique({
            where: { token: sessionTokenMatch[1] },
            include: { user: true },
          });
          if (dbSession && dbSession.expiresAt > new Date()) {
            userId = dbSession.userId;
          }
        }
      }
    } catch (error) {
      console.log('[Import Intelligence API] Session not available:', error);
    }
    
    // Build input
    const input: AnalyzeProductInput = {
      description: body.description,
      htsCode: body.htsCode,
      countryCode: body.countryCode.toUpperCase(),
      value: parseFloat(body.value),
      quantity: parseInt(body.quantity),
      attributes: {
        containsBattery: body.attributes?.containsBattery || false,
        containsChemicals: body.attributes?.containsChemicals || false,
        forChildren: body.attributes?.forChildren || false,
        foodContact: body.attributes?.foodContact || false,
        wireless: body.attributes?.wireless || false,
        medicalDevice: body.attributes?.medicalDevice || false,
        pressurized: body.attributes?.pressurized || false,
        flammable: body.attributes?.flammable || false,
      },
      shippingCost: body.shippingCost != null ? parseFloat(body.shippingCost) : undefined,
      insuranceCost: body.insuranceCost != null ? parseFloat(body.insuranceCost) : undefined,
      isOceanShipment: body.isOceanShipment,
      userId,
    };
    
    console.log('[Import Intelligence API] Analyzing:', {
      description: input.description?.slice(0, 50),
      htsCode: input.htsCode,
      country: input.countryCode,
      value: input.value,
    });
    
    // Run analysis
    const analysis = await analyzeProduct(input);
    
    // Save analysis to search_history so it appears on the dashboard
    let searchHistoryId: string | undefined;
    try {
      if (analysis.classification?.htsCode) {
        const { saveSearchToHistory } = await import('@/services/searchHistory');
        
        // Build a ClassificationResult-shaped object from the analysis
        const classificationResult = {
          htsCode: {
            code: analysis.classification.htsCode,
            description: analysis.classification.description || '',
          },
          confidence: analysis.classification.confidence ?? 0,
          dutyRate: {
            generalRate: analysis.classification.baseMfnRate != null
              ? `${analysis.classification.baseMfnRate}%`
              : '',
          },
          effectiveTariff: analysis.landedCost?.tariffBreakdown
            ? {
                totalAdValorem: analysis.landedCost.tariffBreakdown.effectiveRate ?? null,
                additionalDuties: analysis.landedCost.tariffBreakdown.breakdown?.filter(
                  (b: { type?: string }) => b.type !== 'MFN'
                ) ?? [],
              }
            : undefined,
          suggestedProductName: analysis.classification.suggestedProductName || null,
          // Store the full ImportAnalysis in fullResult for instant hydration
          _fullAnalysis: analysis,
        };

        const classificationInput = {
          productDescription: input.description || input.htsCode || '',
          productName: analysis.classification.suggestedProductName || null,
          countryOfOrigin: input.countryCode,
        };

        searchHistoryId = await saveSearchToHistory(
          classificationInput as any,
          classificationResult as any,
          userId,
        );
      }
    } catch (saveError) {
      // Non-fatal — don't fail the analysis if history save fails
      console.error('[Import Intelligence API] Failed to save to search_history:', saveError);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Import Intelligence API] Analysis completed in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      analysis,
      searchHistoryId,
      meta: {
        duration,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error: any) {
    console.error('[Import Intelligence API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Analysis failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
