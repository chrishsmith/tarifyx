'use client';

import React from 'react';
import { Card, Progress, Typography, Space, Button } from 'antd';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import type { BulkAnalysisStatus } from '../types';

const { Title, Text } = Typography;

interface ProcessingStatusProps {
  status: BulkAnalysisStatus;
  onCancel?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, onCancel }) => {
  const steps = [
    { key: 'validate', label: 'File validated', completed: true },
    { key: 'parse', label: `Products parsed (${status.totalProducts} found)`, completed: true },
    {
      key: 'classify',
      label: `HTS codes assigned (${status.processedProducts} classified, ${status.failedProducts} need review)`,
      completed: status.progress >= 40,
      active: status.progress < 40,
    },
    {
      key: 'costs',
      label: 'Calculating landed costs...',
      completed: status.progress >= 60,
      active: status.progress >= 40 && status.progress < 60,
    },
    {
      key: 'optimize',
      label: 'Analyzing optimization opportunities',
      completed: status.progress >= 80,
      active: status.progress >= 60 && status.progress < 80,
    },
    {
      key: 'compliance',
      label: 'Generating compliance alerts',
      completed: status.progress >= 90,
      active: status.progress >= 80 && status.progress < 90,
    },
    {
      key: 'report',
      label: 'Building report',
      completed: status.progress >= 100,
      active: status.progress >= 90 && status.progress < 100,
    },
  ];

  const getIcon = (step: any) => {
    if (step.completed) {
      return <CheckCircle size={20} className="text-green-600" />;
    }
    if (step.active) {
      return <Loader size={20} className="text-blue-600 animate-spin" />;
    }
    return <Circle size={20} className="text-slate-300" />;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-sm">
        <Title level={3} className="!mb-2">
          📊 Analyzing Your Products
        </Title>
        <Text className="text-slate-600 block mb-6">
          Processing {status.totalProducts} products...
        </Text>

        <Progress
          percent={status.progress}
          status={status.status === 'failed' ? 'exception' : 'active'}
          className="mb-6"
          strokeWidth={12}
        />

        <div className="flex items-center justify-between mb-6">
          <Text strong className="text-lg">
            {status.progress}% ({status.processedProducts}/{status.totalProducts})
          </Text>
          {status.estimatedTime && (
            <Text type="secondary">
              Estimated time remaining: {Math.ceil(status.estimatedTime / 60)} minutes
            </Text>
          )}
        </div>

        <Space direction="vertical" size="middle" className="w-full mb-6">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center gap-3">
              {getIcon(step)}
              <Text className={step.completed ? 'text-slate-900' : 'text-slate-500'}>
                {step.label}
              </Text>
            </div>
          ))}
        </Space>

        {onCancel && (
          <Button onClick={onCancel} disabled={status.status === 'complete'}>
            Cancel
          </Button>
        )}
      </Card>
    </div>
  );
};
