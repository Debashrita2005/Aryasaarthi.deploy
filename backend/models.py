from typing import List, Optional, Literal, Any
from pydantic import BaseModel, Field

GenderType = Literal["MALE", "FEMALE", "OTHER"]
ScCertType = Literal["YES", "NO", "IN_PROGRESS"]
PurposeType = Literal["BUSINESS", "EDUCATION", "GREEN_BUSINESS", "AGRICULTURE", "TRANSPORT"]
DecisionType = Literal["STRONG_MATCH", "LIKELY_MATCH", "INELIGIBLE"]

class FinancialSummary(BaseModel):
    eligibleLoanAmount: float
    beneficiaryContribution: float
    subsidyAmount: float
    interestRate: float
    tenureMonths: int
    moratoriumMonths: int
    estimatedEmi: float

class RecommendationRequest(BaseModel):
    age: Optional[int] = 18
    gender: GenderType = "MALE"
    annualFamilyIncome: float = Field(default=250000.0, ge=0)
    scCertificate: ScCertType = "YES"
    purpose: PurposeType = "BUSINESS"
    projectCost: float = Field(default=100000.0, gt=0)
    state: str = "Uttar Pradesh"
    district: Optional[str] = None
    hasDisability: Optional[bool] = False
    disabilityPercentage: Optional[float] = 0.0
    educationCourseType: Optional[str] = None
    priorDefault: Optional[bool] = False

class RecommendationItem(BaseModel):
    schemeId: str
    schemeCode: str
    schemeName: str
    score: float
    decision: DecisionType
    reasons: List[str] = []
    reasonsHi: List[str] = []
    warnings: List[str] = []
    warningsHi: List[str] = []
    missingInformation: List[str] = []
    missingInformationHi: List[str] = []
    financialSummary: FinancialSummary

class RecommendationResponse(BaseModel):
    requestId: str
    evaluatedAt: str
    bestMatch: Optional[RecommendationItem] = None
    candidateSchemes: List[RecommendationItem] = []
    results: List[RecommendationItem] = []
    recommended: Optional[Any] = None
    alternatives: List[Any] = []

class DocumentItem(BaseModel):
    id: str
    name: str
    nameHi: Optional[str] = None
    mandatory: bool = True
    description: str = ""
    descriptionHi: Optional[str] = None

class EligibilityRules(BaseModel):
    minAge: Optional[int] = 18
    maxAge: Optional[int] = None
    maxAnnualFamilyIncome: Optional[float] = 300000.0  # None means no income ceiling
    requireScCertificate: bool = True
    requiresBenchmarkDisability: bool = False
    educationCourseTypeRequired: bool = False
    notes: Optional[str] = None
    notesHi: Optional[str] = None

class SchemeModel(BaseModel):
    id: str
    code: str
    slug: str
    name: str
    nameHi: str
    category: str
    track: str = "SC_CENTRAL"  # "SC_CENTRAL" | "NDFDC_DISABILITY" | "STATE_SPECIFIC"
    tagline: str
    taglineHi: str
    description: str
    descriptionHi: str
    purpose: str
    project_cost_min: float
    project_cost_max: float
    max_loan_amount: float
    beneficiary_interest_rate_min: float
    beneficiary_interest_rate_max: float
    rebate_women_pct: float = 0.0
    repayment_period_months: int
    moratorium_months: int
    financing_percentage_max: float = 90.0
    eligibility_rules: EligibilityRules
    documents: List[DocumentItem] = []
    official_source_url: str = "https://nsfdc.nic.in"
    source_title: str = "Official Guidelines"
    status: str = "ACTIVE"

class PartnerModel(BaseModel):
    id: str
    name: str
    nameHi: Optional[str] = None
    partnerType: str
    state: str
    district: str
    address: str
    addressHi: Optional[str] = None
    latitude: float
    longitude: float
    phone: str
    email: str
    supportedSchemes: List[str] = []
    operationalStatus: str = "VERIFIED"
