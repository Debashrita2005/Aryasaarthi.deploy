import { NextRequest, NextResponse } from 'next/server';
import { getPartnerById } from '@/lib/partnerService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const partner = getPartnerById(params.id);

  if (!partner) {
    return NextResponse.json(
      { error: `Partner with id "${params.id}" not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    partner,
    caveat: 'Live processing capacity is not available in our data. Please call before travelling.',
    officialSource: 'https://nsfdc.nic.in/channel-partners'
  });
}
