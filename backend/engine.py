import math
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from models import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    FinancialSummary,
    SchemeModel,
    EligibilityRules,
    DocumentItem
)

# Built-in Catalog of Verified Official Schemes (NSFDC, NDFDC Disability, Central)
DEFAULT_SCHEMES: List[SchemeModel] = [
    # 1. Micro Finance Scheme (MFS)
    SchemeModel(
        id="scheme_mfs_01",
        code="MFS",
        slug="micro-finance-scheme",
        name="Micro Finance Scheme (MFS)",
        nameHi="लघु वित्त योजना (माइक्रो फाइनेंस)",
        category="MICRO_FINANCE",
        track="SC_CENTRAL",
        tagline="Direct micro-credit up to ₹1.40 Lakhs for small village shops, rural crafts, and micro income activities",
        taglineHi="छोटी दुकानों, कारीगरी और आजीविका कार्यों के लिए ₹1.40 लाख तक का त्वरित सूक्ष्म ऋण",
        description="Provides direct financial assistance to Scheduled Caste entrepreneurs for setting up or expanding small income-generating micro-enterprises at a capped 6.5% interest rate.",
        descriptionHi="अनुसूचित जाति के उद्यमियों को छोटी आजीविका इकाइयों या दुकानों को शुरू करने अथवा विस्तार देने हेतु 6.5% वार्षिक ब्याज पर वित्तीय सहायता।",
        purpose="BUSINESS",
        project_cost_min=10000,
        project_cost_max=140000,
        max_loan_amount=125000,
        beneficiary_interest_rate_min=6.5,
        beneficiary_interest_rate_max=6.5,
        rebate_women_pct=0.0,
        repayment_period_months=36,
        moratorium_months=3,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=300000.0,
            requireScCertificate=True,
            notes="Applicant must belong to Scheduled Caste community with annual family income up to ₹3,00,000.",
            notesHi="आवेदक अनुसूचित जाति से होना चाहिए तथा वार्षिक पारिवारिक आय ₹3,00,000 तक होनी चाहिए।"
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True, description="Revenue authority issued"),
            DocumentItem(id="doc_inc", name="Income Certificate", mandatory=True, description="Family income up to ₹3 Lakh"),
            DocumentItem(id="doc_kyc", name="Aadhaar & Bank Passbook", mandatory=True, description="Identity and bank account proof")
        ]
    ),

    # 2. Term Loan Scheme (TLS)
    SchemeModel(
        id="scheme_tls_03",
        code="TERM_LOAN",
        slug="term-loan-scheme",
        name="Term Loan Scheme (TLS)",
        nameHi="मियादी ऋण योजना (टर्म लोन)",
        category="TERM_LOAN",
        track="SC_CENTRAL",
        tagline="Substantial capital assistance up to ₹50 Lakhs for commercial, service, agriculture, and transport ventures",
        taglineHi="व्यवसाय, दुकान, वाहन, उद्योग और सेवा इकाइयों के लिए ₹50 लाख तक का पूंजीगत मियादी ऋण",
        description="Provides medium to long-term funding for viable self-employment projects above ₹1.40 Lakh up to ₹50 Lakh at 8% p.a. with up to 7-year repayment.",
        descriptionHi="₹1.40 लाख से अधिक और ₹50 लाख तक की स्वरोजगार परियोजनाओं के लिए 8% वार्षिक ब्याज पर 7 वर्ष की अवधि का ऋण।",
        purpose="BUSINESS",
        project_cost_min=140001,
        project_cost_max=5000000,
        max_loan_amount=4500000,
        beneficiary_interest_rate_min=8.0,
        beneficiary_interest_rate_max=8.0,
        rebate_women_pct=1.0,
        repayment_period_months=84,
        moratorium_months=6,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=300000.0,
            requireScCertificate=True,
            notes="Units up to ₹50 Lakh. Beneficiary rate is 8% p.a. Moratorium is 6 months (12 months for construction/plantation).",
            notesHi="₹50 लाख तक की इकाइयां। ब्याज दर 8% वार्षिक। 6 से 12 माह की छूट अवधि।"
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True),
            DocumentItem(id="doc_project", name="Project Profile / Business Quotation", mandatory=True),
            DocumentItem(id="doc_inc", name="Income Certificate", mandatory=True)
        ]
    ),

    # 3. Udyam Nidhi Yojana (UNY)
    SchemeModel(
        id="scheme_uny_04",
        code="UNY",
        slug="udyam-nidhi-yojana",
        name="Udyam Nidhi Yojana (UNY)",
        nameHi="उद्यम निधि योजना (UNY)",
        category="ENTREPRENEURSHIP",
        track="SC_CENTRAL",
        tagline="Loans up to ₹5.00 Lakhs through Cooperative Banks and Small Finance Banks for micro-enterprises",
        taglineHi="सहकारी बैंकों व स्मॉल फाइनेंस बैंकों के माध्यम से लघु उद्यमों हेतु ₹5.00 लाख तक का ऋण",
        description="Provides loans up to ₹5.00 Lakh through Cooperative Banks and Small Finance Banks to pursue small and micro businesses.",
        descriptionHi="सहकारी बैंकों व लघु वित्त बैंकों के माध्यम से ₹5.00 लाख तक की व्यावसायिक गतिविधियों हेतु ऋण।",
        purpose="BUSINESS",
        project_cost_min=50000,
        project_cost_max=500000,
        max_loan_amount=450000,
        beneficiary_interest_rate_min=13.0,
        beneficiary_interest_rate_max=15.0,
        rebate_women_pct=0.0,
        repayment_period_months=60,
        moratorium_months=3,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=300000.0,
            requireScCertificate=True
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True),
            DocumentItem(id="doc_kyc", name="KYC Documents", mandatory=True)
        ]
    ),

    # 4. Aajeevika Micro-Finance Yojana (AMY)
    SchemeModel(
        id="scheme_amy_02",
        code="AMY",
        slug="aajeevika-micro-finance-yojana",
        name="Aajeevika Micro-Finance Yojana (AMY)",
        nameHi="आजीविका माइक्रो-फाइनेंस योजना (AMY)",
        category="MICRO_FINANCE",
        track="SC_CENTRAL",
        tagline="Prompt micro-finance delivered through accredited NBFC-MFIs for small business pursuits",
        taglineHi="गैर-बैंकिंग वित्तीय कंपनियों (NBFC-MFIs) के माध्यम से त्वरित आजीविका ऋण",
        description="Provides prompt micro finance to eligible SC individuals through selected NBFC-MFIs at 15% p.a.",
        descriptionHi="चयनित NBFC-MFI के माध्यम से छोटे व्यवसाय व आजीविका हेतु 15% ब्याज पर त्वरित ऋण।",
        purpose="BUSINESS",
        project_cost_min=10000,
        project_cost_max=140000,
        max_loan_amount=125000,
        beneficiary_interest_rate_min=15.0,
        beneficiary_interest_rate_max=15.0,
        rebate_women_pct=0.0,
        repayment_period_months=36,
        moratorium_months=3,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=300000.0,
            requireScCertificate=True
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True)
        ]
    ),

    # 5. Educational Loan Scheme (ELS)
    SchemeModel(
        id="scheme_els_05",
        code="ELS",
        slug="educational-loan-scheme",
        name="Educational Loan Scheme (ELS)",
        nameHi="शिक्षा ऋण योजना (एजुकेशनल लोन)",
        category="EDUCATION",
        track="SC_CENTRAL",
        tagline="Concessional education loan up to ₹40 Lakhs (Domestic & Abroad) for 25 recognized professional courses",
        taglineHi="भारत व विदेश में 25 मान्यता प्राप्त व्यावसायिक व तकनीकी पाठ्यक्रमों हेतु ₹40 लाख तक रियायती शिक्षा ऋण",
        description="Provides education loans up to ₹40.00 Lakh for full-time professional degrees at 6.5% interest (6.0% for women).",
        descriptionHi="इंजीनियरिंग, मेडिकल, लॉ व तकनीकी पाठ्यक्रमों हेतु ₹40 लाख तक का ऋण। 6.5% ब्याज (छात्राओं को 6.0%)।",
        purpose="EDUCATION",
        project_cost_min=50000,
        project_cost_max=4000000,
        max_loan_amount=3600000,
        beneficiary_interest_rate_min=6.5,
        beneficiary_interest_rate_max=6.5,
        rebate_women_pct=0.5,
        repayment_period_months=144,
        moratorium_months=12,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=16,
            maxAnnualFamilyIncome=300000.0,
            requireScCertificate=True,
            educationCourseTypeRequired=True
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True),
            DocumentItem(id="doc_admission", name="Admission Offer Letter", mandatory=True),
            DocumentItem(id="doc_fee", name="Fee Structure Breakdown", mandatory=True)
        ]
    ),

    # 6. Green Business Scheme (GBS)
    SchemeModel(
        id="scheme_gbs_06",
        code="GBS",
        slug="green-business-scheme",
        name="Green Business Scheme (GBS)",
        nameHi="ग्रीन बिजनेस योजना (GBS)",
        category="GREEN_BUSINESS",
        track="SC_CENTRAL",
        tagline="Eco-friendly loans up to ₹30 Lakhs for solar power, e-rickshaws, battery vehicles, and green ventures",
        taglineHi="सौर ऊर्जा, ई-रिक्शा, बैटरी वाहन और हरित उद्यमों हेतु ₹30 लाख तक का ऋण",
        description="Assistance for solar rooftop, e-rickshaws, battery transport, polyhouses, and waste recycling at 8% p.a.",
        descriptionHi="सोलर यूनिट, ई-रिक्शा, बैटरी वाहन और पर्यावरण अनुकूल उद्यमों हेतु 8% ब्याज पर ₹30 लाख तक ऋण।",
        purpose="BUSINESS",
        project_cost_min=100000,
        project_cost_max=3000000,
        max_loan_amount=2700000,
        beneficiary_interest_rate_min=8.0,
        beneficiary_interest_rate_max=8.0,
        rebate_women_pct=1.0,
        repayment_period_months=84,
        moratorium_months=6,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=300000.0,
            requireScCertificate=True
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True),
            DocumentItem(id="doc_quote", name="Quotation of Green Equipment / EV", mandatory=True)
        ]
    ),

    # 7. Divyangjan Swavalamban Yojana (DSY) — NDFDC Disability Route
    SchemeModel(
        id="scheme_dsy_07",
        code="DSY",
        slug="divyangjan-swavalamban-yojana",
        name="Divyangjan Swavalamban Yojana (DSY)",
        nameHi="दिव्यांगजन स्वावलंबन योजना (DSY - NDFDC)",
        category="DISABILITY_ENTERPRISE",
        track="NDFDC_DISABILITY",
        tagline="Concessional credit up to ₹50 Lakhs for persons with disabilities for self-employment, small business, and education",
        taglineHi="दिव्यांगजनों के स्वरोजगार, व्यवसाय व उच्च शिक्षा हेतु ₹50 लाख तक का रियायती ऋण",
        description="Apex concessional finance scheme by NDFDC for citizens with 40%+ benchmark disability for income-generating activities and education. No income ceiling and no caste barrier.",
        descriptionHi="40% या अधिक दिव्यांगता वाले नागरिकों हेतु बिना किसी आय सीमा व बिना जाति बंधन के 5%-9% ब्याज पर ₹50 लाख तक का ऋण।",
        purpose="BUSINESS",
        project_cost_min=25000,
        project_cost_max=5000000,
        max_loan_amount=4500000,
        beneficiary_interest_rate_min=5.0,
        beneficiary_interest_rate_max=9.0,
        rebate_women_pct=1.0,
        repayment_period_months=120,
        moratorium_months=6,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=None,  # No income ceiling
            requireScCertificate=False,  # Open to all on disability ground
            requiresBenchmarkDisability=True,
            notes="Requires 40%+ disability certificate under RPwD Act. Age relaxed to 14 for intellectual disability. No income ceiling.",
            notesHi="RPwD अधिनियम के तहत 40%+ दिव्यांगता प्रमाण पत्र अनिवार्य। बौद्धिक दिव्यांगता हेतु न्यूनतम आयु 14 वर्ष। कोई आय सीमा नहीं।"
        ),
        documents=[
            DocumentItem(id="doc_udid", name="Disability Certificate (UDID Card)", mandatory=True, description="40%+ benchmark disability proof"),
            DocumentItem(id="doc_kyc", name="Aadhaar / Address Proof", mandatory=True),
            DocumentItem(id="doc_proj", name="Project Proposal / Quotation", mandatory=True)
        ]
    ),

    # 8. Vishesh Microfinance Yojana (VMY) — NDFDC Disability Micro-Credit
    SchemeModel(
        id="scheme_vmy_08",
        code="VMY",
        slug="vishesh-microfinance-yojana",
        name="Vishesh Microfinance Yojana (VMY)",
        nameHi="विशेष माइक्रोफाइनेंस योजना (VMY - NDFDC)",
        category="DISABILITY_MICROFINANCE",
        track="NDFDC_DISABILITY",
        tagline="Need-based microfinance up to ₹60,000 for small trades with 1% interest subvention on timely repayment",
        taglineHi="दिव्यांगजनों हेतु ₹60,000 तक का सूक्ष्म ऋण एवं समय पर अदायगी पर 1% ब्याज अनुदान",
        description="Provides prompt micro-credit for micro-trades through NBFC-MFIs, Section 8 MFIs, and SHGs for persons with benchmark disabilities. 1% interest subvention applies on timely repayment.",
        descriptionHi="चयनित MFIs व स्वयं सहायता समूहों के माध्यम से सूक्ष्म गतिविधियों हेतु ₹60,000 तक का ऋण। समय पर चुकौती पर 1% ब्याज छूट।",
        purpose="BUSINESS",
        project_cost_min=10000,
        project_cost_max=60000,
        max_loan_amount=54000,  # 90% of ₹60,000
        beneficiary_interest_rate_min=11.5, # net after 1% subvention
        beneficiary_interest_rate_max=12.5,
        rebate_women_pct=1.0,
        repayment_period_months=36,
        moratorium_months=3,
        financing_percentage_max=90.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=None,  # No income ceiling
            requireScCertificate=False,
            requiresBenchmarkDisability=True,
            notes="40%+ benchmark disability. Uniform interest rate up to 12.5% with 1% prompt repayment subvention. No income ceiling.",
            notesHi="40%+ दिव्यांगता प्रमाण पत्र। अधिकतम 12.5% ब्याज, समय पर अदायगी पर 1% अतिरिक्त छूट। कोई आय सीमा नहीं।"
        ),
        documents=[
            DocumentItem(id="doc_udid", name="Disability Certificate / UDID", mandatory=True),
            DocumentItem(id="doc_shg", name="SHG / MFI Registration Details", mandatory=True)
        ]
    ),

    # 9. Stand-Up India (SC/ST & Women Enterprise)
    SchemeModel(
        id="scheme_sui_09",
        code="STAND_UP_INDIA",
        slug="stand-up-india",
        name="Stand-Up India Scheme",
        nameHi="स्टैंड-अप इंडिया योजना",
        category="ENTERPRISE",
        track="SC_CENTRAL",
        tagline="Composite bank loans from ₹10 Lakhs to ₹1 Crore for greenfield enterprises with margin money convergence",
        taglineHi="अनुसूचित जाति/जनजाति व महिला उद्यमियों हेतु नए उद्यमों के लिए ₹10 लाख से ₹1 करोड़ तक का समग्र बैंक ऋण",
        description="Bank-led composite credit facility facilitating commercial loans between ₹10 Lakh and ₹1 Crore for setting up greenfield manufacturing, service, agri-allied, or trading ventures.",
        descriptionHi="विनिर्माण, सेवा, व्यापार व कृषि-संबद्ध क्षेत्रों में नए उद्यम शुरू करने हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।",
        purpose="BUSINESS",
        project_cost_min=1000000,
        project_cost_max=10000000,
        max_loan_amount=8500000,  # 85% composite bank loan
        beneficiary_interest_rate_min=8.25,
        beneficiary_interest_rate_max=10.5,
        rebate_women_pct=0.0,
        repayment_period_months=84,
        moratorium_months=18,
        financing_percentage_max=85.0,
        eligibility_rules=EligibilityRules(
            minAge=18,
            maxAnnualFamilyIncome=None, # No central family income ceiling
            requireScCertificate=True,
            notes="First-time greenfield enterprise in manufacturing, services, or trading. Non-defaulter.",
            notesHi="विनिर्माण या सेवा क्षेत्र में पहला नया उद्यम। आवेदक किसी बैंक का डिफाल्टर नहीं होना चाहिए।"
        ),
        documents=[
            DocumentItem(id="doc_sc", name="Caste Certificate", mandatory=True),
            DocumentItem(id="doc_project", name="Detailed Project Report (DPR)", mandatory=True),
            DocumentItem(id="doc_it_returns", name="IT Returns / PAN", mandatory=True)
        ]
    )
]

