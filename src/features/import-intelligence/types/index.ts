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
}

export interface HtsAlternative {
  code: string;
  description: string;
  confidence: number;
  dutyRate: string;
}

export interface Classification {
  htsCode: string;
  description: string;
  confidence: number;
  alternatives: HtsAlternative[];
  path: string[];
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
  
  // Dutiable value (CIF = FOB + Shipping + Insurance)
  dutiableValue: number;
  
  duties: DutyBreakdown;
  fees: FeeBreakdown;
  estimatedAdditional: AdditionalCosts;
  total: number;
  perUnit: number;
  
  // Insights
  dutyAsPercentOfProduct: number; // How much duties add to product cost
  
  // Data quality & freshness
  dataQuality: 'high' | 'medium' | 'low';
  lastUpdated: Date | string | null;
  tariffConfidence: number; // 0-100 confidence in tariff accuracy
  dataSource?: string; // e.g., "USITC HTS API", "Tariff Registry"
}

export interface CountryOption {
  countryCode: string;
  countryName: string;
  landedCost: number;
  dutyRate: number;
  savings: number;
  ftaAvailable: boolean;
  ftaName?: string;
}

export interface CountryComparison {
  current: CountryOption;
  alternatives: CountryOption[];
  recommendation: string;
}

export type ComplianceAlertLevel = 'high' | 'medium' | 'low';

export interface ComplianceAlert {
  level: ComplianceAlertLevel;
  title: string;
  description: string;
  requiredActions?: string[];
  risk?: string;
  learnMoreUrl?: string;
}

export interface Compliance {
  alerts: ComplianceAlert[];
  passedChecks: string[];
  riskLevel: 'low' | 'medium' | 'high';
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

export interface OptimizationOpportunity {
  id: string;
  title: string;
  type: 'country_switch' | 'fta_qualification' | 'classification_review';
  savings: number;
  description: string;
  tradeoffs?: string[];
  requirements?: string[];
  actionUrl?: string;
}

export interface Optimization {
  opportunities: OptimizationOpportunity[];
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

export interface BulkProduct {
  sku: string;
  description: string;
  countryCode: string;
  value: number;
  quantity?: number;
  htsCode?: string;
  attributes?: Partial<ProductAttributes>;
}

export interface BulkAnalysisStatus {
  analysisId: string;
  status: 'processing' | 'complete' | 'failed';
  progress: number;
  estimatedTime?: number;
  totalProducts: number;
  processedProducts: number;
  failedProducts: number;
}

export interface PortfolioSummary {
  totalProducts: number;
  totalValue: number;
  totalDuty: number;
  averageRate: number;
  attentionRequired: number;
  complianceAlerts: number;
  recentChanges: number;
}

export interface PortfolioProduct {
  sku: string;
  product: string;
  countryCode: string;
  dutyRate: number;
  status: string;
  alert?: string;
  analysis: ImportAnalysis;
}

export interface PortfolioAnalysis {
  summary: PortfolioSummary;
  dutyExposureByCountry: Array<{
    countryCode: string;
    countryName: string;
    totalDuty: number;
    percentage: number;
  }>;
  optimizationOpportunities: Array<{
    type: string;
    productCount: number;
    savings: number;
    description: string;
  }>;
  products: PortfolioProduct[];
}
