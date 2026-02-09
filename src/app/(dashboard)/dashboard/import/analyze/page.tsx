'use client';

import React, { useState, useRef } from 'react';
import { message, Typography, Progress, Segmented } from 'antd';
import { Sparkles, FileSpreadsheet } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductInputSection } from '@/features/import-intelligence/components/ProductInputSection';
import { ResultsContainer } from '@/features/import-intelligence/components/ResultsContainer';
import { BulkClassificationContent } from '@/features/compliance/components/BulkClassificationContent';
import type { ProductInput, ImportAnalysis } from '@/features/import-intelligence/types';

const { Text } = Typography;

type AnalyzeMode = 'single' | 'bulk';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode: AnalyzeMode = searchParams.get('mode') === 'bulk' ? 'bulk' : 'single';
  const [mode, setMode] = useState<AnalyzeMode>(initialMode);
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<ProductInput | null>(null);

  const handleModeChange = (value: AnalyzeMode) => {
    setMode(value);
    // Update URL without full navigation
    const url = value === 'bulk' ? '/dashboard/import/analyze?mode=bulk' : '/dashboard/import/analyze';
    router.replace(url, { scroll: false });
  };

  const startProgressSimulation = () => {
    setProgressStage(0);
    let stage = 0;
    const intervals = [1500, 2500, 4000, 2000, 2000, 3000];
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

  // Hide mode toggle when showing single-product results
  const showModeToggle = mode === 'bulk' || !analysis;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mode toggle */}
      {showModeToggle && (
        <div className="mb-6">
          <Segmented
            value={mode}
            onChange={(val) => handleModeChange(val as AnalyzeMode)}
            options={[
              {
                value: 'single',
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles size={16} />
                    <span>Single Product</span>
                  </div>
                ),
              },
              {
                value: 'bulk',
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <FileSpreadsheet size={16} />
                    <span>Bulk Upload (CSV)</span>
                  </div>
                ),
              },
            ]}
            size="large"
          />
        </div>
      )}

      {mode === 'single' ? (
        <>
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
        </>
      ) : (
        <BulkClassificationContent />
      )}
    </div>
  );
}
