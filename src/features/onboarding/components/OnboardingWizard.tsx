'use client';

import React, { useState } from 'react';
import { Steps, Card, Button, Input, Typography, Result, message, Tag, Select, Progress } from 'antd';
import { LoadingState } from '@/components/shared/LoadingState';
import { Sparkles, Search, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/** Response shape from /api/classify-v10 */
interface ClassificationResult {
    htsCode: string;
    description: string;
    confidence: number;
    dutyRate?: string;
    splitConfidence?: {
        heading: number;
        code: number;
        combined: number;
        headingExplanation?: string;
        codeExplanation?: string;
    };
    alternatives?: Array<{
        htsCode: string;
        description: string;
        confidence: number;
        dutyRate?: string;
    }>;
}

const EXAMPLE_PRODUCTS = [
    "Women's cotton t-shirt with screen print, knitted, 100% cotton",
    'Stainless steel water bottle, double-wall vacuum insulated, 750ml',
    'Wireless Bluetooth earbuds with charging case, lithium battery',
    'Ceramic coffee mug, hand-painted, microwave safe, 12 oz',
    'LED desk lamp with USB charging port, adjustable arm, aluminum',
];

export const OnboardingWizard: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [productDesc, setProductDesc] = useState('');
    const [origin, setOrigin] = useState('CN');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ClassificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAnalyze = async () => {
        const desc = productDesc.trim();
        if (!desc) {
            message.error('Please enter a product description');
            return;
        }

        setCurrent(1);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/classify-v10', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: desc,
                    origin,
                    destination: 'US',
                    saveToHistory: true,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Classification failed (${response.status})`);
            }

            const data = await response.json();

            if (!data.success || !data.data) {
                throw new Error(data.error || 'No classification result returned');
            }

            setResult(data.data);
            setCurrent(2);
        } catch (err) {
            console.error('[OnboardingWizard] classify_error', { ts: new Date().toISOString(), error: err });
            setError(err instanceof Error ? err.message : 'Classification failed');
            setCurrent(2);
        } finally {
            setLoading(false);
        }
    };

    /** Format HTS code with dots for display (e.g. 6109100012 → 6109.10.00.12) */
    const formatHtsCode = (code: string): string => {
        const c = code.replace(/\./g, '');
        if (c.length <= 4) return c;
        let formatted = c.slice(0, 4) + '.' + c.slice(4, 6);
        if (c.length > 6) formatted += '.' + c.slice(6, 8);
        if (c.length > 8) formatted += '.' + c.slice(8);
        return formatted;
    };

    const confidenceColor = (pct: number) => {
        if (pct >= 80) return '#0D9488';
        if (pct >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const steps = [
        {
            title: 'Describe Product',
            icon: <Sparkles size={20} />,
        },
        {
            title: 'AI Analysis',
            icon: <Search size={20} />,
        },
        {
            title: 'Results',
            icon: <CheckCircle size={20} />,
        },
    ];

    const renderStep0 = () => (
        <div className="py-8">
            <div className="text-center mb-8">
                <Title level={4} style={{ color: '#0F172A' }}>Classify your first product</Title>
                <Paragraph type="secondary">
                    Describe any product and our AI will find the correct HTS code in seconds.
                </Paragraph>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Description</label>
                    <TextArea
                        rows={4}
                        placeholder="E.g., Women's cotton t-shirt with screen print, knitted, 100% cotton..."
                        value={productDesc}
                        onChange={(e) => setProductDesc(e.target.value)}
                        className="rounded-lg border-slate-200 focus:border-teal-500"
                        maxLength={500}
                        showCount
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Country of Origin</label>
                    <Select
                        value={origin}
                        onChange={setOrigin}
                        className="w-full"
                        options={[
                            { value: 'CN', label: 'China' },
                            { value: 'VN', label: 'Vietnam' },
                            { value: 'IN', label: 'India' },
                            { value: 'MX', label: 'Mexico' },
                            { value: 'BD', label: 'Bangladesh' },
                            { value: 'TW', label: 'Taiwan' },
                            { value: 'KR', label: 'South Korea' },
                            { value: 'DE', label: 'Germany' },
                            { value: 'JP', label: 'Japan' },
                            { value: 'IT', label: 'Italy' },
                        ]}
                        showSearch
                        optionFilterProp="label"
                    />
                </div>

                {/* Example suggestions */}
                <div>
                    <Text type="secondary" className="text-xs mb-2 block">Try an example:</Text>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLE_PRODUCTS.slice(0, 3).map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => setProductDesc(ex)}
                                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-full transition-colors"
                            >
                                {ex.length > 40 ? ex.slice(0, 40) + '…' : ex}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="py-16 text-center">
            <LoadingState size="large" message="Classifying your product..." />
            <Text type="secondary" className="block mt-2">Searching 27K+ HTS codes with AI analysis</Text>
        </div>
    );

    const renderStep2 = () => {
        if (error) {
            return (
                <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-amber-500" />
                    </div>
                    <Title level={4} style={{ color: '#0F172A' }}>Classification couldn&apos;t complete</Title>
                    <Text type="secondary" className="block mb-6">{error}</Text>
                    <Button
                        type="primary"
                        onClick={() => { setCurrent(0); setError(null); }}
                        className="bg-teal-600 hover:bg-teal-700 border-none"
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        if (!result) return null;

        const conf = result.splitConfidence?.combined ?? result.confidence;
        const confPct = Math.round(conf);

        return (
            <div className="py-6">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={28} className="text-teal-600" />
                    </div>
                    <Title level={4} style={{ color: '#0F172A', marginBottom: 4 }}>Classification Complete</Title>
                    <Text type="secondary">Here&apos;s what we found for your product.</Text>
                </div>

                {/* Primary result */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <Text type="secondary" className="text-xs uppercase font-semibold tracking-wide block mb-1">HTS Code</Text>
                            <div className="text-2xl font-bold font-mono text-teal-700">
                                {formatHtsCode(result.htsCode)}
                            </div>
                        </div>
                        <div className="text-right">
                            <Progress
                                type="circle"
                                percent={confPct}
                                size={52}
                                strokeColor={confidenceColor(confPct)}
                                format={(pct) => <span className="text-xs font-semibold">{pct}%</span>}
                            />
                        </div>
                    </div>
                    <Text className="text-slate-600 text-sm block mb-3">{result.description}</Text>
                    <div className="flex flex-wrap gap-2">
                        {result.dutyRate && (
                            <Tag className="border-slate-200 text-slate-600">Duty: {result.dutyRate}</Tag>
                        )}
                        {result.splitConfidence && (
                            <>
                                <Tag color="cyan">Heading: {result.splitConfidence.heading}%</Tag>
                                <Tag color="blue">Code: {result.splitConfidence.code}%</Tag>
                            </>
                        )}
                    </div>
                </div>

                {/* Alternatives */}
                {result.alternatives && result.alternatives.length > 0 && (
                    <div className="mb-2">
                        <Text type="secondary" className="text-xs uppercase font-semibold tracking-wide block mb-2">Alternatives</Text>
                        <div className="space-y-2">
                            {result.alternatives.slice(0, 2).map((alt, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-lg">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <Text className="font-mono text-sm font-medium text-slate-700">{formatHtsCode(alt.htsCode)}</Text>
                                        <Text type="secondary" className="text-xs block truncate">{alt.description}</Text>
                                    </div>
                                    <Tag className="flex-shrink-0 border-slate-200 text-slate-500">{Math.round(alt.confidence)}%</Tag>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Steps
                current={current}
                items={steps.map(s => ({ title: s.title, icon: s.icon }))}
                className="mb-8"
            />

            <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
                <div className="min-h-[400px] flex flex-col justify-between">
                    {current === 0 && renderStep0()}
                    {current === 1 && renderStep1()}
                    {current === 2 && renderStep2()}

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        {current === 0 && (
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleAnalyze}
                                loading={loading}
                                disabled={!productDesc.trim()}
                                className="bg-teal-600 hover:bg-teal-700 border-none shadow-sm"
                                icon={<ArrowRight size={18} />}
                            >
                                Classify Product
                            </Button>
                        )}
                        {current === 2 && !error && (
                            <div className="flex gap-3">
                                <Button
                                    size="large"
                                    onClick={() => { setCurrent(0); setProductDesc(''); setResult(null); }}
                                    className="border-slate-200"
                                >
                                    Classify Another
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-teal-600 hover:bg-teal-700 border-none"
                                    icon={<ArrowRight size={18} />}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {current === 0 && (
                <div className="mt-6 text-center">
                    <Button type="text" onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-slate-600">
                        Skip — go straight to dashboard
                    </Button>
                </div>
            )}
        </div>
    );
};
