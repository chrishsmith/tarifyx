'use client';

import React from 'react';
import { Table, Tag, Button, Typography, Space, Alert } from 'antd';
import type { CountryComparison } from '../types';

const { Text, Title } = Typography;

interface CountryCompareSectionProps {
  comparison: CountryComparison;
}

export const CountryCompareSection: React.FC<CountryCompareSectionProps> = ({ comparison }) => {
  const columns = [
    {
      title: 'Country',
      dataIndex: 'countryName',
      key: 'country',
      render: (text: string, record: any) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Landed Cost',
      dataIndex: 'landedCost',
      key: 'landedCost',
      render: (value: number) => `$${value.toLocaleString('en-US')}`,
      sorter: (a: any, b: any) => a.landedCost - b.landedCost,
    },
    {
      title: 'Duty Rate',
      dataIndex: 'dutyRate',
      key: 'dutyRate',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => a.dutyRate - b.dutyRate,
    },
    {
      title: 'Savings',
      dataIndex: 'savings',
      key: 'savings',
      render: (value: number) => (
        <Text strong className={value > 0 ? 'text-green-600' : ''}>
          {value > 0 ? `$${value.toLocaleString('en-US')}` : '—'}
        </Text>
      ),
      sorter: (a: any, b: any) => b.savings - a.savings,
    },
    {
      title: 'FTA',
      dataIndex: 'ftaAvailable',
      key: 'fta',
      render: (available: boolean, record: any) =>
        available ? (
          <Tag color="green">{record.ftaName || 'Yes'}</Tag>
        ) : (
          <Tag>No</Tag>
        ),
    },
  ];

  const dataSource = [comparison.current, ...comparison.alternatives].map((item, index) => ({
    key: index,
    ...item,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Title level={5} className="!mb-3">
          Sourcing Alternatives
        </Title>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="middle"
          rowClassName={(record) =>
            record.countryCode === comparison.current.countryCode
              ? 'bg-blue-50'
              : ''
          }
        />
      </div>

      {comparison.recommendation && (
        <Alert
          message="💡 Recommendation"
          description={comparison.recommendation}
          type="info"
          showIcon={false}
          className="border-teal-200 bg-teal-50"
        />
      )}

      <Space>
        <Button type="primary">Full comparison</Button>
        <Button>Find suppliers</Button>
        <Button>Check FTA qualification</Button>
      </Space>
    </div>
  );
};
