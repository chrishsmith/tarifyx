'use client';

import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, Input, Select, Alert } from 'antd';
import { Download, Save, FileText, AlertTriangle } from 'lucide-react';
import type { PortfolioAnalysis } from '../types';

const { Search } = Input;

interface PortfolioDashboardProps {
  analysis: PortfolioAnalysis;
  onProductClick?: (sku: string) => void;
  onExport?: () => void;
  onSave?: () => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  analysis,
  onProductClick,
  onExport,
  onSave,
}) => {
  const [searchText, setSearchText] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | undefined>();

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      fixed: 'left' as const,
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      ellipsis: true,
    },
    {
      title: 'Country',
      dataIndex: 'countryCode',
      key: 'countryCode',
      width: 100,
      filters: Array.from(new Set(analysis.products.map((p) => p.countryCode))).map((code) => ({
        text: code,
        value: code,
      })),
      onFilter: (value: any, record: any) => record.countryCode === value,
    },
    {
      title: 'Duty',
      dataIndex: 'dutyRate',
      key: 'dutyRate',
      width: 100,
      render: (rate: number) => `${rate}%`,
      sorter: (a: any, b: any) => a.dutyRate - b.dutyRate,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string, record: any) => {
        if (record.alert) {
          return <Tag color="warning">{record.alert}</Tag>;
        }
        return <Tag color="success">{status}</Tag>;
      },
    },
  ];

  const filteredData = analysis.products.filter((product) => {
    const matchesSearch =
      !searchText ||
      product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      product.product.toLowerCase().includes(searchText.toLowerCase());
    const matchesCountry = !countryFilter || product.countryCode === countryFilter;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">📊 Portfolio Analysis</h2>
            <p className="text-slate-600">
              {analysis.summary.totalProducts} products analyzed • {new Date().toLocaleDateString()}
            </p>
          </div>
          <Space>
            <Button icon={<Download size={16} />} onClick={onExport}>
              Export
            </Button>
            <Button icon={<Save size={16} />} type="primary" onClick={onSave}>
              Save
            </Button>
          </Space>
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="shadow-sm">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Products"
              value={analysis.summary.totalProducts}
              valueStyle={{ color: '#0D9488' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Value"
              value={analysis.summary.totalValue}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#0D9488' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Duty"
              value={analysis.summary.totalDuty}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#DC2626' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Avg Rate"
              value={analysis.summary.averageRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#0D9488' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Attention Required */}
      {analysis.summary.attentionRequired > 0 && (
        <Alert
          message="⚠️ Attention Required"
          description={
            <ul className="list-disc pl-5 mt-2">
              <li>{analysis.summary.attentionRequired} products need HTS classification review</li>
              <li>{analysis.summary.complianceAlerts} products have compliance alerts</li>
              <li>{analysis.summary.recentChanges} products affected by recent tariff changes</li>
            </ul>
          }
          type="warning"
          showIcon={false}
          action={
            <Button size="small" type="primary">
              Review Issues
            </Button>
          }
        />
      )}

      {/* Duty Exposure by Country */}
      <Card title="Duty Exposure by Country" className="shadow-sm">
        <Space direction="vertical" size="middle" className="w-full">
          {analysis.dutyExposureByCountry.map((country) => (
            <div key={country.countryCode}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {country.countryName} ({country.countryCode})
                </span>
                <span className="text-slate-600">
                  ${country.totalDuty.toLocaleString('en-US')} ({country.percentage}%)
                </span>
              </div>
              <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-teal-500 h-full transition-all"
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </Space>
      </Card>

      {/* Optimization Opportunities */}
      <Card title="💡 Optimization Opportunities" className="shadow-sm">
        <div className="mb-4">
          <p className="text-lg font-semibold text-green-600">
            Total: $
            {analysis.optimizationOpportunities
              .reduce((sum, opp) => sum + opp.savings, 0)
              .toLocaleString('en-US')}
            /yr
          </p>
        </div>
        <Space direction="vertical" size="middle" className="w-full">
          {analysis.optimizationOpportunities.map((opp, index) => (
            <Card key={index} size="small" className="bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    {index + 1}. {opp.type} ({opp.productCount} products)
                  </p>
                  <p className="text-slate-600 text-sm">{opp.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-green-600 font-semibold">
                    ${opp.savings.toLocaleString('en-US')}/yr
                  </p>
                  <Button size="small" type="link" className="!p-0">
                    View Products
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </Card>

      {/* Product List */}
      <Card title="Product List" className="shadow-sm">
        <div className="mb-4 flex gap-4">
          <Search
            placeholder="Search by SKU or product name"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by country"
            allowClear
            onChange={setCountryFilter}
            style={{ width: 200 }}
            options={Array.from(new Set(analysis.products.map((p) => p.countryCode))).map(
              (code) => ({
                label: code,
                value: code,
              })
            )}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="sku"
          pagination={{ pageSize: 50 }}
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => onProductClick?.(record.sku),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
        />
      </Card>

      {/* Actions */}
      <Card className="shadow-sm">
        <Space wrap>
          <Button icon={<FileText size={16} />} type="primary" size="large">
            Export Full Report
          </Button>
          <Button icon={<Save size={16} />} size="large">
            Save to My Products
          </Button>
          <Button size="large">Schedule Monitoring</Button>
        </Space>
      </Card>
    </div>
  );
};
