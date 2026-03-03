'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag } from 'antd';
import { ShieldCheck, TrendingDown, DollarSign, Globe, Package, Search, Calculator, Shield, ArrowRight } from 'lucide-react';
import { TariffIntelligenceCard } from './TariffIntelligenceCard';
import { LoadingState } from '@/components/shared/LoadingState';
import Link from 'next/link';

const { Title, Text } = Typography;

interface DashboardStats {
    totalProducts: number;
    monitoredProducts: number;
    recentSearches: number;
    avgDutyRate: number | null;
}

export const DashboardOverview = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [productsRes, historyRes] = await Promise.all([
                    fetch('/api/saved-products?includeStats=true&limit=1'),
                    fetch('/api/search-history'),
                ]);

                const productsData = productsRes.ok ? await productsRes.json() : null;
                const historyData = historyRes.ok ? await historyRes.json() : null;

                const totalProducts = productsData?.pagination?.total || 0;
                const monitoredProducts = productsData?.stats?.monitoredCount || 0;
                const recentSearches = historyData?.history?.length || 0;

                let avgDutyRate: number | null = null;
                if (productsData?.stats?.avgTariffRate) {
                    avgDutyRate = productsData.stats.avgTariffRate;
                }

                setStats({ totalProducts, monitoredProducts, recentSearches, avgDutyRate });
            } catch (err) {
                console.error('[DashboardOverview] Failed to fetch stats:', err);
                setStats({ totalProducts: 0, monitoredProducts: 0, recentSearches: 0, avgDutyRate: null });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const isNewUser = stats && stats.totalProducts === 0 && stats.recentSearches === 0;

    if (loading) {
        return <LoadingState message="Loading dashboard..." />;
    }

    if (isNewUser) {
        return (
            <div className="flex flex-col gap-8">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#0F172A' }}>Welcome to Tarifyx</Title>
                    <Text className="text-slate-500 text-lg">Get started by classifying your first product.</Text>
                </div>

                <Row gutter={[20, 20]}>
                    {[
                        { step: '1', title: 'Classify a Product', description: 'Enter a product description and get the correct HTS code using AI.', icon: <Search size={24} />, href: '/dashboard/import/analyze' },
                        { step: '2', title: 'Calculate Landed Cost', description: 'See the full duty breakdown including MFN, Section 301, IEEPA, and fees.', icon: <Calculator size={24} />, href: '/dashboard/duties/calculator' },
                        { step: '3', title: 'Check Compliance', description: 'Screen suppliers against denied party lists and check AD/CVD orders.', icon: <Shield size={24} />, href: '/dashboard/compliance/denied-party' },
                        { step: '4', title: 'Monitor Changes', description: 'Save products and get notified when tariff rates change.', icon: <Globe size={24} />, href: '/dashboard/products' },
                    ].map((item) => (
                        <Col xs={24} sm={12} lg={6} key={item.step}>
                            <Link href={item.href}>
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-full hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-sm font-bold">
                                            {item.step}
                                        </div>
                                        <div className="text-teal-600">{item.icon}</div>
                                    </div>
                                    <Text strong className="block text-slate-800 mb-1">{item.title}</Text>
                                    <Text type="secondary" className="text-sm">{item.description}</Text>
                                    <div className="mt-3 flex items-center text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Get started <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <TariffIntelligenceCard className="bg-white border border-slate-200 rounded-xl shadow-sm" />
            </div>
        );
    }

    const statCards = [
        { title: 'Saved Products', value: stats?.totalProducts || 0, prefix: <Package size={20} />, color: '#0D9488', bg: 'bg-teal-50' },
        { title: 'Recent Searches', value: stats?.recentSearches || 0, prefix: <ShieldCheck size={20} />, color: '#0D9488', bg: 'bg-teal-50' },
        { title: 'Monitored', value: stats?.monitoredProducts || 0, prefix: <Globe size={20} />, color: '#0D9488', bg: 'bg-teal-50' },
        { title: 'Avg. Duty Rate', value: stats?.avgDutyRate != null ? `${stats.avgDutyRate.toFixed(1)}%` : 'N/A', prefix: <TrendingDown size={20} />, color: '#F59E0B', bg: 'bg-amber-50' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <Title level={2} style={{ margin: 0, color: '#0F172A' }}>Overview</Title>
                <Text className="text-slate-500 text-lg">Your trade intelligence at a glance.</Text>
            </div>

            <Row gutter={[20, 20]}>
                {statCards.map((stat, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <span style={{ color: stat.color }}>{stat.prefix}</span>
                                </div>
                            </div>
                            <Statistic
                                title={<Text className="text-slate-500 font-medium">{stat.title}</Text>}
                                value={stat.value}
                                styles={{ content: { fontWeight: 700, color: '#1E293B', fontSize: '1.75rem' } }}
                            />
                        </div>
                    </Col>
                ))}
            </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="mb-4">
                            <Title level={4} style={{ margin: 0 }}>Quick Actions</Title>
                            <Text type="secondary">Jump to the tools you use most.</Text>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { label: 'Classify a Product', href: '/dashboard/import/analyze', icon: <Search size={18} /> },
                                { label: 'Calculate Landed Cost', href: '/dashboard/duties/calculator', icon: <DollarSign size={18} /> },
                                { label: 'Screen Denied Parties', href: '/dashboard/compliance/denied-party', icon: <Shield size={18} /> },
                                { label: 'View My Products', href: '/dashboard/products', icon: <Package size={18} /> },
                            ].map((action) => (
                                <Link key={action.href} href={action.href}>
                                    <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer">
                                        <div className="text-teal-600">{action.icon}</div>
                                        <Text className="font-medium text-slate-700">{action.label}</Text>
                                        <ArrowRight size={14} className="ml-auto text-slate-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <TariffIntelligenceCard className="bg-white border border-slate-200 rounded-xl shadow-sm" />
                </Col>
            </Row>
        </div>
    );
};
