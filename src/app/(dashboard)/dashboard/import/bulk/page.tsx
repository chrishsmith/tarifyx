'use client';

import React, { useState } from 'react';
import { BulkUpload } from '@/features/import-intelligence/components/BulkUpload';
import { ProcessingStatus } from '@/features/import-intelligence/components/ProcessingStatus';
import { PortfolioDashboard } from '@/features/import-intelligence/components/PortfolioDashboard';
import type { BulkAnalysisStatus, PortfolioAnalysis } from '@/features/import-intelligence/types';

type ViewState = 'upload' | 'processing' | 'results';

export default function BulkUploadPage() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [status, setStatus] = useState<BulkAnalysisStatus | null>(null);
  const [results, setResults] = useState<PortfolioAnalysis | null>(null);

  const handleUpload = async (file: File) => {
    // TODO: Upload file and start processing
    setViewState('processing');
    
    // Mock processing
    const mockStatus: BulkAnalysisStatus = {
      analysisId: '123',
      status: 'processing',
      progress: 0,
      estimatedTime: 120,
      totalProducts: 500,
      processedProducts: 0,
      failedProducts: 0,
    };
    setStatus(mockStatus);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setStatus((prev) => prev ? { ...prev, progress, processedProducts: Math.floor((progress / 100) * 500) } : null);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Mock results
        const mockResults: PortfolioAnalysis = {
          summary: {
            totalProducts: 500,
            totalValue: 2400000,
            totalDuty: 890000,
            averageRate: 37,
            attentionRequired: 13,
            complianceAlerts: 8,
            recentChanges: 3,
          },
          dutyExposureByCountry: [
            { countryCode: 'CN', countryName: 'China', totalDuty: 650000, percentage: 73 },
            { countryCode: 'VN', countryName: 'Vietnam', totalDuty: 180000, percentage: 20 },
            { countryCode: 'MX', countryName: 'Mexico', totalDuty: 40000, percentage: 4 },
            { countryCode: 'IN', countryName: 'India', totalDuty: 20000, percentage: 2 },
          ],
          optimizationOpportunities: [
            {
              type: 'Country Reallocation',
              productCount: 47,
              savings: 180000,
              description: 'Switch high-tariff products to lower-tariff countries',
            },
            {
              type: 'FTA Qualification',
              productCount: 23,
              savings: 120000,
              description: 'Products from FTA countries that may qualify',
            },
            {
              type: 'Classification Review',
              productCount: 15,
              savings: 40000,
              description: 'Products with potential alternative HTS codes',
            },
          ],
          products: Array.from({ length: 500 }, (_, i) => ({
            sku: `SKU-${String(i + 1).padStart(3, '0')}`,
            product: `Product ${i + 1}`,
            countryCode: ['CN', 'VN', 'MX', 'IN'][i % 4],
            dutyRate: [78, 27, 0, 35][i % 4],
            status: i % 10 === 0 ? 'High duty' : 'OK',
            alert: i % 10 === 0 ? '⚠️ High duty' : undefined,
            analysis: {} as any,
          })),
        };
        setResults(mockResults);
        setViewState('results');
      }
    }, 500);
  };

  const handleCancel = () => {
    setViewState('upload');
    setStatus(null);
  };

  const handleProductClick = (sku: string) => {
    console.log('Product clicked:', sku);
    // TODO: Navigate to product detail
  };

  return (
    <>
      {viewState === 'upload' && <BulkUpload onUpload={handleUpload} />}
      {viewState === 'processing' && status && (
        <ProcessingStatus status={status} onCancel={handleCancel} />
      )}
      {viewState === 'results' && results && (
        <PortfolioDashboard
          analysis={results}
          onProductClick={handleProductClick}
          onExport={() => console.log('Export')}
          onSave={() => console.log('Save')}
        />
      )}
    </>
  );
}
