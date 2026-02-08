'use client';

import React, { useState } from 'react';
import { message } from 'antd';
import { ProductInputSection } from '@/features/import-intelligence/components/ProductInputSection';
import { ResultsContainer } from '@/features/import-intelligence/components/ResultsContainer';
import type { ProductInput, ImportAnalysis } from '@/features/import-intelligence/types';

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (input: ProductInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/import-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('[AnalyzePage] analyze_failed', { ts: new Date().toISOString(), error });
      message.error('Analysis failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setAnalysis(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!analysis ? (
        <ProductInputSection onAnalyze={handleAnalyze} loading={loading} />
      ) : (
        <ResultsContainer analysis={analysis} onEdit={handleEdit} />
      )}
    </div>
  );
}
