'use client';

import React, { useState } from 'react';
import { Button, Typography, Alert, Tooltip } from 'antd';
import { ChevronDown, ChevronRight, Copy, Check, Info, Clock } from 'lucide-react';
import type { ImportAnalysis } from '../types';
import { TariffExplanationDrawer } from './TariffExplanationDrawer';
import { formatHtsCode } from '@/utils/htsFormatting';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';

const { Text } = Typography;

interface LandedCostSectionProps {
  landedCost: ImportAnalysis['landedCost'];
  input: ImportAnalysis['input'];
  classification?: ImportAnalysis['classification'];
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Collapsible section component - simple chevron + label + amount
const CollapsibleSection: React.FC<{
  label: string;
  amount: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ label, amount, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left hover:bg-slate-50 rounded -mx-2 px-2"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronRight size={16} className="text-slate-400" />
          )}
          <Text className="text-sm font-medium text-slate-600">{label}</Text>
        </div>
        <Text className="text-sm font-medium text-slate-700">{formatCurrency(amount)}</Text>
      </button>
      {isOpen && <div className="ml-6 mt-2 space-y-2">{children}</div>}
    </div>
  );
};

// Simple line item - just label and amount
const LineItem: React.FC<{
  label: React.ReactNode;
  amount: number;
  rate?: number;
  isDiscount?: boolean;
  isBold?: boolean;
}> = ({ label, amount, rate, isDiscount = false, isBold = false }) => (
  <div className="flex items-center justify-between py-1">
    <Text className={`text-sm ${isDiscount ? 'text-emerald-600' : 'text-slate-600'} ${isBold ? 'font-semibold' : ''}`}>
      {label}
      {rate !== undefined && (
        <span className="ml-2 text-xs text-slate-400">
          ({isDiscount ? '−' : ''}{Math.abs(rate).toFixed(2)}%)
        </span>
      )}
    </Text>
    <Text className={`text-sm ${isDiscount ? 'text-emerald-600' : 'text-slate-700'} ${isBold ? 'font-semibold' : 'font-medium'}`}>
      {isDiscount ? '−' : ''}{formatCurrency(Math.abs(amount))}
    </Text>
  </div>
);

