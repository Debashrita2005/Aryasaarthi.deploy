import { NextRequest, NextResponse } from 'next/server';
import { checkSchemeRates } from '@/lib/rateChecker';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized triggers
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const report = await checkSchemeRates();

    return NextResponse.json({
      success: true,
      ...report,
      message: `Rate check complete. ${report.changes} change(s) detected across ${report.details.length} schemes.`,
    });
  } catch (error: any) {
    console.error('[cron/check-rates] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Also allow POST from the admin panel button
export async function POST(req: NextRequest) {
  return GET(req);
}
