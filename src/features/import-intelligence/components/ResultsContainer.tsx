'use client';

import React from 'react';
import { Card, Collapse, Typography, Tag, Button, Space } from 'antd';
import { Edit, RotateCcw } from 'lucide-react';
import type { ImportAnalysis } from '../types';
import { CountryCompareSection } from './CountryCompareSection';
import { ComplianceSection } from './ComplianceSection';
import { DocumentationSection } from './DocumentationSection';
import { OptimizationSection } from './OptimizationSection';
import { LandedCostSection } from './LandedCostSection';
import { ClassificationSection } from './ClassificationSection';
import { getCountryName } from '@/components/shared/constants';

const { Title, Text } = Typography;

interface ResultsContainerProps {
  analysis: ImportAnalysis;
  onEdit?: () => void;
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({ analysis, onEdit }) => {
  const { classification, landedCost, countryComparison, compliance, documentation, optimization } = analysis;

  // Auto-expand compliance section when there are high-risk alerts
  const defaultOpenSections = ['classification', 'landedCost', 'countryComparison'];
  if (compliance.riskLevel === 'high' || compliance.alerts.some(a => a.level === 'high')) {
    defaultOpenSections.push('compliance');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Title level={3} className="!mb-2">
              Import Intelligence
            </Title>
            <Text className="text-slate-600 text-base">
              {analysis.input.description || `HTS ${classification.htsCode}`} •{' '}
              <Text strong>{classification.htsCode}</Text> •{' '}
              <Text>{getCountryName(analysis.input.countryCode)} → USA</Text>
            </Text>
          </div>
          {onEdit && (
            <Button icon={<RotateCcw size={14} />} onClick={onEdit}>
              Start over
            </Button>
          )}
        </div>
      </Card>

      {/* Collapsible Sections */}
      <Collapse
        defaultActiveKey={defaultOpenSections}
        expandIconPlacement="end"
        className="bg-white shadow-sm"
        size="large"
        items={[
          // 1. Classification
          {
            key: 'classification',
            label: (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="font-semibold text-base">Product Classification</span>
              </div>
            ),
            children: (
              <ClassificationSection 
                classification={classification} 
                searchQuery={analysis.input.description}
              />
            ),
          },
          // 2. Landed Cost
          {
            key: 'landedCost',
            label: (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="font-semibold text-base">Landed Cost</span>
              </div>
            ),
            children: <LandedCostSection landedCost={landedCost} input={analysis.input} classification={analysis.classification} />,
          },
          // 3. Country Comparison
          {
            key: 'countryComparison',
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="font-semibold text-base">Compare Countries</span>
                </div>
                <Tag color="green">{countryComparison.alternatives.length} alternatives</Tag>
              </div>
            ),
            children: <CountryCompareSection comparison={countryComparison} htsCode={classification.htsCode} quantity={analysis.input.quantity} />,
          },
          // 4. Compliance & Risk
          {
            key: 'compliance',
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="font-semibold text-base">Compliance & Risk</span>
                </div>
                {compliance.riskLevel === 'high' ? (
                  <Tag color="red">{compliance.alerts.length} alert{compliance.alerts.length !== 1 ? 's' : ''}</Tag>
                ) : compliance.riskLevel === 'medium' ? (
                  <Tag color="orange">{compliance.alerts.length} alert{compliance.alerts.length !== 1 ? 's' : ''}</Tag>
                ) : compliance.alerts.length > 0 ? (
                  <Tag color="gold">{compliance.alerts.length} alert{compliance.alerts.length !== 1 ? 's' : ''}</Tag>
                ) : (
                  <Tag color="green">All clear</Tag>
                )}
              </div>
            ),
            children: <ComplianceSection compliance={compliance} htsCode={classification.htsCode} countryCode={analysis.input.countryCode} />,
          },
          // 5. Documentation Required
          {
            key: 'documentation',
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-600 text-white flex items-center justify-center text-sm font-semibold">
                    5
                  </div>
                  <span className="font-semibold text-base">Documentation Required</span>
                </div>
                <Tag color="blue">
                  {documentation.critical.length + documentation.required.length + documentation.recommended.length} docs needed
                </Tag>
              </div>
            ),
            children: (
              <DocumentationSection
                documentation={documentation}
                productDescription={analysis.input.description || classification.description}
                countryName={getCountryName(analysis.input.countryCode)}
              />
            ),
          },
          // 6. Optimization Opportunities
          {
            key: 'optimization',
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
                    6
                  </div>
                  <span className="font-semibold text-base">Optimization Opportunities</span>
                </div>
                {optimization.totalPotentialSavings > 0 ? (
                  <Tag color="green">
                    Save ${optimization.totalPotentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </Tag>
                ) : optimization.opportunities.length > 0 ? (
                  <Tag color="blue">{optimization.opportunities.length} suggestion{optimization.opportunities.length !== 1 ? 's' : ''}</Tag>
                ) : (
                  <Tag color="green">Optimized</Tag>
                )}
              </div>
            ),
            children: <OptimizationSection optimization={optimization} />,
          },
        ]}
      />

      {/* Start Over */}
      {onEdit && (
        <Card className="shadow-sm">
          <Space wrap>
            <Button icon={<RotateCcw size={14} />} onClick={onEdit}>
              Start New Analysis
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};
