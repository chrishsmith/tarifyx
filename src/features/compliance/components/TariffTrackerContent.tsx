'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  Table,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Collapse,
  Button,
  Modal,
  Tooltip,
  Alert,
  Divider,
  List,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  Filter,
  ExternalLink,
  FileText,
  AlertTriangle,
  Shield,
  Globe,
  CheckCircle,
  XCircle,
  PauseCircle,
  Calendar,
  Percent,
  Building,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Calculator,
  Package,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { COUNTRY_OPTIONS, getCountryName, LoadingState, ErrorState } from '@/components/shared';
import { formatHtsCode } from '@/utils/htsFormatting';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TariffProgram {
  id: string;
  name: string;
  type: string;
  category: 'section_301' | 'ieepa' | 'section_232';
  rate: number;
  rateDisplay: string;
  affectedCountries: string[];
  htsChapters?: string[];
  chapter99Code?: string;
  effectiveDate: string;
  expirationDate?: string;
  status: 'active' | 'paused' | 'expired';
  legalAuthority: string;
  executiveOrder?: string;
  federalRegisterCitation?: string;
  federalRegisterUrl?: string;
  ustrDocUrl?: string;
  description: string;
  notes?: string[];
}

interface HtsChapterCoverage {
  chapter: string;
  description: string;
  programs: string[];
}

interface ExternalResource {
  name: string;
  description: string;
  url: string;
  searchUrl?: string;
}

interface TariffTrackerResponse {
  success: boolean;
  programs: TariffProgram[];
  summary: {
    totalPrograms: number;
    activePrograms: number;
    pausedPrograms: number;
    byCategory: {
      section_301: number;
      ieepa: number;
      section_232: number;
    };
  };
  calculation: {
    total: number;
    breakdown: { program: string; rate: number }[];
  } | null;
  countryRate: number | null;
  htsCoverage: HtsChapterCoverage[];
  reciprocalRates: Record<string, number>;
  externalResources: ExternalResource[];
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<string, string> = {
  section_301: 'red',
  ieepa: 'orange',
  section_232: 'blue',
};

const CATEGORY_LABELS: Record<string, string> = {
  section_301: 'Section 301',
  ieepa: 'IEEPA',
  section_232: 'Section 232',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle size={14} className="text-green-500" />,
  paused: <PauseCircle size={14} className="text-yellow-500" />,
  expired: <XCircle size={14} className="text-gray-400" />,
};


// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const TariffTrackerContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TariffTrackerResponse | null>(null);
  
