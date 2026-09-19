// AryaSaarthi — Active Scheme Resolution & Approval Lifecycle Engine
// Ensures that only Admin-VERIFIED scheme updates are published to live users.

import prisma from './db';
import { Scheme } from './types';
import { SCHEMES, getSchemeByCode } from './schemeData';

/**
 * Returns all schemes with approved database overrides applied.
 * Fallbacks to base SCHEMES if no overrides exist or if database query fails.
 */
export async function getActiveSchemes(): Promise<Scheme[]> {
  try {
    const overrides = await prisma.activeSchemeOverride.findMany();
    if (!overrides || overrides.length === 0) {
      return SCHEMES;
    }

    const overrideMap = new Map(overrides.map((o) => [o.schemeCode, o]));

    return SCHEMES.map((baseScheme) => {
      const override = overrideMap.get(baseScheme.code);
      if (!override) return baseScheme;

      return {
        ...baseScheme,
        beneficiary_interest_rate_min: override.interestRateMin,
        beneficiary_interest_rate_max: override.interestRateMax,
        max_loan_amount: override.maxLoanAmount,
        repayment_period_months: override.repaymentMonths,
        rebate_women_pct: override.rebateWomenPct ?? baseScheme.rebate_women_pct,
        official_source_url: override.sourceUrl || baseScheme.official_source_url,
        source_title: `${override.sourceProvider} (Verified by ${override.approvedBy})`,
        source_checked_at: override.approvedAt.toISOString().split('T')[0],
      };
    });
  } catch (error) {
    console.error('[getActiveSchemes] Error loading DB overrides, falling back to static SCHEMES:', error);
    return SCHEMES;
  }
}

/**
 * Returns a specific scheme by code with approved overrides applied.
 */
export async function getActiveSchemeByCode(code: string): Promise<Scheme | undefined> {
  const all = await getActiveSchemes();
  return all.find((s) => s.code.toUpperCase() === code.toUpperCase());
}

/**
 * Admin Action: Verify and Approve a pending scheme update.
 * This commits the change to ActiveSchemeOverride, logs an immutable audit event,
 * takes a snapshot, and makes it live for all users.
 */
