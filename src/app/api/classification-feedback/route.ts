/**
 * Classification Feedback API
 * 
 * POST /api/classification-feedback - Submit user feedback on a classification
 * GET /api/classification-feedback - Get feedback statistics for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { 
  submitClassificationFeedback,
  getFeedbackStats,
} from '@/services/classificationFeedback';
import { FeedbackType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      searchHistoryId,
      feedbackType,
      correctedCode,
      correctionReason,
      wasHelpful,
      qualityRating,
      engineVersion,
      modelVersion,
    } = body;
    
    if (!searchHistoryId || !feedbackType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: searchHistoryId, feedbackType' },
        { status: 400 }
      );
    }
    
    if (!Object.values(FeedbackType).includes(feedbackType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedbackType' },
        { status: 400 }
      );
    }
    
    if (feedbackType === 'corrected' && !correctedCode) {
      return NextResponse.json(
        { success: false, error: 'correctedCode required when feedbackType is "corrected"' },
        { status: 400 }
      );
    }
    
    if (qualityRating !== undefined && (qualityRating < 1 || qualityRating > 5)) {
      return NextResponse.json(
        { success: false, error: 'qualityRating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    const feedback = await submitClassificationFeedback({
      searchHistoryId,
      userId: session.user.id,
      feedbackType,
      correctedCode,
      correctionReason,
      wasHelpful,
      qualityRating,
      engineVersion,
      modelVersion,
    });
    
    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        feedbackType: feedback.feedbackType,
        createdAt: feedback.createdAt,
      },
    });
    
  } catch (error: unknown) {
    console.error('[classification-feedback] POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined;
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined;
    
    const stats = await getFeedbackStats({
      userId: session.user.id,
      startDate,
      endDate,
    });
    
    return NextResponse.json({ success: true, stats });
    
  } catch (error: unknown) {
    console.error('[classification-feedback] GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
