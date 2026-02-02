'use client';

import React, { useState } from 'react';
import { Button, Typography, Alert, Tooltip } from 'antd';
import { ChevronDown, ChevronRight, Copy, Check, Info, Clock } from 'lucide-react';
import type { ImportAnalysis } from '../types';
import { TariffExplanationDrawer } from './TariffExplanationDrawer';
import { CountryComparisonDrawer } from './CountryComparisonDrawer';

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

// Format HTS code with periods (e.g., 6912004400 -> 6912.00.44.00)
const formatHtsCode = (code: string): string => {
  const clean = code.replace(/\./g, '');
  if (clean.length >= 10) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}.${clean.slice(8)}`;
  } else if (clean.length >= 8) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6)}`;
  } else if (clean.length >= 6) {
    return `${clean.slice(0, 4)}.${clean.slice(4)}`;
  } else if (clean.length >= 4) {
    return `${clean.slice(0, 4)}`;
  }
  return code;
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
  label: string;
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
  const [showCountryComparison, setShowCountryComparison] = useState(false);
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
  const marginImpactColor = landedCost.dutyAsPercentOfProduct > 10 
    ? { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' }  // Red for high impact
    : landedCost.dutyAsPercentOfProduct > 5 
      ? { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }  // Yellow for medium
      : { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' }; // Green for low

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
          background: 'linear-gradient(178.52deg, #EEF2FF 5.81%, #EFF6FF 94.19%)',
          border: '1px solid #E0E7FF'
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2">
              <Text className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
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
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-indigo-100">
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

      {/* Contextual Insight Banner - Only shows when relevant */}
      {showInsight && (hasUSMCA || hasSection301) && (
        <Alert
          type={hasUSMCA ? 'success' : 'warning'}
          message={
            hasUSMCA && ftaSavings > 0
              ? `USMCA qualification saves ${formatCurrency(ftaSavings)} on this order`
              : `Section 301 tariff adds ${landedCost.duties.layers?.find(l => l.programType === 'section_301')?.rate}% to this product`
          }
          closable
          onClose={() => setShowInsight(false)}
          className="text-sm"
        />
      )}

      {/* Effective Tariff Rate */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Text className="text-sm text-slate-600">Effective Tariff Rate</Text>
          <button
            onClick={() => setShowTariffExplanation(true)}
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            (why?)
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Text className="text-sm font-medium text-slate-600">
            {landedCost.duties.effectiveRate.toFixed(1)}%
          </Text>
          <Text className="text-sm font-semibold text-slate-900">
            {formatCurrency(landedCost.duties.total)}
          </Text>
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Cost Breakdown Label */}
      <Text className="text-base font-medium text-slate-700 block">
        Cost Breakdown:
      </Text>

      {/* Product & Freight */}
      <CollapsibleSection label="Product & Freight" amount={productFreightTotal}>
        <LineItem label="Product Value (FOB)" amount={landedCost.productValue} />
        <LineItem label="Shipping" amount={landedCost.shipping} />
        <LineItem label="Insurance" amount={landedCost.insurance} />
      </CollapsibleSection>

      {/* Duties & Tariffs */}
      <CollapsibleSection 
        label={`Duties & Tariffs (${landedCost.duties.effectiveRate.toFixed(1)}%)`} 
        amount={landedCost.duties.total}
      >
        <Text className="text-xs text-slate-400 block mb-2">Applied to dutiable value (CIF)</Text>
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
        <LineItem label="MPF (0.3464%)" amount={landedCost.fees.mpf} />
        <LineItem label="HMF (0.125%)" amount={landedCost.fees.hmf} />
        <div className="border-t border-slate-200 pt-2 mt-2">
          <LineItem label="Total Fees" amount={landedCost.fees.total} isBold />
        </div>
      </CollapsibleSection>

      {/* Additional Costs */}
      <CollapsibleSection label="Additional Costs" amount={additionalCostsTotal}>
        <LineItem label="Customs Broker Fee" amount={landedCost.estimatedAdditional?.customsBroker || 150} />
        <LineItem label="Drayage (estimated)" amount={landedCost.estimatedAdditional?.drayage || 300} />
      </CollapsibleSection>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="default"
          size="large"
          className="text-slate-500"
          style={{ opacity: 0.6 }}
        >
          Save scenario
        </Button>
        <Button 
          type="default"
          size="large"
          onClick={() => setShowCountryComparison(true)}
        >
          Compare countries
        </Button>
        <Button 
          type="primary" 
          size="large"
          style={{
            background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
            border: 'none'
          }}
        >
          Export breakdown
        </Button>
      </div>

      {/* Drawers */}
      <TariffExplanationDrawer
        open={showTariffExplanation}
        onClose={() => setShowTariffExplanation(false)}
        landedCost={landedCost}
        htsCode={htsCodeRaw}
        countryCode={input.countryCode || 'CN'}
      />

      <CountryComparisonDrawer
        open={showCountryComparison}
        onClose={() => setShowCountryComparison(false)}
        htsCode={htsCodeRaw}
        currentCountry={input.countryCode || 'CN'}
        currentCost={landedCost.total}
        quantity={input.quantity}
      />
    </div>
  );
};
