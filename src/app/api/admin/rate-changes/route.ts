import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);
    const changesOnly = req.nextUrl.searchParams.get('changesOnly') !== 'false';
    const changes = await prisma.schemeRateSnapshot.findMany({
      where: changesOnly ? { changeDetected: true } : undefined,
      orderBy: { checkedAt: 'desc' },
      take: limit,
    });
    return NextResponse.json({ success: true, changes, total: changes.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
