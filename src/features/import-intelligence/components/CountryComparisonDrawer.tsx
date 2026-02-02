'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, Typography, Button, Tag, Skeleton, Alert, Empty } from 'antd';
import { Globe, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  cost: number;
  tariffRate: number;
  hasFTA: boolean;
  ftaNotes?: string;
  savings?: number;
  savingsPercent?: number;
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

  useEffect(() => {
    if (open && htsCode) {
      fetchCountryComparison();
    }
  }, [open, htsCode]);

  const fetchCountryComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sourcing/quick?hts=${htsCode}&from=${currentCountry}`);
      
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
          cost: alt.landedCost,
          tariffRate: alt.effectiveTariff,
          hasFTA: alt.hasFTA,
          ftaNotes: alt.ftaName,
          savings: alt.savingsAmount,
          savingsPercent: alt.savingsPercent,
        }));
        
        // Add current country at the top
        const currentCountryData: CountryOption = {
          code: currentCountry,
          name: data.data.currentCountry?.name || currentCountry,
          flag: data.data.currentCountry?.flag || '🌍',
          cost: currentCost,
          tariffRate: 0, // Would need to pass this in
          hasFTA: false,
        };
        
        setCountries([currentCountryData, ...mappedCountries]);
      } else {
        setCountries([]);
      }
    } catch (err) {
      console.error('[CountryComparison] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullAnalysis = () => {
    router.push(`/dashboard/sourcing?hts=${htsCode}&from=${currentCountry}`);
    onClose();
  };

  const formatCurrency = (amount: number) => 
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-indigo-600" />
          <Text className="text-lg font-semibold">Compare Sourcing Countries</Text>
        </div>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
    >
      <div className="space-y-4">
        {/* Header Info */}
        <div className="bg-slate-50 rounded-lg p-4">
          <Text className="text-sm text-slate-600 block mb-1">Comparing landed costs for:</Text>
          <Text className="font-mono font-semibold text-slate-900">HTS {htsCode}</Text>
          <Text className="text-xs text-slate-500 block mt-1">
            Quantity: {quantity.toLocaleString()} units
          </Text>
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
          <Empty
            description="No comparison data available for this product"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
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
                      ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {idx === 0 && (
                    <Tag color="blue" className="mb-2">Current Selection</Tag>
                  )}
                  
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
                    </div>
                    <div className="text-right">
                      <Text className="text-2xl font-bold text-slate-900 block">
                        {formatCurrency(country.cost)}
                      </Text>
                      <Text className="text-xs text-slate-500">total landed cost</Text>
                    </div>
                  </div>

                  {/* Savings Indicator */}
                  {idx > 0 && country.savings !== undefined && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <Text className="text-sm text-slate-600">vs. Current</Text>
                      <div className="flex items-center gap-2">
                        {country.savings > 0 ? (
                          <>
                            <TrendingDown size={16} className="text-green-600" />
                            <Text className="font-semibold text-green-600">
                              Save {formatCurrency(country.savings)} ({country.savingsPercent}%)
                            </Text>
                          </>
                        ) : country.savings < 0 ? (
                          <>
                            <TrendingUp size={16} className="text-red-600" />
                            <Text className="font-semibold text-red-600">
                              +{formatCurrency(Math.abs(country.savings))} ({Math.abs(country.savingsPercent || 0)}%)
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
                      const lowest = [...countries].sort((a, b) => a.cost - b.cost)[0];
                      const current = countries[0];
                      
                      if (lowest.code === current.code) {
                        return <Text>You're already sourcing from the most cost-effective country!</Text>;
                      }
                      
                      const savings = current.cost - lowest.cost;
                      const savingsPercent = ((savings / current.cost) * 100).toFixed(1);
                      
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
                className="bg-blue-50 border-blue-200"
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
                background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
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
