import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { runAutomatedPortalCrawler } from '@/lib/crawler/schemeCrawler';

// GET: Fetch list of crawled updates with counts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // optional filter: PENDING_REVIEW, APPROVED, REJECTED

    const where = status ? { status } : {};

    const [updates, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.pendingSchemeUpdate.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        take: 50,
      }),
      prisma.pendingSchemeUpdate.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.pendingSchemeUpdate.count({ where: { status: 'APPROVED' } }),
      prisma.pendingSchemeUpdate.count({ where: { status: 'REJECTED' } }),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      updates,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/pending-updates] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Trigger automated crawler across all bank & NSDC portals
export async function POST(req: NextRequest) {
  try {
    const result = await runAutomatedPortalCrawler();
    return NextResponse.json({
      success: true,
      result,
      message: `Crawler completed scan across ${result.sourcesScanned} portals. ${result.newPendingCreated} new pending update(s) flagged for admin review.`,
    });
  } catch (error: any) {
    console.error('[POST /api/admin/pending-updates] Error running crawler:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to execute crawler' },
      { status: 500 }
    );
  }
}
