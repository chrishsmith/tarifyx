'use client';

import React, { useState, useRef } from 'react';
import { message, Typography, Progress } from 'antd';
import { ProductInputSection } from '@/features/import-intelligence/components/ProductInputSection';
import { ResultsContainer } from '@/features/import-intelligence/components/ResultsContainer';
import type { ProductInput, ImportAnalysis } from '@/features/import-intelligence/types';

const { Text } = Typography;

/** Progress stages shown while analysis runs */
const ANALYSIS_STAGES = [
  { label: 'Classifying product...', pct: 15 },
  { label: 'Calculating landed cost...', pct: 35 },
  { label: 'Comparing sourcing countries...', pct: 55 },
  { label: 'Running compliance checks...', pct: 70 },
  { label: 'Generating documentation checklist...', pct: 85 },
  { label: 'Identifying optimization opportunities...', pct: 95 },
];

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<ProductInput | null>(null);

  const startProgressSimulation = () => {
    setProgressStage(0);
    let stage = 0;
    // Advance through stages at realistic intervals
    const intervals = [1500, 2500, 4000, 2000, 2000, 3000]; // ms per stage
    const advance = () => {
      stage++;
      if (stage < ANALYSIS_STAGES.length) {
        setProgressStage(stage);
        progressTimerRef.current = setTimeout(advance, intervals[stage] || 2000);
      }
    };
    progressTimerRef.current = setTimeout(advance, intervals[0] || 1500);
  };

  const stopProgressSimulation = () => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const handleAnalyze = async (input: ProductInput) => {
    setLoading(true);
    lastInputRef.current = input;
    startProgressSimulation();
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
      stopProgressSimulation();
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setAnalysis(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!analysis ? (
        <>
          <ProductInputSection onAnalyze={handleAnalyze} loading={loading} />
          {loading && (
            <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-[1024px] mx-auto">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-10 w-10 rounded-[14px] bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm animate-pulse">
                  AI
                </div>
                <div>
                  <Text strong className="block">Analyzing your product</Text>
                  <Text className="text-slate-500 text-sm">
                    {ANALYSIS_STAGES[progressStage]?.label || 'Processing...'}
                  </Text>
                </div>
              </div>
              <Progress
                percent={ANALYSIS_STAGES[progressStage]?.pct || 10}
                strokeColor="#0D9488"
                size="small"
                showInfo={false}
              />
              <div className="mt-2 text-xs text-slate-400">
                This typically takes 10-30 seconds depending on data availability.
              </div>
            </div>
          )}
        </>
      ) : (
        <ResultsContainer analysis={analysis} onEdit={handleEdit} />
      )}
    </div>
  );
}
