'use client';

import React, { useState, useRef } from 'react';
import { Table, Tag, Button, Typography, Alert, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Info, TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react';
import type { CountryComparison, CountryOption, TariffBreakdownSummary } from '../types';

const { Text, Title } = Typography;

const INITIAL_VISIBLE = 5;
const ACTION_DEBOUNCE_MS = 300;

/** Assumed annual order multiplier for savings projection */
const ANNUAL_ORDERS_ESTIMATE = 12;

/** Format dollar amounts */
const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Format compact dollar amounts (no decimals for large values) */
const formatCompact = (amount: number) => {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
};

/** Color for tariff program tags */
const TARIFF_COLORS: Record<string, string> = {
  baseMfn: 'blue',
  section301: 'orange',
  ieepa: 'red',
  section232: 'cyan',
  adcvd: 'gold',
  fta: 'green',
};

/** Render a mini tariff breakdown as inline tags */
const TariffBreakdownTags: React.FC<{ breakdown: TariffBreakdownSummary }> = ({ breakdown }) => {
  const parts: Array<{ label: string; rate: number; color: string }> = [];
  if (breakdown.baseMfn > 0) parts.push({ label: 'MFN', rate: breakdown.baseMfn, color: TARIFF_COLORS.baseMfn });
  if (breakdown.section301 > 0) parts.push({ label: '301', rate: breakdown.section301, color: TARIFF_COLORS.section301 });
  const totalIeepa = breakdown.ieepaFentanyl + breakdown.ieepaBaseline + breakdown.ieepaReciprocal;
  if (totalIeepa > 0) parts.push({ label: 'IEEPA', rate: totalIeepa, color: TARIFF_COLORS.ieepa });
  if (breakdown.section232 > 0) parts.push({ label: '232', rate: breakdown.section232, color: TARIFF_COLORS.section232 });
  if (breakdown.adcvd > 0) parts.push({ label: 'AD/CVD', rate: breakdown.adcvd, color: TARIFF_COLORS.adcvd });
  if (breakdown.ftaDiscount > 0) parts.push({ label: 'FTA', rate: -breakdown.ftaDiscount, color: TARIFF_COLORS.fta });

  if (parts.length === 0) return <Text className="text-slate-400 text-xs">No additional tariffs</Text>;

  return (
    <div className="flex flex-wrap gap-1">
      {parts.map(p => (
        <Tag key={p.label} color={p.color} className="text-xs !m-0">
          {p.label} {p.rate > 0 ? '+' : ''}{p.rate}%
        </Tag>
      ))}
    </div>
  );
};

/** Cost trend indicator */
const CostTrendBadge: React.FC<{ trend?: string; percent?: number }> = ({ trend, percent }) => {
  if (!trend || percent === undefined) return null;
  if (trend === 'rising') {
    return (
      <Tooltip title={`Avg import cost rose ${percent}% year-over-year`}>
        <span className="inline-flex items-center gap-0.5 text-xs text-red-600">
          <TrendingUp size={12} /> +{percent}%
        </span>
      </Tooltip>
    );
  }
  if (trend === 'falling') {
    return (
      <Tooltip title={`Avg import cost fell ${Math.abs(percent)}% year-over-year`}>
        <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
          <TrendingDown size={12} /> {percent}%
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Avg import cost is stable year-over-year">
      <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
        <Minus size={12} /> stable
      </span>
    </Tooltip>
  );
};

/** Data quality badge */
const DataQualityBadge: React.FC<{ quality?: string; source?: string }> = ({ quality, source }) => {
  if (source === 'tariff_only') {
    return (
      <Tooltip title="Tariff comparison only — product cost is estimated from your input value. Real manufacturing costs may vary by country.">
        <Tag className="text-xs !m-0" color="default">Tariff Est.</Tag>
      </Tooltip>
    );
  }
  if (quality === 'high') return <Tag className="text-xs !m-0" color="green">High Conf.</Tag>;
  if (quality === 'medium') return <Tag className="text-xs !m-0" color="gold">Med Conf.</Tag>;
  return <Tag className="text-xs !m-0" color="default">Low Conf.</Tag>;
};

interface CountryCompareSectionProps {
  comparison: CountryComparison;
  htsCode?: string;
  /** Quantity from the user input — used for annual savings projection */
  quantity?: number;
}

export const CountryCompareSection: React.FC<CountryCompareSectionProps> = ({ comparison, htsCode, quantity }) => {
  const router = useRouter();
  const lastActionRef = useRef(0);
  const [showAll, setShowAll] = useState(false);

  const currentCountryCode = comparison.current.countryCode;
  const currentLandedCost = comparison.current.landedCost;

  const handleNavigate = (path: string) => {
    try {
      const now = Date.now();
      if (now - lastActionRef.current < ACTION_DEBOUNCE_MS) return;
      lastActionRef.current = now;
      router.push(path);
    } catch (error) {
      console.error(`[CountryCompareSection] ${new Date().toISOString()} Navigation error:`, error);
    }
  };

  const bestAlternative = comparison.alternatives.reduce((best, next) => {
    if (!best) return next;
    return next.savings > best.savings ? next : best;
  }, null as (CountryOption | null));

  // Combine current + alternatives into one list for the table
  const allCountries = [comparison.current, ...comparison.alternatives];
  const visibleCountries = showAll ? allCountries : allCountries.slice(0, INITIAL_VISIBLE + 1); // +1 for current
  const hiddenCount = allCountries.length - visibleCountries.length;

  // Check if we have any cost_data vs all tariff_only
  const hasCostData = allCountries.some(c => c.dataSource === 'cost_data');
  const allTariffOnly = !hasCostData && allCountries.every(c => c.dataSource === 'tariff_only' || c.dataSource === 'estimate');
  const hasImportVolume = allCountries.some(c => c.importVolume && c.importVolume > 0);
  const hasCostTrend = allCountries.some(c => c.costTrend !== undefined);

  // Annual savings projection
  const annualSavings = bestAlternative && bestAlternative.savings > 0 && quantity
    ? bestAlternative.savings * ANNUAL_ORDERS_ESTIMATE
    : undefined;

  const columns = [
    {
      title: 'Country',
      dataIndex: 'countryName',
      key: 'country',
      width: 200,
      fixed: 'left' as const,
      render: (text: string, record: CountryOption) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{text}</span>
            {record.countryCode === currentCountryCode && (
              <Tag color="cyan" className="!m-0">Current</Tag>
            )}
            {bestAlternative && record.countryCode === bestAlternative.countryCode && record.savings > 0 && (
              <Tag color="green" className="!m-0">Best</Tag>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <DataQualityBadge quality={record.dataQuality} source={record.dataSource} />
            {record.ftaAvailable && (
              <Tag color="green" className="text-xs !m-0">
                {record.ftaName || 'FTA'}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="Average import cost per statistical unit from USITC customs data (real declared values). Unit type varies by HTS code (e.g. dozens for apparel, kg for bulk goods). Independent of your input.">
          <span className="cursor-help">Avg. Import Cost</span>
        </Tooltip>
      ),
      dataIndex: 'productCostPerUnit',
      key: 'productCost',
      width: 140,
      render: (value: number | undefined, record: CountryOption) => (
        <div>
          {value !== undefined && value > 0 ? (
            <>
              <Text className="text-slate-700">{formatCurrency(value)}/unit</Text>
              {record.dataSource === 'estimate' && (
                <Text className="text-xs text-slate-400 block">global avg</Text>
              )}
            </>
          ) : (
            <Tooltip title="No USITC import data available for this product from this country">
              <Text className="text-slate-400">No data</Text>
            </Tooltip>
          )}
          {record.costTrend && (
            <div className="mt-0.5">
              <CostTrendBadge trend={record.costTrend} percent={record.costTrendPercent} />
            </div>
          )}
        </div>
      ),
      sorter: (a: CountryOption, b: CountryOption) => (a.productCostPerUnit ?? 0) - (b.productCostPerUnit ?? 0),
    },
    {
      title: (
        <Tooltip title="Total effective tariff rate including all programs (MFN + Section 301 + IEEPA + Section 232 + AD/CVD - FTA discount)">
          <span className="cursor-help">Effective Tariff</span>
        </Tooltip>
      ),
      dataIndex: 'dutyRate',
      key: 'dutyRate',
      width: 120,
      render: (value: number, record: CountryOption) => (
        <div>
          <Text className="font-semibold text-slate-900">{value.toFixed(1)}%</Text>
          {record.tariffBreakdown && (
            <div className="mt-1">
              <TariffBreakdownTags breakdown={record.tariffBreakdown} />
            </div>
          )}
        </div>
      ),
      sorter: (a: CountryOption, b: CountryOption) => a.dutyRate - b.dutyRate,
    },
    {
      title: (
        <Tooltip title="Total cost including product, tariffs, shipping, and fees for the full quantity">
          <span className="cursor-help">Total Landed Cost</span>
        </Tooltip>
      ),
      dataIndex: 'landedCost',
      key: 'landedCost',
      width: 150,
      render: (value: number, record: CountryOption) => (
        <div>
          <Text className="font-semibold text-slate-900">{formatCompact(value)}</Text>
          {record.landedCostPerUnit && (
            <div>
              <Text className="text-xs text-slate-500">
                {formatCurrency(record.landedCostPerUnit)}/unit
              </Text>
            </div>
          )}
        </div>
      ),
      sorter: (a: CountryOption, b: CountryOption) => a.landedCost - b.landedCost,
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Savings',
      key: 'savings',
      width: 140,
      render: (_: unknown, record: CountryOption) => {
        if (record.countryCode === currentCountryCode) {
          return <Text className="text-slate-400">Baseline</Text>;
        }
        if (record.savings <= 0) {
          return <Text className="text-slate-400">—</Text>;
        }
        const percent = record.savingsPercent ?? (currentLandedCost > 0 ? Math.round((record.savings / currentLandedCost) * 100) : 0);
        return (
          <div>
            <div className="flex items-center gap-1">
              <TrendingDown size={14} className="text-green-600" />
              <Text className="font-semibold text-green-600">
                {formatCompact(record.savings)}
              </Text>
            </div>
            {percent > 0 && (
              <Text className="text-xs text-green-600">{percent}% less</Text>
            )}
          </div>
        );
      },
      sorter: (a: CountryOption, b: CountryOption) => b.savings - a.savings,
    },
    // Conditionally show import volume column when data exists
    ...(hasImportVolume ? [{
      title: (
        <Tooltip title="Total US import value for this HTS code from this country (USITC DataWeb). Higher volume = more established supply chain.">
          <span className="cursor-help">Import Volume</span>
        </Tooltip>
      ),
      dataIndex: 'importVolume',
      key: 'importVolume',
      width: 120,
      render: (value: number | undefined) => (
        <Text className="text-slate-600">
          {value && value > 0 ? formatCompact(value) : '—'}
        </Text>
      ),
      sorter: (a: CountryOption, b: CountryOption) => (a.importVolume ?? 0) - (b.importVolume ?? 0),
    }] : []),
    {
      title: 'Transit',
      dataIndex: 'transitDays',
      key: 'transit',
      width: 80,
      render: (days: number | undefined) => (
        <Text className="text-slate-600">{days !== undefined ? `${days}d` : '—'}</Text>
      ),
      sorter: (a: CountryOption, b: CountryOption) => (a.transitDays ?? 99) - (b.transitDays ?? 99),
    },
  ];

  const dataSource = visibleCountries.map((item, index) => ({
    key: `${item.countryCode}-${index}`,
    ...item,
  }));

  const hasContext = Boolean(htsCode);

  return (
    <div className="space-y-4" data-component="country_compare_section">
      {/* Annual savings callout — only if there's a real savings opportunity */}
      {bestAlternative && bestAlternative.savings > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <Text className="text-sm text-green-800 font-medium block">
              Potential savings with {bestAlternative.countryName}
            </Text>
            <Text className="text-xs text-green-600 block mt-0.5">
              vs. {comparison.current.countryName} ({bestAlternative.savingsPercent ?? 0}% lower landed cost)
            </Text>
          </div>
          <div className="text-right">
            <Text className="text-2xl font-bold text-green-700 block">
              {formatCompact(bestAlternative.savings)}
            </Text>
            <Text className="text-xs text-green-600">per order</Text>
            {annualSavings !== undefined && annualSavings > 0 && (
              <Text className="text-xs text-green-600 block">
                ~{formatCompact(annualSavings)}/yr est.
              </Text>
            )}
          </div>
        </div>
      )}

      {/* Data source notice */}
      {allTariffOnly && (
        <Alert
          type="info"
          showIcon
          icon={<Info size={16} />}
          message="Tariff-based comparison"
          description="No real import cost data is available for this product. Costs below use your input value as the product cost basis — actual manufacturing costs vary by country. Tariff rates are accurate."
          className="border-teal-200 bg-teal-50"
        />
      )}

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="!mb-0">
            Sourcing Alternatives
          </Title>
          <Text className="text-xs text-slate-500">
            {allCountries.length} {allCountries.length === 1 ? 'country' : 'countries'} compared
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          scroll={{ x: hasImportVolume ? 950 : 830 }}
          rowClassName={(record) =>
            record.countryCode === currentCountryCode
              ? 'bg-teal-50'
              : ''
          }
        />
      </div>

      {/* Show more / show less */}
      {comparison.alternatives.length > INITIAL_VISIBLE && (
        <div className="text-center">
          <Button
            type="link"
            onClick={() => setShowAll(!showAll)}
            icon={showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          >
            {showAll
              ? 'Show fewer countries'
              : `Show ${hiddenCount} more ${hiddenCount === 1 ? 'country' : 'countries'}`
            }
          </Button>
        </div>
      )}

      {/* Next Steps Footer */}
      {(comparison.recommendation || hasContext) && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Recommendation banner — only when there's a meaningful rec */}
          {comparison.recommendation && bestAlternative && bestAlternative.savings > 0 && (
            <div className="px-5 py-4 bg-teal-50 border-b border-teal-100">
              <Text className="text-sm text-teal-800">{comparison.recommendation}</Text>
            </div>
          )}

          {/* Action grid */}
          <div className="p-5">
            <Text className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block">
              Next Steps
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Primary: View on cost map */}
              <button
                disabled={!hasContext}
                onClick={() => handleNavigate(`/dashboard/intelligence/cost-map?hts=${htsCode}&from=${currentCountryCode}`)}
                className="group text-left p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BarChart3 size={16} className="text-teal-600 shrink-0" />
                  <Text className="text-sm font-medium text-slate-900">View cost map</Text>
                </div>
                <Text className="text-xs text-slate-500 leading-relaxed">
                  Interactive map of landed costs across all countries
                </Text>
              </button>

              {/* Secondary: Save & monitor */}
              <button
                disabled={!hasContext}
                onClick={() => handleNavigate('/dashboard/products?tab=monitored')}
                className="group text-left p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingDown size={16} className="text-teal-600 shrink-0" />
                  <Text className="text-sm font-medium text-slate-900">Monitor tariffs</Text>
                </div>
                <Text className="text-xs text-slate-500 leading-relaxed">
                  Track rate changes and get alerts for this product
                </Text>
              </button>

              {/* Tertiary: FTA check */}
              <button
                onClick={() => handleNavigate(
                  htsCode
                    ? `/dashboard/compliance/fta-calculator?hts=${htsCode}`
                    : '/dashboard/compliance/fta-calculator'
                )}
                className="group text-left p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Tag color="green" className="!m-0 !text-xs">FTA</Tag>
                  <Text className="text-sm font-medium text-slate-900">Check FTA qualification</Text>
                </div>
                <Text className="text-xs text-slate-500 leading-relaxed">
                  {comparison.alternatives.some(c => c.ftaAvailable)
                    ? 'Free trade agreements may reduce your duties'
                    : 'See if your product qualifies for duty reduction'
                  }
                </Text>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
