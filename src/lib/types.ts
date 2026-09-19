// Sahayak NSFDC Domain Types - Strict Typing per DATA_MODEL.md & API_SPEC.md

export type SchemePurpose = 'BUSINESS' | 'EDUCATION' | 'BOTH';

export type SchemeCategory = 
  | 'MICRO_FINANCE' 
  | 'TERM_LOAN' 
  | 'ENTREPRENEURSHIP' 
  | 'EDUCATION'
  | 'GREEN_BUSINESS'
  | 'DISABILITY_ENTERPRISE'
  | 'DISABILITY_MICROFINANCE'
  | 'LIVELIHOOD'
  | 'ENTERPRISE'
  | 'LOAN';

export interface SchemeEligibilityRules {
  minAge?: number;
  maxAge?: number;
  maxAnnualFamilyIncome: number; // e.g. 300000 (₹3 Lakhs) or 0/null for no ceiling
  requireScCertificate: boolean;
  requiresBenchmarkDisability?: boolean;
  noIncomeCeiling?: boolean;
  educationCourseTypeRequired?: boolean;
  notes?: string;
  notesHi?: string;
}

export interface SchemeDocumentItem {
  id: string;
  name: string;
  nameHi: string;
  mandatory: boolean;
  description: string;
  descriptionHi: string;
}

export interface Scheme {
  id: string;
  code: string; // e.g. 'MFS', 'AMY', 'TERM_LOAN', 'UNY', 'ELS'
  slug: string;
  name: string;
  nameHi: string;
  category: SchemeCategory;
  tagline: string;
  taglineHi: string;
  description: string;
  descriptionHi: string;
  purpose: SchemePurpose;
  project_cost_min: number;
  project_cost_max: number;
  max_loan_amount: number;
  beneficiary_interest_rate_min: number; // e.g. 4 for 4%
  beneficiary_interest_rate_max: number; // e.g. 8 for 8%
  rebate_women_pct?: number; // e.g. 1% or 0.5%
  repayment_period_months: number;
  moratorium_months: number;
  financing_percentage_max: number; // e.g. 90 or 100
  eligibility_rules: SchemeEligibilityRules;
  documents: SchemeDocumentItem[];
  official_source_url: string;
  source_title: string;
  source_checked_at: string;
  effective_from: string;
  version: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
}

export type PartnerType = 'SCA' | 'RRB' | 'PSB' | 'BANK' | 'OTHER';

export type OperationalStatus = 'VERIFIED' | 'UNVERIFIED';

export type CapacityStatus = 
  | 'UNKNOWN' 
  | 'VERIFIED_AVAILABLE' 
  | 'VERIFIED_LIMITED' 
  | 'VERIFIED_UNAVAILABLE';

export type PartnerEligibilityStatus = 'eligible' | 'restricted' | 'ineligible';

export interface PartnerHealth {
  npaPercentage: number;
  overdueFlag: boolean;
  fundUtilizationPercentage: number;
  eligibilityStatus?: PartnerEligibilityStatus;
}

export interface Partner {
  id: string;
  name: string;
  nameHi?: string;
  partner_type: PartnerType;
  state: string;
  district: string;
  address: string;
  addressHi?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  supported_scheme_codes: string[];
  verified_at: string;
  verification_source_url: string;
  operational_status: OperationalStatus;
  capacity_status: CapacityStatus;
  capacity_status_source?: string;
  capacity_status_checked_at?: string;
  partnerHealth: PartnerHealth;
  eligibilityStatus?: PartnerEligibilityStatus;
  eligibilityReason?: string;
  adminMetrics?: {
    npaPercentage: number;
    overdueFlag: boolean;
    fundUtilizationPercentage: number;
  };
}

export type RecommendationDecision = 'LIKELY_MATCH' | 'POSSIBLE_MATCH' | 'NOT_MATCHING';

export type ReasonCode =
  | 'PURPOSE_BUSINESS'
  | 'PURPOSE_EDUCATION'
  | 'PURPOSE_GREEN_BUSINESS'
  | 'PURPOSE_AGRICULTURE'
  | 'PURPOSE_TRANSPORT'
  | 'GENDER_FEMALE_PRIORITY'
  | 'GENDER_FEMALE_REBATE'
  | 'GENDER_MALE_WARNING'
  | 'SC_REQUIREMENT_MET'
  | 'INCOME_WITHIN_LIMIT'
  | 'PROJECT_COST_IN_RANGE'
  | 'COURSE_TYPE_MATCH'
  | 'MISSING_SC_CERTIFICATE'
  | 'INCOME_ABOVE_LIMIT'
  | 'PROJECT_COST_OUTSIDE_RANGE'
  | 'COURSE_TYPE_MISMATCH'
  | 'AGE_UNDER_18'
  | 'AGE_ELIGIBLE'
  | 'FINAL_VERIFICATION_REQUIRED';


