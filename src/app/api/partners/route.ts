import { NextRequest, NextResponse } from 'next/server';
import { searchPartners } from '@/lib/partnerService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radiusKm');
    const schemeCode = searchParams.get('scheme') || undefined;
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const includeIneligible = searchParams.get('includeIneligible') === 'true';
    const isAdmin = searchParams.get('role') === 'admin' || searchParams.get('admin') === 'true';

    const latitude = latParam ? parseFloat(latParam) : undefined;
    const longitude = lngParam ? parseFloat(lngParam) : undefined;
    const radiusKm = radiusParam ? parseFloat(radiusParam) : undefined;

    const partners = searchPartners({
      latitude,
      longitude,
      radiusKm,
      schemeCode,
      state,
      district,
      includeIneligible,
    });

    // Strip raw NPA/overdue metrics from public citizen response
    const sanitizedPartners = partners.map((p) => {
      const { partnerHealth, adminMetrics, ...publicData } = p;
      return {
        ...publicData,
        ...(isAdmin ? { adminMetrics } : {}),
      };
    });

    return NextResponse.json({
      count: sanitizedPartners.length,
      partners: sanitizedPartners,
      sourceCaveat: 'Live processing capacity is not available in our data. Please call before travelling.',
      officialDirectoryUrl: 'https://nsfdc.nic.in/channel-partners',
      checkedAt: '2026-09-11'
    });
  } catch (err: unknown) {
    console.error('Error in /api/partners:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve partner directory.' },
      { status: 500 }
    );
  }
}
