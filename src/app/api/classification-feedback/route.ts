/**
 * Classification Feedback API
 * 
 * POST /api/classification-feedback - Submit user feedback on a classification
 * GET /api/classification-feedback/stats - Get feedback statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  submitClassificationFeedback,
  getFeedbackStats,
} from '@/services/classificationFeedback';
import { FeedbackType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      searchHistoryId,
      userId,
      feedbackType,
      correctedCode,
      correctionReason,
      wasHelpful,
      qualityRating,
      engineVersion,
      modelVersion,
    } = body;
    
    // Validate required fields
    if (!searchHistoryId || !feedbackType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: searchHistoryId, feedbackType' },
        { status: 400 }
      );
    }
    
    // Validate feedback type
    if (!Object.values(FeedbackType).includes(feedbackType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedbackType' },
        { status: 400 }
      );
    }
    
    // If corrected, require correctedCode
    if (feedbackType === 'corrected' && !correctedCode) {
      return NextResponse.json(
        { success: false, error: 'correctedCode required when feedbackType is "corrected"' },
        { status: 400 }
      );
    }
    
    // Validate quality rating if provided
    if (qualityRating !== undefined && (qualityRating < 1 || qualityRating > 5)) {
      return NextResponse.json(
        { success: false, error: 'qualityRating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Submit feedback
    const feedback = await submitClassificationFeedback({
      searchHistoryId,
      userId,
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
    
  } catch (error: any) {
    console.error('[Classification Feedback API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined;
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined;
    
    const stats = await getFeedbackStats({
      userId,
      startDate,
      endDate,
    });
    
    return NextResponse.json({
      success: true,
      stats,
    });
    
  } catch (error: any) {
    console.error('[Classification Feedback API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
