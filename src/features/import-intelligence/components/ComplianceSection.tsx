'use client';

import React from 'react';
import { Alert, Card, Typography, Space, Button, Tag, Tooltip, Progress, Divider } from 'antd';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  ShieldAlert,
  ExternalLink, 
  Building2, 
  Scale, 
  FileWarning,
  Search,
  Ban,
  ArrowRight,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import type { Compliance, ComplianceAlert, ComplianceCategory, PGARequirement } from '../types';

const { Text } = Typography;

// ═══════════════════════════════════════════════════════════════════════════
// ACRONYM GLOSSARY — tooltips for jargon that non-experts won't know
// ═══════════════════════════════════════════════════════════════════════════

const GLOSSARY: Record<string, string> = {
  UFLPA: 'Uyghur Forced Labor Prevention Act — US law creating a rebuttable presumption that goods from the Xinjiang region of China are made with forced labor.',
  'OFAC SDN': 'Office of Foreign Assets Control, Specially Designated Nationals list — US Treasury list of sanctioned individuals and entities you cannot do business with.',
  'AD/CVD': 'Antidumping and Countervailing Duties — extra duties on imports sold below fair market value (dumping) or subsidized by foreign governments.',
  PGA: 'Partner Government Agency — federal agencies (FDA, EPA, CPSC, etc.) that have import requirements beyond customs duties.',
  IEEPA: 'International Emergency Economic Powers Act — presidential authority to impose emergency tariffs. Currently used for universal 10% baseline and country-specific tariffs.',
  'Section 301': 'Trade Act of 1974, Section 301 — tariffs imposed on Chinese goods in response to unfair trade practices. Rates range from 7.5% to 100% depending on the product list.',
  'Section 232': 'Trade Expansion Act of 1962, Section 232 — national security tariffs. Currently 25% on steel, aluminum, and automobiles.',
  FTA: 'Free Trade Agreement — treaty between countries that reduces or eliminates tariffs on qualifying goods (e.g., USMCA, KORUS FTA).',
  CPSC: 'Consumer Product Safety Commission — regulates safety of consumer products, especially children\'s products.',
  FDA: 'Food and Drug Administration — regulates food, drugs, medical devices, cosmetics, and radiation-emitting products.',
  EPA: 'Environmental Protection Agency — regulates chemicals, vehicles, engines, and ozone-depleting substances.',
  BIS: 'Bureau of Industry and Security — administers export controls and the Entity List of restricted parties.',
  CBP: 'Customs and Border Protection — the primary agency enforcing US import regulations at the border.',
  MFN: 'Most Favored Nation — the standard duty rate applied to countries with normal trade relations.',
  CPC: 'Children\'s Product Certificate — required certification for products designed for children 12 and under.',
  FMVSS: 'Federal Motor Vehicle Safety Standards — safety standards enforced by NHTSA for vehicles and vehicle equipment.',
  WRO: 'Withhold Release Order — a CBP order to detain shipments suspected of being produced with forced labor.',
};

