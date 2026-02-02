'use client';

import React from 'react';
import { Card, Collapse, Typography, Tag, Button, Space, Tooltip, Progress, Alert } from 'antd';
import { Edit, FileText, Download, Share2, Save, Info, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import type { ImportAnalysis, DutyLayer } from '../types';
import { CountryCompareSection } from './CountryCompareSection';
import { ComplianceSection } from './ComplianceSection';
import { DocumentationSection } from './DocumentationSection';
import { OptimizationSection } from './OptimizationSection';
import { LandedCostSection } from './LandedCostSection';
import { ClassificationSection } from './ClassificationSection';

const { Title, Text } = Typography;

// Tooltip definitions for trade terms
const TOOLTIPS = {
  fob: 'Free On Board - The price of goods at the point of origin, excluding shipping and insurance. Seller is responsible until goods are loaded onto the vessel.',
  cif: 'Cost, Insurance, and Freight - The total value including product cost, shipping, and insurance. This is the "dutiable value" that duties are calculated on.',
  dutiableValue: 'The value on which import duties are calculated. For most imports, this is the CIF value (product + shipping + insurance).',
  baseMfn: 'Most Favored Nation rate - The standard duty rate applied to imports from countries with normal trade relations. This is the "base" rate before any additional tariffs.',
  section301: 'Trade Act of 1974, Section 301 - Tariffs on Chinese products imposed in response to unfair trade practices regarding technology transfer and intellectual property.',
  ieepaFentanyl: 'International Emergency Economic Powers Act - Emergency tariff addressing the fentanyl crisis. Applies to China (20%), Mexico (25%), and Canada (25%).',
  ieepaBaseline: 'Universal 10% tariff effective April 2025 - Applies to nearly ALL countries including FTA partners like Singapore, Korea, and Australia.',
  ieepaReciprocal: 'Country-specific reciprocal tariff above the 10% baseline. Varies by country based on their tariff rates on US goods.',
  section232: 'Trade Expansion Act of 1962, Section 232 - National security tariffs on steel (25%), aluminum (25%), and automobiles (25%).',
  adcvd: 'Antidumping and Countervailing Duties - Additional duties on products sold below fair market value (dumping) or subsidized by foreign governments.',
  mpf: 'Merchandise Processing Fee - CBP fee of 0.3464% of dutiable value, with minimum $31.67 and maximum $614.35 per entry.',
  hmf: 'Harbor Maintenance Fee - 0.125% of cargo value for ocean shipments. Funds port infrastructure maintenance. Does not apply to air shipments.',
  effectiveRate: 'The total duty rate after combining all applicable tariff programs. This is what you actually pay as a percentage of dutiable value.',
  ftaDiscount: 'Free Trade Agreement benefit that waives the base MFN duty. Note: FTAs do NOT waive IEEPA tariffs (except USMCA for compliant goods).',
};

// Helper to format rate with proper precision
const formatRate = (rate: number): string => {
  return rate.toFixed(2).replace(/\.?0+$/, '') + '%';
};

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to get color for duty type
const getDutyColor = (programType: string): string => {
  switch (programType) {
    case 'base_mfn': return '#1890ff';
    case 'section_301': return '#fa8c16';
    case 'ieepa_fentanyl': return '#f5222d';
    case 'ieepa_baseline': return '#eb2f96';
    case 'ieepa_reciprocal': return '#722ed1';
    case 'section_232': return '#13c2c2';
    case 'adcvd': return '#faad14';
    case 'fta_discount': return '#52c41a';
    default: return '#8c8c8c';
  }
};

// Tooltip wrapper component
const InfoTooltip: React.FC<{ term: keyof typeof TOOLTIPS; children?: React.ReactNode }> = ({ term, children }) => (
  <Tooltip title={TOOLTIPS[term]} placement="top">
    <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-slate-400">
      {children}
      <HelpCircle size={12} className="text-slate-400" />
    </span>
  </Tooltip>
);

interface ResultsContainerProps {
  analysis: ImportAnalysis;
  onEdit?: () => void;
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({ analysis, onEdit }) => {
  const { classification, landedCost, countryComparison, compliance, documentation, optimization } = analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Title level={3} className="!mb-2">
              🧭 Import Intelligence
            </Title>
            <Text className="text-slate-600 text-base">
              {analysis.input.description || `HTS ${classification.htsCode}`} •{' '}
              <Text strong>{classification.htsCode}</Text> •{' '}
              <Text>{analysis.input.countryCode} → USA</Text>
            </Text>
          </div>
          {onEdit && (
            <Button icon={<Edit size={16} />} onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Collapsible Sections */}
      <Collapse
        defaultActiveKey={['classification', 'landedCost']}
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
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="font-semibold text-base">Landed Cost</span>
                </div>
                <Text strong className="text-lg text-teal-700 font-mono">
                  {formatCurrency(landedCost.total)}
                </Text>
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
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="font-semibold text-base">Compare Countries</span>
                </div>
                <Tag color="green">{countryComparison.alternatives.length} alternatives</Tag>
              </div>
            ),
            children: <CountryCompareSection comparison={countryComparison} />,
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
                {compliance.alerts.length > 0 && (
                  <Tag color="warning">{compliance.alerts.length} alerts ⚠️</Tag>
                )}
              </div>
            ),
            children: <ComplianceSection compliance={compliance} />,
          },
          // 5. Documentation Required
          {
            key: 'documentation',
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                    5
                  </div>
                  <span className="font-semibold text-base">Documentation Required</span>
                </div>
                <Tag color="blue">
                  {documentation.critical.length + documentation.required.length} docs needed
                </Tag>
              </div>
            ),
            children: <DocumentationSection documentation={documentation} />,
          },
          // 6. Optimization Opportunities
          {
            key: 'optimization',
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                    6
                  </div>
                  <span className="font-semibold text-base">Optimization Opportunities</span>
                </div>
                <Text strong className="text-green-600">
                  ${optimization.totalPotentialSavings.toLocaleString('en-US')} savings
                </Text>
              </div>
            ),
            children: <OptimizationSection optimization={optimization} />,
          },
        ]}
      />

      {/* Action Buttons */}
      <Card className="shadow-sm">
        <Space wrap>
          <Button icon={<Save size={16} />} type="primary">
            Save to My Products
          </Button>
          <Button icon={<Download size={16} />}>Export PDF</Button>
          <Button icon={<Share2 size={16} />}>Share Analysis</Button>
          <Button>Start New</Button>
        </Space>
      </Card>
    </div>
  );
};
