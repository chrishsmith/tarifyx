'use client';

import React from 'react';
import { ModeSelector } from '@/features/import-intelligence/components/ModeSelector';

export default function ImportIntelligencePage() {
  // TODO: Fetch recent analyses from API
  const recentAnalyses = [
    {
      id: '1',
      title: 'Cotton T-Shirts from China',
      date: 'Jan 28',
      summary: '$7,800 duty',
    },
    {
      id: '2',
      title: 'Wireless Earbuds from Vietnam',
      date: 'Jan 27',
      summary: '$2,700 duty',
    },
    {
      id: '3',
      title: 'Bulk Analysis: 500 products',
      date: 'Jan 25',
      summary: '$340K savings found',
    },
  ];

  return <ModeSelector recentAnalyses={recentAnalyses} />;
}
