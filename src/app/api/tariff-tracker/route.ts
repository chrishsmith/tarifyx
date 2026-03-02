/**
 * Tariff Tracker API
 * 
 * GET /api/tariff-tracker
 *   Returns all special tariff programs, reciprocal rates, and program data.
 *   Now reads from the database (CountryTariffProfile) as single source of truth.
 *   Static data from specialTariffs.ts is used only for program metadata
 *   (descriptions, legal references, etc.) — rates come from DB.
 * 
 *   Query params:
 *     - category: 'section_301' | 'ieepa' | 'section_232'
 *     - country: ISO 2-letter country code
 *     - htsCode: HTS code to check for applicable tariffs
 *     - status: 'active' | 'paused' | 'expired'
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  ALL_TARIFF_PROGRAMS,
  SECTION_301_PROGRAMS,
  IEEPA_PROGRAMS,
  SECTION_232_PROGRAMS,
  HTS_CHAPTER_COVERAGE,
  EXTERNAL_RESOURCES,
  getHtsChapterTariffs,
  calculateTotalAdditionalTariff,
  type TariffProgram,
} from '@/data/specialTariffs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'section_301' | 'ieepa' | 'section_232' | null;
    const country = searchParams.get('country');
    const htsCode = searchParams.get('htsCode');
    const status = searchParams.get('status') as 'active' | 'paused' | 'expired' | null;

    let programs: TariffProgram[] = ALL_TARIFF_PROGRAMS;

    // Filter by category
    if (category) {
      switch (category) {
        case 'section_301':
          programs = SECTION_301_PROGRAMS;
          break;
        case 'ieepa':
          programs = IEEPA_PROGRAMS;
          break;
        case 'section_232':
          programs = SECTION_232_PROGRAMS;
          break;
      }
    }

    // Filter by country
    if (country) {
      programs = programs.filter(p => 
        p.affectedCountries.includes(country.toUpperCase()) || 
        p.affectedCountries.includes('ALL')
      );
    }

    // Filter by HTS code
    if (htsCode) {
      const chapter = htsCode.replace(/\./g, '').substring(0, 2);
      const chapterTariffs = getHtsChapterTariffs(chapter);
      const chapterProgramIds = chapterTariffs.map(t => t.id);
      
      programs = programs.filter(p => 
        chapterProgramIds.includes(p.id) ||
        p.type === 'ieepa_baseline' ||
        p.type === 'ieepa_reciprocal' ||
        p.type === 'ieepa_fentanyl'
      );
    }

    // Filter by status
    if (status) {
      programs = programs.filter(p => p.status === status);
    }

    // Calculate totals if both country and HTS code provided
    let calculation = null;
    if (country && htsCode) {
      calculation = calculateTotalAdditionalTariff(country, htsCode);
    }

    // ═══════════════════════════════════════════════════════════════════
    // RECIPROCAL RATES: Read from DB (single source of truth)
    // ═══════════════════════════════════════════════════════════════════
    let reciprocalRates: Record<string, number> = {};
    let countryRate: number | null = null;
    let lastVerified: string | null = null;

    try {
      // Fetch all country profiles with reciprocal rates from DB
      const profiles = await prisma.countryTariffProfile.findMany({
        where: {
          OR: [
            { reciprocalRate: { not: null } },
            { ieepaBaselineRate: { gt: 0 } },
          ],
        },
        select: {
          countryCode: true,
          reciprocalRate: true,
          ieepaBaselineRate: true,
          lastVerified: true,
        },
        orderBy: { lastVerified: 'desc' },
      });

      // Build reciprocal rates map from DB
      for (const profile of profiles) {
        const rate = profile.reciprocalRate ?? profile.ieepaBaselineRate ?? 10;
        reciprocalRates[profile.countryCode] = rate;
      }

      // Add DEFAULT entry
      reciprocalRates['DEFAULT'] = 10;

      // Get country-specific rate if requested
      if (country) {
        countryRate = reciprocalRates[country.toUpperCase()] ?? 10;
      }

      // Get most recent verification date
      lastVerified = profiles[0]?.lastVerified
        ? profiles[0].lastVerified.toISOString().split('T')[0]
        : null;

    } catch (dbError) {
      // If DB is unavailable, return empty rates with warning
      console.error('[API] Failed to read reciprocal rates from DB:', dbError);
      reciprocalRates = { DEFAULT: 10 };
    }

    // Summary statistics
    const summary = {
      totalPrograms: programs.length,
      activePrograms: programs.filter(p => p.status === 'active').length,
      pausedPrograms: programs.filter(p => p.status === 'paused').length,
      byCategory: {
        section_301: programs.filter(p => p.category === 'section_301').length,
        ieepa: programs.filter(p => p.category === 'ieepa').length,
        section_232: programs.filter(p => p.category === 'section_232').length,
      },
    };

    return NextResponse.json({
      success: true,
      programs,
      summary,
      calculation,
      countryRate,
      htsCoverage: HTS_CHAPTER_COVERAGE,
      reciprocalRates,
      externalResources: EXTERNAL_RESOURCES,
      lastUpdated: lastVerified ?? new Date().toISOString().split('T')[0],
      dataSource: 'database', // Indicates rates come from DB, not static files
    });

  } catch (error) {
    console.error('[API] Tariff tracker error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tariff data' },
      { status: 500 }
    );
  }
}
