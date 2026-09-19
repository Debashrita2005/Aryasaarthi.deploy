import { NextResponse } from 'next/server';
import { SCHEME_CONFIG_VERSION } from '@/lib/schemeData';
import { OFFICIAL_VENTURES, VENTURE_SECTORS } from '@/lib/ventureData';
import { getActiveSchemes } from '@/lib/activeSchemes';

export async function GET() {
  const schemes = await getActiveSchemes();
  return NextResponse.json({
    status: 'SUCCESS',
    sync_metadata: {
      source: 'National Scheduled Castes Finance & Development Corporation (NSFDC) & Verified Updates',
      official_scheme_url: 'https://nsfdc.nic.in/scheme',
      indicative_activities_url: 'https://nsfdc.nic.in/indicative-activities',
      pm_suraj_portal: 'https://pmsuraj.dosje.gov.in/',
      helpline: '1800110396',
      last_verified_at: '2026-09-13',
      engine_version: SCHEME_CONFIG_VERSION,
      verification_status: 'SYNCHRONIZED_ACTIVE'
    },
    scheme_count: schemes.length,
    schemes: schemes.map((scheme) => ({
      code: scheme.code,
      name: scheme.name,
      nameHi: scheme.nameHi,
      category: scheme.category,
      project_cost_max: scheme.project_cost_max,
      max_loan_amount: scheme.max_loan_amount,
      beneficiary_interest_rate_min: scheme.beneficiary_interest_rate_min,
      beneficiary_interest_rate_max: scheme.beneficiary_interest_rate_max,
      rebate_women_pct: scheme.rebate_women_pct || 0,
      repayment_period_months: scheme.repayment_period_months,
      moratorium_months: scheme.moratorium_months,
      official_source_url: scheme.official_source_url,
      source_checked_at: scheme.source_checked_at
    })),
    sectors: VENTURE_SECTORS,
    ventures_count: OFFICIAL_VENTURES.length,
    ventures: OFFICIAL_VENTURES
  });
}
