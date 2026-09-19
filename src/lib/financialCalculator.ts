import { CalculationRequest, CalculationResult, AmortizationRow, RepaymentFrequency } from './types';

export function calculateRepayment(request: CalculationRequest): CalculationResult {
  const principal = Math.max(1000, Number(request.principal) || 0);
  const annualRate = Math.max(0, Number(request.annualRate) || 0);
  const tenureMonths = Math.max(1, Math.round(Number(request.tenureMonths) || 12));
  const moratoriumMonths = Math.max(0, Math.round(Number(request.moratoriumMonths) || 0));
  const moratoriumMode = request.moratoriumMode || 'NO_INTEREST_DURING_MORATORIUM';
  const frequency = request.frequency || 'MONTHLY';
  const projectCost = request.projectCost ? Math.max(principal, Number(request.projectCost)) : Math.round(principal / 0.9);

  // Own contribution (margin money)
  const marginMoney = Math.max(0, projectCost - principal);
  const financedPercentage = Math.round((principal / projectCost) * 100);

  // Handle Moratorium Interest calculation
  let effectivePrincipal = principal;
  let moratoriumInterestAccrued = 0;

  if (moratoriumMonths > 0 && annualRate > 0) {
    if (moratoriumMode === 'INTEREST_ACCRUES') {
      moratoriumInterestAccrued = (principal * (annualRate / 100) * moratoriumMonths) / 12;
      effectivePrincipal = principal + moratoriumInterestAccrued;
    }
    // For 'NO_INTEREST_DURING_MORATORIUM', no interest accrues during grace period.
  }

  // Calculate EMI based on frequency
  let payment = 0;
  let totalRepayment = 0;
  let totalInterest = 0;

  const periods = frequency === 'QUARTERLY' ? Math.ceil(tenureMonths / 3) : tenureMonths;
  const periodicRate = frequency === 'QUARTERLY' ? (annualRate / 4) / 100 : (annualRate / 12) / 100;

  if (periodicRate === 0) {
    payment = effectivePrincipal / periods;
  } else {
    const compoundFactor = Math.pow(1 + periodicRate, periods);
    payment = (effectivePrincipal * periodicRate * compoundFactor) / (compoundFactor - 1);
  }

  // Round installment payment to 2 decimal places
  payment = Math.round(payment * 100) / 100;
  totalRepayment = Math.round(payment * periods * 100) / 100;
  totalInterest = Math.round((totalRepayment - principal) * 100) / 100;

  // Generate amortization preview for the first 12 repayment months
  const amortizationPreview: AmortizationRow[] = [];
  let currentBalance = effectivePrincipal;
  const previewMonths = Math.min(12, periods);

  for (let m = 1; m <= previewMonths; m++) {
    const interestPart = periodicRate === 0 ? 0 : currentBalance * periodicRate;
    const principalPart = payment - interestPart;
    currentBalance = Math.max(0, currentBalance - principalPart);

    amortizationPreview.push({
      month: m,
      principalPayment: Math.round(principalPart),
      interestPayment: Math.round(interestPart),
      totalPayment: Math.round(payment),
      remainingBalance: Math.round(currentBalance)
    });
  }

  const assumptions = [
    `Indicative reducing-balance calculation at ${annualRate}% per annum over ${tenureMonths} months.`,
    frequency === 'QUARTERLY' ? 'Quarterly repayment schedule selected.' : 'Monthly repayment schedule selected.',
    moratoriumMonths > 0
      ? `Moratorium period of ${moratoriumMonths} months applied (${moratoriumMode === 'NO_INTEREST_DURING_MORATORIUM' ? 'No interest accrued during moratorium' : 'Interest accrued during moratorium'}).`
      : 'Immediate repayment without moratorium.',
    `Estimated own contribution (margin money) of ₹${marginMoney.toLocaleString('en-IN')} (${100 - financedPercentage}%).`
  ];

  const assumptionsHi = [
    `${annualRate}% वार्षिक दर से ${tenureMonths} माह की घटती शेष राशि (Reducing Balance) पर आधारित गणना।`,
    frequency === 'QUARTERLY' ? 'त्रैमासिक किस्त विकल्प चुना गया है।' : 'मासिक किस्त (EMI) विकल्प चुना गया है।',
    moratoriumMonths > 0
      ? `${moratoriumMonths} माह की ऋण स्थगन (मोरेटोरियम) अवधि लागू है।`
      : 'ऋण वितरण के तुरंत बाद नियमित मासिक किस्त प्रारंभ।',
    `अनुमानित स्वयं का अंशदान (मार्जिन मनी): ₹${marginMoney.toLocaleString('en-IN')} (${100 - financedPercentage}%)`
  ];

  const disclaimer = 'This calculation is an indicative estimate only. The actual repayment schedule, interest subsidy, moratorium terms, and sanction are determined solely by the authorized State Channelizing Agency or bank.';
  const disclaimerHi = 'यह गणना केवल एक सांकेतिक अनुमान है। वास्तविक किस्त, ब्याज दर, छूट और स्वीकृति संबंधित अधिकृत राज्य एजेंसी या बैंक द्वारा आधिकारिक नियमों के आधार पर तय की जाएगी।';

  return {
    installmentPayment: payment,
    frequency,
    totalRepayment,
    totalInterest,
    principal,
    projectCost,
    marginMoney,
    financedPercentage,
    moratoriumMonths,
    moratoriumMode,
    amortizationPreview,
    assumptions,
    assumptionsHi,
    disclaimer,
    disclaimerHi
  };
}

/**
 * Calculates the maximum loan principal affordable for a given target EMI, interest rate, and tenure.
 */
export function calculatePrincipalFromEmi(params: {
  emi: number;
  annualRate: number;
  tenureMonths: number;
  frequency?: RepaymentFrequency;
}): number {
  const { emi, annualRate, tenureMonths, frequency = 'MONTHLY' } = params;
  if (emi <= 0 || tenureMonths <= 0) return 0;

  const periods = frequency === 'QUARTERLY' ? Math.ceil(tenureMonths / 3) : tenureMonths;
  const periodicRate = frequency === 'QUARTERLY' ? (annualRate / 4) / 100 : (annualRate / 12) / 100;

  if (periodicRate === 0) {
    return Math.round(emi * periods);
  }

  const compoundFactor = Math.pow(1 + periodicRate, periods);
  const principal = (emi * (compoundFactor - 1)) / (periodicRate * compoundFactor);
  return Math.max(1000, Math.round(principal));
}

