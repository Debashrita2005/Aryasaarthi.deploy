import { NextRequest, NextResponse } from 'next/server';
import { rejectSchemeUpdate } from '@/lib/activeSchemes';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const reviewer = body.reviewer || 'Sahayak Chief Governance Officer';
    const reviewNotes = body.reviewNotes || 'Rejected during compliance review.';

    const result = await rejectSchemeUpdate({
      pendingUpdateId: params.id,
      reviewer,
      reviewNotes,
    });

    return NextResponse.json({
      success: true,
      message: 'Pending scheme update rejected and excluded from user display.',
      data: result,
    });
  } catch (error: any) {
    console.error(`[POST /api/admin/pending-updates/${params.id}/reject] Error:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reject update' },
      { status: 400 }
    );
  }
}
