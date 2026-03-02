/**
 * Tariff Alert by ID API
 * 
 * GET /api/tariff-alerts/[id] - Get a specific alert
 * PATCH /api/tariff-alerts/[id] - Update an alert (toggle active, change settings)
 * DELETE /api/tariff-alerts/[id] - Delete an alert
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

async function getAuthUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const alert = await prisma.tariffAlert.findFirst({
      where: { id, userId },
      include: {
        savedProduct: {
          select: { id: true, name: true },
        },
        alertEvents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!alert) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('[tariff-alerts/id] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch alert' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive, alertType, threshold } = body;

    // Verify ownership before updating
    const existing = await prisma.tariffAlert.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    const updateData: {
      isActive?: boolean;
      alertType?: 'ANY_CHANGE' | 'INCREASE_ONLY' | 'DECREASE_ONLY' | 'THRESHOLD';
      threshold?: number | null;
    } = {};

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (alertType && ['ANY_CHANGE', 'INCREASE_ONLY', 'DECREASE_ONLY', 'THRESHOLD'].includes(alertType)) {
      updateData.alertType = alertType as typeof updateData.alertType;
    }

    if (threshold !== undefined) {
      updateData.threshold = threshold;
    }

    const alert = await prisma.tariffAlert.update({
      where: { id },
      data: updateData,
      include: {
        savedProduct: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('[tariff-alerts/id] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update alert' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const existing = await prisma.tariffAlert.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    await prisma.tariffAlert.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('[tariff-alerts/id] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete alert' }, { status: 500 });
  }
}
