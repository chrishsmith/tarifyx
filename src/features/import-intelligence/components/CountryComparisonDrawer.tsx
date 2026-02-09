'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Typography, Button, Tag, Skeleton, Alert } from 'antd';
import { EmptyState } from '@/components/shared/EmptyState';
import { Globe, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  costPerUnit: number;
  costTotal: number;
  tariffRate: number;
  hasFTA: boolean;
  ftaNotes?: string;
  savingsPerUnit?: number;
  savingsTotal?: number;
  savingsPercent?: number;
  supplierCount?: number;
  transitDays?: number;
  confidenceScore?: number;
  dataQuality?: 'high' | 'medium' | 'low';
  isRecommended?: boolean;
}

interface BaselineInfo {
  code: string;
  name: string;
  landedCostPerUnit: number;
  landedCostTotal: number;
}

interface PotentialSavingsInfo {
  percent: number;
  perUnit: number;
  total: number;
  annual?: number;
}

interface CountryComparisonDrawerProps {
  open: boolean;
  onClose: () => void;
  htsCode: string;
  currentCountry: string;
  currentCost: number;
  quantity: number;
}

export const CountryComparisonDrawer: React.FC<CountryComparisonDrawerProps> = ({
  open,
  onClose,
  htsCode,
  currentCountry,
  currentCost,
  quantity,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<BaselineInfo | null>(null);
  const [potentialSavings, setPotentialSavings] = useState<PotentialSavingsInfo | null>(null);
  const lastFetchRef = useRef(0);
  const lastActionRef = useRef(0);

  const ACTION_DEBOUNCE_MS = 300;

  useEffect(() => {
    if (!open || !htsCode) {
      return;
    }

    const controller = new AbortController();
    fetchCountryComparison(controller.signal);

    return () => {
      controller.abort();
    };
  }, [open, htsCode, currentCountry, quantity]);

  const fetchCountryComparison = async (signal: AbortSignal) => {
    try {
      const now = Date.now();
      if (now - lastFetchRef.current < ACTION_DEBOUNCE_MS) {
        return;
      }
      lastFetchRef.current = now;

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        hts: htsCode,
        from: currentCountry,
        quantity: String(quantity),
      });

      const response = await fetch(`/api/sourcing/quick?${params.toString()}`, { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch country comparison');
      }

      const data = await response.json();

      if (data.success && data.data?.alternatives) {
        // Map the alternatives to our format
        const mappedCountries: CountryOption[] = data.data.alternatives.map((alt: any) => ({
          code: alt.code,
          name: alt.name,
          flag: alt.flag,
          costPerUnit: alt.landedCostPerUnit,
          costTotal: alt.landedCostTotal,
          tariffRate: alt.effectiveTariff,
          hasFTA: alt.hasFTA,
          ftaNotes: alt.ftaName,
          savingsPerUnit: alt.savingsAmountPerUnit,
          savingsTotal: alt.savingsAmountTotal,
          savingsPercent: alt.savingsPercent,
          supplierCount: alt.supplierCount,
          transitDays: alt.transitDays,
          confidenceScore: alt.confidenceScore,
          dataQuality: alt.dataQuality,
          isRecommended: alt.isRecommended,
        }));

        const perUnitFallback = quantity > 0 ? currentCost / quantity : currentCost;

        // Add current country at the top
        const currentCountryData: CountryOption = {
          code: currentCountry,
          name: data.data.currentCountry?.name || currentCountry,
          flag: data.data.currentCountry?.flag || '🌍',
          costPerUnit: data.data.currentCountry?.landedCostPerUnit ?? perUnitFallback,
          costTotal: data.data.currentCountry?.landedCostTotal ?? currentCost,
          tariffRate: data.data.currentCountry?.effectiveTariff ?? 0,
          hasFTA: false,
          supplierCount: data.data.currentCountry?.supplierCount ?? undefined,
          transitDays: data.data.currentCountry?.transitDays ?? undefined,
          confidenceScore: data.data.currentCountry?.confidenceScore ?? undefined,
          dataQuality: data.data.currentCountry?.dataQuality ?? undefined,
        };

        setBaseline(data.data.baseline || null);
        setPotentialSavings(data.data.potentialSavings || null);
        setCountries([currentCountryData, ...mappedCountries]);
      } else {
        setBaseline(null);
        setPotentialSavings(null);
        setCountries([]);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      console.error(`[CountryComparison] ${new Date().toISOString()} Error:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullAnalysis = () => {
    try {
      const now = Date.now();
      if (now - lastActionRef.current < ACTION_DEBOUNCE_MS) {
        return;
      }
      lastActionRef.current = now;
      router.push(`/dashboard/intelligence/cost-map?hts=${htsCode}&from=${currentCountry}`);
      onClose();
    } catch (error) {
      console.error(`[CountryComparison] ${new Date().toISOString()} Navigation error:`, error);
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (error) {
      console.error(`[CountryComparison] ${new Date().toISOString()} formatCurrency error:`, error);
      return '$0.00';
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-teal-600" />
          <Text className="text-lg font-semibold">Compare Sourcing Countries</Text>
        </div>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
      data-component="country_comparison_drawer"
    >
      <div className="space-y-4" data-component="country_comparison_drawer_body">
        {/* Header Info */}
        <div className="bg-slate-50 rounded-lg p-4">
          <Text className="text-sm text-slate-600 block mb-1">Comparing landed costs for:</Text>
          <Text className="font-mono font-semibold text-slate-900">HTS {htsCode}</Text>
          <Text className="text-xs text-slate-500 block mt-1">
            Quantity: {quantity.toLocaleString()} units
          </Text>
          {baseline && (
            <Text className="text-xs text-slate-500 block mt-1">
              Baseline: {baseline.name} ({baseline.code})
            </Text>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert
            type="error"
            message="Failed to Load Comparison"
            description={error}
            showIcon
          />
        )}

        {/* Empty State */}
        {!loading && !error && countries.length === 0 && (
          <EmptyState
            icon="search"
            title="No comparison data"
            description="No country comparison data is available for this product."
          />
        )}

        {/* Country List */}
        {!loading && !error && countries.length > 0 && (
          <>
            <div className="space-y-3">
              {countries.map((country, idx) => (
                <div
                  key={country.code}
                  className={`rounded-lg border p-4 transition-all ${
                    idx === 0
                      ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {idx === 0 && (
                      <Tag color="cyan">Current Selection</Tag>
                    )}
                    {country.isRecommended && idx > 0 && (
                      <Tag color="green">Recommended</Tag>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{country.flag}</span>
                        <Text className="font-semibold text-slate-900 text-lg">
                          {country.name}
                        </Text>
                      </div>
                      {country.hasFTA && (
                        <Tag color="green" className="text-xs">
                          {country.ftaNotes || 'FTA Available'}
                        </Tag>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {country.supplierCount !== undefined && (
                          <Tag className="text-xs" color="default">
                            {country.supplierCount} suppliers
                          </Tag>
                        )}
                        {country.transitDays !== undefined && (
                          <Tag className="text-xs" color="default">
                            {country.transitDays} day transit
                          </Tag>
                        )}
                        {country.dataQuality && (
                          <Tag className="text-xs" color={country.dataQuality === 'high' ? 'green' : country.dataQuality === 'medium' ? 'gold' : 'default'}>
                            {country.dataQuality} confidence
                          </Tag>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Text className="text-2xl font-bold text-slate-900 block">
                        {formatCurrency(country.costTotal)}
                      </Text>
                      <Text className="text-xs text-slate-500">total landed cost</Text>
                      <Text className="text-xs text-slate-400 block">
                        {formatCurrency(country.costPerUnit)} per unit
                      </Text>
                    </div>
                  </div>

                  {/* Savings Indicator */}
                  {idx > 0 && country.savingsTotal !== undefined && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <Text className="text-sm text-slate-600">vs. Baseline</Text>
                      <div className="flex items-center gap-2">
                        {country.savingsTotal > 0 ? (
                          <>
                            <TrendingDown size={16} className="text-green-600" />
                            <Text className="font-semibold text-green-600">
                              Save {formatCurrency(country.savingsTotal)} ({country.savingsPercent}%)
                            </Text>
                          </>
                        ) : country.savingsTotal < 0 ? (
                          <>
                            <TrendingUp size={16} className="text-red-600" />
                            <Text className="font-semibold text-red-600">
                              +{formatCurrency(Math.abs(country.savingsTotal))} ({Math.abs(country.savingsPercent || 0)}%)
                            </Text>
                          </>
                        ) : (
                          <Text className="text-slate-500">Same cost</Text>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tariff Rate */}
                  {country.tariffRate > 0 && (
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <Text className="text-slate-600">Effective Tariff</Text>
                      <Text className="font-medium text-slate-900">
                        {country.tariffRate.toFixed(1)}%
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Insight */}
            {countries.length > 1 && (
              <Alert
                type="info"
                icon={<Globe size={16} />}
                message={
                  <div className="text-sm">
                    {(() => {
                      if (potentialSavings && potentialSavings.perUnit > 0 && baseline) {
                        return (
                          <Text>
                            Best alternative saves <strong>{formatCurrency(potentialSavings.total)}</strong> total
                            ({potentialSavings.percent}%) vs {baseline.name}.
                          </Text>
                        );
                      }

                      const lowest = [...countries].sort((a, b) => a.costTotal - b.costTotal)[0];
                      const current = countries[0];
                      
                      if (lowest.code === current.code) {
                        return <Text>You're already sourcing from the most cost-effective country!</Text>;
                      }
                      
                      const savings = current.costTotal - lowest.costTotal;
                      const savingsPercent = ((savings / current.costTotal) * 100).toFixed(1);
                      
                      return (
                        <Text>
                          <strong>{lowest.flag} {lowest.name}</strong> offers the lowest landed cost. 
                          Potential savings of <strong>{formatCurrency(savings)}</strong> ({savingsPercent}%) 
                          compared to your current selection.
                        </Text>
                      );
                    })()}
                  </div>
                }
                className="bg-teal-50 border-teal-200"
              />
            )}

            {/* Action Button */}
            <Button
              type="primary"
              size="large"
              icon={<ArrowRight size={16} />}
              onClick={handleViewFullAnalysis}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                border: 'none'
              }}
            >
              View Full Sourcing Analysis
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default CountryComparisonDrawer;