export async function approveAndPublishSchemeUpdate(params: {
  pendingUpdateId: string;
  reviewer: string;
  reviewNotes?: string;
  modifiedValues?: {
    interestRateMin?: number;
    interestRateMax?: number;
    maxLoanAmount?: number;
    repaymentMonths?: number;
  };
}) {
  const pending = await prisma.pendingSchemeUpdate.findUnique({
    where: { id: params.pendingUpdateId },
  });

  if (!pending) {
    throw new Error(`Pending scheme update with ID ${params.pendingUpdateId} not found.`);
  }

  if (pending.status === 'APPROVED') {
    throw new Error('This update has already been verified and published.');
  }

  const finalRateMin = params.modifiedValues?.interestRateMin ?? pending.newInterestRateMin;
  const finalRateMax = params.modifiedValues?.interestRateMax ?? pending.newInterestRateMax;
  const finalMaxLoan = params.modifiedValues?.maxLoanAmount ?? (pending.newMaxLoan || 100000);
  const finalRepayment = params.modifiedValues?.repaymentMonths ?? (pending.newRepaymentMonths || 36);

  // 1. Mark the pending proposal as APPROVED & published
  const updatedPending = await prisma.pendingSchemeUpdate.update({
    where: { id: params.pendingUpdateId },
    data: {
      status: 'APPROVED',
      isPublished: true,
      reviewedBy: params.reviewer,
      reviewNotes: params.reviewNotes || 'Verified and approved by admin officer.',
      reviewedAt: new Date(),
      newInterestRateMin: finalRateMin,
      newInterestRateMax: finalRateMax,
      newMaxLoan: finalMaxLoan,
      newRepaymentMonths: finalRepayment,
    },
  });

  // 2. Upsert into ActiveSchemeOverride to make it active for all user queries
  const activeOverride = await prisma.activeSchemeOverride.upsert({
    where: { schemeCode: pending.schemeCode },
    update: {
      interestRateMin: finalRateMin,
      interestRateMax: finalRateMax,
      maxLoanAmount: finalMaxLoan,
      repaymentMonths: finalRepayment,
      sourceProvider: pending.provider,
      sourceUrl: pending.sourceUrl,
      approvedBy: params.reviewer,
      approvedAt: new Date(),
    },
    create: {
      schemeCode: pending.schemeCode,
      schemeName: pending.schemeName,
      interestRateMin: finalRateMin,
      interestRateMax: finalRateMax,
      maxLoanAmount: finalMaxLoan,
      repaymentMonths: finalRepayment,
      sourceProvider: pending.provider,
      sourceUrl: pending.sourceUrl,
      approvedBy: params.reviewer,
    },
  });

  // 3. Create a SchemeRateSnapshot to preserve historical timeline
  await prisma.schemeRateSnapshot.create({
    data: {
      schemeCode: pending.schemeCode,
      schemeName: pending.schemeName,
      snapshotVersion: `VERIFIED-${new Date().toISOString().split('T')[0]}`,
      interestRateMin: finalRateMin,
      interestRateMax: finalRateMax,
      maxLoanAmount: finalMaxLoan,
      repaymentMonths: finalRepayment,
      changeDetected: true,
      changeDescription: `Admin verified update from ${pending.provider}: Rate ${finalRateMin}% - ${finalRateMax}%, Max ₹${(finalMaxLoan / 100000).toFixed(2)}L`,
      previousRateMin: pending.oldInterestRateMin,
      previousRateMax: pending.oldInterestRateMax,
      previousMaxLoan: pending.oldMaxLoan,
      previousRepayment: pending.oldRepaymentMonths,
    },
  });

  const verifiedDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // 4. Update VerifiedScheme lastVerifiedDate in database
  await prisma.verifiedScheme.updateMany({
    where: { code: pending.schemeCode },
    data: {
      lastVerifiedDate: verifiedDateStr,
      officialSourceUrl: pending.sourceUrl,
    },
  });

  // 5. Dispatch genuine broadcast notification to all citizens
  await prisma.schemeNotification.create({
    data: {
      userId: null,
      schemeCode: pending.schemeCode,
      schemeName: pending.schemeName,
      title: `Verified Rate Change: ${pending.schemeName}`,
      titleHi: `सत्यापित ब्याज दर अपडेट: ${pending.schemeName}`,
      message: `Interest rate officially verified as ${finalRateMin}% - ${finalRateMax}% p.a. Verified from ${pending.provider} (${pending.sourceUrl}) on ${verifiedDateStr}.`,
      messageHi: `${pending.schemeName} के लिए ब्याज दर ${finalRateMin}% - ${finalRateMax}% वार्षिक आधिकारिक रूप से सत्यापित।`,
      changeType: 'INTEREST_RATE',
      oldValue: pending.oldInterestRateMin ? `${pending.oldInterestRateMin}% - ${pending.oldInterestRateMax}%` : null,
      newValue: `${finalRateMin}% - ${finalRateMax}%`,
      verifiedDate: verifiedDateStr,
      sourceUrl: pending.sourceUrl,
    },
  });

  return {
    success: true,
    pendingUpdate: updatedPending,
    activeOverride,
  };
}

/**
 * Admin Action: Reject a pending scheme update.
 * Does NOT publish to users.
 */
export async function rejectSchemeUpdate(params: {
  pendingUpdateId: string;
  reviewer: string;
  reviewNotes: string;
}) {
  const pending = await prisma.pendingSchemeUpdate.findUnique({
    where: { id: params.pendingUpdateId },
  });

  if (!pending) {
    throw new Error(`Pending scheme update with ID ${params.pendingUpdateId} not found.`);
  }

  const updatedPending = await prisma.pendingSchemeUpdate.update({
    where: { id: params.pendingUpdateId },
    data: {
      status: 'REJECTED',
      isPublished: false,
      reviewedBy: params.reviewer,
      reviewNotes: params.reviewNotes,
      reviewedAt: new Date(),
    },
  });

  return {
    success: true,
    pendingUpdate: updatedPending,
  };
}
