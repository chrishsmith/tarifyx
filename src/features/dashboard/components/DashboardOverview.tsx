'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Tag, Progress, Dropdown, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import { LoadingState } from '@/components/shared/LoadingState';
import {
    Sparkles,
    ChevronRight,
    Clock,
    Package,
    Search,
    Target,
    Eye,
    MoreHorizontal,
    Copy,
    Map,
    Calculator,
    ShieldAlert,
    FileCheck,
    ClipboardList,
    Bookmark,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TariffIntelligenceCard } from './TariffIntelligenceCard';
import { formatHtsCode } from '@/utils/htsFormatting';

const { Title, Text } = Typography;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Matches the shape returned by /api/search-history */
interface RecentClassification {
    id: string;
    productName: string | null;
    productDescription: string;
    htsCode: string;
    countryOfOrigin: string | null;
    confidence: number;
    createdAt: string;
}

interface DashboardStats {
    totalProducts: number;
    monitoredProducts: number;
    totalSearches: number;
    searchesThisMonth: number;
    avgConfidence: number;
    uniqueHtsCodes: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS ROW
// ═══════════════════════════════════════════════════════════════════════════════

const STAT_CARDS = [
    { key: 'totalProducts', label: 'Saved Products', icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
    { key: 'searchesThisMonth', label: 'Searches This Month', icon: Search, color: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'avgConfidence', label: 'Avg Confidence', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', suffix: '%' },
    { key: 'monitoredProducts', label: 'Monitored', icon: Eye, color: 'text-sky-600', bg: 'bg-sky-50' },
] as const;

const StatsRow: React.FC<{ stats: DashboardStats | null; loading: boolean }> = ({ stats, loading }) => {
    if (loading) {
        return (
            <Row gutter={[16, 16]}>
                {STAT_CARDS.map((card) => (
                    <Col xs={12} md={6} key={card.key}>
                        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded w-20 mb-3" />
                            <div className="h-7 bg-slate-100 rounded w-12" />
                        </div>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Row gutter={[16, 16]}>
            {STAT_CARDS.map((card) => {
                const Icon = card.icon;
                const value = stats ? stats[card.key] : 0;
                return (
                    <Col xs={12} md={6} key={card.key}>
                        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                                    <Icon size={14} className={card.color} />
                                </div>
                                <Text type="secondary" className="text-xs font-medium">
                                    {card.label}
                                </Text>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                                {value}{'suffix' in card ? card.suffix : ''}
                            </div>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// RECENT CLASSIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Confidence color based on threshold */
function getConfidenceColor(confidence: number): string {
    if (confidence >= 85) return '#10b981'; // emerald-500
    if (confidence >= 70) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
}

const RecentClassificationsCard: React.FC = () => {
    const [items, setItems] = useState<RecentClassification[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const router = useRouter();

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

    /** Copy formatted HTS code to clipboard */
    const handleCopyHts = (e: React.MouseEvent, htsCode: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(formatHtsCode(htsCode));
        message.success('HTS code copied');
    };

    /** Save product to My Products via API */
    const handleSaveProduct = async (e: React.MouseEvent, item: RecentClassification) => {
        e.preventDefault();
        e.stopPropagation();
        setSavingId(item.id);
        try {
            const res = await fetch('/api/saved-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.productName || item.productDescription.slice(0, 100),
                    description: item.productDescription,
                    htsCode: item.htsCode,
                    htsDescription: '',
                    countryOfOrigin: item.countryOfOrigin,
                    sourceSearchId: item.id,
                }),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Product saved to My Products');
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } catch (err) {
            console.error('[DashboardOverview] save_product_failed', { ts: new Date().toISOString(), error: err });
            message.error('Failed to save product');
        } finally {
            setSavingId(null);
        }
    };

    /** Delete a search history item */
    const handleDelete = async (e: React.MouseEvent, item: RecentClassification) => {
        e.preventDefault();
        e.stopPropagation();
        Modal.confirm({
            title: 'Delete classification?',
            content: `Remove "${item.productName || item.productDescription.slice(0, 60)}" from your history?`,
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await fetch(`/api/search-history/${item.id}`, { method: 'DELETE' });
                    if (res.ok) {
                        setItems(prev => prev.filter(i => i.id !== item.id));
                        message.success('Classification deleted');
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (err) {
                    console.error('[DashboardOverview] delete_failed', { ts: new Date().toISOString(), error: err });
                    message.error('Failed to delete');
                }
            },
        });
    };

    /** Build the 3-dot dropdown menu items for a row */
    const getRowMenuItems = (item: RecentClassification): MenuProps['items'] => {
        const hts = item.htsCode;
        const country = item.countryOfOrigin || '';

        return [
            {
                key: 'cost-map',
                icon: <Map size={14} />,
                label: 'View on Cost Map',
                onClick: (info) => {
                    info.domEvent.preventDefault();
                    info.domEvent.stopPropagation();
                    router.push(`/dashboard/intelligence/cost-map?hts=${hts}`);
                },
            },
            {
                key: 'landed-cost',
                icon: <Calculator size={14} />,
                label: 'Calculate Landed Cost',
                onClick: (info) => {
                    info.domEvent.preventDefault();
                    info.domEvent.stopPropagation();
                    const params = new URLSearchParams({ hts });
                    if (country) params.set('country', country);
                    router.push(`/dashboard/duties/calculator?${params.toString()}`);
                },
            },
            { type: 'divider' as const },
            {
                key: 'adcvd',
                icon: <ShieldAlert size={14} />,
                label: 'Check AD/CVD',
                onClick: (info) => {
                    info.domEvent.preventDefault();
                    info.domEvent.stopPropagation();
                    const params = new URLSearchParams({ htsCode: hts });
                    if (country) params.set('countryCode', country);
                    router.push(`/dashboard/compliance/addcvd?${params.toString()}`);
                },
            },
            {
                key: 'fta',
                icon: <FileCheck size={14} />,
                label: 'FTA Calculator',
                onClick: (info) => {
                    info.domEvent.preventDefault();
                    info.domEvent.stopPropagation();
                    router.push(`/dashboard/compliance/fta-calculator?htsCode=${hts}`);
                },
            },
            {
                key: 'pga',
                icon: <ClipboardList size={14} />,
                label: 'PGA Requirements',
                onClick: (info) => {
                    info.domEvent.preventDefault();
                    info.domEvent.stopPropagation();
                    router.push(`/dashboard/compliance/pga?htsCode=${hts}`);
                },
            },
            { type: 'divider' as const },
            {
                key: 'save',
                icon: <Bookmark size={14} />,
                label: 'Save to My Products',
                disabled: savingId === item.id,
                onClick: (info) => {
                    handleSaveProduct(info.domEvent as unknown as React.MouseEvent, item);
                },
            },
            {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: 'Delete',
                danger: true,
                onClick: (info) => {
                    handleDelete(info.domEvent as unknown as React.MouseEvent, item);
                },
            },
        ];
    };

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
                    href="/dashboard/products"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                    View all <ChevronRight size={14} />
                </Link>
            </div>

            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/dashboard/import/analyze?id=${item.id}`}
                        className="block px-6 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <Text className="block truncate text-sm font-medium text-slate-800">
                                    {item.productName || item.productDescription}
                                </Text>
                                <div className="flex items-center gap-2 mt-1">
                                    {item.htsCode && (
                                        <span className="inline-flex items-center gap-1">
                                            <Tag className="!m-0 font-mono text-xs border-slate-200 text-slate-600">
                                                {formatHtsCode(item.htsCode)}
                                            </Tag>
                                            <button
                                                onClick={(e) => handleCopyHts(e, item.htsCode)}
                                                className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                                title="Copy HTS code"
                                            >
                                                <Copy size={12} />
                                            </button>
                                        </span>
                                    )}
                                    {item.countryOfOrigin && (
                                        <Text type="secondary" className="text-xs">
                                            {getCountryName(item.countryOfOrigin)}
                                        </Text>
                                    )}
                                    {item.confidence > 0 && (
                                        <span className="inline-flex items-center gap-1">
                                            <Progress
                                                type="circle"
                                                percent={Math.round(item.confidence)}
                                                size={16}
                                                strokeColor={getConfidenceColor(item.confidence)}
                                                strokeWidth={10}
                                                format={() => ''}
                                            />
                                            <Text type="secondary" className="text-xs">
                                                {Math.round(item.confidence)}%
                                            </Text>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock size={12} />
                                    <Text type="secondary" className="text-xs whitespace-nowrap">
                                        {formatTimeAgo(item.createdAt)}
                                    </Text>
                                </div>
                                <Dropdown
                                    menu={{ items: getRowMenuItems(item) }}
                                    trigger={['click']}
                                    placement="bottomRight"
                                >
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                        title="Actions"
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                </Dropdown>
                            </div>
                        </div>
                    </Link>
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

/** Map ISO 3166-1 alpha-2 codes to country names */
const COUNTRY_NAMES: Record<string, string> = {
    CN: 'China', VN: 'Vietnam', IN: 'India', BD: 'Bangladesh', TH: 'Thailand',
    ID: 'Indonesia', MY: 'Malaysia', PH: 'Philippines', KR: 'South Korea', JP: 'Japan',
    TW: 'Taiwan', PK: 'Pakistan', KH: 'Cambodia', MM: 'Myanmar', LK: 'Sri Lanka',
    MX: 'Mexico', CA: 'Canada', BR: 'Brazil', CO: 'Colombia', CL: 'Chile',
    PE: 'Peru', AR: 'Argentina', GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador',
    CR: 'Costa Rica', DO: 'Dominican Republic', NI: 'Nicaragua', PA: 'Panama',
    DE: 'Germany', IT: 'Italy', FR: 'France', GB: 'United Kingdom', ES: 'Spain',
    PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium', PL: 'Poland', CZ: 'Czech Republic',
    RO: 'Romania', HU: 'Hungary', AT: 'Austria', SE: 'Sweden', DK: 'Denmark',
    FI: 'Finland', IE: 'Ireland', CH: 'Switzerland', NO: 'Norway', GR: 'Greece',
    TR: 'Turkey', IL: 'Israel', AE: 'UAE', SA: 'Saudi Arabia', QA: 'Qatar',
    EG: 'Egypt', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya', ET: 'Ethiopia',
    GH: 'Ghana', TZ: 'Tanzania', MA: 'Morocco', TN: 'Tunisia',
    AU: 'Australia', NZ: 'New Zealand', SG: 'Singapore', HK: 'Hong Kong',
    US: 'United States', PR: 'Puerto Rico', JO: 'Jordan', LB: 'Lebanon',
    UA: 'Ukraine', BG: 'Bulgaria', HR: 'Croatia', SK: 'Slovakia', SI: 'Slovenia',
    LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia', RS: 'Serbia', BA: 'Bosnia',
    RU: 'Russia', BY: 'Belarus', KZ: 'Kazakhstan', UZ: 'Uzbekistan',
    NP: 'Nepal', LA: 'Laos',
};

function getCountryName(code: string): string {
    return COUNTRY_NAMES[code?.toUpperCase()] || code;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const DashboardOverview = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch search stats and product stats in parallel
                const [searchRes, productRes] = await Promise.all([
                    fetch('/api/search-history?includeStats=true&limit=0'),
                    fetch('/api/saved-products?includeStats=true&limit=0'),
                ]);

                const searchData = searchRes.ok ? await searchRes.json() : {};
                const productData = productRes.ok ? await productRes.json() : {};

                setStats({
                    totalProducts: productData.stats?.totalProducts ?? 0,
                    monitoredProducts: productData.stats?.monitoredProducts ?? 0,
                    totalSearches: searchData.stats?.totalSearches ?? 0,
                    searchesThisMonth: searchData.stats?.searchesThisMonth ?? 0,
                    avgConfidence: searchData.stats?.avgConfidence ?? 0,
                    uniqueHtsCodes: searchData.stats?.uniqueHtsCodes ?? 0,
                });
            } catch (err) {
                console.error('[DashboardOverview] stats_fetch_failed', {
                    ts: new Date().toISOString(),
                    error: err,
                });
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Title level={2} style={{ margin: 0, color: '#0F172A' }}>Dashboard</Title>
                <Text className="text-slate-500 text-lg">
                    Classify products, calculate costs, and optimize your imports.
                </Text>
            </div>

            {/* Stats Row */}
            <StatsRow stats={stats} loading={statsLoading} />

            {/* Recent + Tariff Intelligence */}
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
