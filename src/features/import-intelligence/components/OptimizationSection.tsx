'use client';

import React from 'react';
import { Card, Typography, Tag, Button, Tooltip } from 'antd';
import { 
  Globe, 
  FileCheck, 
  TrendingDown, 
  Search, 
  Shield, 
  Scale, 
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import type { Optimization, OptimizationType, OptimizationDifficulty, OptimizationPriority } from '../types';
import { EmptyState } from '@/components/shared/EmptyState';

const { Text, Title } = Typography;

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const TYPE_CONFIG: Record<OptimizationType, { icon: React.ReactNode; color: string }> = {
  country_switch: { icon: <Globe size={20} />, color: '#0D9488' },
  fta_qualification: { icon: <FileCheck size={20} />, color: '#059669' },
  classification_review: { icon: <Search size={20} />, color: '#2563eb' },
  tariff_engineering: { icon: <TrendingDown size={20} />, color: '#7C3AED' },
  section_232_exclusion: { icon: <Shield size={20} />, color: '#dc2626' },
  duty_drawback: { icon: <RotateCcw size={20} />, color: '#d97706' },
  adcvd_mitigation: { icon: <Scale size={20} />, color: '#ea580c' },
  high_tariff_alert: { icon: <AlertTriangle size={20} />, color: '#dc2626' },
};

const DIFFICULTY_CONFIG: Record<OptimizationDifficulty, { label: string; color: string; tagColor: string }> = {
  easy: { label: 'Quick Win', color: '#059669', tagColor: 'green' },
  medium: { label: 'Moderate Effort', color: '#d97706', tagColor: 'orange' },
  hard: { label: 'Strategic Change', color: '#dc2626', tagColor: 'red' },
};

const PRIORITY_CONFIG: Record<OptimizationPriority, { label: string; tagColor: string }> = {
  high: { label: 'High Priority', tagColor: 'red' },
  medium: { label: 'Medium', tagColor: 'orange' },
  low: { label: 'Low', tagColor: 'default' },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OptimizationSectionProps {
  optimization: Optimization;
}

export const OptimizationSection: React.FC<OptimizationSectionProps> = ({ optimization }) => {
  const { opportunities, totalPotentialSavings, topRecommendation } = optimization;
  const hasOpportunities = opportunities.length > 0;
  const hasSavings = opportunities.some(o => o.savings > 0);

  if (!hasOpportunities) {
    return (
      <EmptyState
        icon={<TrendingDown size={32} className="text-green-600" />}
        title="No optimization opportunities found"
        description="Your current sourcing strategy appears cost-optimal for this product and country combination."
      />
    );
  }

  return (
    <div>
      {/* Intro */}
      <Text className="text-slate-600 block" style={{ marginBottom: 20 }}>
        Based on your classification, tariff exposure, and sourcing country, we identified{' '}
        <Text strong>{opportunities.length} optimization opportunit{opportunities.length !== 1 ? 'ies' : 'y'}</Text>:
      </Text>

      {/* Opportunity Cards */}
      {opportunities.map((opp, index) => {
        const typeConfig = TYPE_CONFIG[opp.type] || TYPE_CONFIG.high_tariff_alert;
        const diffConfig = opp.difficulty ? DIFFICULTY_CONFIG[opp.difficulty] : null;
        const isExternal = opp.actionUrl?.startsWith('http');

        return (
          <Card key={opp.id} className="border border-slate-200 shadow-sm" style={{ marginBottom: 16 }}>
            <div className="flex items-start gap-4">
              {/* Number badge + icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: typeConfig.color }}
                >
                  {index + 1}
                </div>
                <span style={{ color: typeConfig.color }}>{typeConfig.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header row: title + savings tag */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <Title level={5} className="!mb-1 !text-base">
                      {opp.title}
                    </Title>
                    <div className="flex items-center gap-2 flex-wrap">
                      {opp.priority && (
                        <Tag 
                          color={PRIORITY_CONFIG[opp.priority].tagColor}
                          className="!text-xs !m-0"
                        >
                          {PRIORITY_CONFIG[opp.priority].label}
                        </Tag>
                      )}
                      {diffConfig && (
                        <Tag color={diffConfig.tagColor} className="!text-xs !m-0">
                          {diffConfig.label}
                        </Tag>
                      )}
                    </div>
                  </div>
                  {opp.savings > 0 && (
                    <div className="text-right shrink-0">
                      <Tag color="green" className="!text-sm !px-3 !py-1 !m-0 !font-semibold">
                        Save ${opp.savings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </Tag>
                      {opp.savingsPercent !== undefined && opp.savingsPercent > 0 && (
                        <Text className="text-green-600 text-xs block mt-1 text-right">
                          {opp.savingsPercent}% of landed cost
                        </Text>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <Text className="text-slate-600 text-sm block mb-3">{opp.description}</Text>

                {/* Requirements */}
                {opp.requirements && opp.requirements.length > 0 && (
                  <div className="mb-3">
                    <Text className="text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wide">
                      Requirements
                    </Text>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {opp.requirements.map((req, i) => (
                        <li key={i} className="text-slate-600 text-sm">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tradeoffs */}
                {opp.tradeoffs && opp.tradeoffs.length > 0 && (
                  <div className="mb-3 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                    <Text className="text-xs font-semibold text-amber-700 block mb-1 uppercase tracking-wide">
                      Trade-offs
                    </Text>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {opp.tradeoffs.map((tradeoff, i) => (
                        <li key={i} className="text-amber-800 text-sm">{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action CTA */}
                {opp.actionUrl && opp.actionLabel && (
                  <Button
                    type="default"
                    size="small"
                    href={opp.actionUrl}
                    target={isExternal ? '_blank' : undefined}
                    icon={isExternal ? <ExternalLink size={12} /> : <ChevronRight size={12} />}
                    className="!text-teal-600 !border-teal-200 hover:!border-teal-400 hover:!text-teal-700"
                  >
                    {opp.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {/* Total Savings Summary */}
      {totalPotentialSavings > 0 && (
        <Card className="bg-teal-50 border-teal-200" style={{ marginTop: 8 }}>
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-slate-600 block text-sm mb-1">
                Total Potential Savings (De-duplicated)
              </Text>
              <Title level={3} className="!mb-0 !text-teal-700">
                ${totalPotentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/shipment
              </Title>
              <Tooltip title="Savings are de-duplicated: sourcing changes (country switch, FTA, AD/CVD) are mutually exclusive — only the best is counted. Classification review and Section 232 exclusion savings stack independently.">
                <Text className="text-slate-500 text-xs inline-flex items-center gap-1 mt-1 cursor-help border-b border-dotted border-slate-400">
                  How is this calculated?
                  <HelpCircle size={10} />
                </Text>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
