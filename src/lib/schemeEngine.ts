import {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationItem,
  RecommendationDecision,
  ReasonCode,
  Scheme,
  ExplainableRecommendationItem,
} from './types';
import { SCHEMES, OFFICIAL_INCOME_CEILING, SCHEME_CONFIG_VERSION } from './schemeData';

interface EvaluatedEligibleScheme {
  scheme: Scheme;
  matchedRule: string;
  matchedRuleHi: string;
  fitScore: number; // 0.0 to 1.0
  reasons: string[];
  reasonsHi: string[];
  reasonCodes: ReasonCode[];
  warnings: string[];
  warningsHi: string[];
}

/**
 * Task 2: Explainable Scheme Recommender
 * 
 * Two-Stage Architecture (recorded in DECISIONS.md):
 * Stage 1: Deterministic Hard-Rule Filters (income ceiling, caste certificate, purpose, project cost cap)
 * Stage 2: Fit Scoring (0-1) & Ranking among verified eligible schemes
 */
export function evaluateRecommendation(
  request: RecommendationRequest,
  schemesList: Scheme[] = SCHEMES
): RecommendationResponse {
  const requestId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const evaluatedAt = new Date().toISOString().split('T')[0];

  const eligibleCandidates: EvaluatedEligibleScheme[] = [];
  const results: RecommendationItem[] = [];

  // =========================================================================
  // STAGE 1: Deterministic Hard-Rule Filters
  // =========================================================================
  for (const scheme of schemesList) {
    const reasonCodes: ReasonCode[] = [];
    const reasons: string[] = [];
    const reasonsHi: string[] = [];
    const warnings: string[] = [];
    const warningsHi: string[] = [];
    const missingInformation: string[] = [];
    const missingInformationHi: string[] = [];

    let passedHardFilters = true;

    // Hard Filter 0: Age Requirement (Must be >= 18)
    if (request.age !== undefined && request.age !== null) {
      if (request.age < 18) {
        passedHardFilters = false;
        reasonCodes.push('AGE_UNDER_18');
        warnings.push(`Applicant age (${request.age} years) is below the minimum legal age of 18 years required for concessional loan sanctions.`);
        warningsHi.push(`आवेदक की आयु (${request.age} वर्ष) ऋण स्वीकृति हेतु आवश्यक न्यूनतम कानूनी आयु 18 वर्ष से कम है।`);
      } else {
        reasonCodes.push('AGE_ELIGIBLE');
        reasons.push(`Applicant age of ${request.age} years meets the legal eligibility criteria (18+ years).`);
        reasonsHi.push(`आवेदक की आयु ${request.age} वर्ष वैधानिक पात्रता मानदंड (18+ वर्ष) को पूरा करती है।`);
      }
    }

    // Hard Filter 1: Caste Certificate Requirement
    if (request.scCertificate === 'YES') {

      reasonCodes.push('SC_REQUIREMENT_MET');
      reasons.push('Valid Scheduled Caste certificate requirement fulfilled.');
      reasonsHi.push('अनुसूचित जाति प्रमाण पत्र की शर्त पूरी होती है।');
    } else if (request.scCertificate === 'IN_PROGRESS') {
      missingInformation.push('Caste certificate application must be completed before sanction.');
      missingInformationHi.push('ऋण स्वीकृति से पूर्व जाति प्रमाण पत्र आवेदन पूर्ण होना आवश्यक है।');
      warnings.push('Caste certificate is currently in progress; channel partners require a verified certificate before processing.');
      warningsHi.push('जाति प्रमाण पत्र प्रक्रियाधीन है; अधिकृत एजेंसी द्वारा सत्यापन के बाद ही आवेदन आगे बढ़ेगा।');
    } else {
      // Hard statutory failure: NSFDC schemes strictly require SC status
      passedHardFilters = false;
      reasonCodes.push('MISSING_SC_CERTIFICATE');
    }

    // Hard Filter 2: Statutory Income Ceiling (Official: ₹5,00,000/year)
    if (request.annualFamilyIncome <= OFFICIAL_INCOME_CEILING) {
      reasonCodes.push('INCOME_WITHIN_LIMIT');
      reasons.push(`Annual family income of ₹${request.annualFamilyIncome.toLocaleString('en-IN')} is within the configured ceiling of ₹${OFFICIAL_INCOME_CEILING.toLocaleString('en-IN')}.`);
      reasonsHi.push(`वार्षिक पारिवारिक आय ₹${request.annualFamilyIncome.toLocaleString('en-IN')} वर्तमान सीमा ₹${OFFICIAL_INCOME_CEILING.toLocaleString('en-IN')} के अंतर्गत है।`);
    } else {
      // Income exceeds statutory concessional ceiling
      passedHardFilters = false;
      reasonCodes.push('INCOME_ABOVE_LIMIT');
      warnings.push(`Stated family income of ₹${request.annualFamilyIncome.toLocaleString('en-IN')} exceeds the present concessional loan ceiling of ₹${OFFICIAL_INCOME_CEILING.toLocaleString('en-IN')}.`);
      warningsHi.push(`पारिवारिक आय ₹${request.annualFamilyIncome.toLocaleString('en-IN')} वर्तमान सीमा ₹${OFFICIAL_INCOME_CEILING.toLocaleString('en-IN')} से अधिक है।`);
    }

    // Hard Filter 3: Purpose Compatibility
    let purposeMatched = false;
    if (request.purpose === 'EDUCATION') {
      if (scheme.purpose === 'EDUCATION' || scheme.category === 'EDUCATION' || scheme.code === 'ELS') {
        purposeMatched = true;
        reasonCodes.push('PURPOSE_EDUCATION');
        reasons.push('Matches technical or professional higher education assistance.');
        reasonsHi.push('तकनीकी अथवा व्यावसायिक उच्च शिक्षा के उद्देश्य से मेल खाता है।');
      }
    } else if (request.purpose === 'BUSINESS') {
      if (scheme.purpose === 'BUSINESS' || scheme.purpose === 'BOTH') {
        purposeMatched = true;
        reasonCodes.push('PURPOSE_BUSINESS');
        reasons.push('Matches entrepreneurial, commercial or self-employment goal.');
        reasonsHi.push('स्वरोजगार, व्यापार अथवा व्यवसाय उद्देश्य से मेल खाता है।');
      }
    } else if (request.purpose === 'GREEN_BUSINESS') {
      if (scheme.code === 'GBS' || scheme.category === 'GREEN_BUSINESS' || scheme.code === 'TERM_LOAN') {
        purposeMatched = true;
        reasonCodes.push('PURPOSE_GREEN_BUSINESS');
        reasons.push('Direct match for Green Business Scheme or commercial clean mobility term finance.');
        reasonsHi.push('हरित व्यवसाय योजना अथवा स्वच्छ प्रौद्योगिकी हेतु अनुकूल।');
      }
    } else if (request.purpose === 'AGRICULTURE') {
      if (['TERM_LOAN', 'MFS', 'UNY'].includes(scheme.code)) {
        purposeMatched = true;
        reasonCodes.push('PURPOSE_AGRICULTURE');
        reasons.push('Direct fit for Agricultural and Allied activities (Dairy, poultry, farm machinery).');
        reasonsHi.push('कृषि एवं संबद्ध गतिविधियों हेतु उपयुक्त ऋण सुविधा।');
      }
    } else if (request.purpose === 'TRANSPORT') {
      if (['TERM_LOAN', 'GBS', 'UNY'].includes(scheme.code)) {
        purposeMatched = true;
        reasonCodes.push('PURPOSE_TRANSPORT');
        reasons.push('Finances commercial passenger & goods transport vehicles with interest concessions.');
        reasonsHi.push('व्यावसायिक एवं यात्री परिवहन वाहनों हेतु रियायती ऋण।');
      }
    }

    if (!purposeMatched) {
      passedHardFilters = false;
      warnings.push('Scheme purpose does not match requested citizen goal.');
      warningsHi.push('योजना का उद्देश्य आपके चयन से मेल नहीं खाता।');
    }

    // Hard Filter 4: Maximum Project Cost Ceiling
    if (request.projectCost > scheme.project_cost_max) {
      passedHardFilters = false;
      reasonCodes.push('PROJECT_COST_OUTSIDE_RANGE');
      warnings.push(`Project cost of ₹${request.projectCost.toLocaleString('en-IN')} exceeds the maximum allowable limit of ₹${scheme.project_cost_max.toLocaleString('en-IN')} under this scheme.`);
      warningsHi.push(`परियोजना लागत ₹${request.projectCost.toLocaleString('en-IN')} इस योजना की अधिकतम सीमा ₹${scheme.project_cost_max.toLocaleString('en-IN')} से अधिक है।`);
    } else {
      reasonCodes.push('PROJECT_COST_IN_RANGE');
      reasons.push(`Estimated project cost of ₹${request.projectCost.toLocaleString('en-IN')} is within scheme ceiling (up to ₹${scheme.project_cost_max.toLocaleString('en-IN')}).`);
      reasonsHi.push(`परियोजना लागत ₹${request.projectCost.toLocaleString('en-IN')} योजना की अधिकतम सीमा ₹${scheme.project_cost_max.toLocaleString('en-IN')} के भीतर है।`);
    }

    // Hard Filter 5: Education course admission requirement
    if (scheme.category === 'EDUCATION' && request.purpose === 'EDUCATION') {
      if (request.courseType === 'FULL_TIME_PROFESSIONAL') {
        reasonCodes.push('COURSE_TYPE_MATCH');
        reasons.push('Full-time professional / technical degree course verified.');
        reasonsHi.push('पूर्णकालिक तकनीकी या व्यावसायिक डिग्री पाठ्यक्रम पात्र है।');
      } else if (!request.courseType) {
        missingInformation.push('Confirmed admission to recognized full-time professional/technical course required.');
        missingInformationHi.push('मान्यता प्राप्त पूर्णकालिक व्यावसायिक/तकनीकी पाठ्यक्रम में प्रवेश आवश्यक है।');
      }
    }

    // Gender incentives & adjustments
    if (request.gender === 'FEMALE') {
      if (scheme.code === 'ELS') {
        reasonCodes.push('GENDER_FEMALE_REBATE');
        reasons.push('Female applicant incentive: 0.5% p.a. interest rebate applicable (Effective rate 6.0% p.a. instead of 6.5%).');
        reasonsHi.push('महिला आवेदक विशेष लाभ: शिक्षा ऋण पर 0.5% वार्षिक ब्याज छूट लागू (प्रभावी दर 6.0% वार्षिक)।');
      }
      if (scheme.code === 'AMY') {
        reasonCodes.push('GENDER_FEMALE_PRIORITY');
        reasons.push('Mahila Samriddhi priority: Special women empowerment allocation with simplified partner disbursement.');
        reasonsHi.push('महिला समृद्धि प्राथमिकता: महिला उद्यमियों हेतु विशेष आवंटन व त्वरित अनुमोदन।');
      }
    } else if (request.gender === 'MALE' && scheme.code === 'AMY') {
      reasonCodes.push('GENDER_MALE_WARNING');
      warnings.push('Mahila Samriddhi components specifically prioritize female SC beneficiaries. Male applicants are advised to select MFS or Term Loan.');
      warningsHi.push('महिला समृद्धि घटक मुख्य रूप से महिला लाभार्थियों को प्राथमिकता देता है।');
    }

    // =========================================================================
    // STAGE 2: Deterministic Matched Rule & Normalized Fit Scoring (0 to 1)
    // =========================================================================
    if (passedHardFilters) {
      // Deterministic matchedRule formulation
      let matchedRule = `Statutory rules satisfied: Project cost ₹${request.projectCost.toLocaleString('en-IN')} fits within scheme limit (up to ₹${scheme.project_cost_max.toLocaleString('en-IN')}) and family income is within ₹${OFFICIAL_INCOME_CEILING.toLocaleString('en-IN')} limit.`;
      let matchedRuleHi = `वैधानिक नियम पूर्ण: परियोजना लागत ₹${request.projectCost.toLocaleString('en-IN')} योजना सीमा (₹${scheme.project_cost_max.toLocaleString('en-IN')} तक) के अंतर्गत है और आय सीमा पूरी होती है।`;

      if (scheme.code === 'MFS') {
        matchedRule = `Micro-enterprise rule matched: Project cost ₹${request.projectCost.toLocaleString('en-IN')} fits within ₹1,50,000 micro-credit cap at 5% reducing interest with statutory income limit verified.`;
        matchedRuleHi = `लघु वित्त नियम मेल: ₹1.5 लाख तक की परियोजना लागत, 5% घटती ब्याज दर तथा आय सीमा सत्यापित।`;
      } else if (scheme.code === 'AMY') {
        matchedRule = `Mahila Samriddhi rule matched: Dedicated women empowerment loan with concessional 4% interest rate, project cost under ₹1,40,000 cap, and verified SC beneficiary status.`;
        matchedRuleHi = `महिला समृद्धि नियम मेल: महिला उद्यमियों हेतु 4% रियायती ब्याज दर, ₹1.40 लाख तक की परियोजना लागत व सत्यापित जाति स्थिति।`;
      } else if (scheme.code === 'TERM_LOAN') {
        matchedRule = `Term Loan rule matched: Commercial project cost ₹${request.projectCost.toLocaleString('en-IN')} qualifies under standard enterprise ceiling (up to ₹50,00,000) at 6%-8% interest.`;
        matchedRuleHi = `मियादी ऋण नियम मेल: ₹50 लाख तक की व्यावसायिक परियोजना लागत पर 6%-8% ब्याज दर मान्य।`;
      } else if (scheme.code === 'ELS') {
        matchedRule = `Higher Education credit rule matched: Professional degree financing supported up to ₹20,00,000 with concessional 6.5% interest rate.`;
        matchedRuleHi = `शिक्षा ऋण नियम मेल: व्यावसायिक डिग्री हेतु ₹20 लाख तक 6.5% ब्याज दर पर ऋण मान्य।`;
      } else if (scheme.code === 'GBS') {
        matchedRule = `Green Business rule matched: Clean technology & e-mobility venture supported up to ₹30,00,000 at concessional interest.`;
        matchedRuleHi = `हरित व्यवसाय नियम मेल: पर्यावरण-अनुकूल व ई-वाहन व्यवसाय हेतु ₹30 लाख तक वित्तीय सहायता।`;
      }

      // Calculate Fit Score (0.0 to 1.0)
      let score = 0.70; // Base passing score

      // Closeness of project cost to scheme capacity
      if (request.projectCost >= scheme.project_cost_min && request.projectCost <= scheme.project_cost_max) {
        score += 0.15;
      }
      // Gender preference bonus
      if (request.gender === 'FEMALE') {
        if (scheme.code === 'AMY' || scheme.code === 'ELS') {
          score += 0.10;
        }
      } else if (request.gender === 'MALE' && scheme.code === 'AMY') {
        score -= 0.25; // Significant penalty for male applicant applying for women-only scheme
      }

      // Concessional interest advantage
      if (scheme.beneficiary_interest_rate_min <= 4) {
        score += 0.05;
      }

      // In-progress certificate penalty
      if (request.scCertificate === 'IN_PROGRESS') {
        score -= 0.10;
      }

      // Age category bonus
      if (request.age !== undefined && request.age >= 18 && request.age <= 35) {
        score += 0.05; // Youth entrepreneur encouragement
        reasons.push('Eligible youth demographic (18-35 years): High priority for start-up capital.');
        reasonsHi.push('युवा लाभार्थी वर्ग (18-35 वर्ष): नए उद्यम हेतु प्राथमिकता।');
      }

      // Employment status nuance
      if (request.employmentStatus === 'UNEMPLOYED') {
        if (['MFS', 'TERM_LOAN', 'UNY'].includes(scheme.code)) {
          score += 0.05;
          reasons.push('Unemployed beneficiary: Tailored for establishment of new micro-enterprises.');
          reasonsHi.push('बेरोजगार नागरिक: नए स्वरोजगार की स्थापना हेतु अनुकूल।');
        }
      } else if (request.employmentStatus === 'STUDENT') {
        if (scheme.code === 'ELS') {
          score += 0.10;
          reasons.push('Student beneficiary: Direct match with technical and professional education support.');
          reasonsHi.push('विद्यार्थी लाभार्थी: तकनीकी व व्यावसायिक शिक्षा ऋण से सीधा मेल।');
        }
      } else if (request.employmentStatus === 'DAILY_WAGE' || request.employmentStatus === 'SELF_EMPLOYED') {
        if (['MFS', 'AMY'].includes(scheme.code)) {
          score += 0.05;
        }
      }

      // Area type nuance (Rural vs Urban)
      if (request.areaType === 'RURAL') {
        if (['MFS', 'AMY', 'TERM_LOAN'].includes(scheme.code)) {
          score += 0.03;
          reasons.push('Rural area outreach: Priority grassroot allocation through SCAs and RRBs.');
          reasonsHi.push('ग्रामीण क्षेत्र प्राथमिकता: राज्य एजेंसी और ग्रामीण बैंकों के माध्यम से प्राथमिकता।');
        }
      } else if (request.areaType === 'URBAN') {
        if (['GBS', 'TERM_LOAN'].includes(scheme.code)) {
          score += 0.03;
          reasons.push('Urban area focus: Tailored for commercial services, retail, and clean urban mobility.');
          reasonsHi.push('शहरी क्षेत्र प्राथमिकता: वाणिज्यिक सेवाओं, खुदरा व्यापार एवं नगरीय ई-वाहन हेतु अनुकूल।');
        }
      }

      // State Channelizing Agency notification
      if (request.state) {
        reasons.push(`State Channelizing Agency (SCA) network mapped for ${request.state}.`);
        reasonsHi.push(`${request.state} राज्य हेतु अधिकृत चैनल एजेंसी पहचानी गई।`);
      }

      const fitScore = Math.max(0.0, Math.min(1.0, Number(score.toFixed(2))));

      eligibleCandidates.push({
        scheme,
        matchedRule,
        matchedRuleHi,
        fitScore,
        reasons,
        reasonsHi,
        reasonCodes,
        warnings,
        warningsHi,
      });

      results.push({
        schemeCode: scheme.code,
        schemeName: scheme.name,
        schemeNameHi: scheme.nameHi,
        decision: fitScore >= 0.75 ? 'LIKELY_MATCH' : 'POSSIBLE_MATCH',
        matchScore: Math.round(fitScore * 100),
        reasonCodes,
        reasons,
        reasonsHi,
        warnings,
        warningsHi,
        missingInformation,
        missingInformationHi,
        scheme,
      });
    } else {
      // Ineligible under hard filters
      results.push({
        schemeCode: scheme.code,
        schemeName: scheme.name,
        schemeNameHi: scheme.nameHi,
        decision: 'NOT_MATCHING',
        matchScore: 0,
        reasonCodes,
        reasons,
        reasonsHi,
        warnings,
        warningsHi,
        missingInformation,
        missingInformationHi,
        scheme,
      });
    }
  }

  // Sort eligible candidates by fitScore descending
  eligibleCandidates.sort((a, b) => b.fitScore - a.fitScore);

  // Sort results array for backward compatibility
  results.sort((a, b) => {
    const order: Record<RecommendationDecision, number> = {
      LIKELY_MATCH: 3,
      POSSIBLE_MATCH: 2,
      NOT_MATCHING: 1,
    };
    if (order[b.decision] !== order[a.decision]) {
      return order[b.decision] - order[a.decision];
    }
    return b.matchScore - a.matchScore;
  });

  // =========================================================================
  // STAGE 3: Build Recommended Pick and Alternatives
  // =========================================================================
  let recommended: ExplainableRecommendationItem | null = null;
  const alternatives: ExplainableRecommendationItem[] = [];

  if (eligibleCandidates.length > 0) {
    const top = eligibleCandidates[0];
    recommended = {
      schemeId: top.scheme.id,
      schemeName: top.scheme.name,
      matchedRule: top.matchedRule,
      fitScore: top.fitScore,
      schemeCode: top.scheme.code,
      category: top.scheme.category,
      interestRate: `${top.scheme.beneficiary_interest_rate_min}% – ${top.scheme.beneficiary_interest_rate_max}%`,
      maxLoanAmount: top.scheme.max_loan_amount,
    };

    // Populate alternatives (next-best eligible candidates, minimum top 2 if available)
    for (let i = 1; i < eligibleCandidates.length; i++) {
      const candidate = eligibleCandidates[i];

      // Deterministic whyNotTop explanation
      let whyNotTop = `Secondary fit compared to ${top.scheme.name}.`;

      if (candidate.scheme.beneficiary_interest_rate_min > top.scheme.beneficiary_interest_rate_min) {
        whyNotTop = `Higher interest rate (${candidate.scheme.beneficiary_interest_rate_min}% p.a. vs ${top.scheme.beneficiary_interest_rate_min}% p.a. for ${top.scheme.name}).`;
      } else if (top.scheme.code === 'AMY' && candidate.scheme.code === 'MFS') {
        whyNotTop = `Top pick offers specialized 4% rate and targeted women entrepreneurship allocation under Mahila Samriddhi.`;
      } else if (candidate.scheme.project_cost_max > top.scheme.project_cost_max) {
        whyNotTop = `Higher scale term lending structure designed for larger investments beyond your stated budget.`;
      } else if (candidate.scheme.project_cost_max < top.scheme.project_cost_max) {
        whyNotTop = `Lower maximum loan ceiling (up to ₹${candidate.scheme.max_loan_amount.toLocaleString('en-IN')}) compared to ${top.scheme.name}.`;
      }

      alternatives.push({
        schemeId: candidate.scheme.id,
        schemeName: candidate.scheme.name,
        matchedRule: candidate.matchedRule,
        fitScore: candidate.fitScore,
        whyNotTop,
        schemeCode: candidate.scheme.code,
        category: candidate.scheme.category,
        interestRate: `${candidate.scheme.beneficiary_interest_rate_min}% – ${candidate.scheme.beneficiary_interest_rate_max}%`,
        maxLoanAmount: candidate.scheme.max_loan_amount,
      });
    }
  }

  return {
    engineVersion: SCHEME_CONFIG_VERSION,
    requestId,
    evaluatedAt,
    recommended,
    alternatives,
    results,
    source: {
      url: 'https://nsfdc.nic.in/',
      title: 'National Scheduled Castes Finance and Development Corporation (Official Portal)',
      checkedAt: '2026-09-11',
    },
  };
}
