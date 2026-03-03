'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    Form, 
    Input, 
    InputNumber, 
    Select, 
    Button, 
    Typography, 
    Divider, 
    Tag,
    Tooltip,
    Alert,
    message,
    Modal,
    Popconfirm,
    Badge,
} from 'antd';
import { 
    Calculator, 
    Package,
    Ship,
    DollarSign,
    HelpCircle,
    Info,
    Save,
    Trash2,
    GitCompare,
    X,
    Bookmark,
    ChevronRight,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Copy,
    Check,
    Clock,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    Percent,
    Receipt,
    TrendingDown,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { COUNTRY_OPTIONS, getCountryFlag, LoadingState } from '@/components/shared';
import { formatHtsCode } from '@/utils/htsFormatting';
import type { EffectiveTariffRate, AdditionalDuty } from '@/types/tariffLayers.types';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';

const { Title, Text } = Typography;

const SCENARIOS_STORAGE_KEY = 'tarifyx_landed_cost_scenarios';

if (typeof window !== 'undefined') {
    const OLD_KEY = 'sourcify_landed_cost_scenarios';
    const oldData = window.localStorage.getItem(OLD_KEY);
    if (oldData && !window.localStorage.getItem(SCENARIOS_STORAGE_KEY)) {
        window.localStorage.setItem(SCENARIOS_STORAGE_KEY, oldData);
        window.localStorage.removeItem(OLD_KEY);
    }
}

interface DutyBreakdown {
    baseMfn: number;
    baseMfnRate: number;
    additionalDuties: number;
    additionalDutiesRate: number;
    totalDuty: number;
    effectiveRate: number;
}

interface FeeBreakdown {
    mpf: number;
    hmf: number;
    totalFees: number;
}

interface LandedCostResult {
    htsCode: string;
    htsDescription: string;
    countryCode: string;
    countryName: string;
    productValue: number;
    quantity: number;
    shippingCost: number;
    insuranceCost: number;
    duties: DutyBreakdown;
    fees: FeeBreakdown;
    totalDutiesAndFees: number;
    totalLandedCost: number;
    perUnitCost: number;
    tariffBreakdown: EffectiveTariffRate;
    calculatedAt: Date;
    isOceanShipment: boolean;
}

interface FormValues {
    htsCode: string;
    countryCode: string;
    productValue: number;
    quantity: number;
    shippingCost: number;
    insuranceCost: number;
    isOceanShipment: boolean;
}

interface SavedScenario {
    id: string;
    name: string;
    savedAt: string;
    result: LandedCostResult;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
    '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PROGRAM_COLORS: Record<string, string> = {
    section_301: 'orange',
    ieepa_fentanyl: 'red',
    ieepa_reciprocal: 'red',
    section_232: 'cyan',
    other: 'default',
};

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        setIsLoaded(true);
    }, [key]);
    
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);
    
    return [isLoaded ? storedValue : initialValue, setValue];
}

// ─── Collapsible Section ─────────────────────────────────────────────────────

const CollapsibleSection: React.FC<{
    label: string;
    amount: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ label, amount, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2.5 text-left hover:bg-slate-50 rounded -mx-2 px-2 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {isOpen ? (
                        <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                    )}
                    <Text className="text-sm font-medium text-slate-600">{label}</Text>
                </div>
                <Text className="text-sm font-semibold text-slate-700">{formatCurrency(amount)}</Text>
            </button>
            {isOpen && <div className="ml-6 mt-1 space-y-1">{children}</div>}
        </div>
    );
};

// ─── Line Item ───────────────────────────────────────────────────────────────

