'use client';

import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, Input, Select, Alert } from 'antd';
import { Plus, Upload, Download, RefreshCw, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

const { Search } = Input;

interface SavedProduct {
  id: string;
  sku: string;
  product: string;
  countryCode: string;
  dutyRate: number;
  status: string;
  alert?: string;
  lastUpdated: string;
}

export const MyPortfolioPage: React.FC = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  // Mock data
  const savedProducts: SavedProduct[] = [
    {
      id: '1',
      sku: 'SKU-001',
      product: 'Cotton T-Shirts',
      countryCode: 'CN',
      dutyRate: 78,
      status: 'alert',
      alert: '⚠️ +10% Apr 9',
      lastUpdated: '2026-01-28',
    },
    {
      id: '2',
      sku: 'SKU-002',
      product: 'Wireless Earbuds',
      countryCode: 'VN',
      dutyRate: 27,
      status: 'alert',
      alert: '⚠️ +36% Apr 9',
      lastUpdated: '2026-01-27',
    },
    {
      id: '3',
      sku: 'SKU-003',
      product: 'Plastic Parts',
      countryCode: 'MX',
      dutyRate: 0,
      status: 'stable',
      lastUpdated: '2026-01-26',
    },
  ];

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
      render: (status: string, record: SavedProduct) => {
        if (record.alert) {
          return <Tag color="warning">{record.alert}</Tag>;
        }
        return <Tag color="success">✓ {status}</Tag>;
      },
    },
  ];

  const filteredData = savedProducts.filter((product) => {
    const matchesSearch =
      !searchText ||
      product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      product.product.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !filterStatus || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const alertCount = savedProducts.filter((p) => p.alert).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">📁 My Products</h2>
          </div>
          <Space>
            <Button
              icon={<Plus size={16} />}
              type="primary"
              onClick={() => router.push('/dashboard/import/analyze')}
            >
              Add
            </Button>
            <Button
              icon={<Upload size={16} />}
              onClick={() => router.push('/dashboard/import/bulk')}
            >
              Upload
            </Button>
          </Space>
        </div>
      </Card>

      {/* Alerts */}
      {alertCount > 0 && (
        <Alert
          message="Alerts"
          description={
            <Space direction="vertical" size="small">
              <div className="flex items-center gap-2">
                <Tag color="red">{alertCount}</Tag>
                <span>products have tariff changes since last week</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="orange">12</Tag>
                <span>products may qualify for FTA (not verified)</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="green">485</Tag>
                <span>products up to date</span>
              </div>
            </Space>
          }
          type="warning"
          showIcon={false}
          action={
            <Button size="small" type="primary">
              Review Alerts
            </Button>
          }
          className="shadow-sm"
        />
      )}

      {/* Quick Stats */}
      <Card className="shadow-sm">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Products"
              value={500}
              valueStyle={{ color: '#0D9488' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Annual Duty"
              value={890000}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#DC2626' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Savings Opp."
              value={340000}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#10B981' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Alerts"
              value={alertCount}
              valueStyle={{ color: '#F59E0B' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Product List */}
      <Card title="Products" className="shadow-sm">
        <div className="mb-4 flex gap-4">
          <Search
            placeholder="Search by SKU or product name"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            onChange={setFilterStatus}
            style={{ width: 200 }}
            options={[
              { label: 'All', value: undefined },
              { label: 'Alerts', value: 'alert' },
              { label: 'Stable', value: 'stable' },
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 50 }}
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => router.push(`/dashboard/import/analyze?id=${record.id}`),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
        />
      </Card>

      {/* Actions */}
      <Card className="shadow-sm">
        <Space wrap>
          <Button icon={<Download size={16} />} size="large">
            Export All
          </Button>
          <Button icon={<RefreshCw size={16} />} size="large">
            Re-analyze All
          </Button>
          <Button icon={<Bell size={16} />} size="large">
            Set Up Email Alerts
          </Button>
        </Space>
      </Card>
    </div>
  );
};
