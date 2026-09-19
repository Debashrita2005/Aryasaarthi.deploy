import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSchemeBySlug } from '@/lib/schemeData';
import { getVerifiedSchemeBySlug } from '@/lib/verifiedSchemesData';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // 1. Check in verified database first
  try {
    const dbScheme = await prisma.verifiedScheme.findFirst({
      where: {
        OR: [{ slug: slug }, { code: slug.toUpperCase() }],
      },
    });

    if (dbScheme) {
      return NextResponse.json({
        found: true,
        source: 'DATABASE_VERIFIED',
        scheme: {
          ...dbScheme,
          documents: JSON.parse(dbScheme.documentsJson),
        },
      });
    }
  } catch (err) {
    console.error('[API Scheme Detail] DB lookup error:', err);
  }

  // 2. Check in verified static fallback
  const verifiedFallback = getVerifiedSchemeBySlug(slug);
  if (verifiedFallback) {
    return NextResponse.json({
      found: true,
      source: 'VERIFIED_DIRECTORY_STATIC',
      scheme: verifiedFallback,
    });
  }

  // 3. Check in NSFDC core lending schemes
  const coreScheme = getSchemeBySlug(slug);
  if (coreScheme) {
    return NextResponse.json({
      found: true,
      source: 'CORE_LENDING_ACTIVE',
      scheme: coreScheme,
    });
  }

  return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
}
