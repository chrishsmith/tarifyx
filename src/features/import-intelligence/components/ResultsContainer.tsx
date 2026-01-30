'use client';

import React from 'react';
import { Card, Collapse, Typography, Tag, Button, Space, Tooltip, Progress, Alert } from 'antd';
import { Edit, FileText, Download, Share2, Save, Info, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import type { ImportAnalysis, DutyLayer } from '../types';
import { CountryCompareSection } from './CountryCompareSection';
import { ComplianceSection } from './ComplianceSection';
import { DocumentationSection } from './DocumentationSection';
import { OptimizationSection } from './OptimizationSection';

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
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">1. Product Classification</span>
                <Tag color="blue">{classification.confidence}% confidence</Tag>
              </div>
            ),
            children: (
          <div className="space-y-4">
            <div>
              <Text strong className="text-base">
                HTS Code: {classification.htsCode}
              </Text>
              <div className="mt-2 text-slate-600">{classification.description}</div>
            </div>

            <div>
              <Text type="secondary">Confidence:</Text>
              <div className="mt-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${classification.confidence}%` }}
                />
              </div>
            </div>

            {classification.path.length > 0 && (
              <div>
                <Text type="secondary">Classification Path:</Text>
                <div className="mt-2 text-slate-700">
                  {classification.path.join(' > ')}
                </div>
              </div>
            )}

            <Space>
              <Button size="small">View alternatives</Button>
              <Button size="small">Why this code?</Button>
            </Space>
          </div>
            ),
          },
          // 2. Landed Cost
          {
            key: 'landedCost',
            label: (
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-base">2. Landed Cost</span>
                <div className="flex items-center gap-3">
                  <Tag color="orange" className="font-semibold">
                    {formatRate(landedCost.duties.effectiveRate)} effective duty
                  </Tag>
                  <Text strong className="text-lg text-teal-600">
                    {formatCurrency(landedCost.total)}
                  </Text>
                </div>
              </div>
            ),
            children: (
          <div className="space-y-6">
            {/* Effective Tariff Rate Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-amber-600" />
                  <Text strong className="text-lg text-amber-800">
                    <InfoTooltip term="effectiveRate">Effective Tariff Rate</InfoTooltip>
                  </Text>
                </div>
                <Text strong className="text-2xl text-amber-700">
                  {formatRate(landedCost.duties.effectiveRate)}
                </Text>
              </div>
              
              {/* Visual breakdown bar */}
              <div className="mb-3">
                <div className="h-6 bg-slate-200 rounded-full overflow-hidden flex">
                  {landedCost.duties.layers?.filter(l => l.rate > 0).map((layer, idx) => (
                    <Tooltip 
                      key={idx} 
                      title={`${layer.name}: ${formatRate(layer.rate)}`}
                    >
                      <div 
                        className="h-full transition-all hover:opacity-80"
                        style={{ 
                          width: `${(layer.rate / Math.max(landedCost.duties.effectiveRate, 1)) * 100}%`,
                          backgroundColor: getDutyColor(layer.programType),
                        }}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs">
                {landedCost.duties.layers?.filter(l => l.rate > 0).map((layer, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: getDutyColor(layer.programType) }}
                    />
                    <span className="text-slate-600">{layer.name} ({formatRate(layer.rate)})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings from tariff calculation */}
            {landedCost.duties.warnings && landedCost.duties.warnings.length > 0 && (
              <Alert
                type="warning"
                showIcon
                icon={<AlertTriangle size={16} />}
                message="Tariff Alerts"
                description={
                  <ul className="list-disc list-inside text-sm mt-1">
                    {landedCost.duties.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                }
              />
            )}

            {/* Cost Breakdown */}
            <div className="border-b border-slate-200 pb-4">
              <Text strong className="text-base block mb-3 text-slate-700">
                COST BREAKDOWN
              </Text>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <InfoTooltip term="fob">Product Value (FOB)</InfoTooltip>
                  <Text>{formatCurrency(landedCost.productValue)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Shipping</Text>
                  <Text>{formatCurrency(landedCost.shipping)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Insurance</Text>
                  <Text>{formatCurrency(landedCost.insurance)}</Text>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 bg-slate-50 -mx-2 px-2 py-1 rounded">
                  <InfoTooltip term="dutiableValue">
                    <Text strong>Dutiable Value (CIF)</Text>
                  </InfoTooltip>
                  <Text strong>{formatCurrency(landedCost.dutiableValue || (landedCost.productValue + landedCost.shipping + landedCost.insurance))}</Text>
                </div>
              </div>
            </div>

            {/* Duties - Detailed Breakdown */}
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <Text strong className="text-base text-slate-700">
                  DUTIES
                </Text>
                <Text className="text-sm text-slate-500">
                  Rate × Dutiable Value = Amount
                </Text>
              </div>
              
              <div className="space-y-2">
                {/* Show each duty layer */}
                {landedCost.duties.layers?.map((layer, idx) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between items-center py-1 ${layer.programType === 'fta_discount' ? 'text-green-600' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getDutyColor(layer.programType) }}
                      />
                      <Tooltip title={layer.description}>
                        <span className="cursor-help border-b border-dotted border-slate-300">
                          {layer.name}
                        </span>
                      </Tooltip>
                      <Tag 
                        color={layer.rate < 0 ? 'green' : 'default'} 
                        className="text-xs"
                      >
                        {layer.rate < 0 ? '' : '+'}{formatRate(layer.rate)}
                      </Tag>
                    </div>
                    <Text className={layer.rate < 0 ? 'text-green-600' : ''}>
                      {layer.rate < 0 ? '-' : ''}{formatCurrency(Math.abs(layer.amount))}
                    </Text>
                  </div>
                ))}
                
                {/* Fallback if no layers (backward compatibility) */}
                {(!landedCost.duties.layers || landedCost.duties.layers.length === 0) && (
                  <>
                    {landedCost.duties.baseMfn > 0 && (
                      <div className="flex justify-between">
                        <InfoTooltip term="baseMfn">Base MFN</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.baseMfn)}</Text>
                      </div>
                    )}
                    {landedCost.duties.section301 && (
                      <div className="flex justify-between">
                        <InfoTooltip term="section301">Section 301</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.section301)}</Text>
                      </div>
                    )}
                    {landedCost.duties.ieepaFentanyl && (
                      <div className="flex justify-between">
                        <InfoTooltip term="ieepaFentanyl">IEEPA Fentanyl</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.ieepaFentanyl)}</Text>
                      </div>
                    )}
                    {landedCost.duties.ieepaBaseline && (
                      <div className="flex justify-between">
                        <InfoTooltip term="ieepaBaseline">IEEPA Baseline (10%)</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.ieepaBaseline)}</Text>
                      </div>
                    )}
                    {landedCost.duties.ieepaReciprocal && (
                      <div className="flex justify-between">
                        <InfoTooltip term="ieepaReciprocal">IEEPA Reciprocal</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.ieepaReciprocal)}</Text>
                      </div>
                    )}
                    {landedCost.duties.section232 && (
                      <div className="flex justify-between">
                        <InfoTooltip term="section232">Section 232</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.section232)}</Text>
                      </div>
                    )}
                    {landedCost.duties.adcvd && (
                      <div className="flex justify-between">
                        <InfoTooltip term="adcvd">AD/CVD</InfoTooltip>
                        <Text>{formatCurrency(landedCost.duties.adcvd)}</Text>
                      </div>
                    )}
                  </>
                )}
                
                {/* Total Duty */}
                <div className="flex justify-between pt-3 mt-2 border-t-2 border-amber-200 bg-amber-50 -mx-2 px-2 py-2 rounded">
                  <Text strong className="text-amber-800">
                    Total Duty ({formatRate(landedCost.duties.effectiveRate)})
                  </Text>
                  <Text strong className="text-lg text-amber-700">
                    {formatCurrency(landedCost.duties.total)}
                  </Text>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="border-b border-slate-200 pb-4">
              <Text strong className="text-base block mb-3 text-slate-700">
                FEES
              </Text>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <InfoTooltip term="mpf">MPF (0.3464%)</InfoTooltip>
                  <Text>{formatCurrency(landedCost.fees.mpf)}</Text>
                </div>
                <div className="flex justify-between">
                  <InfoTooltip term="hmf">HMF (0.125%)</InfoTooltip>
                  <Text>{formatCurrency(landedCost.fees.hmf)}</Text>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <Text strong>Total Fees</Text>
                  <Text strong>{formatCurrency(landedCost.fees.total)}</Text>
                </div>
              </div>
            </div>

            {/* Estimated Additional */}
            {landedCost.estimatedAdditional && landedCost.estimatedAdditional.total > 0 && (
              <div className="border-b border-slate-200 pb-4">
                <Text strong className="text-base block mb-3 text-slate-700">
                  ESTIMATED ADDITIONAL
                </Text>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <Text>Customs Broker Fee</Text>
                    <Text>{formatCurrency(landedCost.estimatedAdditional.customsBroker)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Drayage (estimated)</Text>
                    <Text>{formatCurrency(landedCost.estimatedAdditional.drayage)}</Text>
                  </div>
                </div>
              </div>
            )}

            {/* Total Landed Cost */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <Text strong className="text-lg text-white">
                  TOTAL LANDED COST
                </Text>
                <Text strong className="text-2xl text-white">
                  {formatCurrency(landedCost.total)}
                </Text>
              </div>
              <div className="flex justify-between mt-2 text-teal-100">
                <Text className="text-teal-100">Per Unit ({analysis.input.quantity.toLocaleString()} units)</Text>
                <Text className="text-teal-100 font-semibold">{formatCurrency(landedCost.perUnit)}</Text>
              </div>
            </div>

            {/* Margin Impact Insight */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <Text strong className="text-blue-800 block mb-1">Margin Impact</Text>
                  <Text className="text-blue-700 text-sm">
                    Duties and fees add <Text strong className="text-blue-800">
                      {formatRate(landedCost.dutyAsPercentOfProduct || ((landedCost.duties.total + landedCost.fees.total) / landedCost.productValue * 100))}
                    </Text> to your product cost. 
                    {landedCost.duties.effectiveRate > 50 && (
                      <span className="block mt-1 text-amber-700">
                        ⚠️ High tariff exposure - consider alternative sourcing countries.
                      </span>
                    )}
                  </Text>
                </div>
              </div>
            </div>

            <Space>
              <Button size="small">Save scenario</Button>
              <Button size="small">Compare scenarios</Button>
              <Button size="small">Export breakdown</Button>
            </Space>
          </div>
            ),
          },
          // 3. Country Comparison
          {
            key: 'countryComparison',
            label: (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">3. Compare Countries</span>
                <Tag color="green">{countryComparison.alternatives.length} alternatives</Tag>
              </div>
            ),
            children: <CountryCompareSection comparison={countryComparison} />,
          },
          // 4. Compliance & Risk
          {
            key: 'compliance',
            label: (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">4. Compliance & Risk</span>
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
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">5. Documentation Required</span>
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
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">6. Optimization Opportunities</span>
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
