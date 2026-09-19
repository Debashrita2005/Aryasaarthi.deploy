import { NextRequest, NextResponse } from 'next/server';
import { runAutomatedPortalCrawler } from '@/lib/crawler/schemeCrawler';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/crawler/scrape
 * Triggers backend scraper to fetch actual rate alert data from monitored external portals,
 * records rate change snapshots and staging proposals, and returns real-time alert data.
 */
export async function POST(req: NextRequest) {
  try {
    const scanResult = await runAutomatedPortalCrawler();

    // Fetch the latest rate alerts generated
    const latestAlerts = await prisma.schemeRateSnapshot.findMany({
      where: { changeDetected: true },
      orderBy: { checkedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      message: `Scraper scanned ${scanResult.sourcesScanned} portals. Found ${scanResult.proposalsFound} rate drift(s), created ${scanResult.rateAlertsCreated} rate alert snapshot(s).`,
      scanResult,
      rateAlerts: latestAlerts,
    });
  } catch (error: any) {
    console.error('[POST /api/crawler/scrape] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to execute backend scraper' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crawler/scrape
 * Quick status and latest rate alerts fetched by the scraper
 */
export async function GET(req: NextRequest) {
  try {
    const shouldRun = req.nextUrl.searchParams.get('run') === 'true';

    if (shouldRun) {
      return POST(req);
    }

    const latestAlerts = await prisma.schemeRateSnapshot.findMany({
      where: { changeDetected: true },
      orderBy: { checkedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      totalAlerts: latestAlerts.length,
      rateAlerts: latestAlerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching rate alerts' },
      { status: 500 }
    );
  }
}
