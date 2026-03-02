'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { message, Typography, Progress, Segmented } from 'antd';
import { Sparkles, FileSpreadsheet } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductInputSection } from '@/features/import-intelligence/components/ProductInputSection';
import { ResultsContainer } from '@/features/import-intelligence/components/ResultsContainer';
import { BulkClassificationContent } from '@/features/compliance/components/BulkClassificationContent';
import { LoadingState } from '@/components/shared/LoadingState';
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
  const [hydrating, setHydrating] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<ProductInput | null>(null);
  const hydratedIdRef = useRef<string | null>(null);

  const handleModeChange = (value: AnalyzeMode) => {
    setMode(value);
    const url = value === 'bulk' ? '/dashboard/import/analyze?mode=bulk' : '/dashboard/import/analyze';
    router.replace(url, { scroll: false });
  };

  const startProgressSimulation = useCallback(() => {
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
  }, []);

  const stopProgressSimulation = useCallback(() => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const runAnalysis = useCallback(async (input: ProductInput) => {
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
  }, [startProgressSimulation, stopProgressSimulation]);

  // Hydrate cached analysis from search history when ?id= is present
  useEffect(() => {
    const historyId = searchParams.get('id');
    if (!historyId || hydratedIdRef.current === historyId) return;
    hydratedIdRef.current = historyId;

    const hydrate = async () => {
      setHydrating(true);
      try {
        const res = await fetch(`/api/search-history/${historyId}`);
        if (!res.ok) throw new Error('Failed to load cached analysis');
        const detail = await res.json();

        // Try instant hydration from _fullAnalysis (saved by the new analyze route)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fullAnalysis = (detail.fullResult as any)?._fullAnalysis;
        if (fullAnalysis) {
          setAnalysis(fullAnalysis as ImportAnalysis);
          setHydrating(false);
          return;
        }

        // Fallback for older entries: re-run analysis using the cached HTS code.
        // Passing htsCode skips AI classification (the expensive part), so this is fast.
        if (detail.htsCode) {
          setHydrating(false);
          const input: ProductInput = {
            description: detail.productDescription || '',
            htsCode: detail.htsCode,
            countryCode: detail.countryOfOrigin || 'CN',
            value: 10000,  // Fallback values for legacy cache entries without stored value/quantity
            quantity: 1000, // Landed cost section will note these are estimates
            attributes: {
              containsBattery: false,
              containsChemicals: false,
              forChildren: false,
              foodContact: false,
              wireless: false,
              medicalDevice: false,
              pressurized: false,
              flammable: false,
            },
          };
          runAnalysis(input);
          return;
        }

        // No usable data at all
        message.info('Cached analysis not available. Please re-analyze.');
        router.replace('/dashboard/import/analyze');
      } catch (err) {
        console.error('[AnalyzePage] hydrate_failed', { ts: new Date().toISOString(), error: err });
        message.error('Could not load cached analysis.');
        router.replace('/dashboard/import/analyze');
      } finally {
        setHydrating(false);
      }
    };
    hydrate();
  }, [searchParams, router, runAnalysis]);

  const handleEdit = () => {
    setAnalysis(null);
  };

  // Hide mode toggle when showing single-product results
  const showModeToggle = mode === 'bulk' || !analysis;

  // Show loading state while hydrating a cached analysis
  if (hydrating) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <LoadingState message="Loading your previous analysis..." />
        </div>
      </div>
    );
  }

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
              <ProductInputSection onAnalyze={runAnalysis} loading={loading} />
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
