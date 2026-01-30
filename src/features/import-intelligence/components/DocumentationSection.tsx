'use client';

import React from 'react';
import { Card, Typography, Checkbox, Button, Space, Tag, Divider } from 'antd';
import { FileText, Download } from 'lucide-react';
import type { Documentation } from '../types';

const { Text, Title } = Typography;

interface DocumentationSectionProps {
  documentation: Documentation;
}

export const DocumentationSection: React.FC<DocumentationSectionProps> = ({ documentation }) => {
  const renderDocumentList = (docs: any[], title: string, color: string) => {
    if (docs.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag color={color}>{title}</Tag>
        </div>
        <Space direction="vertical" size="middle" className="w-full">
          {docs.map((doc, index) => (
            <Card key={index} size="small" className="shadow-sm">
              <div className="flex items-start gap-3">
                <Checkbox />
                <div className="flex-1">
                  <Text strong className="block mb-1">
                    {doc.name}
                  </Text>
                  {doc.agency && (
                    <Text type="secondary" className="text-sm block mb-2">
                      Agency: {doc.agency}
                    </Text>
                  )}
                  <Text className="text-slate-600 block mb-2">{doc.description}</Text>
                  {doc.mustInclude && doc.mustInclude.length > 0 && (
                    <div className="mb-2">
                      <Text type="secondary" className="text-sm block mb-1">
                        Must include:
                      </Text>
                      <ul className="list-disc pl-5 text-sm text-slate-600">
                        {doc.mustInclude.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Space size="small">
                    {doc.templateUrl && (
                      <Button size="small" type="link" className="!p-0">
                        Template
                      </Button>
                    )}
                    {doc.learnMoreUrl && (
                      <Button size="small" type="link" className="!p-0">
                        Requirements
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Text className="text-slate-600 block mb-6">
        Based on your product, you need the following documentation:
      </Text>

      {renderDocumentList(
        documentation.critical,
        '🔴 CRITICAL (Shipment WILL be held without these)',
        'red'
      )}

      {renderDocumentList(
        documentation.required,
        '🟡 REQUIRED (PGA Agency Requirements)',
        'orange'
      )}

      {renderDocumentList(
        documentation.recommended,
        '🟢 RECOMMENDED (Speeds clearance, reduces risk)',
        'green'
      )}

      {documentation.dangerousGoods && (
        <div>
          <Divider />
          <Card className="bg-orange-50 border-orange-200">
            <Title level={5} className="!mb-3">
              🔋 Dangerous Goods Requirements
            </Title>
            <Text className="block mb-2">
              <Text strong>UN Classification:</Text> {documentation.dangerousGoods.unNumber} -{' '}
              {documentation.dangerousGoods.properShippingName}
            </Text>
            <Text className="block mb-2">
              <Text strong>Class:</Text> {documentation.dangerousGoods.hazardClass}
            </Text>
            <Text className="block mb-4">
              <Text strong>Packing Instruction:</Text>{' '}
              {documentation.dangerousGoods.packingInstruction}
            </Text>
            <Button type="primary" size="small">
              View Dangerous Goods Requirements
            </Button>
          </Card>
        </div>
      )}

      <Divider />

      <Space>
        <Button icon={<Download size={16} />} type="primary">
          Download All Templates
        </Button>
        <Button icon={<FileText size={16} />}>Save Checklist</Button>
        <Button>Print Checklist</Button>
      </Space>
    </div>
  );
};
