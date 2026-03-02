/**
 * Tariff Alert Events API
 * 
 * GET /api/tariff-alerts/events - List alert events for the authenticated user
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: { alertId?: string; alert: { userId: string } } = {
      alert: { userId: session.user.id },
    };

    if (alertId) {
      whereClause.alertId = alertId;
    }

    const events = await prisma.tariffAlertEvent.findMany({
      where: whereClause,
      include: {
        alert: {
          select: {
            id: true,
            htsCode: true,
            countryOfOrigin: true,
            savedProduct: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('[tariff-alerts/events] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alert events' },
      { status: 500 }
    );
  }
}