def calculate_monthly_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> float:
    """Calculates monthly Equated Monthly Installment (EMI) using standard compound interest."""
    if principal <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate_pct <= 0:
        return round(principal / tenure_months, 2)
    
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    factor = math.pow(1.0 + monthly_rate, tenure_months)
    emi = principal * monthly_rate * factor / (factor - 1.0)
    return round(emi, 2)

class RuleEngine:
    """
    Two-Stage Explainable Scheme Recommendation Engine.
    Stage 1: Boolean Hard Constraint Filters.
    Stage 2: Multi-Attribute Utility Fit Scoring (0.0 to 1.0).
    Stage 3: Bilingual Explainable Reasoning and Financial Estimation.
    """
    def __init__(self, schemes: Optional[List[SchemeModel]] = None):
        self.schemes = schemes if schemes is not None else DEFAULT_SCHEMES

    def evaluate(self, request: RecommendationRequest) -> RecommendationResponse:
        request_id = f"rec_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:6]}"
        evaluated_at = datetime.utcnow().isoformat() + "Z"

        evaluated_candidates: List[Tuple[float, RecommendationItem]] = []

        for scheme in self.schemes:
            reasons: List[str] = []
            reasons_hi: List[str] = []
            warnings: List[str] = []
            warnings_hi: List[str] = []
            missing_info: List[str] = []
            missing_info_hi: List[str] = []

            passed_hard_filters = True

            # --- HARD FILTER 0: AGE ---
            min_age = scheme.eligibility_rules.minAge or 18
            # Disability intellectual relaxation to 14
            if request.hasDisability and scheme.eligibility_rules.requiresBenchmarkDisability:
                min_age = 14

            if request.age is not None:
                if request.age < min_age:
                    passed_hard_filters = False
                    warnings.append(f"Applicant age ({request.age} yrs) is below minimum required age of {min_age} yrs.")
                    warnings_hi.append(f"आवेदक की आयु ({request.age} वर्ष) न्यूनतम आवश्यक आयु {min_age} वर्ष से कम है।")
                else:
                    reasons.append(f"Age of {request.age} years satisfies statutory eligibility criteria ({min_age}+ years).")
                    reasons_hi.append(f"आयु {request.age} वर्ष कानूनी पात्रता मानदंड ({min_age}+ वर्ष) को पूरा करती है।")

            # --- HARD FILTER 1: CASTE / DISABILITY GATE ---
            is_disability_scheme = scheme.eligibility_rules.requiresBenchmarkDisability or scheme.track == "NDFDC_DISABILITY"

            if is_disability_scheme:
                # NDFDC route: SC certificate NOT mandatory, disability certificate required
                if request.hasDisability and (request.disabilityPercentage or 0) >= 40.0:
                    reasons.append(f"Benchmark disability ({request.disabilityPercentage}%) qualifies for parallel NDFDC credit.")
                    reasons_hi.append(f"मानक दिव्यांगता ({request.disabilityPercentage}%) समानांतर NDFDC रियायती ऋण हेतु योग्य बनाती है।")
                elif request.hasDisability:
                    reasons.append("Disability declared; verified medical certificate required before sanction.")
                    reasons_hi.append("दिव्यांगता घोषित; ऋण स्वीकृति से पूर्व सक्षम प्राधिकारी का प्रमाण पत्र आवश्यक है।")
                else:
                    passed_hard_filters = False
                    warnings.append("This scheme specifically requires 40%+ benchmark disability under the RPwD Act.")
                    warnings_hi.append("इस योजना के लिए RPwD अधिनियम के तहत 40% या अधिक दिव्यांगता प्रमाण पत्र अनिवार्य है।")
            else:
                # SC Central route: requires SC Certificate
                if request.scCertificate == "YES":
                    reasons.append("Valid Scheduled Caste (SC) certificate requirement verified.")
                    reasons_hi.append("सत्यापित अनुसूचित जाति (SC) प्रमाण पत्र की शर्त पूरी होती है।")
                elif request.scCertificate == "IN_PROGRESS":
                    missing_info.append("Caste certificate is in-progress; required prior to bank loan sanction.")
                    missing_info_hi.append("जाति प्रमाण पत्र प्रक्रियाधीन है; अंतिम स्वीकृति से पूर्व जमा करना अनिवार्य है।")
                else:
                    passed_hard_filters = False

            # --- HARD FILTER 2: INCOME CEILING ---
            income_ceiling = scheme.eligibility_rules.maxAnnualFamilyIncome
            if income_ceiling is not None and income_ceiling > 0:
                if request.annualFamilyIncome <= income_ceiling:
                    reasons.append(f"Annual family income (₹{request.annualFamilyIncome:,.0f}) is within limit of ₹{income_ceiling:,.0f}.")
                    reasons_hi.append(f"वार्षिक पारिवारिक आय (₹{request.annualFamilyIncome:,.0f}) स्वीकृत सीमा ₹{income_ceiling:,.0f} के भीतर है।")
                else:
                    passed_hard_filters = False
                    warnings.append(f"Stated income of ₹{request.annualFamilyIncome:,.0f} exceeds scheme limit of ₹{income_ceiling:,.0f}.")
                    warnings_hi.append(f"पारिवारिक आय ₹{request.annualFamilyIncome:,.0f} योजना की सीमा ₹{income_ceiling:,.0f} से अधिक है।")
            else:
                reasons.append("No upper family income ceiling applies to this scheme.")
                reasons_hi.append("इस योजना में कोई ऊपरी पारिवारिक आय सीमा लागू नहीं होती है।")

            # --- HARD FILTER 3: PURPOSE COMPATIBILITY ---
            purpose_matched = False
            purpose_exact = False
            req_pur = request.purpose.upper()

            if req_pur == "BUSINESS":
                if scheme.purpose in ["BUSINESS", "BOTH", "COMMERCIAL"]:
                    purpose_matched = True
                    purpose_exact = True
                    reasons.append("Direct match for commercial enterprise, business, or self-employment.")
                    reasons_hi.append("व्यावसायिक उद्यम, दुकान या स्वरोजगार के उद्देश्य से सीधा मेल।")
            elif req_pur == "EDUCATION":
                if scheme.purpose == "EDUCATION" or scheme.category == "EDUCATION" or scheme.code in ["ELS", "DSY"]:
                    purpose_matched = True
                    if scheme.code == "ELS":
                        purpose_exact = True
                    reasons.append("Matches technical or higher professional education financing.")
                    reasons_hi.append("तकनीकी अथवा व्यावसायिक उच्च शिक्षा उद्देश्य से मेल खाता है।")
            elif req_pur == "GREEN_BUSINESS":
                if scheme.code == "GBS":
                    purpose_matched = True
                    purpose_exact = True
                    reasons.append("Direct fit for eco-friendly green venture or electric vehicle transport.")
                    reasons_hi.append("पर्यावरण अनुकूल हरित उद्यम अथवा ई-वाहन परियोजना हेतु उपयुक्त।")
                elif scheme.code in ["TERM_LOAN", "DSY"]:
                    purpose_matched = True
                    reasons.append("Alternative general term loan option that can finance clean transport.")
                    reasons_hi.append("वैकल्पिक मियादी ऋण जो स्वच्छ परिवहन को वित्तपोषित कर सकता है।")
            elif req_pur in ["AGRICULTURE", "TRANSPORT"]:
                if scheme.code in ["TERM_LOAN", "MFS", "UNY", "DSY", "GBS"]:
                    purpose_matched = True
                    purpose_exact = True
                    reasons.append(f"Matches sector requirement for {req_pur.capitalize()} activity.")
                    reasons_hi.append(f"{req_pur.capitalize()} गतिविधि के लिए ऋण प्रावधान उपलब्ध है।")

            if not purpose_matched:
                passed_hard_filters = False
                warnings.append(f"Scheme purpose does not match requested goal of {request.purpose}.")
                warnings_hi.append("योजना का उद्देश्य आपके चुने हुए लक्ष्य से मेल नहीं खाता है।")

            # --- HARD FILTER 4: PROJECT COST WINDOW ---
            if request.projectCost > scheme.project_cost_max:
                passed_hard_filters = False
                warnings.append(f"Project cost of ₹{request.projectCost:,.0f} exceeds maximum ceiling of ₹{scheme.project_cost_max:,.0f}.")
                warnings_hi.append(f"परियोजना लागत ₹{request.projectCost:,.0f} अधिकतम सीमा ₹{scheme.project_cost_max:,.0f} से अधिक है।")

            # --- STAGE 2: MULTI-ATTRIBUTE FIT SCORING ---
            fit_score = 0.0
            if passed_hard_filters:
                # Baseline passing score: 0.65
                base_score = 0.65

                # 1. Purpose Exact Match Bonus (+0.10)
                if purpose_exact:
                    base_score += 0.10

                # 2. Interest Rate Competitiveness (+0.10 max)
                rate_score = max(0.0, min(1.0, 1.0 - (scheme.beneficiary_interest_rate_min - 4.0) / 11.0)) * 0.10

                # 3. Capital Coverage (+0.08 max)
                coverage_ratio = min(1.0, scheme.max_loan_amount / request.projectCost) * 0.08

                # 4. Demographic & Affirmative Bonus (+0.07 max)
                demo_bonus = 0.0
                if request.gender == "FEMALE" and scheme.rebate_women_pct > 0:
                    demo_bonus += 0.04
                    reasons.append(f"Women beneficiary receives additional {scheme.rebate_women_pct}% interest rebate.")
                    reasons_hi.append(f"महिला आवेदकों को ब्याज दर में {scheme.rebate_women_pct}% की विशेष छूट प्राप्त होती है।")

                if request.hasDisability and is_disability_scheme:
                    demo_bonus += 0.04
                    reasons.append("Dedicated disability credit allocation prioritization applies.")
                    reasons_hi.append("दिव्यांगजन प्राथमिकता कोटा एवं विशेष शर्तों का सीधा लाभ।")

                if 18 <= (request.age or 18) <= 35 and scheme.category in ["ENTREPRENEURSHIP", "MICRO_FINANCE", "TERM_LOAN"]:
                    demo_bonus += 0.02
                    reasons.append("Youth entrepreneurship prioritization applies.")
                    reasons_hi.append("युवा उद्यमिता प्राथमिकता के अंतर्गत अनुकूल मूल्यांकन।")

                fit_score = round(base_score + rate_score + coverage_ratio + demo_bonus, 4)
                fit_score = min(0.99, max(0.50, fit_score))
            else:
                fit_score = round(max(0.10, 0.40 - len(warnings) * 0.10), 2)

            # Decision categorization
            if passed_hard_filters and fit_score >= 0.75:
                decision = "STRONG_MATCH"
            elif passed_hard_filters and fit_score >= 0.50:
                decision = "LIKELY_MATCH"
            else:
                decision = "INELIGIBLE"

            # --- STAGE 3: FINANCIAL SUMMARY ---
            eligible_loan = min(request.projectCost * (scheme.financing_percentage_max / 100.0), float(scheme.max_loan_amount))
            margin_money = max(0.0, request.projectCost - eligible_loan)
            effective_rate = scheme.beneficiary_interest_rate_min
            if request.gender == "FEMALE" and scheme.rebate_women_pct > 0:
                effective_rate = max(1.0, effective_rate - scheme.rebate_women_pct)

            emi = calculate_monthly_emi(eligible_loan, effective_rate, scheme.repayment_period_months)

            # Government subsidy calculation (PM-AJAY or interest concessions)
            subsidy_amount = 0.0
            if scheme.code == "STAND_UP_INDIA":
                subsidy_amount = min(request.projectCost * 0.15, 150000.0) # margin money support
            elif scheme.track == "NDFDC_DISABILITY" and request.hasDisability:
                subsidy_amount = round(eligible_loan * 0.01, 2) # 1% interest subvention

            financial_summary = FinancialSummary(
                eligibleLoanAmount=round(eligible_loan, 2),
                beneficiaryContribution=round(margin_money, 2),
                subsidyAmount=subsidy_amount,
                interestRate=round(effective_rate, 2),
                tenureMonths=scheme.repayment_period_months,
                moratoriumMonths=scheme.moratorium_months,
                estimatedEmi=emi
            )

            item = RecommendationItem(
                schemeId=scheme.id,
                schemeCode=scheme.code,
                schemeName=scheme.name,
                score=fit_score,
                decision=decision,
                reasons=reasons,
                reasonsHi=reasons_hi,
                warnings=warnings,
                warningsHi=warnings_hi,
                missingInformation=missing_info,
                missingInformationHi=missing_info_hi,
                financialSummary=financial_summary
            )

            evaluated_candidates.append((fit_score, item))

        # Sort candidates descending by fit score
        evaluated_candidates.sort(key=lambda x: x[0], reverse=True)

        best_match = None
        candidate_schemes: List[RecommendationItem] = []

        eligible_items = [item for score, item in evaluated_candidates if item.decision in ["STRONG_MATCH", "LIKELY_MATCH"]]
        if eligible_items:
            best_match = eligible_items[0]
            candidate_schemes = eligible_items[1:]
        else:
            if evaluated_candidates:
                best_match = evaluated_candidates[0][1]
                candidate_schemes = [c[1] for c in evaluated_candidates[1:]]

        all_results = [item for score, item in evaluated_candidates]
        rec_obj = None
        if best_match:
            rec_obj = {
                "schemeId": best_match.schemeId,
                "schemeName": best_match.schemeName,
                "schemeCode": best_match.schemeCode,
                "fitScore": best_match.score,
                "matchedRule": best_match.reasons[0] if best_match.reasons else "Eligible"
            }
        alts_obj = []
        for c in candidate_schemes[:3]:
            alts_obj.append({
                "schemeId": c.schemeId,
                "schemeName": c.schemeName,
                "schemeCode": c.schemeCode,
                "fitScore": c.score,
                "matchedRule": c.reasons[0] if c.reasons else "Alternative"
            })

        return RecommendationResponse(
            requestId=request_id,
            evaluatedAt=evaluated_at,
            bestMatch=best_match,
            candidateSchemes=candidate_schemes,
            results=all_results,
            recommended=rec_obj,
            alternatives=alts_obj
        )
