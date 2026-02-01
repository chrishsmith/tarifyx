'use client';

import React, { useState } from 'react';
import { Button } from 'antd';
import { Copy, Check, HelpCircle } from 'lucide-react';
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
  const confidenceBadge = getConfidenceBadge(classification.confidence);
  const pathSteps = parseClassificationPath(classification.path, classification.htsCode, classification.description);
  
  // Debug logging
  console.log('[ClassificationSection] Path data:', classification.path);
  console.log('[ClassificationSection] Parsed steps:', pathSteps);

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
              {confidenceBadge.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {formatHtsCode(classification.htsCode)}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/60 transition-colors"
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
      </div>

      {/* Classification Path */}
      <div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Classification Path:
        </div>
        
        <div className="relative space-y-4">
          {pathSteps.map((step, idx) => {
            const isLast = idx === pathSteps.length - 1;
            
            return (
              <div key={idx} className="flex items-start gap-4 relative">
                {/* Vertical connector line */}
                {!isLast && (
                  <div 
                    className="absolute left-[18px] top-9 w-0.5 bg-slate-200"
                    style={{ height: 'calc(100% + 8px)' }}
                  />
                )}
                
                {/* Step number badge */}
                <div 
                  className={`
                    flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold z-10
                    ${isLast 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-blue-100 text-blue-700'
                    }
                  `}
                >
                  {idx + 1}
                </div>
                
                {/* Step content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`font-bold ${isLast ? 'text-2xl text-slate-900' : 'text-xl text-slate-800'}`}>
                      {step.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {step.level}
                    </span>
                  </div>
                  <p className={`text-base ${isLast ? 'text-slate-700 font-medium' : 'text-slate-600'}`}>
                    {step.description}
                  </p>
                </div>
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
