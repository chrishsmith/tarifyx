/**
 * Tariff Alerts API
 * 
 * GET /api/tariff-alerts - List all alerts for the current user
 * POST /api/tariff-alerts - Create a new alert
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getEffectiveTariff } from '@/services/tariff/registry';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Sign in to view your alerts',
      }, { status: 401 });
    }

    const alerts = await prisma.tariffAlert.findMany({
      where: { userId: session.user.id },
      include: {
        savedProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error('[tariff-alerts] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Sign in to create alerts' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { htsCode, countryOfOrigin, alertType, threshold } = body;

    if (!htsCode) {
      return NextResponse.json(
        { success: false, error: 'HTS code is required' },
        { status: 400 }
      );
    }

    // Normalize HTS code
    const normalizedCode = htsCode.replace(/\./g, '');

    // Get current rate for the HTS code and country
    let originalRate = 0;
    try {
      const tariffInfo = await getEffectiveTariff(normalizedCode, countryOfOrigin || 'CN');
      originalRate = tariffInfo.effectiveRate || 0;
    } catch {
      originalRate = 0;
    }

    const alert = await prisma.tariffAlert.create({
      data: {
        userId: session.user.id,
        htsCode: normalizedCode,
        countryOfOrigin: countryOfOrigin || null,
        originalRate,
        currentRate: originalRate,
        alertType: alertType || 'ANY_CHANGE',
        threshold: threshold || null,
        isActive: true,
      },
      include: {
        savedProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('[tariff-alerts] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
