'use client';

import React from 'react';
import { Card, Collapse, Typography, Tag, Button, Space } from 'antd';
import { RotateCcw, ArrowRight, Shield, Calculator, Bookmark, Globe } from 'lucide-react';
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
    <div className="flex flex-col gap-10">
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

      {/* Next Steps Guidance */}
      <Card className="shadow-sm border-teal-200 bg-teal-50/30">
        <div className="mb-3">
          <Text strong className="text-base text-slate-800">What to do next</Text>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/dashboard/products" className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-colors group">
            <Bookmark size={18} className="text-teal-600 mt-0.5 shrink-0" />
            <div>
              <Text strong className="text-sm group-hover:text-teal-700">Save to Portfolio</Text>
              <Text className="text-xs text-slate-500 block">Track this product and get tariff change alerts</Text>
            </div>
          </a>
          <a href="/dashboard/compliance/denied-party" className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-colors group">
            <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <Text strong className="text-sm group-hover:text-teal-700">Screen Suppliers</Text>
              <Text className="text-xs text-slate-500 block">Run denied party checks on your suppliers</Text>
            </div>
          </a>
          <a href="/dashboard/duties/calculator" className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-colors group">
            <Calculator size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <Text strong className="text-sm group-hover:text-teal-700">Detailed Cost Calc</Text>
              <Text className="text-xs text-slate-500 block">Save scenarios and compare in the full calculator</Text>
            </div>
          </a>
          <a href="/dashboard/compliance/fta-calculator" className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-colors group">
            <Globe size={18} className="text-violet-600 mt-0.5 shrink-0" />
            <div>
              <Text strong className="text-sm group-hover:text-teal-700">Check FTA Eligibility</Text>
              <Text className="text-xs text-slate-500 block">See if your product qualifies for duty-free treatment</Text>
            </div>
          </a>
        </div>
      </Card>

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
