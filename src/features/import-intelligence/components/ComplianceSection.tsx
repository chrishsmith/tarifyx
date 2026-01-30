'use client';

import React from 'react';
import { Alert, Card, Typography, Space, Button, Tag } from 'antd';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { Compliance } from '../types';

const { Text, Title } = Typography;

interface ComplianceSectionProps {
  compliance: Compliance;
}

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({ compliance }) => {
  const highAlerts = compliance.alerts.filter((a) => a.level === 'high');
  const mediumAlerts = compliance.alerts.filter((a) => a.level === 'medium');
  const lowAlerts = compliance.alerts.filter((a) => a.level === 'low');

  const renderAlert = (alert: any, index: number) => (
    <Card key={index} className="mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={24}
          className={
            alert.level === 'high'
              ? 'text-red-500'
              : alert.level === 'medium'
              ? 'text-orange-500'
              : 'text-yellow-500'
          }
        />
        <div className="flex-1">
          <Title level={5} className="!mb-2">
            {alert.title}
          </Title>
          <Text className="text-slate-600 block mb-3">{alert.description}</Text>

          {alert.requiredActions && alert.requiredActions.length > 0 && (
            <div className="mb-3">
              <Text strong className="block mb-2">
                Required actions:
              </Text>
              <ul className="list-disc pl-5 space-y-1">
                {alert.requiredActions.map((action: string, i: number) => (
                  <li key={i} className="text-slate-600">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alert.risk && (
            <Alert
              message={`Risk: ${alert.risk}`}
              type="warning"
              showIcon
              className="mb-3"
            />
          )}

          {alert.learnMoreUrl && (
            <Button size="small" href={alert.learnMoreUrl} target="_blank">
              Learn More
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {highAlerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag color="red">HIGH PRIORITY</Tag>
          </div>
          {highAlerts.map(renderAlert)}
        </div>
      )}

      {mediumAlerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag color="orange">MEDIUM PRIORITY</Tag>
          </div>
          {mediumAlerts.map(renderAlert)}
        </div>
      )}

      {lowAlerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag color="yellow">LOW PRIORITY</Tag>
          </div>
          {lowAlerts.map(renderAlert)}
        </div>
      )}

      {compliance.passedChecks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag color="green">PASSED CHECKS</Tag>
          </div>
          <Card className="bg-green-50 border-green-200">
            <Space direction="vertical" size="small">
              {compliance.passedChecks.map((check, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <Text className="text-green-800">{check}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </div>
      )}

      {compliance.alerts.length === 0 && (
        <Alert
          message="No compliance issues found"
          description="Your product passed all compliance checks."
          type="success"
          showIcon
        />
      )}
    </div>
  );
};