export interface RecommendationItem {
  schemeCode: string;
  schemeName: string;
  schemeNameHi: string;
  decision: RecommendationDecision;
  matchScore: number; // 0 - 100
  reasonCodes: ReasonCode[];
  reasons: string[];
  reasonsHi: string[];
  warnings: string[];
  warningsHi: string[];
  missingInformation: string[];
  missingInformationHi: string[];
  scheme: Scheme;
}

export interface ExplainableRecommendationItem {
  schemeId: string;
  schemeName: string;
  matchedRule: string;
  fitScore: number; // 0 - 1
  whyNotTop?: string;
  schemeCode?: string;
  category?: SchemeCategory;
  interestRate?: string;
  maxLoanAmount?: number;
}

export interface RecommendationResponse {
  engineVersion: string;
  requestId: string;
  evaluatedAt: string;
  recommended: ExplainableRecommendationItem | null;
  alternatives: ExplainableRecommendationItem[];
  results: RecommendationItem[];
  source: {
    url: string;
    title: string;
    checkedAt: string;
  };
}

export type RecommendationPurpose = 
  | 'BUSINESS' 
  | 'EDUCATION' 
  | 'GREEN_BUSINESS' 
  | 'AGRICULTURE' 
  | 'TRANSPORT';

export type EmploymentStatus = 
  | 'UNEMPLOYED' 
  | 'SELF_EMPLOYED' 
  | 'DAILY_WAGE' 
  | 'STUDENT' 
  | 'SALARIED';

export type AreaType = 
  | 'RURAL' 
  | 'URBAN' 
  | 'SEMI_URBAN';

export interface RecommendationRequest {
  purpose: RecommendationPurpose;
  projectCost: number;
  annualFamilyIncome: number;
  scCertificate: 'YES' | 'NO' | 'IN_PROGRESS';
  courseType?: 'FULL_TIME_PROFESSIONAL' | 'OTHER';
  activityCategory?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  age?: number;
  employmentStatus?: EmploymentStatus;
  state?: string;
  areaType?: AreaType;
  location?: {
    state: string;
    district?: string;
  };
  hasDisability?: boolean;
  disabilityStatus?: 'NO' | 'YES_WITH_CERT' | 'YES_NO_CERT';
  disabilityPercentage?: number;
}


export type MoratoriumMode =
  | 'NO_INTEREST_DURING_MORATORIUM'
  | 'INTEREST_ACCRUES'
  | 'DEFERRED_PAYMENT';

export type RepaymentFrequency = 'MONTHLY' | 'QUARTERLY';

export interface CalculationRequest {
  principal: number;
  annualRate: number; // percentage, e.g. 6 for 6%
  tenureMonths: number;
  moratoriumMonths?: number;
  moratoriumMode?: MoratoriumMode;
  frequency?: RepaymentFrequency;
  projectCost?: number;
}

export interface AmortizationRow {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface CalculationResult {
  installmentPayment: number;
  frequency: RepaymentFrequency;
  totalRepayment: number;
  totalInterest: number;
  principal: number;
  projectCost: number;
  marginMoney: number; // own contribution
  financedPercentage: number;
  moratoriumMonths: number;
  moratoriumMode: MoratoriumMode;
  amortizationPreview: AmortizationRow[];
  assumptions: string[];
  assumptionsHi: string[];
  disclaimer: string;
  disclaimerHi: string;
}

export interface SourceMetadata {
  id: string;
  url: string;
  title: string;
  sourceType: 'OFFICIAL_PORTAL' | 'OFFICIAL_FAQ' | 'POLICY_DOCUMENT' | 'NOTIFICATION';
  retrievedAt: string;
  publishedAt?: string;
  effectiveDate: string;
  contentHash: string;
  reviewer: string;
  status: 'CURRENT_VERIFIED' | 'NEEDS_REVIEW' | 'SUPERSEDED';
  notes?: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'ROLLBACK';
  entityType: 'SCHEME_RULE' | 'PARTNER' | 'SOURCE' | 'TRANSLATION';
  entityId: string;
  beforeJson?: string;
  afterJson?: string;
  reason: string;
  sourceUrl?: string;
  createdAt: string;
}
