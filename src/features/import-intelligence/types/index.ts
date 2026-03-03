// Import Intelligence Types

export interface ProductAttributes {
  containsBattery: boolean;
  containsChemicals: boolean;
  forChildren: boolean;
  foodContact: boolean;
  wireless: boolean;
  medicalDevice: boolean;
  pressurized: boolean;
  flammable: boolean;
}

export interface ProductInput {
  description?: string;
  htsCode?: string;
  countryCode: string;
  value: number;
  quantity: number;
  attributes: ProductAttributes;
  shippingCost?: number;
  insuranceCost?: number;
  isOceanShipment?: boolean;
}

export interface HtsAlternative {
  code: string;
  description: string;
  confidence: number;
  dutyRate: string;
}

export interface SplitConfidence {
  heading: number;       // 0-100: How sure we are about the 4-digit heading
  code: number;          // 0-100: How sure we are about the specific statistical suffix
  combined: number;      // heading × code / 100 (the effective confidence)
  headingExplanation: string;
  codeExplanation: string;
}

export interface HeadingPredictionSummary {
  topHeading: string;    // 4-digit heading code
  topChapter: string;    // 2-digit chapter
  confidence: number;    // Confidence of top prediction
  method: string;        // 'deterministic' | 'setfit' | 'ai'
  constrained: boolean;  // Whether search was gated to predicted headings
}

export interface Classification {
  htsCode: string;
  description: string;
  confidence: number;
  baseMfnRate?: number;
  alternatives: HtsAlternative[];
  path: string[];
  splitConfidence?: SplitConfidence;
  headingPrediction?: HeadingPredictionSummary;
  suggestedProductName?: string | null;
}

export interface DutyLayer {
  name: string;
  rate: number;
  amount: number;
  description: string;
  legalReference?: string;
  programType: 'base_mfn' | 'section_301' | 'ieepa_fentanyl' | 'ieepa_baseline' | 'ieepa_reciprocal' | 'section_232' | 'adcvd' | 'fta_discount';
}

export interface DutyBreakdown {
  // Individual rates (for backward compatibility)
  baseMfn: number;
  section301?: number;
  ieepaFentanyl?: number;
  ieepaBaseline?: number;
  ieepaReciprocal?: number;
  section232?: number;
  adcvd?: number;
  ftaDiscount?: number;
  
  // Totals
  total: number;
  effectiveRate: number;
  
  // Detailed breakdown for UI
  layers: DutyLayer[];
  
  // Warnings
  warnings?: string[];
}

export interface FeeBreakdown {
  mpf: number;
  hmf: number;
  total: number;
}

export interface AdditionalCosts {
  customsBroker: number;
  drayage: number;
  total: number;
}

export interface LandedCost {
  productValue: number;
  shipping: number;
  insurance: number;
  shippingIsEstimated: boolean;
  insuranceIsEstimated: boolean;
  isOceanShipment: boolean;
  
  // Dutiable value (FOB product value — US customs uses transaction value, not CIF)
  dutiableValue: number;
  
  duties: DutyBreakdown;
  fees: FeeBreakdown;
  estimatedAdditional: AdditionalCosts;
  total: number;
  perUnit: number;
  
  // Insights
  dutyAsPercentOfProduct: number;
  
  // Data quality & freshness
  dataQuality: 'high' | 'medium' | 'low';
  lastUpdated: Date | string | null;
  tariffConfidence: number;
  dataSource?: string;
  
  // Tariff breakdown summary (rate percentages by program)
  tariffBreakdown?: TariffBreakdownSummary;
}

export interface TariffBreakdownSummary {
  baseMfn: number;
  section301: number;
  ieepaFentanyl: number;
  ieepaBaseline: number;
  ieepaReciprocal: number;
  section232: number;
  adcvd: number;
  ftaDiscount: number;
  effectiveRate: number;
  breakdown?: Array<{ type?: string; name?: string; rate?: number; amount?: number }>;
}

export interface CountryOption {
  countryCode: string;
  countryName: string;
  landedCost: number;
  landedCostPerUnit?: number;
  productCostPerUnit?: number;
  dutyRate: number;
  savings: number;
  savingsPercent?: number;
  ftaAvailable: boolean;
  ftaName?: string;
  supplierCount?: number;
  transitDays?: number;
  confidenceScore?: number;
  dataQuality?: 'high' | 'medium' | 'low';
  dataSource?: 'cost_data' | 'estimate' | 'tariff_only';
  tariffBreakdown?: TariffBreakdownSummary;
  importVolume?: number;
  importVolumeYear?: number;
  costTrend?: 'rising' | 'falling' | 'stable';
  costTrendPercent?: number;
}

