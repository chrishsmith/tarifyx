'use client';

import React, { useState } from 'react';
import { Steps, Card, Button, Input, Typography, message, Select } from 'antd';
import { Search, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/LoadingState';
import { COUNTRY_OPTIONS } from '@/components/shared/constants';
import { formatHtsCode } from '@/utils/htsFormatting';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const EXAMPLE_PRODUCTS = [
    'Women\'s cotton t-shirt, crew neck, short sleeve, knitted',
    'Stainless steel water bottle, double wall insulated, 500ml',
    'Wireless Bluetooth earbuds with charging case, lithium battery',
    'Ceramic dinner plates, white glazed, set of 4',
    'Men\'s leather wallet, bifold, genuine cowhide',
];

interface ClassificationResult {
    code: string;
    description: string;
    confidence: number;
    splitConfidence?: {
        heading: number;
        code: number;
        combined: number;
        headingExplanation?: string;
        codeExplanation?: string;
    };
    alternatives?: Array<{ code: string; description: string; confidence: number }>;
}

export const OnboardingWizard: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [productDesc, setProductDesc] = useState('');
    const [countryCode, setCountryCode] = useState('CN');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ClassificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAnalyze = async () => {
        if (!productDesc.trim()) {
            message.error('Please enter a product description');
            return;
        }
        setLoading(true);
        setError(null);
        setCurrent(1);

        try {
            const response = await fetch('/api/classify-v10', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productDescription: productDesc.trim(),
                    countryOfOrigin: countryCode,
                }),
            });

            if (!response.ok) {
                throw new Error('Classification failed');
            }

            const data = await response.json();
            if (data.success && data.result) {
                setResult({
                    code: data.result.code || data.result.htsCode,
                    description: data.result.description || data.result.htsDescription,
                    confidence: data.result.confidence,
                    splitConfidence: data.result.splitConfidence,
                    alternatives: data.result.alternatives?.slice(0, 3),
                });
                setCurrent(2);
            } else {
                throw new Error(data.error || 'No classification result');
            }
        } catch (err) {
            console.error('[OnboardingWizard] Classification error:', err);
            setError('Classification failed. You can try again or skip to the dashboard.');
            setCurrent(0);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Describe Product',
            icon: <Search size={20} />,
            content: (
                <div className="py-6">
                    <div className="text-center mb-8">
                        <Title level={4}>Let&apos;s classify your first product</Title>
                        <Paragraph type="secondary">
                            Describe your product and we&apos;ll find the correct HTS code using AI.
                        </Paragraph>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Text strong className="block mb-2 text-slate-700">Product Description</Text>
                            <TextArea
                                rows={3}
                                placeholder="E.g., Women's cotton t-shirt with screen print, knitted, 100% cotton..."
                                value={productDesc}
                                onChange={(e) => setProductDesc(e.target.value)}
                                className="rounded-xl border-slate-200 focus:border-teal-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Text type="secondary" className="text-xs w-full">Try an example:</Text>
                            {EXAMPLE_PRODUCTS.map((example, i) => (
                                <Button
                                    key={i}
                                    size="small"
                                    type="dashed"
                                    onClick={() => setProductDesc(example)}
                                    className="text-xs text-slate-600"
                                >
                                    {example.length > 45 ? example.slice(0, 45) + '...' : example}
                                </Button>
                            ))}
                        </div>

                        <div>
                            <Text strong className="block mb-2 text-slate-700">Country of Origin</Text>
                            <Select
                                showSearch
                                value={countryCode}
                                onChange={setCountryCode}
                                options={COUNTRY_OPTIONS}
                                optionFilterProp="label"
                                className="w-full"
                                placeholder="Select country"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <Text className="text-red-700 text-sm">{error}</Text>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'AI Analysis',
            icon: <Search size={20} />,
            content: (
                <div className="py-16">
                    <LoadingState message="Analyzing your product against 27,000+ HTS codes..." />
                </div>
            ),
        },
        {
            title: 'Results',
            icon: <CheckCircle size={20} />,
            content: result ? (
                <div className="py-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 mb-3">
                            <CheckCircle size={24} className="text-teal-600" />
                        </div>
                        <Title level={4} className="!mb-1">Classification Complete</Title>
                        <Text type="secondary">Here&apos;s what we found for your product.</Text>
                    </div>

                    <Card className="bg-slate-50 border-slate-200 shadow-sm mb-4">
                        <div className="space-y-2">
                            <Text type="secondary" className="text-xs uppercase font-bold tracking-wide">HTS Code</Text>
                            <div className="text-2xl font-bold text-teal-700">{formatHtsCode(result.code)}</div>
                            <Text className="text-slate-600">{result.description}</Text>
                            <div className="pt-2 flex gap-2 flex-wrap">
                                <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-medium">
                                    {result.confidence}% Confidence
                                </span>
                                {result.splitConfidence && (
                                    <>
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                                            Heading: {result.splitConfidence.heading}%
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                                            Subheading: {result.splitConfidence.code}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    {result.alternatives && result.alternatives.length > 0 && (
                        <div className="mb-4">
                            <Text type="secondary" className="text-xs uppercase font-bold tracking-wide block mb-2">
                                Alternatives
                            </Text>
                            {result.alternatives.map((alt, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                    <div>
                                        <Text className="font-mono text-sm">{formatHtsCode(alt.code)}</Text>
                                        <Text type="secondary" className="text-xs block">{alt.description}</Text>
                                    </div>
                                    <Text type="secondary" className="text-xs">{alt.confidence}%</Text>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null,
        },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Steps
                current={current}
                items={steps.map(s => ({ title: s.title, icon: s.icon }))}
                className="mb-8"
            />

            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="min-h-[400px] flex flex-col justify-between">
                    {steps[current].content}

                    <div className="flex justify-between pt-6 border-t border-slate-100">
                        <div>
                            {current === 2 && (
                                <Button
                                    onClick={() => {
                                        setCurrent(0);
                                        setResult(null);
                                        setProductDesc('');
                                    }}
                                >
                                    Classify Another
                                </Button>
                            )}
                        </div>
                        <div>
                            {current === 0 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleAnalyze}
                                    loading={loading}
                                    className="bg-teal-600 hover:bg-teal-500"
                                    icon={<ArrowRight size={18} />}
                                >
                                    Analyze Product
                                </Button>
                            )}
                            {current === 2 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => router.push('/dashboard/import/analyze')}
                                    className="bg-teal-600 hover:bg-teal-500"
                                >
                                    Go to Full Analysis
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {current === 0 && (
                <div className="mt-8 text-center">
                    <Button type="text" onClick={() => router.push('/dashboard')}>Skip to dashboard</Button>
                </div>
            )}
        </div>
    );
};