  // Filters — initialize from URL params for deep linking
  const [htsSearch, setHtsSearch] = useState(searchParams.get('hts') || '');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(searchParams.get('country') || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') || null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TariffProgram | null>(null);

  // Fetch data
  useEffect(() => {
    fetchTariffData();
  }, [selectedCountry, selectedCategory]);

  const fetchTariffData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country', selectedCountry);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/tariff-tracker?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch tariff data');
      }
    } catch (err) {
      setError('Failed to load tariff tracker data');
      console.error('[TariffTrackerContent] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs by HTS search
  const filteredPrograms = useMemo(() => {
    if (!data) return [];
    let programs = data.programs;
    
    // Filter by status
    if (showActiveOnly) {
      programs = programs.filter(p => p.status === 'active');
    }
    
    // Filter by HTS code search
    if (htsSearch) {
      const chapter = htsSearch.replace(/\./g, '').substring(0, 2);
      const coverage = data.htsCoverage.find(c => c.chapter === chapter);
      
      if (coverage) {
        programs = programs.filter(p => 
          coverage.programs.includes(p.id) ||
          p.type === 'ieepa_baseline' ||
          p.type === 'ieepa_reciprocal' ||
          p.type === 'ieepa_fentanyl'
        );
      }
    }
    
    return programs;
  }, [data, htsSearch, showActiveOnly]);

  // Calculate total for HTS + Country
  const calculatedTotal = useMemo(() => {
    if (!htsSearch || !selectedCountry || !data) return null;
    
    const chapter = htsSearch.replace(/\./g, '').substring(0, 2);
    const breakdown: { program: string; rate: number }[] = [];
    let total = 0;
    
    // IEEPA rate
    const ieepaRate = data.reciprocalRates[selectedCountry] ?? data.reciprocalRates['DEFAULT'] ?? 10;
    breakdown.push({ program: 'IEEPA Reciprocal/Baseline', rate: ieepaRate });
    total += ieepaRate;
    
    // Fentanyl — pull rates from fetched program data
    const fentanylPrograms = filteredPrograms.filter(p => p.type === 'ieepa_fentanyl' && p.status === 'active');
    for (const fp of fentanylPrograms) {
      const appliesToCountry = 
        (fp.id.includes('china') && (selectedCountry === 'CN' || selectedCountry === 'HK')) ||
        (fp.id.includes('mexico') && selectedCountry === 'MX') ||
        (fp.id.includes('canada') && selectedCountry === 'CA');
      if (appliesToCountry) {
        breakdown.push({ program: fp.name, rate: fp.rate });
        total += fp.rate;
      }
    }
    
    // Section 301 (CN only)
    if (selectedCountry === 'CN') {
      const s301Programs = filteredPrograms.filter(p => 
        p.category === 'section_301' && 
        p.htsChapters?.includes(chapter) &&
        p.status === 'active'
      );
      if (s301Programs.length > 0) {
        const highest = Math.max(...s301Programs.map(p => p.rate));
        breakdown.push({ program: 'Section 301', rate: highest });
        total += highest;
      }
    }
    
    // Section 232
    const s232Programs = filteredPrograms.filter(p => 
      p.category === 'section_232' && 
      p.htsChapters?.includes(chapter) &&
      p.status === 'active'
    );
    if (s232Programs.length > 0) {
      const s232 = s232Programs[0];
      breakdown.push({ program: s232.name, rate: s232.rate });
      total += s232.rate;
    }
    
    return { total, breakdown };
  }, [htsSearch, selectedCountry, data, filteredPrograms]);

  // Export data
  // Navigate to landed cost calculator with context
  const handleCalculateLandedCost = () => {
    const params = new URLSearchParams();
    if (htsSearch) params.set('hts', htsSearch);
    if (selectedCountry) params.set('country', selectedCountry);
    router.push(`/dashboard/duties/calculator?${params.toString()}`);
  };

  // Table columns
  const columns: ColumnsType<TariffProgram> = [
    {
      title: 'Program',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.name}</div>
          <div className="text-xs text-slate-500 font-mono">{record.chapter99Code || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color={CATEGORY_COLORS[category]}>
          {CATEGORY_LABELS[category]}
        </Tag>
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rateDisplay',
      key: 'rate',
      width: 80,
      render: (rate: string) => (
        <Text strong className="text-lg text-teal-600">{rate}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Space>
          {STATUS_ICONS[status]}
          <Text className="capitalize">{status}</Text>
        </Space>
      ),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
      render: (date: string) => (
        <Space>
          <Calendar size={14} className="text-slate-400" />
          <Text>{date}</Text>
        </Space>
      ),
    },
    {
      title: 'Affected',
      key: 'affected',
      width: 120,
      render: (_, record) => {
        const countries = record.affectedCountries;
        if (countries.includes('ALL')) {
          return <Tag icon={<Globe size={12} />} color="cyan">All Countries</Tag>;
        }
        return (
          <Tooltip title={countries.map(c => getCountryName(c)).join(', ')}>
            <Tag>{countries.length} countr{countries.length === 1 ? 'y' : 'ies'}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedProgram(record);
              setDetailModalOpen(true);
            }}
          >
            Details
          </Button>
          {record.federalRegisterUrl && (
            <Tooltip title="Federal Register">
              <Button
                type="text"
                size="small"
                icon={<ExternalLink size={14} />}
                href={record.federalRegisterUrl}
                target="_blank"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (loading && !data) {
    return <LoadingState message="Loading tariff data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTariffData} />;
  }

  if (!data) {
    return <ErrorState message="No tariff data available" />;
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Context Banner — dynamic based on current landscape */}
      <div>
        <Alert
          type="info"
          showIcon
          icon={<AlertTriangle size={16} />}
          message="Current Tariff Landscape (as of February 2026)"
          description={
            <div className="text-sm space-y-1">
              <div>China IEEPA rates reduced to 10% reciprocal + 10% fentanyl (20% total) per Nov 2025 trade deal — stays at this level until Nov 10, 2026.</div>
              <div>Mexico/Canada 25% fentanyl tariffs active since March 2025 — USMCA-compliant goods largely exempt.</div>
              <div>Section 301 tariffs (7.5-100%) on China remain in effect. Country-specific reciprocal rates unchanged for other nations.</div>
            </div>
          }
        />
      </div>

      {/* Summary Cards */}
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center border border-slate-200 shadow-sm">
              <Statistic
                title="Section 301"
                value={data.summary.byCategory.section_301}
                suffix="lists"
                valueStyle={{ color: '#dc2626' }}
                prefix={<Shield size={16} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center border border-slate-200 shadow-sm">
              <Statistic
                title="IEEPA Programs"
                value={data.summary.byCategory.ieepa}
                suffix="active"
                valueStyle={{ color: '#f97316' }}
                prefix={<Globe size={16} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center border border-slate-200 shadow-sm">
              <Statistic
                title="Section 232"
                value={data.summary.byCategory.section_232}
                suffix="products"
                valueStyle={{ color: '#2563eb' }}
                prefix={<Building size={16} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center border border-slate-200 shadow-sm">
              <Statistic
                title="Active Programs"
                value={data.summary.activePrograms}
                suffix={`/ ${data.summary.totalPrograms}`}
                valueStyle={{ color: '#0d9488' }}
                prefix={<CheckCircle size={16} />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Search & Filters */}
      <Card className="border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Search by HTS Code
            </label>
            <Input
              placeholder="Enter HTS code (e.g., 8471.30)"
              prefix={<Search size={16} className="text-slate-400" />}
              value={htsSearch}
              onChange={(e) => setHtsSearch(e.target.value)}
              allowClear
            />
          </div>
          <div className="w-full sm:w-52">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Country of Origin
            </label>
            <Select
              placeholder="Select country"
              options={COUNTRY_OPTIONS}
              value={selectedCountry}
              onChange={setSelectedCountry}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <Select
              placeholder="All categories"
              options={[
                { value: 'section_301', label: 'Section 301' },
                { value: 'ieepa', label: 'IEEPA' },
                { value: 'section_232', label: 'Section 232' },
              ]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              type={showActiveOnly ? 'primary' : 'default'}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              icon={<Filter size={14} />}
            >
              Active Only
            </Button>
          </div>
        </div>
      </Card>

      {/* Calculated Total (when HTS + Country selected) */}
      {calculatedTotal && (
        <Card 
          className="border-2 border-teal-200 bg-teal-50 shadow-sm"
          title={
            <Space>
              <Percent size={18} className="text-teal-600" />
              <span>
                Additional Tariff for HTS {formatHtsCode(htsSearch)} from {getCountryName(selectedCountry || '')}
              </span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<Calculator size={14} />}
              onClick={handleCalculateLandedCost}
              size="small"
            >
              Full Landed Cost
            </Button>
          }
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600">{calculatedTotal.total}%</div>
                <div className="text-sm text-slate-500 mt-1">Total Additional Rate</div>
                <div className="text-xs text-slate-400 mt-0.5">(excludes base MFN duty)</div>
              </div>
            </Col>
            <Col xs={24} sm={16}>
              <div className="space-y-2">
                <Text strong>Breakdown:</Text>
                {calculatedTotal.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                    <Text>{item.program}</Text>
                    <Tag color="cyan">{item.rate}%</Tag>
                  </div>
                ))}
              </div>
              <Alert
                type="info"
                className="mt-3"
                message="This is an estimate based on known programs. Does not include base MFN duty or AD/CVD orders. Use the Landed Cost Calculator for a complete breakdown."
                showIcon
              />
              {(selectedCountry === 'MX' || selectedCountry === 'CA') && (
                <Alert
                  type="warning"
                  className="mt-2"
                  message="USMCA-compliant goods from Mexico/Canada may be exempt from the 25% fentanyl tariff. Check FTA qualification."
                  showIcon
                />
              )}
            </Col>
          </Row>
        </Card>
      )}

      {/* Quick Actions */}
      {(htsSearch || selectedCountry) && (
        <div className="flex flex-wrap gap-3">
          {htsSearch && selectedCountry && (
            <Button
              icon={<Calculator size={14} />}
              onClick={handleCalculateLandedCost}
            >
              Calculate Full Landed Cost
            </Button>
          )}
          <Link href="/dashboard/import/analyze">
            <Button icon={<Package size={14} />}>
              Classify a Product
            </Button>
          </Link>
          <Link href="/dashboard/products">
            <Button icon={<TrendingUp size={14} />}>
              View My Products
            </Button>
          </Link>
        </div>
      )}

      {/* Main Content - Collapsible Sections */}
      <Collapse defaultActiveKey={['section_301', 'ieepa', 'section_232']}>
        {/* Section 301 */}
        <Panel
          header={
            <Space>
              <Tag color="red">Section 301</Tag>
              <Text strong>China Trade Tariffs</Text>
              <Text type="secondary">({filteredPrograms.filter(p => p.category === 'section_301').length} lists)</Text>
            </Space>
          }
          key="section_301"
        >
          <Table
            columns={columns}
            dataSource={filteredPrograms.filter(p => p.category === 'section_301')}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />
        </Panel>

        {/* IEEPA */}
        <Panel
          header={
            <Space>
              <Tag color="orange">IEEPA</Tag>
              <Text strong>International Emergency Economic Powers Act</Text>
              <Text type="secondary">({filteredPrograms.filter(p => p.category === 'ieepa').length} programs)</Text>
            </Space>
          }
          key="ieepa"
        >
          <Table
            columns={columns}
            dataSource={filteredPrograms.filter(p => p.category === 'ieepa')}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />

        </Panel>

        {/* Section 232 */}
        <Panel
          header={
            <Space>
              <Tag color="blue">Section 232</Tag>
              <Text strong>National Security Tariffs</Text>
              <Text type="secondary">({filteredPrograms.filter(p => p.category === 'section_232').length} products)</Text>
            </Space>
          }
          key="section_232"
        >
          <Table
            columns={columns}
            dataSource={filteredPrograms.filter(p => p.category === 'section_232')}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />
        </Panel>
      </Collapse>

      {/* External Resources */}
      <Card
        className="border border-slate-200 shadow-sm"
        title={
          <Space>
            <BookOpen size={18} className="text-slate-600" />
            <span>Official Resources</span>
          </Space>
        }
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={data.externalResources}
          renderItem={(resource) => (
            <List.Item>
              <Card size="small" className="h-full border border-slate-200 shadow-sm">
                <Space direction="vertical" size="small">
                  <Typography.Link href={resource.url} target="_blank" className="font-medium">
                    {resource.name} <ExternalLink size={12} className="inline" />
                  </Typography.Link>
                  <Text type="secondary" className="text-sm">{resource.description}</Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={selectedProgram?.name}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedProgram && (
          <div className="space-y-4">
            {/* Status and Rate */}
            <div className="flex items-center gap-4">
              <Tag color={CATEGORY_COLORS[selectedProgram.category]} className="text-lg px-4 py-1">
                {CATEGORY_LABELS[selectedProgram.category]}
              </Tag>
              <div className="text-3xl font-bold text-teal-600">{selectedProgram.rateDisplay}</div>
              <Space>
                {STATUS_ICONS[selectedProgram.status]}
                <Text className="capitalize">{selectedProgram.status}</Text>
              </Space>
            </div>

            <Divider />

            {/* Description */}
            <div>
              <Text strong>Description</Text>
              <Paragraph className="mt-1">{selectedProgram.description}</Paragraph>
            </div>

            {/* Legal Details */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Legal Authority</Text>
                <div className="font-medium">{selectedProgram.legalAuthority}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Effective Date</Text>
                <div className="font-medium">{selectedProgram.effectiveDate}</div>
              </Col>
              {selectedProgram.executiveOrder && (
                <Col span={12}>
                  <Text type="secondary">Executive Order</Text>
                  <div className="font-medium">{selectedProgram.executiveOrder}</div>
                </Col>
              )}
              {selectedProgram.federalRegisterCitation && (
                <Col span={12}>
                  <Text type="secondary">Federal Register</Text>
                  <div className="font-medium">{selectedProgram.federalRegisterCitation}</div>
                </Col>
              )}
              {selectedProgram.chapter99Code && (
                <Col span={12}>
                  <Text type="secondary">Chapter 99 Code</Text>
                  <div className="font-medium font-mono">{selectedProgram.chapter99Code}</div>
                </Col>
              )}
            </Row>

            {/* Affected Countries */}
            <div>
              <Text strong>Affected Countries</Text>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProgram.affectedCountries.includes('ALL') ? (
                  <Tag icon={<Globe size={12} />} color="cyan">All Countries</Tag>
                ) : (
                  selectedProgram.affectedCountries.map(c => (
                    <Tag key={c}>{getCountryName(c)} ({c})</Tag>
                  ))
                )}
              </div>
            </div>

            {/* HTS Chapters */}
            {selectedProgram.htsChapters && (
              <div>
                <Text strong>Applicable HTS Chapters</Text>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProgram.htsChapters.map(ch => (
                    <Tag key={ch} color="blue">Chapter {ch}</Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedProgram.notes && selectedProgram.notes.length > 0 && (
              <div>
                <Text strong>Notes</Text>
                <ul className="mt-1 list-disc list-inside text-slate-600">
                  {selectedProgram.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Links */}
            <Divider />
            <Space wrap>
              {selectedProgram.federalRegisterUrl && (
                <Button
                  type="primary"
                  icon={<FileText size={14} />}
                  href={selectedProgram.federalRegisterUrl}
                  target="_blank"
                >
                  View Federal Register
                </Button>
              )}
              {selectedProgram.ustrDocUrl && (
                <Button
                  icon={<ExternalLink size={14} />}
                  href={selectedProgram.ustrDocUrl}
                  target="_blank"
                >
                  View USTR Documentation
                </Button>
              )}
              <Button
                icon={<ArrowRight size={14} />}
                onClick={() => {
                  setDetailModalOpen(false);
                  handleCalculateLandedCost();
                }}
              >
                Calculate Landed Cost
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};