/** Render text with acronym tooltips — replaces known acronyms with underline + tooltip */
const AcronymText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  // Build regex from glossary keys, longest first to avoid partial matches
  const keys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');

  const parts: Array<{ text: string; isAcronym: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const seen = new Set<string>(); // only tooltip the first occurrence per render

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isAcronym: false });
    }
    parts.push({ text: match[1], isAcronym: !seen.has(match[1]) });
    seen.add(match[1]);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isAcronym: false });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.isAcronym ? (
          <Tooltip key={i} title={GLOSSARY[part.text]} placement="top">
            <span className="border-b border-dotted border-slate-400 cursor-help">{part.text}</span>
          </Tooltip>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY / RISK CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_LABELS: Record<ComplianceCategory, { label: string; icon: React.ReactNode; color: string }> = {
  sanctions: { label: 'Sanctions & Embargoes', icon: <Ban size={16} />, color: '#dc2626' },
  forced_labor: { label: 'Forced Labor / UFLPA', icon: <ShieldAlert size={16} />, color: '#dc2626' },
  adcvd: { label: 'Anti-Dumping / Countervailing Duties', icon: <Scale size={16} />, color: '#ea580c' },
  tariff_program: { label: 'Tariff Programs', icon: <FileWarning size={16} />, color: '#d97706' },
  pga: { label: 'Government Agency Requirements', icon: <Building2 size={16} />, color: '#2563eb' },
  fta: { label: 'Free Trade Agreement', icon: <Shield size={16} />, color: '#059669' },
  general: { label: 'General Compliance', icon: <Shield size={16} />, color: '#64748b' },
};

const RISK_CONFIG = {
  high: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'HIGH RISK', tagColor: 'red' },
  medium: { color: '#d97706', bg: '#fffbeb', border: '#fed7aa', label: 'MEDIUM RISK', tagColor: 'orange' },
  low: { color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', label: 'LOW RISK', tagColor: 'green' },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TOOL LINK DESCRIPTIONS — for the promoted CTA cards
// ═══════════════════════════════════════════════════════════════════════════

const TOOL_DESCRIPTIONS: Array<{
  key: keyof Compliance['toolLinks'];
  icon: React.ReactNode;
  title: string;
  description: string;
}> = [
  {
    key: 'deniedPartySearch',
    icon: <Search size={18} />,
    title: 'Denied Party Screen',
    description: 'Screen suppliers against OFAC SDN, BIS Entity List, and Denied Persons List',
  },
  {
    key: 'adcvdLookup',
    icon: <Scale size={18} />,
    title: 'AD/CVD Lookup',
    description: 'Check antidumping & countervailing duty orders by product and country',
  },
  {
    key: 'pgaLookup',
    icon: <Building2 size={18} />,
    title: 'PGA Requirements',
    description: 'View all government agency filing requirements for any HTS code',
  },
  {
    key: 'ftaCalculator',
    icon: <Shield size={18} />,
    title: 'FTA Calculator',
    description: 'Determine if your product qualifies for free trade agreement benefits',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceSectionProps {
  compliance: Compliance;
  /** HTS code from classification — passed to deep-dive tool links */
  htsCode?: string;
  /** Country of origin — passed to deep-dive tool links */
  countryCode?: string;
}

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({ compliance, htsCode, countryCode }) => {
  const { alerts, passedChecks, riskLevel, riskScore, pgaRequirements, adcvdWarning, toolLinks } = compliance;

  // Build contextual URLs so deep-dive tools open pre-filled with analysis data
  const buildToolUrl = (basePath: string, params?: Record<string, string | undefined>): string => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.set(key, value);
      }
    }
    const qs = searchParams.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const contextualToolLinks = {
    deniedPartySearch: buildToolUrl(toolLinks.deniedPartySearch, { countryCode }),
    adcvdLookup: buildToolUrl(toolLinks.adcvdLookup, { htsCode, countryCode }),
    pgaLookup: buildToolUrl(toolLinks.pgaLookup, { htsCode }),
    ftaCalculator: buildToolUrl(toolLinks.ftaCalculator, { htsCode }),
  };
  const riskConfig = RISK_CONFIG[riskLevel];

  // Group alerts by category
  const alertsByCategory = alerts.reduce<Record<string, ComplianceAlert[]>>((acc, alert) => {
    const cat = alert.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(alert);
    return acc;
  }, {});

  const categoryOrder: ComplianceCategory[] = ['sanctions', 'forced_labor', 'adcvd', 'tariff_program', 'pga', 'fta', 'general'];
  const orderedCategories = categoryOrder.filter(cat => alertsByCategory[cat]?.length > 0);

  return (
    <div className="space-y-8">
      {/* ─── Risk Dashboard ─────────────────────────────────────────── */}
      <div 
        className="rounded-xl p-5 border"
        style={{ backgroundColor: riskConfig.bg, borderColor: riskConfig.border }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Progress
              type="circle"
              percent={riskScore}
              size={72}
              strokeColor={riskConfig.color}
              trailColor={riskConfig.border}
              format={() => (
                <span className="text-lg font-bold" style={{ color: riskConfig.color }}>
                  {riskScore}
                </span>
              )}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tag color={riskConfig.tagColor} className="!m-0 font-semibold">
                  {riskConfig.label}
                </Tag>
                <Tooltip title="Risk score is calculated from the number and severity of compliance alerts. 0 = no risk, 100 = critical.">
                  <HelpCircle size={14} className="text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <Text className="text-slate-600 text-sm block">
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''} found &middot; {passedChecks.length} check{passedChecks.length !== 1 ? 's' : ''} passed
              </Text>
            </div>
          </div>

          {/* Quick severity breakdown */}
          <div className="flex gap-6 text-sm">
            {alerts.filter(a => a.level === 'high').length > 0 && (
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">
                  {alerts.filter(a => a.level === 'high').length}
                </div>
                <div className="text-slate-500 text-xs">High</div>
              </div>
            )}
            {alerts.filter(a => a.level === 'medium').length > 0 && (
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {alerts.filter(a => a.level === 'medium').length}
                </div>
                <div className="text-slate-500 text-xs">Medium</div>
              </div>
            )}
            {alerts.filter(a => a.level === 'low').length > 0 && (
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {alerts.filter(a => a.level === 'low').length}
                </div>
                <div className="text-slate-500 text-xs">Low</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Alerts by Category ─────────────────────────────────────── */}
      {orderedCategories.length > 0 && (
        <div className="space-y-6">
          {orderedCategories.map(category => {
            const catAlerts = alertsByCategory[category];
            const catInfo = CATEGORY_LABELS[category];
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: catInfo.color }}>{catInfo.icon}</span>
                  <AcronymText
                    text={catInfo.label}
                    className="text-sm font-semibold uppercase tracking-wide"
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  {catAlerts.map((alert, index) => (
                    <AlertCard key={`${category}-${index}`} alert={alert} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── PGA Agency Details ─────────────────────────────────────── */}
      {pgaRequirements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-blue-600" />
            <Text strong className="text-sm uppercase tracking-wide text-blue-600">
              Agency Requirements Detail
            </Text>
            <Tooltip title={GLOSSARY.PGA}>
              <HelpCircle size={14} className="text-slate-400 cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pgaRequirements.map(pga => (
              <PGACard key={pga.agencyCode} pga={pga} />
            ))}
          </div>
        </div>
      )}

      {/* ─── AD/CVD Detail Card ─────────────────────────────────────── */}
      {adcvdWarning && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale size={16} className="text-orange-600" />
            <Text strong className="text-sm uppercase tracking-wide text-orange-600">
              AD/CVD Order Detail
            </Text>
            <Tooltip title={GLOSSARY['AD/CVD']}>
              <HelpCircle size={14} className="text-slate-400 cursor-help" />
            </Tooltip>
          </div>
          <Card className="bg-white border border-slate-200 shadow-sm" size="small">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text strong>{adcvdWarning.productCategory}</Text>
                {adcvdWarning.dutyRange && (
                  <Tag color="red">Duty Range: {adcvdWarning.dutyRange}</Tag>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {adcvdWarning.affectedCountries.map(cc => (
                  <Tag 
                    key={cc} 
                    color={adcvdWarning.isCountryAffected && cc === countryCode ? 'red' : 'default'}
                    className="!text-xs"
                  >
                    {cc}
                  </Tag>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-slate-500 text-xs">
                  {adcvdWarning.orderCount} active order{adcvdWarning.orderCount !== 1 ? 's' : ''}
                </Text>
                <Button 
                  size="small" 
                  type="link" 
                  href={adcvdWarning.lookupUrl} 
                  target="_blank"
                  icon={<ExternalLink size={12} />}
                >
                  CBP AD/CVD Database
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Passed Checks ──────────────────────────────────────────── */}
      {passedChecks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-600" />
            <Text strong className="text-sm uppercase tracking-wide text-green-600">
              Passed Checks
            </Text>
          </div>
          <Card className="bg-green-50 border-green-200" size="small">
            <Space direction="vertical" size={8} className="w-full">
              {passedChecks.map((check, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <AcronymText text={check.label} className="text-green-800 text-sm" />
                    {check.detail && (
                      <AcronymText text={check.detail} className="text-green-600 text-xs block" />
                    )}
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </div>
      )}

      {/* ─── No Alerts Fallback ─────────────────────────────────────── */}
      {alerts.length === 0 && (
        <Alert
          message="No compliance issues found"
          description="Your product passed all compliance checks. Standard import documentation and procedures apply."
          type="success"
          showIcon
        />
      )}

      {/* ─── Deep-Dive Compliance Tools (Promoted CTA Grid) ─────────── */}
      <div>
        <Divider className="!mt-2 !mb-5" />
        <div className="mb-4">
          <Text strong className="text-base block mb-1">Run Detailed Compliance Checks</Text>
          <Text className="text-slate-500 text-sm">
            Use our specialized tools to screen specific suppliers, look up orders, or check agency requirements.
          </Text>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOOL_DESCRIPTIONS.map(tool => (
            <a
              key={tool.key}
              href={contextualToolLinks[tool.key]}
              className="group block rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-md transition-all no-underline"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Text strong className="text-sm text-slate-900">{tool.title}</Text>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <Text className="text-slate-500 text-xs block mt-0.5">{tool.description}</Text>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/** Individual alert card */
const AlertCard: React.FC<{ alert: ComplianceAlert }> = ({ alert }) => {
  const levelConfig = {
    high: { icon: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    medium: { icon: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    low: { icon: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  }[alert.level];

  return (
    <Card 
      className={`${levelConfig.bg} ${levelConfig.border} border shadow-none !mb-0`} 
      size="small"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className={`${levelConfig.icon} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <AcronymText text={alert.title} className="text-sm font-semibold" />
            {alert.financialExposure && (
              <Tag color="red" className="!text-xs !m-0">
                {alert.financialExposure}
              </Tag>
            )}
          </div>
          <AcronymText text={alert.description} className="text-slate-600 text-sm block mb-2" />

          {alert.requiredActions && alert.requiredActions.length > 0 && (
            <div className="mb-2">
              <Text className="text-xs font-semibold text-slate-500 block mb-1">REQUIRED ACTIONS</Text>
              <ul className="list-none pl-0 space-y-0.5">
                {alert.requiredActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-slate-600">
                    <ArrowRight size={12} className="mt-1 shrink-0 text-slate-400" />
                    <AcronymText text={action} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alert.risk && (
            <div className="bg-slate-50 rounded-md px-3 py-1.5 mb-2">
              <Text className="text-xs text-slate-500">
                <Text strong className="text-xs">Risk: </Text>
                <AcronymText text={alert.risk} />
              </Text>
            </div>
          )}

          {alert.learnMoreUrl && (
            <Button 
              size="small" 
              type="link" 
              className="!p-0 !h-auto"
              href={alert.learnMoreUrl} 
              target={alert.learnMoreUrl.startsWith('http') ? '_blank' : undefined}
              icon={<ExternalLink size={12} />}
            >
              Learn More
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

/** PGA agency card */
const PGACard: React.FC<{ pga: PGARequirement }> = ({ pga }) => (
  <Card className="bg-white border border-slate-200 shadow-sm" size="small">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-blue-600" />
          <Tooltip title={GLOSSARY[pga.agencyCode] || pga.agencyName}>
            <Text strong className="text-sm border-b border-dotted border-slate-400 cursor-help">
              {pga.agencyCode}
            </Text>
          </Tooltip>
        </div>
        <Button 
          size="small" 
          type="link" 
          href={pga.website} 
          target="_blank" 
          icon={<ExternalLink size={12} />}
          className="!p-0 !h-auto"
        >
          Website
        </Button>
      </div>
      <Text className="text-slate-600 text-xs block">{pga.agencyName}</Text>
      {pga.flags.map(flag => (
        <div key={flag.code} className="bg-slate-50 rounded-md p-2">
          <Text className="text-xs font-semibold block">{flag.code} &mdash; {flag.name}</Text>
          <Text className="text-xs text-slate-500 block">{flag.description}</Text>
        </div>
      ))}
    </div>
  </Card>
);
