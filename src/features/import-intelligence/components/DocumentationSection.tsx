'use client';

import React, { useState, useCallback } from 'react';
import { Card, Typography, Checkbox, Button, Space, Tag, Divider, Tooltip, Progress, message } from 'antd';
import { FileText, Download, AlertTriangle, ShieldCheck, ExternalLink, Printer, ChevronDown, ChevronUp, Package } from 'lucide-react';
import type { Documentation, DocumentRequirement } from '../types';

const { Text, Title } = Typography;

interface DocumentationSectionProps {
  documentation: Documentation;
  /** Product description for contextual intro */
  productDescription?: string;
  /** Country name for contextual intro */
  countryName?: string;
}

/**
 * Documentation Required section — renders a checklist of documents
 * grouped by criticality (critical → required → recommended) with
 * local checkbox state, contextual intro, and dangerous goods handling.
 */
export const DocumentationSection: React.FC<DocumentationSectionProps> = ({
  documentation,
  productDescription,
  countryName,
}) => {
  // Local checklist state — keyed by doc name
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  // Collapse state for "must include" sections
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const allDocs = [
    ...documentation.critical,
    ...documentation.required,
    ...documentation.recommended,
    ...(documentation.dangerousGoods?.documents || []),
  ];
  const totalDocs = allDocs.length;
  const checkedCount = checkedDocs.size;
  const progressPercent = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0;

  const toggleCheck = useCallback((docName: string) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docName)) {
        next.delete(docName);
      } else {
        next.add(docName);
      }
      return next;
    });
  }, []);

  const toggleExpand = useCallback((docName: string) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docName)) {
        next.delete(docName);
      } else {
        next.add(docName);
      }
      return next;
    });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyChecklist = useCallback(() => {
    const lines: string[] = [];
    const addSection = (title: string, docs: DocumentRequirement[]) => {
      if (docs.length === 0) return;
      lines.push(`\n${title}`);
      for (const doc of docs) {
        const checked = checkedDocs.has(doc.name) ? '✓' : '☐';
        lines.push(`  ${checked} ${doc.name}`);
        if (doc.agency) lines.push(`    Agency: ${doc.agency}`);
        lines.push(`    ${doc.description}`);
        if (doc.mustInclude?.length) {
          for (const item of doc.mustInclude) {
            lines.push(`    • ${item}`);
          }
        }
      }
    };
    lines.push('Import Documentation Checklist');
    if (productDescription || countryName) {
      lines.push(`Product: ${productDescription || 'N/A'} | Origin: ${countryName || 'N/A'}`);
    }
    addSection('CRITICAL — Shipment will be held without these', documentation.critical);
    addSection('REQUIRED — PGA Agency Requirements', documentation.required);
    addSection('RECOMMENDED — Speeds clearance, reduces risk', documentation.recommended);
    if (documentation.dangerousGoods) {
      addSection('DANGEROUS GOODS', documentation.dangerousGoods.documents);
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      message.success('Checklist copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy checklist');
    });
  }, [documentation, checkedDocs, productDescription, countryName]);

  const renderDocCard = (doc: DocumentRequirement, index: number) => {
    const isChecked = checkedDocs.has(doc.name);
    const isExpanded = expandedDocs.has(doc.name);
    const hasMustInclude = doc.mustInclude && doc.mustInclude.length > 0;

    return (
      <Card
        key={`${doc.name}-${index}`}
        size="small"
        className={`shadow-sm transition-colors ${isChecked ? 'bg-slate-50 border-slate-200' : 'border-slate-200'}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isChecked}
            onChange={() => toggleCheck(doc.name)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Text strong className={`block ${isChecked ? 'line-through text-slate-400' : ''}`}>
                {doc.name}
              </Text>
              {doc.agency && (
                <Tag color="default" className="!text-xs">{doc.agency}</Tag>
              )}
            </div>
            <Text className="text-slate-600 text-sm block mb-2">{doc.description}</Text>

            {hasMustInclude && (
              <div className="mb-2">
                <button
                  onClick={() => toggleExpand(doc.name)}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer bg-transparent border-0 p-0"
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isExpanded ? 'Hide' : 'Show'} required contents ({doc.mustInclude!.length})
                </button>
                {isExpanded && (
                  <ul className="list-disc pl-5 text-sm text-slate-600 mt-1 space-y-0.5">
                    {doc.mustInclude!.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {doc.learnMoreUrl && (
              <a
                href={doc.learnMoreUrl}
                target={doc.learnMoreUrl.startsWith('http') ? '_blank' : undefined}
                rel={doc.learnMoreUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-xs text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
              >
                <ExternalLink size={10} />
                Requirements
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderDocumentList = (
    docs: DocumentRequirement[],
    title: string,
    tagColor: string,
    icon: React.ReactNode
  ) => {
    if (docs.length === 0) return null;

    const sectionChecked = docs.filter(d => checkedDocs.has(d.name)).length;
    const allSectionChecked = sectionChecked === docs.length;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <Tag color={tagColor} className="!m-0">{title}</Tag>
          </div>
          {allSectionChecked ? (
            <Tag color="green" className="!text-xs">
              <ShieldCheck size={10} className="inline mr-1" />
              Complete
            </Tag>
          ) : (
            <Text type="secondary" className="text-xs">{sectionChecked}/{docs.length}</Text>
          )}
        </div>
        <Space direction="vertical" size="small" className="w-full">
          {docs.map((doc, index) => renderDocCard(doc, index))}
        </Space>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Contextual intro */}
      <div className="flex items-center justify-between">
        <Text className="text-slate-600">
          {productDescription && countryName
            ? `Based on your product (${productDescription} from ${countryName}), you need:`
            : 'Based on your product and origin country, you need the following documentation:'}
        </Text>
        <Tooltip title={`${checkedCount} of ${totalDocs} documents prepared`}>
          <div className="flex items-center gap-2">
            <Progress
              percent={progressPercent}
              size="small"
              strokeColor="#0D9488"
              className="!w-24 !mb-0"
              format={() => `${checkedCount}/${totalDocs}`}
            />
          </div>
        </Tooltip>
      </div>

      {renderDocumentList(
        documentation.critical,
        'CRITICAL — Shipment will be held without these',
        'red',
        <AlertTriangle size={14} className="text-red-500" />
      )}

      {renderDocumentList(
        documentation.required,
        'REQUIRED — PGA Agency Requirements',
        'orange',
        <FileText size={14} className="text-orange-500" />
      )}

      {renderDocumentList(
        documentation.recommended,
        'RECOMMENDED — Speeds clearance, reduces risk',
        'green',
        <ShieldCheck size={14} className="text-green-500" />
      )}

      {documentation.dangerousGoods && (
        <div>
          <Divider className="!my-4" />
          <Card className="bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-orange-600" />
              <Title level={5} className="!mb-0">
                Dangerous Goods Requirements
              </Title>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <Text type="secondary" className="text-xs block">UN Classification</Text>
                <Text strong>{documentation.dangerousGoods.unNumber} — {documentation.dangerousGoods.properShippingName}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-xs block">Hazard Class</Text>
                <Text strong>{documentation.dangerousGoods.hazardClass}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-xs block">Packing Instruction</Text>
                <Text strong>{documentation.dangerousGoods.packingInstruction}</Text>
              </div>
              {documentation.dangerousGoods.packingGroup && (
                <div>
                  <Text type="secondary" className="text-xs block">Packing Group</Text>
                  <Text strong>{documentation.dangerousGoods.packingGroup}</Text>
                </div>
              )}
            </div>

            {/* DG-specific documents as checkable items */}
            {documentation.dangerousGoods.documents.length > 0 && (
              <div className="mb-4">
                <Text strong className="text-sm block mb-2">Required DG Documents:</Text>
                <Space direction="vertical" size="small" className="w-full">
                  {documentation.dangerousGoods.documents.map((doc, i) => renderDocCard(doc, i))}
                </Space>
              </div>
            )}

            {/* Carrier restrictions */}
            {documentation.dangerousGoods.carrierRestrictions.length > 0 && (
              <div className="mb-4">
                <Text strong className="text-sm block mb-2">Carrier Restrictions:</Text>
                {documentation.dangerousGoods.carrierRestrictions.map((cr, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 mb-2 border border-orange-100">
                    <Text strong className="text-sm">{cr.carrier}:</Text>{' '}
                    <Text className="text-sm text-slate-600">{cr.restriction}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{cr.details}</Text>
                  </div>
                ))}
              </div>
            )}

            {/* Packaging + labeling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentation.dangerousGoods.packagingRequirements.length > 0 && (
                <div>
                  <Text strong className="text-sm block mb-1">Packaging:</Text>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-0.5">
                    {documentation.dangerousGoods.packagingRequirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {documentation.dangerousGoods.labelingRequirements.length > 0 && (
                <div>
                  <Text strong className="text-sm block mb-1">Labeling:</Text>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-0.5">
                    {documentation.dangerousGoods.labelingRequirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Divider className="!my-4" />

      <Space>
        <Button
          icon={<Download size={14} />}
          onClick={handleCopyChecklist}
          type="primary"
          style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}
        >
          Copy Checklist
        </Button>
        <Button icon={<Printer size={14} />} onClick={handlePrint}>
          Print Checklist
        </Button>
      </Space>
    </div>
  );
};
