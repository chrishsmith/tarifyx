/**
 * Classification Feedback Service
 * 
 * Handles user feedback on HTS classifications for active learning.
 * Collects confirmations, corrections, and quality ratings to improve the model.
 * 
 * @module classificationFeedback
 * @created January 2026
 */

import { prisma } from '@/lib/db';
import { FeedbackType } from '@prisma/client';

export interface SubmitFeedbackInput {
  searchHistoryId: string;
  userId?: string;
  feedbackType: FeedbackType;
  correctedCode?: string;
  correctionReason?: string;
  wasHelpful?: boolean;
  qualityRating?: number; // 1-5
  engineVersion?: string;
  modelVersion?: string;
}

export interface FeedbackStats {
  totalFeedback: number;
  confirmed: number;
  corrected: number;
  rejected: number;
  uncertain: number;
  avgQualityRating: number;
  correctionRate: number;
  addedToTraining: number;
}

/**
 * Submit user feedback on a classification
 */
export async function submitClassificationFeedback(
  input: SubmitFeedbackInput
) {
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
  } = input;
  
  // Get the original search history
  const searchHistory = await prisma.searchHistory.findUnique({
    where: { id: searchHistoryId },
  });
  
  if (!searchHistory) {
    throw new Error('Search history not found');
  }
  
  // Create feedback record
  const feedback = await prisma.classificationFeedback.create({
    data: {
      searchHistoryId,
      userId,
      feedbackType,
      originalCode: searchHistory.htsCode,
      originalConfidence: searchHistory.confidence,
      correctedCode,
      correctionReason,
      wasHelpful,
      qualityRating,
      engineVersion,
      modelVersion,
    },
  });
  
  // Update search history with user verification
  await prisma.searchHistory.update({
    where: { id: searchHistoryId },
    data: {
      isUserVerified: feedbackType === 'confirmed',
      userCorrectedCode: correctedCode,
    },
  });
  
  console.log(`[Feedback] ${feedbackType} feedback received for search ${searchHistoryId}`);
  
  return feedback;
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(
  options: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<FeedbackStats> {
  const { userId, startDate, endDate } = options;
  
  const where: any = {};
  
  if (userId) {
    where.userId = userId;
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  
  // Get all feedback
  const allFeedback = await prisma.classificationFeedback.findMany({
    where,
    select: {
      feedbackType: true,
      qualityRating: true,
      addedToTraining: true,
    },
  });
  
  const totalFeedback = allFeedback.length;
  const confirmed = allFeedback.filter(f => f.feedbackType === 'confirmed').length;
  const corrected = allFeedback.filter(f => f.feedbackType === 'corrected').length;
  const rejected = allFeedback.filter(f => f.feedbackType === 'rejected').length;
  const uncertain = allFeedback.filter(f => f.feedbackType === 'uncertain').length;
  const addedToTraining = allFeedback.filter(f => f.addedToTraining).length;
  
  const ratingsWithValues = allFeedback.filter(f => f.qualityRating !== null);
  const avgQualityRating = ratingsWithValues.length > 0
    ? ratingsWithValues.reduce((sum, f) => sum + (f.qualityRating || 0), 0) / ratingsWithValues.length
    : 0;
  
  const correctionRate = totalFeedback > 0 ? corrected / totalFeedback : 0;
  
  return {
    totalFeedback,
    confirmed,
    corrected,
    rejected,
    uncertain,
    avgQualityRating,
    correctionRate,
    addedToTraining,
  };
}

/**
 * Get feedback items ready for training
 * 
 * Returns feedback that hasn't been added to training yet,
 * prioritizing corrections and high-quality confirmations
 */
export async function getFeedbackForTraining(limit: number = 100) {
  const feedback = await prisma.classificationFeedback.findMany({
    where: {
      addedToTraining: false,
      OR: [
        { feedbackType: 'corrected' }, // All corrections
        { 
          feedbackType: 'confirmed',
          qualityRating: { gte: 4 } // High-quality confirmations
        },
      ],
    },
    include: {
      searchHistory: {
        select: {
          productDescription: true,
          htsCode: true,
          confidence: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // Oldest first
    },
    take: limit,
  });
  
  return feedback;
}

/**
 * Mark feedback as added to training
 */
export async function markFeedbackAsTrained(feedbackIds: string[]) {
  await prisma.classificationFeedback.updateMany({
    where: {
      id: { in: feedbackIds },
    },
    data: {
      addedToTraining: true,
      trainedAt: new Date(),
    },
  });
  
  console.log(`[Feedback] Marked ${feedbackIds.length} feedback items as trained`);
}

/**
 * Export feedback for model training
 * 
 * Returns data in format suitable for fine-tuning:
 * { text: string, label: string }[]
 */
export async function exportFeedbackForTraining() {
  const feedback = await getFeedbackForTraining(10000); // Get all available
  
  const trainingData = feedback.map(f => {
    const text = f.searchHistory?.productDescription || '';
    const label = f.correctedCode || f.originalCode;
    
    return {
      text,
      label,
      feedbackType: f.feedbackType,
      originalCode: f.originalCode,
      correctedCode: f.correctedCode,
      confidence: f.originalConfidence,
      qualityRating: f.qualityRating,
    };
  });
  
  return trainingData;
}

/**
 * Get recent corrections for review
 */
export async function getRecentCorrections(limit: number = 20) {
  return prisma.classificationFeedback.findMany({
    where: {
      feedbackType: 'corrected',
    },
    include: {
      searchHistory: {
        select: {
          productDescription: true,
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

export default {
  submitClassificationFeedback,
  getFeedbackStats,
  getFeedbackForTraining,
  markFeedbackAsTrained,
  exportFeedbackForTraining,
  getRecentCorrections,
};
