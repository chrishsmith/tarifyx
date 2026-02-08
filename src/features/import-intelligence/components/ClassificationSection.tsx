'use client';

import React, { useState } from 'react';
import { Button, Collapse } from 'antd';
import { Copy, Check, HelpCircle, FileText, AlertTriangle, Scale, Target, Hash } from 'lucide-react';
import type { ImportAnalysis } from '../types';

interface ClassificationSectionProps {
  classification: ImportAnalysis['classification'];
  searchQuery?: string;
}

// Format HTS code with periods (e.g., 6912004400 -> 6912.00.44.00)
const formatHtsCode = (code: string): string => {
  const clean = code.replace(/\./g, '');
  if (clean.length >= 10) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}.${clean.slice(8)}`;
  } else if (clean.length >= 8) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6)}`;
  } else if (clean.length >= 6) {
    return `${clean.slice(0, 4)}.${clean.slice(4)}`;
  }
  return code;
};

// Get confidence badge color and label
const getConfidenceBadge = (confidence: number): { label: string; bgColor: string; textColor: string } => {
  if (confidence >= 85) {
    return { label: 'High', bgColor: 'bg-green-100', textColor: 'text-green-700' };
  } else if (confidence >= 70) {
    return { label: 'Medium', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
  } else {
    return { label: 'Low', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
  }
};

// Classification path step data
interface PathStep {
  code: string;
  level: string;
  description: string;
  notes?: string[];
  rulings?: Array<{
    number: string;
    excerpt: string;
    date?: string;
    url?: string;
  }>;
  exclusions?: string[];
}

// Parse classification path into steps
const parseClassificationPath = (path: string[], htsCode: string, description: string): PathStep[] => {
  // If we have path data with descriptions (format: "code|description")
  if (path.length > 0 && path[0].includes('|')) {
    return path.map((entry, idx) => {
      const [code, desc] = entry.split('|');
      const cleanCode = code.replace(/\./g, '');
      
      // Determine level based on code length
      let level = 'CHAPTER';
      let displayCode = code;
      
      if (cleanCode.length === 2) {
        level = 'CHAPTER';
        displayCode = cleanCode;
      } else if (cleanCode.length === 4) {
        level = 'HEADING';
        displayCode = cleanCode;
      } else if (cleanCode.length === 6) {
        level = 'SUBHEADING';
        displayCode = `${cleanCode.slice(0, 4)}.${cleanCode.slice(4, 6)}`;
      } else if (cleanCode.length === 8) {
        level = 'TARIFF ITEM';
        displayCode = `${cleanCode.slice(0, 4)}.${cleanCode.slice(4, 6)}.${cleanCode.slice(6, 8)}`;
      } else if (cleanCode.length >= 10) {
        level = 'HTS CODE';
        displayCode = formatHtsCode(cleanCode);
      }
      
      return {
        code: displayCode,
        level,
        description: desc || 'Classification level',
      };
    });
  }
  
  // If we have path data without descriptions (just codes)
  if (path.length > 0) {
    return path.map((code, idx) => {
      const cleanCode = code.replace(/\./g, '');
      let level = 'CHAPTER';
      let displayCode = code;
      
      if (cleanCode.length === 2) {
        level = 'CHAPTER';
        displayCode = cleanCode;
      } else if (cleanCode.length === 4) {
        level = 'HEADING';
        displayCode = cleanCode;
      } else if (cleanCode.length === 6) {
        level = 'SUBHEADING';
        displayCode = `${cleanCode.slice(0, 4)}.${cleanCode.slice(4, 6)}`;
      } else if (cleanCode.length === 8) {
        level = 'TARIFF ITEM';
        displayCode = `${cleanCode.slice(0, 4)}.${cleanCode.slice(4, 6)}.${cleanCode.slice(6, 8)}`;
      } else if (cleanCode.length >= 10) {
        level = 'HTS CODE';
        displayCode = formatHtsCode(cleanCode);
      }
      
      return {
        code: displayCode,
        level,
        description: idx === path.length - 1 ? description : `Classification level ${idx + 1}`,
      };
    });
  }
  
  // Otherwise, generate from HTS code
  const clean = htsCode.replace(/\./g, '');
  const steps: PathStep[] = [];
  
  // Chapter (2 digits)
  if (clean.length >= 2) {
    steps.push({ 
      code: clean.slice(0, 2), 
      level: 'CHAPTER', 
      description: 'Chapter classification' 
    });
  }
  
  // Heading (4 digits)
  if (clean.length >= 4) {
    steps.push({ 
      code: clean.slice(0, 4), 
      level: 'HEADING', 
      description: 'Heading classification'
    });
  }
  
  // Subheading (6 digits)
  if (clean.length >= 6) {
    steps.push({ 
      code: `${clean.slice(0, 4)}.${clean.slice(4, 6)}`, 
      level: 'SUBHEADING', 
      description: 'Subheading classification'
    });
  }
  
  // Tariff item (8 digits)
  if (clean.length >= 8) {
    steps.push({ 
      code: `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`, 
      level: 'TARIFF ITEM', 
      description: 'Tariff item classification' 
    });
  }
  
  // Full HTS Code (10 digits)
  if (clean.length >= 10) {
    steps.push({ 
      code: formatHtsCode(htsCode), 
      level: 'HTS CODE', 
      description
    });
  }
  
  return steps;
};

export const ClassificationSection: React.FC<ClassificationSectionProps> = ({ 
  classification, 
  searchQuery 
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const confidenceBadge = getConfidenceBadge(classification.confidence);
  const pathSteps = parseClassificationPath(classification.path, classification.htsCode, classification.description);
  
  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(classification.htsCode.replace(/\./g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Search */}
      {searchQuery && (
        <div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Your Search
          </div>
          <p className="text-lg font-semibold text-slate-700">{searchQuery}</p>
        </div>
      )}

      {/* HTS Code Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            HTS Code
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Confidence:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceBadge.bgColor} ${confidenceBadge.textColor}`}>
              {classification.confidence}% — {confidenceBadge.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {formatHtsCode(classification.htsCode)}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
            title="Copy HTS code"
          >
            {copied ? (
              <Check size={20} className="text-green-600" />
            ) : (
              <Copy size={20} className="text-slate-400" />
            )}
          </button>
        </div>
        <p className="text-slate-600">{classification.description}</p>

        {/* Split Confidence Breakdown */}
        {classification.splitConfidence && (
          <div className="mt-4 pt-4 border-t border-blue-200/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Confidence Breakdown
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Heading Confidence */}
              <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Target size={14} className="text-teal-600" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Heading</span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {classification.splitConfidence.heading}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${classification.splitConfidence.heading}%`,
                      backgroundColor: classification.splitConfidence.heading >= 85 ? '#10B981' : classification.splitConfidence.heading >= 70 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                  {classification.splitConfidence.headingExplanation}
                </p>
              </div>

              {/* Code Confidence */}
              <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Hash size={14} className="text-teal-600" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Exact Code</span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {classification.splitConfidence.code}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${classification.splitConfidence.code}%`,
                      backgroundColor: classification.splitConfidence.code >= 85 ? '#10B981' : classification.splitConfidence.code >= 70 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                  {classification.splitConfidence.codeExplanation}
                </p>
              </div>
            </div>

            {/* Heading Prediction Method Badge */}
            {classification.headingPrediction && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-400">Heading identified via:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  classification.headingPrediction.method === 'deterministic'
                    ? 'bg-green-100 text-green-700'
                    : classification.headingPrediction.method === 'setfit'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  {classification.headingPrediction.method === 'deterministic'
                    ? 'Pattern Match'
                    : classification.headingPrediction.method === 'setfit'
                      ? 'ML Model'
                      : 'AI Analysis'}
                </span>
                {classification.headingPrediction.constrained && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                    Search Gated
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Classification Path */}
      <div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Classification Path:
        </div>
        
        <div className="relative">
          {pathSteps.map((step, idx) => {
            const isLast = idx === pathSteps.length - 1;
            const isExpanded = expandedSteps.has(idx);
            const isHovered = hoveredStep === idx;
            const hasAdditionalInfo = (step.notes && step.notes.length > 0) || 
                                     (step.rulings && step.rulings.length > 0) || 
                                     (step.exclusions && step.exclusions.length > 0);
            
            return (
              <div key={idx} className="relative mb-4">
                <div 
                  className={`flex items-start gap-4 relative transition-all ${
                    hasAdditionalInfo ? 'cursor-pointer' : ''
                  }`}
                  onMouseEnter={() => hasAdditionalInfo && setHoveredStep(idx)}
                  onMouseLeave={() => hasAdditionalInfo && setHoveredStep(null)}
                  onClick={() => hasAdditionalInfo && toggleStep(idx)}
                >
                  {/* Vertical connector line - touches top circle, gap before bottom */}
                  {!isLast && (
                    <div 
                      className="absolute left-[18px] top-9 bg-slate-200 z-0"
                      style={{ width: '2px', height: 'calc(100% - 28px)' }}
                    />
                  )}
                  
                  {/* Step number badge with gradient */}
                  <div 
                    className={`
                      flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all
                      ${isLast 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : isHovered && hasAdditionalInfo
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-teal-50 text-teal-700'
                      }
                    `}
                  >
                    {idx + 1}
                  </div>
                  
                  {/* Step content */}
                  <div className={`flex-1 rounded-lg p-2 -ml-2 transition-all ${
                    isHovered && hasAdditionalInfo ? 'bg-blue-50' : ''
                  }`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-bold ${isLast ? 'text-2xl text-slate-900' : 'text-xl text-slate-800'}`}>
                        {step.code}
                      </span>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        isLast ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {step.level}
                      </span>
                      {hasAdditionalInfo && (
                        <div className="flex items-center gap-2 ml-auto">
                          {step.notes && step.notes.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <FileText size={14} />
                              <span>{step.notes.length}</span>
                            </div>
                          )}
                          {step.rulings && step.rulings.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Scale size={14} />
                              <span>{step.rulings.length}</span>
                            </div>
                          )}
                          {step.exclusions && step.exclusions.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <AlertTriangle size={14} />
                              <span>{step.exclusions.length}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className={`text-base ${isLast ? 'text-slate-700 font-medium' : 'text-slate-600'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Expanded content */}
                {isExpanded && hasAdditionalInfo && (
                  <div className="ml-16 mt-3 space-y-3 pb-2">
                    {/* Notes */}
                    {step.notes && step.notes.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="font-semibold text-blue-900 text-sm">Notes</span>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {step.notes.map((note, i) => (
                            <li key={i} className="leading-relaxed">• {note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Rulings */}
                    {step.rulings && step.rulings.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale size={16} className="text-green-600" />
                          <span className="font-semibold text-green-900 text-sm">Relevant Rulings</span>
                        </div>
                        <div className="space-y-2">
                          {step.rulings.map((ruling, i) => (
                            <div key={i} className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-green-700">{ruling.number}</span>
                                {ruling.date && (
                                  <span className="text-xs text-slate-500">{ruling.date}</span>
                                )}
                              </div>
                              <p className="text-slate-700 mt-1">{ruling.excerpt}</p>
                              {ruling.url && (
                                <a 
                                  href={ruling.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-600 hover:underline mt-1 inline-block"
                                >
                                  View full ruling →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Exclusions */}
                    {step.exclusions && step.exclusions.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={16} className="text-amber-600" />
                          <span className="font-semibold text-amber-900 text-sm">Exclusions</span>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {step.exclusions.map((exclusion, i) => (
                            <li key={i} className="leading-relaxed">• {exclusion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button size="middle" className="rounded-lg">
          View alternatives
        </Button>
        <Button 
          size="middle" 
          type="primary" 
          className="rounded-lg"
          icon={<HelpCircle size={16} />}
        >
          Why this code?
        </Button>
      </div>
    </div>
  );
};
