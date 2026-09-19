// AryaSaarthi — Scheme Rate Change Checker
// Compares live SCHEMES data to last DB snapshot and writes change records.

import { SCHEMES, SCHEME_CONFIG_VERSION } from './schemeData';
import prisma from './db';

export interface RateCheckDetail {
  schemeCode: string;
  schemeName: string;
  changeDetected: boolean;
  changeDescription: string | null;
  isNew: boolean;
}

export interface RateCheckReport {
  checkedAt: string;
  newSnapshots: number;
  changes: number;
  details: RateCheckDetail[];
}

export async function checkSchemeRates(): Promise<RateCheckReport> {
  const details: RateCheckDetail[] = [];
  let newSnapshots = 0;
  let changes = 0;

  for (const scheme of SCHEMES) {
    // Fetch the most recent snapshot for this scheme
    const lastSnapshot = await prisma.schemeRateSnapshot.findFirst({
      where: { schemeCode: scheme.code },
      orderBy: { checkedAt: 'desc' },
    });

    const current = {
      interestRateMin: scheme.beneficiary_interest_rate_min,
      interestRateMax: scheme.beneficiary_interest_rate_max,
      rebateWomenPct: scheme.rebate_women_pct ?? null,
      maxLoanAmount: scheme.max_loan_amount,
      repaymentMonths: scheme.repayment_period_months,
    };

    let changeDetected = false;
    const changeParts: string[] = [];

    if (!lastSnapshot) {
      // First time seeing this scheme — baseline snapshot
      newSnapshots++;
    } else {
      // Compare each field
      if (lastSnapshot.interestRateMin !== current.interestRateMin) {
        changeParts.push(
          `Interest rate (min): ${lastSnapshot.interestRateMin}% → ${current.interestRateMin}%`
        );
      }
      if (lastSnapshot.interestRateMax !== current.interestRateMax) {
        changeParts.push(
          `Interest rate (max): ${lastSnapshot.interestRateMax}% → ${current.interestRateMax}%`
        );
      }
      if (lastSnapshot.maxLoanAmount !== current.maxLoanAmount) {
        changeParts.push(
          `Max loan: ₹${(lastSnapshot.maxLoanAmount / 100000).toFixed(2)}L → ₹${(current.maxLoanAmount / 100000).toFixed(2)}L`
        );
      }
      if (lastSnapshot.repaymentMonths !== current.repaymentMonths) {
        changeParts.push(
          `Repayment: ${lastSnapshot.repaymentMonths}m → ${current.repaymentMonths}m`
        );
      }
      if (changeParts.length > 0) {
        changeDetected = true;
        changes++;
      }
    }

    const changeDescription = changeParts.length > 0 ? changeParts.join(' | ') : null;

    await prisma.schemeRateSnapshot.create({
      data: {
        schemeCode: scheme.code,
        schemeName: scheme.name,
        snapshotVersion: SCHEME_CONFIG_VERSION,
        interestRateMin: current.interestRateMin,
        interestRateMax: current.interestRateMax,
        rebateWomenPct: current.rebateWomenPct,
        maxLoanAmount: current.maxLoanAmount,
        repaymentMonths: current.repaymentMonths,
        changeDetected,
        changeDescription,
        previousRateMin: lastSnapshot?.interestRateMin ?? null,
        previousRateMax: lastSnapshot?.interestRateMax ?? null,
        previousMaxLoan: lastSnapshot?.maxLoanAmount ?? null,
        previousRepayment: lastSnapshot?.repaymentMonths ?? null,
      },
    });

    details.push({
      schemeCode: scheme.code,
      schemeName: scheme.name,
      changeDetected,
      changeDescription,
      isNew: !lastSnapshot,
    });
  }

  return {
    checkedAt: new Date().toISOString(),
    newSnapshots,
    changes,
    details,
  };
}
