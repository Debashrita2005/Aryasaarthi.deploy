import { NextRequest, NextResponse } from 'next/server';
import { approveAndPublishSchemeUpdate } from '@/lib/activeSchemes';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const reviewer = body.reviewer || 'Sahayak Chief Governance Officer';
    const reviewNotes = body.reviewNotes || 'Verified against bank circular and approved.';
    const modifiedValues = body.modifiedValues;

    const result = await approveAndPublishSchemeUpdate({
      pendingUpdateId: params.id,
      reviewer,
      reviewNotes,
      modifiedValues,
    });

    return NextResponse.json({
      success: true,
      message: 'Scheme update verified and published live to users.',
      data: result,
    });
  } catch (error: any) {
    console.error(`[POST /api/admin/pending-updates/${params.id}/approve] Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to approve update' },
      { status: 400 }
    );
  }
}
