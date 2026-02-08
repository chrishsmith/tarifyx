'use client';

import React, { useRef, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Checkbox, Button, Typography, Tooltip } from 'antd';
import { FileText, Save, Hash, ChevronRight, HelpCircle } from 'lucide-react';
import { COUNTRIES } from '@/components/shared/constants';
import type { ProductInput, ProductAttributes } from '../types';

const { TextArea } = Input;
const { Title, Text } = Typography;
const INPUT_DEBOUNCE_MS = 300;
const MAX_DESCRIPTION_LENGTH = 2000;

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
  const lastActionRef = useRef<number>(0);
  const inputModeOptions = [
    { value: 'describe' as const, label: 'Describe my product', icon: FileText },
    { value: 'hts' as const, label: 'I have an HTS code', icon: Hash },
    { value: 'saved' as const, label: 'Use saved product', icon: Save },
  ];

  const handleSubmit = async (values: any) => {
    const now = Date.now();
    if (now - lastActionRef.current < INPUT_DEBOUNCE_MS) {
      return;
    }
    lastActionRef.current = now;

    try {
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
      console.info('[import_intelligence] analyze', {
        ts: new Date().toISOString(),
        inputMode,
        countryCode: values.countryCode,
        hasDescription: Boolean(values.description),
        hasHtsCode: Boolean(values.htsCode),
      });
      onAnalyze(productInput);
    } catch (error) {
      console.error('[import_intelligence] analyze_failed', {
        ts: new Date().toISOString(),
        inputMode,
        error,
      });
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-8" data-component-id="import_analyze_product">
      <div className="max-w-[1024px] mx-auto">
        <div className="mb-6">
          <Title level={2} className="!mb-1 text-slate-900">
            HTS Classification
          </Title>
          <Text className="text-slate-500">Classify your product and get the full tariff breakdown</Text>
        </div>

        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 -m-6 mb-6 px-8 py-6 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[14px] bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
                1
              </div>
              <Title level={4} className="!m-0 text-slate-900">Product Information</Title>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{
              quantity: 1000,
              value: 10000,
            }}
          >
            <Text className="text-slate-600 text-sm">How would you like to identify your product?</Text>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              {inputModeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = inputMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInputMode(option.value)}
                    aria-pressed={isActive}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              {inputMode === 'describe' && (
                <Form.Item
                  name="description"
                  rules={[
                    { required: true, message: 'Please describe your product' },
                    { min: 20, message: 'Please provide at least 20 characters for accurate classification' },
                  ]}
                  className="!mb-3"
                >
                  <TextArea
                    rows={4}
                    placeholder="Describe your product in detail... e.g., &quot;Cotton t-shirts, 100% cotton, knit fabric, short sleeve, for adults, printed designs&quot;"
                    className="text-base !rounded-lg"
                    showCount
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                </Form.Item>
              )}

              {inputMode === 'hts' && (
                <Form.Item
                  name="htsCode"
                  label={<span className="text-slate-700 font-medium">HTS Code</span>}
                  rules={[{ required: true, message: 'Please enter an HTS code' }]}
                >
                  <Input
                    placeholder="e.g., 6109.10.00.12"
                    size="large"
                    maxLength={10}
                  />
                </Form.Item>
              )}

              {inputMode === 'saved' && (
                <Form.Item
                  name="savedProductId"
                  label={<span className="text-slate-700 font-medium">Select Saved Product</span>}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="countryCode"
                label={<span className="text-slate-700 font-medium"><span className="text-red-500">*</span> Country of Origin</span>}
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
                label={
                  <span className="text-slate-700 font-medium inline-flex items-center gap-1">
                    <span className="text-red-500">*</span> Total Shipment Value (USD)
                    <Tooltip title="The total value of the entire shipment (unit cost × quantity). Example: 1,000 shirts at $5 each = $5,000 total.">
                      <HelpCircle size={14} className="text-slate-400 cursor-help" />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: 'Required' }]}
                extra={<span className="text-xs text-slate-400">Unit cost × quantity — not the per-unit price</span>}
              >
                <InputNumber
                  placeholder="5,000"
                  size="large"
                  className="w-full"
                  min={0}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label={<span className="text-slate-700 font-medium"><span className="text-red-500">*</span> Quantity (units)</span>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  placeholder="1,000"
                  size="large"
                  className="w-full"
                  min={1}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/,/g, '')}
                />
              </Form.Item>
            </div>

            <div className="mt-2">
              <div className="mb-3 text-slate-600 text-sm">
                Additional Details (improves accuracy):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <Form.Item name="containsBattery" valuePropName="checked" className="!mb-0">
                  <Checkbox className="tarifyx-checkbox">Contains lithium battery</Checkbox>
                </Form.Item>
                <Form.Item name="containsChemicals" valuePropName="checked" className="!mb-0">
                  <Checkbox className="tarifyx-checkbox">Contains chemicals/hazardous materials</Checkbox>
                </Form.Item>
                <Form.Item name="forChildren" valuePropName="checked" className="!mb-0">
                  <Checkbox className="tarifyx-checkbox">For children (under 12)</Checkbox>
                </Form.Item>
                <Form.Item name="foodContact" valuePropName="checked" className="!mb-0">
                  <Checkbox className="tarifyx-checkbox">Food or food contact</Checkbox>
                </Form.Item>
                <Form.Item name="wireless" valuePropName="checked" className="!mb-0">
                  <Checkbox className="tarifyx-checkbox">Wireless/radio frequency</Checkbox>
                </Form.Item>
                <Form.Item name="medicalDevice" valuePropName="checked" className="!mb-0">
                  <Checkbox className="tarifyx-checkbox">Medical device</Checkbox>
                </Form.Item>
              </div>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="bg-teal-600 hover:bg-teal-700 border-none shadow-sm px-6"
              >
                Analyze Product
                <ChevronRight size={16} className="ml-2" />
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <style jsx global>{`
          .tarifyx-checkbox .ant-checkbox-inner {
            border-color: #cbd5e1;
          }

          .tarifyx-checkbox .ant-checkbox-checked .ant-checkbox-inner {
            border-color: transparent;
            background-color: #0D9488;
          }

          .tarifyx-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
            border-color: #ffffff;
          }

          .tarifyx-checkbox:hover .ant-checkbox-inner,
          .tarifyx-checkbox .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #0D9488;
          }
        `}</style>
      </div>
    </div>
  );
};
