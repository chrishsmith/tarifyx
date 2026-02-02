'use client';

import React from 'react';
import { Drawer, Typography, Divider, Tag, Button, Space, Alert } from 'antd';
import { Info, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ImportAnalysis } from '../types';

const { Title, Text, Paragraph } = Typography;

interface TariffExplanationDrawerProps {
  open: boolean;
  onClose: () => void;
  landedCost: ImportAnalysis['landedCost'];
  htsCode: string;
  countryCode: string;
}

export const TariffExplanationDrawer: React.FC<TariffExplanationDrawerProps> = ({
  open,
  onClose,
  landedCost,
  htsCode,
  countryCode,
}) => {
  const router = useRouter();

  const hasUSMCA = landedCost.duties.layers?.some(l => l.programType === 'fta_discount' && l.name.includes('USMCA'));
  const hasSection301 = landedCost.duties.layers?.some(l => l.programType === 'section_301' && l.rate > 0);
  const hasIEEPA = landedCost.duties.layers?.some(l => l.programType?.includes('ieepa') && l.rate > 0);

  const handleGoToFTACalculator = () => {
    router.push(`/dashboard/compliance/fta-calculator?hts=${htsCode}&country=${countryCode}`);
    onClose();
  };

  const formatRate = (rate: number) => `${rate.toFixed(1)}%`;
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Info size={20} className="text-indigo-600" />
          <Text className="text-lg font-semibold">How Your Tariff Rate is Calculated</Text>
        </div>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-sm font-medium text-slate-600">Effective Tariff Rate</Text>
            <Title level={3} className="m-0 text-indigo-600">
              {formatRate(landedCost.duties.effectiveRate)}
            </Title>
          </div>
          <Text className="text-xs text-slate-500">
            Applied to dutiable value (CIF: Cost + Insurance + Freight)
          </Text>
        </div>

        <Divider className="my-6" />

        {/* Breakdown */}
        <div className="space-y-4">
          <Title level={5} className="text-slate-900">Tariff Components:</Title>

          {landedCost.duties.layers?.map((layer, idx) => (
            <TariffComponent
              key={idx}
              icon={
                layer.programType === 'fta_discount' ? (
                  <CheckCircle size={18} className="text-emerald-600" />
                ) : layer.programType === 'section_301' || layer.programType?.includes('ieepa') ? (
                  <AlertTriangle size={18} className="text-amber-600" />
                ) : (
                  <Info size={18} className="text-blue-600" />
                )
              }
              label={layer.name}
              rate={layer.rate}
              amount={layer.amount}
              description={layer.description || ''}
              type={layer.programType === 'fta_discount' ? 'discount' : layer.rate > 0 ? 'additional' : 'base'}
            />
          ))}

          {/* Total */}
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="flex items-center justify-between">
              <Text className="font-semibold text-slate-900">Effective Rate</Text>
              <Text className="text-xl font-bold text-indigo-600">
                {formatRate(landedCost.duties.effectiveRate)}
              </Text>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Text className="text-sm text-slate-600">Total Duty Amount</Text>
              <Text className="text-lg font-semibold text-slate-900">
                {formatCurrency(landedCost.duties.total)}
              </Text>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Contextual Help */}
        <div className="space-y-4">
          <Title level={5} className="text-slate-900">Understanding Your Rate:</Title>

          {hasUSMCA && (
            <Alert
              type="success"
              icon={<CheckCircle size={16} />}
              message="USMCA Benefits Available"
              description={
                <div className="space-y-2">
                  <Paragraph className="text-sm mb-2">
                    Your product may qualify for USMCA preferential treatment, which can eliminate 
                    base duties and potentially exempt from IEEPA tariffs.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="small"
                    icon={<ArrowRight size={14} />}
                    onClick={handleGoToFTACalculator}
                    className="bg-emerald-600"
                  >
                    Check USMCA Qualification
                  </Button>
                </div>
              }
              className="bg-emerald-50 border-emerald-200"
            />
          )}

          {hasSection301 && (
            <Alert
              type="warning"
              icon={<AlertTriangle size={16} />}
              message="Section 301 Tariff Applies"
              description={
                <Paragraph className="text-sm mb-0">
                  This product is subject to additional tariffs under Section 301 (China trade). 
                  Consider sourcing from alternative countries to avoid this surcharge.
                </Paragraph>
              }
              className="bg-amber-50 border-amber-200"
            />
          )}

          {hasIEEPA && !hasUSMCA && (
            <Alert
              type="info"
              icon={<Info size={16} />}
              message="IEEPA Tariff Information"
              description={
                <Paragraph className="text-sm mb-0">
                  The International Emergency Economic Powers Act (IEEPA) tariff applies to most 
                  countries. Only USMCA-compliant goods from Mexico/Canada may be exempt.
                </Paragraph>
              }
              className="bg-blue-50 border-blue-200"
            />
          )}
        </div>

        <Divider className="my-6" />

        {/* Additional Resources */}
        <div className="space-y-3">
          <Title level={5} className="text-slate-900">Learn More:</Title>
          <Space direction="vertical" className="w-full">
            <Button 
              type="link" 
              className="p-0 h-auto text-left"
              onClick={() => {
                router.push(`/dashboard/compliance/fta-rules?hts=${htsCode}`);
                onClose();
              }}
            >
              → View all FTA rules for HTS {htsCode}
            </Button>
            <Button 
              type="link" 
              className="p-0 h-auto text-left"
              onClick={() => {
                router.push('/dashboard/compliance/tariff-tracker');
                onClose();
              }}
            >
              → Track tariff changes and updates
            </Button>
            <Button 
              type="link" 
              className="p-0 h-auto text-left"
              onClick={() => {
                router.push('/dashboard/intelligence/trade-stats');
                onClose();
              }}
            >
              → View trade statistics for this product
            </Button>
          </Space>
        </div>
      </div>
    </Drawer>
  );
};

// Helper component for tariff breakdown items
const TariffComponent: React.FC<{
  icon: React.ReactNode;
  label: string;
  rate: number;
  amount: number;
  description: string;
  type: 'base' | 'discount' | 'additional';
}> = ({ icon, label, rate, amount, description, type }) => {
  const formatRate = (rate: number) => `${rate.toFixed(1)}%`;
  const formatCurrency = (amount: number) => `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-slate-50">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <Text className="font-medium text-slate-900">{label}</Text>
          <Tag 
            color={type === 'discount' ? 'success' : type === 'additional' ? 'warning' : 'default'}
            className="m-0"
          >
            {rate < 0 ? '−' : '+'}{Math.abs(rate).toFixed(1)}%
          </Tag>
        </div>
        <Text className="text-xs text-slate-600 block mb-1">{description}</Text>
        <Text className={`text-sm font-medium ${type === 'discount' ? 'text-emerald-600' : 'text-slate-700'}`}>
          {rate < 0 ? '−' : ''}{formatCurrency(amount)}
        </Text>
      </div>
    </div>
  );
};

export default TariffExplanationDrawer;
