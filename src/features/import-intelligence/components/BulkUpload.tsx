'use client';

import React, { useState } from 'react';
import { Card, Upload, Button, Typography, Alert, Space } from 'antd';
import { FileSpreadsheet, Download, FileText } from 'lucide-react';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface BulkUploadProps {
  onUpload: (file: File) => void;
  loading?: boolean;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ onUpload, loading = false }) => {
  const [fileList, setFileList] = useState<any[]>([]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv,.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const handleUpload = () => {
    if (fileList.length > 0) {
      onUpload(fileList[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm">
        <Title level={3} className="!mb-2">
          📊 Bulk Import Analysis
        </Title>
        <Paragraph className="text-slate-600 mb-6">
          Upload your product catalog for comprehensive analysis
        </Paragraph>

        <Dragger {...uploadProps} className="mb-6">
          <div className="py-8">
            <FileSpreadsheet size={48} className="mx-auto text-teal-600 mb-4" />
            <Text className="text-lg block mb-2">Drop CSV or Excel file here</Text>
            <Text type="secondary">or click to browse</Text>
            <div className="mt-4 text-sm text-slate-500">
              <div>Supports: .csv, .xlsx, .xls</div>
              <div>Max: 5,000 products per upload</div>
            </div>
          </div>
        </Dragger>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Title level={5} className="!mb-3">
              Required columns:
            </Title>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>SKU or Product ID</li>
              <li>Product Description</li>
              <li>Country of Origin (ISO code: CN, VN, MX, etc.)</li>
              <li>Product Value (USD)</li>
            </ul>
          </div>
          <div>
            <Title level={5} className="!mb-3">
              Optional columns (improves accuracy):
            </Title>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>HTS Code (if known)</li>
              <li>Quantity</li>
              <li>Materials</li>
              <li>Contains Battery (yes/no)</li>
              <li>For Children (yes/no)</li>
            </ul>
          </div>
        </div>

        <Alert
          message="Need help formatting your file?"
          description="Download our template to see the exact format required."
          type="info"
          showIcon
          className="mb-6"
        />

        <Space>
          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={loading}
          >
            Analyze Products
          </Button>
          <Button icon={<Download size={16} />} size="large">
            Download Template
          </Button>
          <Button icon={<FileText size={16} />} size="large">
            View Sample File
          </Button>
        </Space>
      </Card>
    </div>
  );
};
