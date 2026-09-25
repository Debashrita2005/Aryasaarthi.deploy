import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { Prisma, VerifiedScheme } from '@prisma/client';
import { SCHEME_CONFIG_VERSION } from '@/lib/schemeData';
import { getActiveSchemes } from '@/lib/activeSchemes';
import { ALL_VERIFIED_SCHEMES, type VerifiedSchemeData } from '@/lib/verifiedSchemesData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level'); // 'CENTRAL' | 'STATE_UT'
  const state = searchParams.get('state');
  const category = searchParams.get('category');
  const query = searchParams.get('search')?.toLowerCase().trim();

  // Load active NSFDC schemes (backward-compatible)
  const activeLendingSchemes = await getActiveSchemes();

  // Query verified directory from DB (with fallback to static dataset)
  let verifiedList: VerifiedSchemeData[] = [];
  try {
    const whereClause: Prisma.VerifiedSchemeWhereInput = {};
    if (level && level !== 'ALL') whereClause.level = level;
    if (state && state !== 'ALL') whereClause.state = state;
    if (category && category !== 'ALL') whereClause.category = category;

    const dbSchemes: VerifiedScheme[] = await prisma.verifiedScheme.findMany({
      where: whereClause,
      orderBy: [{ level: 'asc' }, { state: 'asc' }, { name: 'asc' }],
    });

    if (dbSchemes && dbSchemes.length > 0) {
      verifiedList = dbSchemes.map((s: VerifiedScheme) => ({
        code: s.code,
        slug: s.slug,
        name: s.name,
        nameHi: s.nameHi ?? undefined,
        level: s.level as 'CENTRAL' | 'STATE_UT',
        state: s.state,
        category: s.category as VerifiedSchemeData['category'],
        typeLabel: s.typeLabel,
        eligibility: s.eligibility,
        documents: JSON.parse(s.documentsJson),
        officialRoute: s.officialRoute,
        officialSourceUrl: s.officialSourceUrl,
        verifiedAt: s.verifiedAt,
        lastVerifiedDate: s.lastVerifiedDate,
      }));
    } else {
      verifiedList = ALL_VERIFIED_SCHEMES;
    }
  } catch (err) {
    console.error('[API Schemes] Falling back to static verified dataset:', err);
    verifiedList = ALL_VERIFIED_SCHEMES;
  }

  // Apply search filter if present
  if (query) {
    verifiedList = verifiedList.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.nameHi && s.nameHi.toLowerCase().includes(query)) ||
        s.code.toLowerCase().includes(query) ||
        (s.state && s.state.toLowerCase().includes(query)) ||
        s.category.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    version: SCHEME_CONFIG_VERSION,
    directoryVersion: 'September 2026 Revised Directory',
    count: verifiedList.length,
    schemes: activeLendingSchemes,
    verifiedSchemes: verifiedList,
    source: {
      url: 'https://socialjustice.gov.in',
      title: 'Official Scheduled Caste Welfare Schemes Directory (September 2026)',
      checkedAt: '2026-09-15',
    },
  });
}
