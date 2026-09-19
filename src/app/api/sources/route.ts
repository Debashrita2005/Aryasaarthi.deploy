import { NextResponse } from 'next/server';
import { SOURCES } from '@/lib/sourceData';

export async function GET() {
  return NextResponse.json({
    sources: SOURCES,
    checkedAt: '2026-09-11',
    policy: 'Strict zero-hallucination source attribution. Revalidate all financial parameters prior to production changes.'
  });
}
