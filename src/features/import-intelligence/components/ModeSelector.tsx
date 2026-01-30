'use client';

import React from 'react';
import { Card, Row, Col, Typography, List } from 'antd';
import { Package, FileSpreadsheet, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

interface RecentAnalysis {
  id: string;
  title: string;
  date: string;
  summary: string;
}

interface ModeSelectorProps {
  recentAnalyses?: RecentAnalysis[];
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ recentAnalyses = [] }) => {
  const router = useRouter();

  const modes = [
    {
      key: 'single',
      icon: <Package size={48} className="text-teal-600" />,
      title: 'Single Product',
      description: 'Analyze one product with guided flow',
      path: '/dashboard/import/analyze',
    },
    {
      key: 'bulk',
      icon: <FileSpreadsheet size={48} className="text-blue-600" />,
      title: 'Bulk Upload',
      description: 'Upload CSV with multiple products',
      path: '/dashboard/import/bulk',
    },
    {
      key: 'portfolio',
      icon: <FolderOpen size={48} className="text-purple-600" />,
      title: 'My Portfolio',
      description: 'View saved products and monitoring',
      path: '/dashboard/import/portfolio',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="shadow-sm">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            🧭 Import Intelligence
          </Title>
          <Paragraph className="text-slate-600 text-lg">
            How would you like to analyze?
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="mb-8">
          {modes.map((mode) => (
            <Col xs={24} md={8} key={mode.key}>
              <Card
                hoverable
                className="h-full text-center cursor-pointer transition-all hover:shadow-md border-2 hover:border-teal-500"
                onClick={() => router.push(mode.path)}
              >
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="mb-2">{mode.icon}</div>
                  <Title level={4} className="!mb-2">
                    {mode.title}
                  </Title>
                  <Paragraph className="text-slate-600 !mb-0">
                    {mode.description}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {recentAnalyses.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Title level={5} className="!mb-4">
              Recent Analyses
            </Title>
            <div className="space-y-2">
              {recentAnalyses.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer hover:bg-slate-50 px-4 py-3 rounded-lg transition-colors border border-slate-200"
                  onClick={() => router.push(`/dashboard/import/analyze?id=${item.id}`)}
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-500 text-sm">{item.date}</span>
                    <span className="text-slate-700 text-sm">{item.summary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
