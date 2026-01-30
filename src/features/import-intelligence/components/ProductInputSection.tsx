'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Checkbox, Button, Segmented, Typography } from 'antd';
import { Package, FileText, Save } from 'lucide-react';
import { COUNTRIES } from '@/components/shared/constants';
import type { ProductInput, ProductAttributes } from '../types';

const { TextArea } = Input;
const { Title } = Typography;

interface ProductInputSectionProps {
  onAnalyze: (input: ProductInput) => void;
  loading?: boolean;
}

type InputMode = 'describe' | 'hts' | 'saved';

export const ProductInputSection: React.FC<ProductInputSectionProps> = ({
  onAnalyze,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [inputMode, setInputMode] = useState<InputMode>('describe');

  const handleSubmit = async (values: any) => {
    const productInput: ProductInput = {
      description: values.description,
      htsCode: values.htsCode,
      countryCode: values.countryCode,
      value: values.value,
      quantity: values.quantity,
      attributes: {
        containsBattery: values.containsBattery || false,
        containsChemicals: values.containsChemicals || false,
        forChildren: values.forChildren || false,
        foodContact: values.foodContact || false,
        wireless: values.wireless || false,
        medicalDevice: values.medicalDevice || false,
        pressurized: values.pressurized || false,
        flammable: values.flammable || false,
      },
    };
    onAnalyze(productInput);
  };

  return (
    <Card className="shadow-sm">
      <div className="mb-6">
        <Title level={4} className="!mb-2 flex items-center gap-2">
          <span className="bg-teal-100 text-teal-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            1
          </span>
          Product Information
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 1000,
          value: 10000,
        }}
      >
        {/* Input Mode Selector */}
        <Form.Item label="How would you like to identify your product?">
          <Segmented
            options={[
              { label: 'Describe my product', value: 'describe', icon: <FileText size={16} /> },
              { label: 'I have an HTS code', value: 'hts', icon: <Package size={16} /> },
              { label: 'Use saved product', value: 'saved', icon: <Save size={16} /> },
            ]}
            value={inputMode}
            onChange={(value) => setInputMode(value as InputMode)}
            block
            size="large"
          />
        </Form.Item>

        <div className="border-t border-slate-200 my-6" />

        {/* Product Description Input */}
        {inputMode === 'describe' && (
          <Form.Item
            name="description"
            rules={[
              { required: true, message: 'Please describe your product' },
              { min: 20, message: 'Please provide at least 20 characters for accurate classification' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe your product in detail...&#10;&#10;e.g., &quot;Cotton t-shirts, 100% cotton, knit fabric, short sleeve, for adults, printed designs&quot;"
              className="text-base"
              showCount
              maxLength={2000}
            />
          </Form.Item>
        )}

        {/* HTS Code Input */}
        {inputMode === 'hts' && (
          <Form.Item
            name="htsCode"
            label="HTS Code"
            rules={[{ required: true, message: 'Please enter an HTS code' }]}
          >
            <Input
              placeholder="e.g., 6109.10.00.12"
              size="large"
              maxLength={10}
            />
          </Form.Item>
        )}

        {/* Saved Product Selector */}
        {inputMode === 'saved' && (
          <Form.Item
            name="savedProductId"
            label="Select Saved Product"
            rules={[{ required: true, message: 'Please select a saved product' }]}
          >
            <Select
              placeholder="Choose from your saved products"
              size="large"
              options={[
                { value: '1', label: 'Cotton T-Shirts (6109.10.00.12)' },
                { value: '2', label: 'Wireless Earbuds (8518.30.20.00)' },
              ]}
            />
          </Form.Item>
        )}

        {/* Basic Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Form.Item
            name="countryCode"
            label="Country of Origin"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select
              placeholder="Select country"
              size="large"
              showSearch
              options={COUNTRIES.map((c) => ({ value: c.value, label: c.label }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="value"
            label="Product Value (USD)"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              placeholder="10000"
              size="large"
              className="w-full"
              min={0}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity (units)"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              placeholder="1000"
              size="large"
              className="w-full"
              min={1}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/,/g, '')}
            />
          </Form.Item>
        </div>

        {/* Additional Details */}
        <div className="mt-6">
          <div className="mb-3 text-slate-700 font-medium">
            Additional Details (improves accuracy):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Form.Item name="containsBattery" valuePropName="checked" className="!mb-0">
              <Checkbox>Contains lithium battery</Checkbox>
            </Form.Item>
            <Form.Item name="containsChemicals" valuePropName="checked" className="!mb-0">
              <Checkbox>Contains chemicals/hazardous materials</Checkbox>
            </Form.Item>
            <Form.Item name="forChildren" valuePropName="checked" className="!mb-0">
              <Checkbox>For children (under 12)</Checkbox>
            </Form.Item>
            <Form.Item name="foodContact" valuePropName="checked" className="!mb-0">
              <Checkbox>Food or food contact</Checkbox>
            </Form.Item>
            <Form.Item name="wireless" valuePropName="checked" className="!mb-0">
              <Checkbox>Wireless/radio frequency</Checkbox>
            </Form.Item>
            <Form.Item name="medicalDevice" valuePropName="checked" className="!mb-0">
              <Checkbox>Medical device</Checkbox>
            </Form.Item>
          </div>
        </div>

        {/* Submit Button */}
        <Form.Item className="mt-8 mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="h-12 px-8 text-base font-medium"
          >
            Analyze Product →
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
