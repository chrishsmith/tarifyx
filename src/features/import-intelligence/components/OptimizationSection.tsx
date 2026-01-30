'use client';

import React from 'react';
import { Card, Typography, Tag, Button, Space, Alert } from 'antd';
import { TrendingDown, Globe, FileCheck } from 'lucide-react';
import type { Optimization } from '../types';

const { Text, Title } = Typography;

interface OptimizationSectionProps {
  optimization: Optimization;
}

export const OptimizationSection: React.FC<OptimizationSectionProps> = ({ optimization }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'country_switch':
        return <Globe size={24} className="text-blue-600" />;
      case 'fta_qualification':
        return <FileCheck size={24} className="text-green-600" />;
      case 'classification_review':
        return <TrendingDown size={24} className="text-purple-600" />;
      default:
        return <TrendingDown size={24} className="text-slate-600" />;
    }
  };

  const getNumber = (index: number) => {
    const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    return numbers[index] || `${index + 1}️⃣`;
  };

  return (
    <div className="space-y-6">
      <Text className="text-slate-600 block mb-4">
        We found {optimization.opportunities.length} way
        {optimization.opportunities.length !== 1 ? 's' : ''} to reduce your import costs:
      </Text>

      {optimization.opportunities.map((opp, index) => (
        <Card key={opp.id} className="shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon(opp.type)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Title level={5} className="!mb-1">
                    {getNumber(index)} {opp.title}
                  </Title>
                </div>
                <Tag color="green" className="text-base px-3 py-1">
                  Save: ${opp.savings.toLocaleString('en-US')}/yr
                </Tag>
              </div>

              <Text className="text-slate-600 block mb-4">{opp.description}</Text>

              {opp.requirements && opp.requirements.length > 0 && (
                <div className="mb-4">
                  <Text strong className="block mb-2">
                    Requirements:
                  </Text>
                  <ul className="list-disc pl-5 space-y-1">
                    {opp.requirements.map((req, i) => (
                      <li key={i} className="text-slate-600">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {opp.tradeoffs && opp.tradeoffs.length > 0 && (
                <div className="mb-4">
                  <Text strong className="block mb-2">
                    Trade-offs:
                  </Text>
                  <ul className="list-disc pl-5 space-y-1">
                    {opp.tradeoffs.map((tradeoff, i) => (
                      <li key={i} className="text-slate-600">
                        {tradeoff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {opp.actionUrl && (
                <Button type="primary" size="small">
                  Learn More
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {optimization.opportunities.length === 0 && (
        <Alert
          message="No optimization opportunities found"
          description="Your current sourcing strategy appears optimal."
          type="info"
          showIcon
        />
      )}

      {optimization.totalPotentialSavings > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-slate-600 block mb-1">
                Total Potential Savings
              </Text>
              <Title level={2} className="!mb-0 text-green-700">
                ${optimization.totalPotentialSavings.toLocaleString('en-US')}/year
              </Title>
              {optimization.topRecommendation && (
                <Text className="text-slate-600 block mt-2">
                  Best option: {optimization.topRecommendation}
                </Text>
              )}
            </div>
          </div>
        </Card>
      )}

      <Space>
        <Button type="primary">Generate Optimization Report</Button>
        <Button>Schedule Consultation</Button>
      </Space>
    </div>
  );
};