const LineItem: React.FC<{
    label: React.ReactNode;
    amount: number;
    rate?: number;
    isDiscount?: boolean;
    isBold?: boolean;
    tooltip?: string;
    tag?: { label: string; color: string };
}> = ({ label, amount, rate, isDiscount = false, isBold = false, tooltip, tag }) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-1.5">
            <Text className={`text-sm ${isDiscount ? 'text-emerald-600' : 'text-slate-600'} ${isBold ? 'font-semibold' : ''}`}>
                {label}
                {rate !== undefined && (
                    <span className="ml-1.5 text-xs text-slate-400">
                        ({isDiscount ? '−' : ''}{Math.abs(rate).toFixed(1)}%)
                    </span>
                )}
            </Text>
            {tag && <Tag color={tag.color} className="text-xs !m-0">{tag.label}</Tag>}
            {tooltip && (
                <Tooltip title={tooltip}>
                    <HelpCircle size={12} className="text-slate-400 cursor-help" />
                </Tooltip>
            )}
        </div>
        <Text className={`text-sm ${isDiscount ? 'text-emerald-600' : 'text-slate-700'} ${isBold ? 'font-semibold' : 'font-medium'}`}>
            {isDiscount ? '−' : ''}{formatCurrency(Math.abs(amount))}
        </Text>
    </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel?: string;
    className?: string;
}> = ({ icon, label, value, sublabel, className = '' }) => (
    <div className={`rounded-lg border border-slate-200 bg-white p-3 ${className}`}>
        <div className="flex items-center gap-1.5 mb-1">
            {icon}
            <Text className="text-xs text-slate-500 font-medium">{label}</Text>
        </div>
        <Text className="text-lg font-bold text-slate-900 block leading-tight">{value}</Text>
        {sublabel && <Text className="text-xs text-slate-400">{sublabel}</Text>}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const LandedCostCalculator: React.FC = () => {
    const [form] = Form.useForm<FormValues>();
    const [messageApi, contextHolder] = message.useMessage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<LandedCostResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        const hts = searchParams.get('hts');
        const country = searchParams.get('country');
        if (hts || country) {
            const values: Partial<FormValues> = {};
            if (hts) values.htsCode = hts;
            if (country) {
                const upperCountry = country.toUpperCase();
                if (COUNTRY_OPTIONS.some(c => c.value === upperCountry)) {
                    values.countryCode = upperCountry;
                }
            }
            form.setFieldsValue(values);
        }
    }, [searchParams, form]);
    
    const [savedScenarios, setSavedScenarios] = useLocalStorage<SavedScenario[]>(SCENARIOS_STORAGE_KEY, []);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [scenarioName, setScenarioName] = useState('');
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    
    const generateId = () => `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const handleSaveScenario = () => {
        if (!result || !scenarioName.trim()) return;
        const newScenario: SavedScenario = {
            id: generateId(),
            name: scenarioName.trim(),
            savedAt: new Date().toISOString(),
            result,
        };
        setSavedScenarios(prev => [newScenario, ...prev]);
        setSaveModalOpen(false);
        setScenarioName('');
        messageApi.success(`Scenario "${newScenario.name}" saved`);
    };
    
    const handleDeleteScenario = (id: string) => {
        setSavedScenarios(prev => prev.filter(s => s.id !== id));
        setSelectedForCompare(prev => prev.filter(sid => sid !== id));
        messageApi.success('Scenario deleted');
    };
    
    const toggleCompareSelection = (id: string) => {
        setSelectedForCompare(prev => {
            if (prev.includes(id)) return prev.filter(sid => sid !== id);
            if (prev.length >= 3) {
                messageApi.warning('Maximum 3 scenarios can be compared');
                return prev;
            }
            return [...prev, id];
        });
    };
    
    const scenariosToCompare = savedScenarios.filter(s => selectedForCompare.includes(s.id));
    
    const openSaveModal = () => {
        if (!result) return;
        const country = COUNTRY_OPTIONS.find(c => c.value === result.countryCode);
        const defaultName = `${formatHtsCode(result.htsCode)} from ${country?.label.split(' ')[1] || result.countryCode}`;
        setScenarioName(defaultName);
        setSaveModalOpen(true);
    };
    
    const loadScenario = (scenario: SavedScenario) => {
        form.setFieldsValue({
            htsCode: scenario.result.htsCode,
            countryCode: scenario.result.countryCode,
            productValue: scenario.result.productValue,
            quantity: scenario.result.quantity,
            shippingCost: scenario.result.shippingCost,
            insuranceCost: scenario.result.insuranceCost,
            isOceanShipment: scenario.result.isOceanShipment,
        });
        setResult(scenario.result);
        setShowSaved(false);
    };
    
    const handleCalculate = async (values: FormValues) => {
        setIsCalculating(true);
        setError(null);
        setResult(null);
        
        try {
            const response = await fetch('/api/landed-cost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    htsCode: values.htsCode,
                    countryCode: values.countryCode,
                    productValue: values.productValue,
                    quantity: values.quantity,
                    shippingCost: values.shippingCost || 0,
                    insuranceCost: values.insuranceCost || 0,
                    isOceanShipment: values.isOceanShipment ?? true,
                }),
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Calculation failed');
            setResult(data.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to calculate landed cost';
            setError(errorMessage);
            messageApi.error(errorMessage);
        } finally {
            setIsCalculating(false);
        }
    };
    
    const copyTotal = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.totalLandedCost.toFixed(2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    // ─── Derived data ────────────────────────────────────────────────────────

    const dutyAsPercentOfProduct = result 
        ? (result.duties.totalDuty / result.productValue) * 100 
        : 0;

    const marginImpactColor = dutyAsPercentOfProduct > 25 
        ? { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' }
        : dutyAsPercentOfProduct > 10 
            ? { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
            : { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };

    const hasSection301 = result?.tariffBreakdown?.additionalDuties?.some(
        (d: AdditionalDuty) => d.programType === 'section_301'
    );
    const isUSMCA = result?.countryCode === 'MX' || result?.countryCode === 'CA';

    // ─── Compare helpers ─────────────────────────────────────────────────────

    const getDifferenceIndicator = (value: number, baseValue: number) => {
        const diff = value - baseValue;
        const pctDiff = baseValue > 0 ? (diff / baseValue) * 100 : 0;
        if (Math.abs(diff) < 0.01) return null;
        return diff > 0 ? (
            <span className="text-red-600 text-xs flex items-center gap-0.5">
                <ArrowUp size={12} />+${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pctDiff.toFixed(1)}%)
            </span>
        ) : (
            <span className="text-green-600 text-xs flex items-center gap-0.5">
                <ArrowDown size={12} />-${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({Math.abs(pctDiff).toFixed(1)}%)
            </span>
        );
    };
    
    // ─── Render: Compare View ────────────────────────────────────────────────

    const renderComparisonView = () => {
        if (scenariosToCompare.length < 2) {
            return (
                <div className="text-center py-12">
                    <GitCompare size={48} className="mx-auto text-slate-300 mb-4" />
                    <Text className="text-slate-500 block mb-1">Select 2-3 scenarios to compare</Text>
                    <Text className="text-slate-400 text-sm">{selectedForCompare.length} of 2-3 selected</Text>
                </div>
            );
        }
        
        const baseScenario = scenariosToCompare[0];
        
        return (
            <div className="space-y-4">
                <div className={`grid gap-4 ${scenariosToCompare.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                    {scenariosToCompare.map((scenario, idx) => (
                        <div 
                            key={scenario.id} 
                            className={`rounded-lg p-4 border ${idx === 0 ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}
                        >
                            {idx === 0 && <Tag color="teal" className="mb-2">Base Scenario</Tag>}
                            <div className="font-medium text-slate-800 mb-1 truncate" title={scenario.name}>{scenario.name}</div>
                            <div className="text-xs text-slate-500 mb-3">{getCountryFlag(scenario.result.countryCode)} {scenario.result.countryName}</div>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-baseline">
                                    <Text className="text-slate-500 text-sm">Total Duties</Text>
                                    <div className="text-right">
                                        <div className="font-medium text-amber-700">${scenario.result.duties.totalDuty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        {idx > 0 && getDifferenceIndicator(scenario.result.duties.totalDuty, baseScenario.result.duties.totalDuty)}
                                    </div>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <Text className="text-slate-500 text-sm">Duty Rate</Text>
                                    <div className="font-medium">{scenario.result.duties.effectiveRate.toFixed(1)}%</div>
                                </div>
                                <Divider className="!my-1.5" />
                                <div className="flex justify-between items-baseline">
                                    <Text strong className="text-slate-700">Total Landed</Text>
                                    <div className="text-right">
                                        <div className="font-bold text-teal-700 text-lg">${scenario.result.totalLandedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        {idx > 0 && getDifferenceIndicator(scenario.result.totalLandedCost, baseScenario.result.totalLandedCost)}
                                    </div>
                                </div>
                                {scenario.result.quantity > 1 && (
                                    <div className="flex justify-between items-baseline text-sm">
                                        <Text className="text-slate-500">Per Unit</Text>
                                        <div className="text-right">
                                            <div className="font-medium">${scenario.result.perUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            {idx > 0 && getDifferenceIndicator(scenario.result.perUnitCost, baseScenario.result.perUnitCost)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {scenariosToCompare.length >= 2 && (() => {
                    const lowest = [...scenariosToCompare].sort((a, b) => a.result.totalLandedCost - b.result.totalLandedCost)[0];
                    const highest = [...scenariosToCompare].sort((a, b) => b.result.totalLandedCost - a.result.totalLandedCost)[0];
                    const savings = highest.result.totalLandedCost - lowest.result.totalLandedCost;
                    return (
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-sm text-teal-800">
                            <strong>{lowest.name}</strong> has the lowest landed cost — save <strong>${savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> vs {highest.name}.
                        </div>
                    );
                })()}
            </div>
        );
    };

    // ─── Render: Results ─────────────────────────────────────────────────────

    const renderResults = () => {
        if (!result) return null;
        const shippingInsuranceTotal = result.shippingCost + result.insuranceCost;

        return (
            <div className="space-y-5">
                {/* 1. Hero: Total Landed Cost */}
                <div 
                    className="rounded-xl p-5"
                    style={{ background: 'linear-gradient(178deg, #F0FDFA 6%, #F0FDF4 94%)', border: '1px solid #CCFBF1' }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Text className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1.5">
                                Total Landed Cost
                            </Text>
                            <Text className="text-3xl sm:text-4xl font-bold text-slate-900 block">
                                {formatCurrency(result.totalLandedCost)}
                            </Text>
                            {result.quantity > 1 && (
                                <Text className="text-base text-slate-500 mt-0.5 block">
                                    {formatCurrency(result.perUnitCost)} per unit
                                </Text>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                            <Tag color="cyan" className="text-xs mb-1">
                                {getCountryFlag(result.countryCode)} {result.countryName}
                            </Tag>
                            <div className="flex items-center gap-1 text-xs text-slate-400 justify-end mt-1">
                                <Clock size={11} />
                                <span>
                                    {result.tariffBreakdown?.dataFreshness?.includes('Live') 
                                        ? 'Live rates' 
                                        : 'Registry data'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        icon={<Percent size={13} className="text-slate-400" />}
                        label="Effective Rate"
                        value={`${result.duties.effectiveRate.toFixed(1)}%`}
                        sublabel="All tariff layers"
                    />
                    <StatCard
                        icon={<Receipt size={13} className="text-slate-400" />}
                        label="Total Duties"
                        value={formatCurrency(result.duties.totalDuty)}
                        sublabel={`+ ${formatCurrency(result.fees.totalFees)} fees`}
                    />
                    <StatCard
                        icon={<TrendingDown size={13} className={dutyAsPercentOfProduct > 25 ? 'text-red-400' : dutyAsPercentOfProduct > 10 ? 'text-amber-400' : 'text-emerald-400'} />}
                        label="Margin Impact"
                        value={`-${dutyAsPercentOfProduct.toFixed(1)}%`}
                        sublabel="Duties ÷ product value"
                        className={dutyAsPercentOfProduct > 25 ? 'border-red-200' : dutyAsPercentOfProduct > 10 ? 'border-amber-200' : ''}
                    />
                </div>

                {/* 3. Contextual Alerts */}
                {isUSMCA && (
                    <Alert
                        type="success"
                        icon={<CheckCircle size={16} />}
                        message="USMCA Benefits May Apply"
                        description={
                            <div className="flex items-center justify-between">
                                <Text className="text-sm">USMCA-compliant goods may be exempt from <GlossaryTerm term="IEEPA">IEEPA</GlossaryTerm> tariffs.</Text>
                                <Button
                                    type="link" size="small"
                                    onClick={() => router.push(`/dashboard/compliance/fta-calculator?hts=${result.htsCode}&country=${result.countryCode}`)}
                                    icon={<ExternalLink size={12} />}
                                >
                                    Check qualification
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
                        message={<><GlossaryTerm term="Section 301">Section 301</GlossaryTerm> Tariff Applies</>}
                        description="This product is subject to additional tariffs under Section 301 (China trade). Consider sourcing from alternative countries."
                        className="bg-amber-50 border-amber-200"
                    />
                )}

                {/* 4. Cost Breakdown */}
                <Card className="border border-slate-200 shadow-sm !rounded-xl">
                    {/* HTS Code header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                            <Tag className="font-mono text-xs border-0 flex-shrink-0" style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                                {formatHtsCode(result.htsCode)}
                            </Tag>
                            {result.tariffBreakdown?.dataFreshness?.includes('Live') && (
                                <Tag color="green" className="text-xs flex-shrink-0">LIVE</Tag>
                            )}
                            <Text className="text-sm text-slate-500 truncate">{result.htsDescription}</Text>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <CollapsibleSection label="Product & Freight" amount={result.productValue + shippingInsuranceTotal}>
                            <LineItem label="Product Value (FOB)" amount={result.productValue} />
                            {result.shippingCost > 0 && <LineItem label="Shipping" amount={result.shippingCost} />}
                            {result.insuranceCost > 0 && <LineItem label="Insurance" amount={result.insuranceCost} />}
                        </CollapsibleSection>

                        <Divider className="!my-2" />

                        <CollapsibleSection 
                            label={`Duties & Tariffs (${result.duties.effectiveRate.toFixed(1)}%)`}
                            amount={result.duties.totalDuty}
                        >
                            <Text className="text-xs text-slate-400 block mb-2">Applied to entered value (FOB)</Text>
                            <LineItem 
                                label={<>Base <GlossaryTerm term="MFN">MFN</GlossaryTerm> Rate</>} 
                                amount={result.duties.baseMfn} 
                                rate={result.duties.baseMfnRate}
                            />
                            {result.tariffBreakdown?.additionalDuties?.map((duty: AdditionalDuty, idx: number) => (
                                <LineItem
                                    key={idx}
                                    label={duty.programName}
                                    amount={result.productValue * ((duty.rate.numericRate ?? 0) / 100)}
                                    rate={duty.rate.numericRate}
                                    tag={{ 
                                        label: duty.programType === 'section_301' ? '301' 
                                            : duty.programType === 'ieepa_fentanyl' || duty.programType === 'ieepa_reciprocal' ? 'IEEPA'
                                            : duty.programType === 'section_232' ? '232' 
                                            : duty.programType,
                                        color: PROGRAM_COLORS[duty.programType] || 'default',
                                    }}
                                    tooltip={duty.description}
                                />
                            ))}
                            <div className="border-t border-slate-200 pt-2 mt-2">
                                <LineItem label="Effective Tariff Total" amount={result.duties.totalDuty} isBold />
                            </div>
                        </CollapsibleSection>

                        <Divider className="!my-2" />

                        <CollapsibleSection label="Customs Fees" amount={result.fees.totalFees}>
                            <LineItem 
                                label={<><GlossaryTerm term="MPF">MPF</GlossaryTerm> (0.3464%)</>} 
                                amount={result.fees.mpf}
                                tooltip="Merchandise Processing Fee: 0.3464% of value, min $33.58, max $651.50"
                            />
                            <LineItem 
                                label={
                                    result.isOceanShipment 
                                        ? <><GlossaryTerm term="HMF">HMF</GlossaryTerm> (0.125%)</> 
                                        : <><GlossaryTerm term="HMF">HMF</GlossaryTerm> (Air — N/A)</>
                                }
                                amount={result.fees.hmf}
                                tooltip="Harbor Maintenance Fee: 0.125% of value (ocean shipments only)"
                            />
                        </CollapsibleSection>
                    </div>

                    {result.tariffBreakdown?.adcvdWarning?.isCountryAffected && (
                        <Alert
                            type="error" showIcon icon={<AlertTriangle size={16} />} className="mt-4"
                            message={<span className="font-semibold text-sm"><GlossaryTerm term="AD/CVD">AD/CVD</GlossaryTerm> Orders May Apply</span>}
                            description={
                                <a href={result.tariffBreakdown.adcvdWarning.lookupUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    Check AD/CVD Orders <ExternalLink size={12} />
                                </a>
                            }
                        />
                    )}
                </Card>

                {/* 5. Additional Costs Note */}
                <div className="flex items-start gap-2 px-1 text-xs text-slate-400">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                        Not included: customs broker ($150–$400) and drayage ($200–$600).
                        Add to shipping for a more complete total.
                    </span>
                </div>

                {/* 6. Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="primary" icon={<Save size={14} />} onClick={openSaveModal}
                        style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', border: 'none' }}
                    >
                        Save
                    </Button>
                    <Button type="default" icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={copyTotal}>
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                        type="default"
                        onClick={() => router.push(`/dashboard/compliance/fta-calculator?hts=${result.htsCode}&country=${result.countryCode}`)}
                    >
                        Check <GlossaryTerm term="FTA">FTA</GlossaryTerm>
                    </Button>
                    <div className="flex-1" />
                    <div className="flex gap-3">
                        <Button type="link" size="small" className="!text-slate-400 hover:!text-teal-600 !px-0 !text-xs"
                            onClick={() => router.push(`/dashboard/compliance/fta-rules?hts=${result.htsCode}`)}>
                            FTA Rules
                        </Button>
                        <Button type="link" size="small" className="!text-slate-400 hover:!text-teal-600 !px-0 !text-xs"
                            onClick={() => router.push('/dashboard/compliance/tariff-tracker')}>
                            Tariff Tracker
                        </Button>
                        <Button type="link" size="small" className="!text-slate-400 hover:!text-teal-600 !px-0 !text-xs"
                            onClick={() => router.push('/dashboard/intelligence/trade-stats')}>
                            Trade Stats
                        </Button>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-slate-400 px-1">
                    Rates for informational purposes. Verify with CBP before import.
                    {result.tariffBreakdown?.dataFreshness?.includes('Live') && (
                        <span className="text-green-600 ml-2">✓ Live from USITC</span>
                    )}
                </div>
            </div>
        );
    };
    
    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {contextHolder}
            
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                            <Calculator className="text-white" size={20} />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>Landed Cost Calculator</Title>
                            <Text className="text-slate-500">Full duty breakdown for any HTS code and country</Text>
                        </div>
                    </div>
                    {savedScenarios.length >= 2 && !compareMode && (
                        <Button type="default" icon={<GitCompare size={16} />}
                            onClick={() => { setCompareMode(true); setSelectedForCompare([]); }}>
                            Compare Scenarios
                        </Button>
                    )}
                    {compareMode && (
                        <Button type="primary" icon={<X size={16} />}
                            onClick={() => { setCompareMode(false); setSelectedForCompare([]); }}
                            style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' }}>
                            Exit Compare
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Compare Mode */}
            {compareMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="border border-slate-200 shadow-sm lg:col-span-1">
                        <div className="flex items-center justify-between mb-3">
                            <Text strong className="text-slate-700 text-sm">Select Scenarios</Text>
                            <Badge count={selectedForCompare.length} showZero color="cyan" />
                        </div>
                        <div className="space-y-2">
                            {savedScenarios.map(scenario => (
                                <div key={scenario.id} onClick={() => toggleCompareSelection(scenario.id)}
                                    className={`p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                                        selectedForCompare.includes(scenario.id)
                                            ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-200'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="font-medium text-slate-800 truncate">{scenario.name}</div>
                                            <div className="text-xs text-slate-500">{getCountryFlag(scenario.result.countryCode)} ${scenario.result.totalLandedCost.toLocaleString()}</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            selectedForCompare.includes(scenario.id) ? 'bg-teal-600 border-teal-600' : 'border-slate-300'
                                        }`}>
                                            {selectedForCompare.includes(scenario.id) && (
                                                <span className="text-white text-xs font-bold">{selectedForCompare.indexOf(scenario.id) + 1}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <div className="lg:col-span-3">{renderComparisonView()}</div>
                </div>
            ) : (
                /* ─── Normal: 2-column layout ─────────────────────────── */
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Form */}
                    <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-4">
                        <Card className="border border-slate-200 shadow-sm !rounded-xl">
                            <Form form={form} layout="vertical" onFinish={handleCalculate}
                                initialValues={{ quantity: 1, shippingCost: 0, insuranceCost: 0, isOceanShipment: true }}>
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package size={15} className="text-teal-600" />
                                        <Text strong className="text-slate-700 text-sm">Product</Text>
                                    </div>
                                    <Form.Item name="htsCode" label="HTS Code"
                                        rules={[{ required: true, message: 'Required' }, { pattern: /^[\d.]+$/, message: 'Digits and dots only' }]}
                                        tooltip="6-10 digit HTS classification code">
                                        <Input placeholder="e.g., 6109.10.00.12" className="font-mono" maxLength={14} />
                                    </Form.Item>
                                    <Form.Item name="countryCode"
                                        label={<GlossaryTerm term="Country of Origin">Country of Origin</GlossaryTerm>}
                                        rules={[{ required: true, message: 'Required' }]}>
                                        <Select showSearch placeholder="Select country" options={COUNTRY_OPTIONS}
                                            filterOption={(input, option) => (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())} />
                                    </Form.Item>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Form.Item name="productValue" label="Value (USD)"
                                            rules={[{ required: true, message: 'Required' }, { type: 'number', min: 0.01, message: '> $0' }]}>
                                            <InputNumber<number> prefix="$" style={{ width: '100%' }} placeholder="10,000" min={0.01} step={100} />
                                        </Form.Item>
                                        <Form.Item name="quantity" label="Quantity"
                                            rules={[{ required: true, message: 'Required' }, { type: 'number', min: 1, message: '≥ 1' }]}>
                                            <InputNumber<number> style={{ width: '100%' }} placeholder="1,000" min={1} step={1} />
                                        </Form.Item>
                                    </div>
                                </div>
                                
                                <Divider className="!my-3" />
                                
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Ship size={15} className="text-teal-600" />
                                        <Text strong className="text-slate-700 text-sm">Shipping</Text>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Form.Item name="shippingCost" label="Freight (USD)" className="!mb-2">
                                            <InputNumber<number> prefix="$" style={{ width: '100%' }} placeholder="500" min={0} step={50} />
                                        </Form.Item>
                                        <Form.Item name="insuranceCost" label="Insurance (USD)" className="!mb-2">
                                            <InputNumber<number> prefix="$" style={{ width: '100%' }} placeholder="100" min={0} step={25} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item name="isOceanShipment" className="!mb-0"
                                        getValueFromEvent={(val: string) => val === 'ocean'}
                                        getValueProps={(val: boolean) => ({ value: val !== false ? 'ocean' : 'air' })}>
                                        <Select size="small" options={[
                                            { value: 'ocean', label: 'Ocean (includes HMF)' },
                                            { value: 'air', label: 'Air (no HMF)' },
                                        ]} />
                                    </Form.Item>
                                </div>
                                
                                <Button type="primary" htmlType="submit" loading={isCalculating} icon={<Calculator size={16} />}
                                    size="large" className="w-full"
                                    style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', height: 44 }}>
                                    Calculate Landed Cost
                                </Button>
                                <div className="mt-2 text-center">
                                    <Button type="link" size="small" className="!text-slate-400 hover:!text-teal-600 !text-xs"
                                        onClick={() => router.push('/dashboard/import/analyze')}>
                                        Don&apos;t know your HTS code? Classify first →
                                    </Button>
                                </div>
                            </Form>
                        </Card>

                        {/* Saved Scenarios — compact collapsible */}
                        {savedScenarios.length > 0 && (
                            <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                                <button onClick={() => setShowSaved(!showSaved)}
                                    className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Bookmark size={14} className="text-teal-600" />
                                        <Text className="text-sm font-medium text-slate-700">Saved Scenarios</Text>
                                        <Badge count={savedScenarios.length} color="cyan" className="ml-1" />
                                    </div>
                                    {showSaved ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                </button>
                                {showSaved && (
                                    <div className="px-3 pb-3 space-y-1.5 max-h-[300px] overflow-y-auto">
                                        {savedScenarios.map(scenario => (
                                            <div key={scenario.id}
                                                className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-all group cursor-pointer"
                                                onClick={() => loadScenario(scenario)}>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-slate-700 truncate">{scenario.name}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {getCountryFlag(scenario.result.countryCode)} {formatCurrency(scenario.result.totalLandedCost)} · {scenario.result.duties.effectiveRate.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Popconfirm title="Delete?" onConfirm={(e) => { e?.stopPropagation(); handleDeleteScenario(scenario.id); }}
                                                        okText="Delete" cancelText="No" okButtonProps={{ danger: true }}>
                                                        <Button type="text" size="small" danger icon={<Trash2 size={12} />}
                                                            onClick={e => e.stopPropagation()} />
                                                    </Popconfirm>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Results */}
                    <div className="flex-1 min-w-0">
                        {isCalculating && (
                            <Card className="border border-slate-200 shadow-sm !rounded-xl">
                                <LoadingState message="Calculating landed cost..." />
                            </Card>
                        )}
                        
                        {error && !isCalculating && (
                            <Alert type="error" message="Calculation Error" description={error} showIcon />
                        )}
                        
                        {result && !isCalculating && renderResults()}
                        
                        {!result && !isCalculating && !error && (
                            <div className="border border-dashed border-slate-200 rounded-xl bg-white p-12 text-center">
                                <DollarSign size={48} className="mx-auto text-slate-200 mb-4" />
                                <Text className="text-slate-500 block mb-1 text-base">
                                    Enter product details and calculate
                                </Text>
                                <Text className="text-slate-400 text-sm">
                                    Full duty breakdown with individual tariff layers
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Save Scenario Modal */}
            <Modal
                title={<div className="flex items-center gap-2"><Save size={18} className="text-teal-600" /><span>Save Scenario</span></div>}
                open={saveModalOpen}
                onOk={handleSaveScenario}
                onCancel={() => { setSaveModalOpen(false); setScenarioName(''); }}
                okText="Save"
                okButtonProps={{
                    disabled: !scenarioName.trim(),
                    style: { background: scenarioName.trim() ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' : undefined }
                }}>
                <div className="py-4">
                    <Text className="text-slate-600 block mb-2">Give this scenario a name:</Text>
                    <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)}
                        placeholder="e.g., China Option A, Vietnam Bulk Order" maxLength={100} autoFocus
                        onPressEnter={() => { if (scenarioName.trim()) handleSaveScenario(); }} />
                    {result && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-mono text-sm">{formatHtsCode(result.htsCode)}</div>
                                    <div className="text-xs text-slate-500">{getCountryFlag(result.countryCode)} {result.countryName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-teal-700">${result.totalLandedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div className="text-xs text-slate-500">{result.duties.effectiveRate.toFixed(1)}% duty</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