export interface CountryComparison {
  current: CountryOption;
  alternatives: CountryOption[];
  recommendation: string;
}

export type ComplianceAlertLevel = 'high' | 'medium' | 'low';

export type ComplianceCategory = 
  | 'pga'           // Partner Government Agency requirements
  | 'adcvd'         // Antidumping / Countervailing Duties
  | 'tariff_program' // Section 301, 232, IEEPA warnings
  | 'forced_labor'  // UFLPA / forced labor risk
  | 'sanctions'     // Sanctioned/embargoed country
  | 'fta'           // FTA qualification requirements
  | 'general';      // General compliance

export interface ComplianceAlert {
  level: ComplianceAlertLevel;
  category: ComplianceCategory;
  title: string;
  description: string;
  requiredActions?: string[];
  risk?: string;
  learnMoreUrl?: string;
  /** Financial exposure estimate (e.g., AD/CVD duty range) */
  financialExposure?: string;
}

/** PGA agency requirement surfaced from classification */
export interface PGARequirement {
  agencyCode: string;
  agencyName: string;
  flags: Array<{
    code: string;
    name: string;
    description: string;
    requirements: string[];
  }>;
  website: string;
}

/** AD/CVD order warning surfaced from classification */
export interface ADCVDWarning {
  productCategory: string;
  affectedCountries: string[];
  isCountryAffected: boolean;
  dutyRange?: string;
  orderCount: number;
  lookupUrl: string;
}

export interface CompliancePassedCheck {
  category: ComplianceCategory;
  label: string;
  detail?: string;
}

export interface Compliance {
  alerts: ComplianceAlert[];
  passedChecks: CompliancePassedCheck[];
  riskLevel: 'low' | 'medium' | 'high';
  /** Overall risk score 0-100 (higher = more risk) */
  riskScore: number;
  /** PGA agencies with requirements for this HTS code */
  pgaRequirements: PGARequirement[];
  /** AD/CVD order warning if applicable */
  adcvdWarning?: ADCVDWarning;
  /** Deep-dive tool links */
  toolLinks: {
    deniedPartySearch: string;
    adcvdLookup: string;
    pgaLookup: string;
    ftaCalculator: string;
  };
}

export type DocumentCriticality = 'critical' | 'required' | 'recommended';

export interface DocumentRequirement {
  name: string;
  criticality: DocumentCriticality;
  description: string;
  agency?: string;
  templateUrl?: string;
  learnMoreUrl?: string;
  mustInclude?: string[];
}

export interface CarrierRestriction {
  carrier: string;
  restriction: string;
  details: string;
}

export interface DangerousGoodsRequirements {
  unClass: string;
  unNumber: string;
  properShippingName: string;
  hazardClass: string;
  packingGroup?: string;
  packingInstruction: string;
  documents: DocumentRequirement[];
  carrierRestrictions: CarrierRestriction[];
  packagingRequirements: string[];
  labelingRequirements: string[];
}

export interface Documentation {
  critical: DocumentRequirement[];
  required: DocumentRequirement[];
  recommended: DocumentRequirement[];
  dangerousGoods?: DangerousGoodsRequirements;
}

export type OptimizationType =
  | 'country_switch'
  | 'fta_qualification'
  | 'classification_review'
  | 'tariff_engineering'
  | 'section_232_exclusion'
  | 'duty_drawback'
  | 'adcvd_mitigation'
  | 'high_tariff_alert';

export type OptimizationDifficulty = 'easy' | 'medium' | 'hard';
export type OptimizationPriority = 'high' | 'medium' | 'low';

export interface OptimizationOpportunity {
  id: string;
  title: string;
  type: OptimizationType;
  savings: number;
  /** Savings as percentage of current landed cost */
  savingsPercent?: number;
  description: string;
  tradeoffs?: string[];
  requirements?: string[];
  /** Button label for primary CTA (e.g., "Compare Countries", "Open FTA Calculator") */
  actionLabel?: string;
  /** Internal route for primary CTA */
  actionUrl?: string;
  /** Difficulty of implementing this optimization */
  difficulty?: OptimizationDifficulty;
  /** Priority ranking — affects sort order */
  priority?: OptimizationPriority;
  /** Which collapse section this relates to (for scroll-to-section) */
  relatedSection?: string;
}

export interface Optimization {
  opportunities: OptimizationOpportunity[];
  /** De-duplicated total savings (accounts for overlapping opportunities) */
  totalPotentialSavings: number;
  topRecommendation: string;
}

export interface ImportAnalysis {
  id: string;
  createdAt: Date;
  input: ProductInput;
  classification: Classification;
  landedCost: LandedCost;
  countryComparison: CountryComparison;
  compliance: Compliance;
  documentation: Documentation;
  optimization: Optimization;
}

