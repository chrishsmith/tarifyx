'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Tag } from 'antd';
import { LoadingState } from '@/components/shared/LoadingState';
import {
    Sparkles,
    Calculator,
    Globe,
    ChevronRight,
    Clock,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { TariffIntelligenceCard } from './TariffIntelligenceCard';

const { Title, Text } = Typography;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface RecentClassification {
    id: string;
    description: string;
    htsCode: string | null;
    countryCode: string | null;
    createdAt: string;
    confidence?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTION CARDS
// ═══════════════════════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
    {
        title: 'Classify Product',
        description: 'Get the HTS code for any product with AI',
        icon: Sparkles,
        href: '/dashboard/import/analyze',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
    },
    {
        title: 'Calculate Landed Cost',
        description: 'Full tariff breakdown: MFN + 301 + IEEPA + fees',
        icon: Calculator,
        href: '/dashboard/duties/calculator',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
    {
        title: 'Compare Countries',
        description: 'Find the cheapest country to source from',
        icon: Globe,
        href: '/dashboard/optimizer',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
    },
] as const;

const QuickActionCard: React.FC<typeof QUICK_ACTIONS[number]> = ({
    title,
    description,
    icon: Icon,
    href,
    color,
    bg,
}) => (
    <Link href={href} className="block h-full">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 h-full hover:shadow-md hover:border-slate-300 transition-all duration-200 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon size={22} className={color} />
                </div>
                <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                />
            </div>
            <Title level={5} className="!mb-1 !text-slate-900">{title}</Title>
            <Text className="text-slate-500 text-sm">{description}</Text>
        </div>
    </Link>
);

// ═══════════════════════════════════════════════════════════════════════════════
// RECENT CLASSIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const RecentClassificationsCard: React.FC = () => {
    const [items, setItems] = useState<RecentClassification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/search-history?limit=5');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setItems(data.items || []);
            } catch (err) {
                console.error('[DashboardOverview] recent_fetch_failed', {
                    ts: new Date().toISOString(),
                    error: err,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    if (loading) {
        return (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
                <LoadingState message="Loading recent activity..." />
            </div>
        );
    }

    // Empty state — new user, no classifications yet
    if (items.length === 0) {
        return (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
                <div className="text-center py-8">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={28} className="text-teal-600" />
                    </div>
                    <Title level={5} className="!mb-2 !text-slate-900">
                        No classifications yet
                    </Title>
                    <Text className="text-slate-500 block mb-5">
                        Classify your first product to see results here.
                    </Text>
                    <Link href="/dashboard/import/analyze">
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
                            <Sparkles size={16} />
                            Classify a Product
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <Title level={5} className="!m-0">Recent Classifications</Title>
                <Link
                    href="/dashboard/import/analyze"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                    View all <ChevronRight size={14} />
                </Link>
            </div>

            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="px-6 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <Text className="block truncate text-sm font-medium text-slate-800">
                                    {item.description}
                                </Text>
                                <div className="flex items-center gap-2 mt-1">
                                    {item.htsCode && (
                                        <Tag className="!m-0 font-mono text-xs border-slate-200 text-slate-600">
                                            {item.htsCode}
                                        </Tag>
                                    )}
                                    {item.countryCode && (
                                        <Text type="secondary" className="text-xs">
                                            {item.countryCode}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                                <Clock size={12} />
                                <Text type="secondary" className="text-xs whitespace-nowrap">
                                    {formatTimeAgo(item.createdAt)}
                                </Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatTimeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const DashboardOverview = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Title level={2} style={{ margin: 0, color: '#0F172A' }}>Dashboard</Title>
                <Text className="text-slate-500 text-lg">
                    Classify products, calculate costs, and optimize your imports.
                </Text>
            </div>

            {/* Quick Actions */}
            <Row gutter={[24, 24]}>
                {QUICK_ACTIONS.map((action) => (
                    <Col xs={24} md={8} key={action.href}>
                        <QuickActionCard {...action} />
                    </Col>
                ))}
            </Row>

            {/* Bottom Row: Recent + Tariff Intelligence */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <RecentClassificationsCard />
                </Col>
                <Col xs={24} lg={10}>
                    <TariffIntelligenceCard
                        className="bg-white border border-slate-200 shadow-sm rounded-xl"
                    />
                </Col>
            </Row>
        </div>
    );
};