export const LandedCostSection: React.FC<LandedCostSectionProps> = ({ landedCost, input, classification }) => {
  // Use classified HTS code (from Section 1) if available, fallback to input
  const htsCodeRaw = classification?.htsCode || input.htsCode || '';
  const htsCode = formatHtsCode(htsCodeRaw);
  const productDescription = classification?.description || input.description || 'Product';
  const [showTariffExplanation, setShowTariffExplanation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInsight, setShowInsight] = useState(true);

  // Calculate values
  const productFreightTotal = landedCost.productValue + landedCost.shipping + landedCost.insurance;
  const additionalCostsTotal = landedCost.estimatedAdditional?.total || 450;

  // Check for contextual insights
  const hasUSMCA = landedCost.duties.layers?.some(l => l.programType === 'fta_discount' && l.name?.includes('USMCA'));
  const hasSection301 = landedCost.duties.layers?.some(l => l.programType === 'section_301' && l.rate > 0);
  const ftaSavings = landedCost.duties.layers
    ?.filter(l => l.programType === 'fta_discount' && l.rate < 0)
    .reduce((sum, l) => sum + Math.abs(l.amount), 0) || 0;

  // Data quality & freshness
  const dataQuality = landedCost.dataQuality || 'medium';
  const tariffConfidence = landedCost.tariffConfidence ?? 85;
  const lastUpdated = landedCost.lastUpdated 
    ? new Date(landedCost.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  
  // Margin impact calculation - based on duty as % of product value
  const marginImpact = landedCost.dutyAsPercentOfProduct 
    ? (landedCost.dutyAsPercentOfProduct > 0 ? `-${landedCost.dutyAsPercentOfProduct.toFixed(1)}%` : '+0%')
    : null;
  const marginImpactColor = landedCost.dutyAsPercentOfProduct > 25 
    ? { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' }
    : landedCost.dutyAsPercentOfProduct > 10 
      ? { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
      : { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };

  const copyTotal = () => {
    navigator.clipboard.writeText(landedCost.total.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="space-y-6">
      {/* Your Purchase */}
      <div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
          Your Purchase
        </div>
        <p className="text-lg font-semibold text-slate-700">
          {input.quantity.toLocaleString()} units × {productDescription} {htsCode && `(HTS: ${htsCode})`}
        </p>
      </div>

      {/* Total Landed Cost Box */}
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(178.52deg, #F0FDFA 5.81%, #F0FDF4 94.19%)',
          border: '1px solid #CCFBF1'
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2">
              <Text className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                Total Landed Cost
              </Text>
            </div>
            <Text className="text-4xl font-bold text-slate-900 block mb-1">
              {formatCurrency(landedCost.total)}
            </Text>
            <Text className="text-lg text-slate-600">
              {formatCurrency(landedCost.perUnit)} per unit
            </Text>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Total Tariff Rate - secondary to dollar amount */}
            <div className="text-right">
              <Text className="text-xs text-slate-500 block">Total Tariff Rate</Text>
              <Text className="text-xl font-semibold text-slate-600">
                {landedCost.duties.effectiveRate.toFixed(1)}%
              </Text>
            </div>
          </div>
        </div>
        
        {/* Data freshness footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-teal-100">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            <span>
              {lastUpdated ? `Rates as of ${lastUpdated}` : 'Tariff data from registry'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Info size={12} />
            <span>Source: {landedCost.dataSource || 'USITC HTS API'}</span>
          </div>
        </div>
      </div>

      {/* Margin Impact Indicator */}
      {marginImpact && (
        <div 
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ 
            background: marginImpactColor.bg, 
            border: `1px solid ${marginImpactColor.border}` 
          }}
        >
          <div className="flex items-center gap-2">
            <Text className="text-sm font-medium" style={{ color: marginImpactColor.text }}>
              Duty Impact on Margin
            </Text>
            <Tooltip title="Total duties as a percentage of your product value — shows how much tariffs eat into your margin">
              <Info size={14} className="text-slate-400 cursor-help" />
            </Tooltip>
          </div>
          <Text className="text-lg font-bold" style={{ color: marginImpactColor.text }}>
            {marginImpact}
          </Text>
        </div>
      )}

      {/* Contextual Insight Banner - Only shows when relevant */}
      {showInsight && (hasUSMCA || hasSection301) && (
        <Alert
          type={hasUSMCA ? 'success' : 'warning'}
          message={
            hasUSMCA && ftaSavings > 0
              ? <><GlossaryTerm term="USMCA">USMCA</GlossaryTerm> qualification saves {formatCurrency(ftaSavings)} on this order</>
              : <><GlossaryTerm term="Section 301">Section 301</GlossaryTerm> tariff adds {landedCost.duties.layers?.find(l => l.programType === 'section_301')?.rate}% to this product</>
          }
          closable
          onClose={() => setShowInsight(false)}
          className="text-sm"
        />
      )}

      {/* Cost Breakdown Label */}
      <Text className="text-base font-medium text-slate-700 block">
        Cost Breakdown:
      </Text>

      {/* Product & Freight */}
      <CollapsibleSection label="Product & Freight" amount={productFreightTotal}>
        <LineItem label="Product Value (FOB)" amount={landedCost.productValue} />
        <LineItem 
          label={<>Shipping{landedCost.shippingIsEstimated && <span className="ml-1 text-xs text-slate-400">(est.)</span>}</>} 
          amount={landedCost.shipping} 
        />
        <LineItem 
          label={<>Insurance{landedCost.insuranceIsEstimated && <span className="ml-1 text-xs text-slate-400">(est.)</span>}</>} 
          amount={landedCost.insurance} 
        />
      </CollapsibleSection>

      {/* Duties & Tariffs */}
      <CollapsibleSection 
        label={`Duties & Tariffs (${landedCost.duties.effectiveRate.toFixed(1)}%)`} 
        amount={landedCost.duties.total}
      >
        <Text className="text-xs text-slate-400 block mb-2">Applied to declared value (FOB)</Text>
        {landedCost.duties.layers?.map((layer, idx) => (
          <LineItem 
            key={idx}
            label={layer.name}
            amount={layer.amount}
            rate={layer.rate}
            isDiscount={layer.rate < 0}
          />
        ))}
        <div className="border-t border-slate-200 pt-2 mt-2">
          <LineItem label="Effective Tariff Total" amount={landedCost.duties.total} isBold />
        </div>
      </CollapsibleSection>

      {/* Fees */}
      <CollapsibleSection label="Fees" amount={landedCost.fees.total}>
        <LineItem label={<><GlossaryTerm term="MPF">MPF</GlossaryTerm> (0.3464%)</>} amount={landedCost.fees.mpf} />
        <LineItem 
          label={
            landedCost.isOceanShipment === false 
              ? <><GlossaryTerm term="HMF">HMF</GlossaryTerm> (Air — N/A)</>
              : <><GlossaryTerm term="HMF">HMF</GlossaryTerm> (0.125%)</>
          } 
          amount={landedCost.fees.hmf} 
        />
        <div className="border-t border-slate-200 pt-2 mt-2">
          <LineItem label="Total Fees" amount={landedCost.fees.total} isBold />
        </div>
      </CollapsibleSection>

      {/* Additional Costs */}
      <CollapsibleSection label="Additional Costs (estimated)" amount={additionalCostsTotal}>
        <LineItem label="Customs Broker Fee (estimated)" amount={landedCost.estimatedAdditional?.customsBroker || 150} />
        <LineItem label="Drayage (estimated)" amount={landedCost.estimatedAdditional?.drayage || 300} />
        <Text className="text-xs text-slate-400 block mt-1">
          Estimates based on typical ocean shipment. Actual costs vary by entry complexity and location.
        </Text>
      </CollapsibleSection>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="primary" 
          size="large"
          onClick={() => {
            // Expand and scroll to Section 3 (Compare Countries) in the parent Collapse
            const collapsePanel = document.querySelector('[data-component="country_compare_section"]');
            if (collapsePanel) {
              collapsePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              // Fallback: click the Section 3 collapse header to expand it, then scroll
              const headers = document.querySelectorAll('.ant-collapse-header');
              headers.forEach((header) => {
                if (header.textContent?.includes('Compare Countries')) {
                  (header as HTMLElement).click();
                  setTimeout(() => header.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
                }
              });
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            border: 'none'
          }}
        >
          Compare countries
        </Button>
        <Button 
          type="default"
          size="large"
          onClick={() => setShowTariffExplanation(true)}
        >
          Tariff details
        </Button>
        <Button 
          type="default" 
          size="large"
          onClick={copyTotal}
          icon={copied ? <Check size={16} /> : <Copy size={16} />}
        >
          {copied ? 'Copied!' : 'Copy total'}
        </Button>
      </div>

      {/* Tariff Explanation Drawer */}
      <TariffExplanationDrawer
        open={showTariffExplanation}
        onClose={() => setShowTariffExplanation(false)}
        landedCost={landedCost}
        htsCode={htsCodeRaw}
        countryCode={input.countryCode || 'CN'}
      />
    </div>
  );
};
