import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Helper to safely parse numeric inputs, removing commas, spaces, currency symbols
 * Avoids bug where parseInt("5,00,000", 10) evaluates to 5 instead of 500000.
 */
function parseSafeInt(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : Math.round(val);
  const cleaned = String(val).replace(/[^0-9]/g, '');
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * Valid Inquiry Status Lifecycle
 */
const VALID_INQUIRY_STATUSES = [
  'INQUIRY_SUBMITTED',
  'DOCUMENTS_PREPARED',
  'FORWARDED_TO_PARTNER',
  'SANCTIONED',
  'REJECTED',
] as const;

type InquiryStatus = typeof VALID_INQUIRY_STATUSES[number];

/**
 * GET /api/user/inquiries?userId=...&status=...&limit=...
 * Fetch all scheme inquiries/applications submitted by a user, or all for admin
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isAll = searchParams.get('all') === 'true';
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim().toLowerCase();
    const limit = Math.min(Math.max(parseSafeInt(searchParams.get('limit')) || 100, 1), 200);

    if (!userId && !isAll) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required (or all=true for admin)' },
        { status: 400 }
      );
    }

    const where: any = {};

    if (!isAll && userId) {
      where.userId = userId;
    }

    if (status && VALID_INQUIRY_STATUSES.includes(status as any)) {
      where.status = status;
    }

    const inquiries = await prisma.schemeInquiry.findMany({
      where,
      include: {
        provider: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            state: true,
            district: true,
            gender: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Optional in-memory search across applicant name, scheme name, or code
    const filtered = search
      ? inquiries.filter(
          (inq) =>
            inq.schemeName.toLowerCase().includes(search) ||
            inq.schemeCode.toLowerCase().includes(search) ||
            (inq.applicantPhone && inq.applicantPhone.toLowerCase().includes(search)) ||
            (inq.user?.name && inq.user.name.toLowerCase().includes(search)) ||
            (inq.applicantState && inq.applicantState.toLowerCase().includes(search))
        )
      : inquiries;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      inquiries: filtered,
    });
  } catch (error: any) {
    console.error('[GET /api/user/inquiries] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch scheme inquiries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/inquiries
 * Submit an inquiry/application for a scheme
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const {
      userId,
      schemeCode,
      schemeName,
      schemeCategory,
      purpose,
      requestedLoanAmount,
      projectCost,
      providerId,
      providerName,
      providerDistrict,
      applicantName,
      applicantPhone,
      applicantState,
      applicantDistrict,
      notes,
    } = body;

    // Strict validation
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!schemeCode || typeof schemeCode !== 'string' || !schemeCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'schemeCode is required' },
        { status: 400 }
      );
    }

    if (!schemeName || typeof schemeName !== 'string' || !schemeName.trim()) {
      return NextResponse.json(
        { success: false, error: 'schemeName is required' },
        { status: 400 }
      );
    }

    // Safely parse amounts (handles Indian commas, rupee symbols)
    const parsedLoanAmount = parseSafeInt(requestedLoanAmount);
    const parsedProjectCost = parseSafeInt(projectCost);

    // Ensure user exists in DB or upsert
    const existingUser = await prisma.user.findUnique({
      where: { id: userId.trim() },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId.trim(),
          name: (applicantName || 'Beneficiary Citizen').trim(),
          phone: applicantPhone?.trim() || null,
          authMethod: 'citizen',
          role: 'beneficiary',
          state: applicantState?.trim() || null,
          district: applicantDistrict?.trim() || null,
        },
      });
    } else {
      // Update phone or location if currently missing
      const updates: any = {};
      if (!existingUser.phone && applicantPhone) updates.phone = applicantPhone.trim();
      if (!existingUser.state && applicantState) updates.state = applicantState.trim();
      if (!existingUser.district && applicantDistrict) updates.district = applicantDistrict.trim();
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: updates,
        });
      }
    }

    // Validate providerId to prevent foreign key constraint violations
    let validProviderId: string | null = null;
    let finalProviderName = providerName || null;
    let finalProviderDistrict = providerDistrict || null;

    if (providerId && typeof providerId === 'string') {
      const providerExists = await prisma.schemeProvider.findUnique({
        where: { id: providerId.trim() },
      });
      if (providerExists) {
        validProviderId = providerExists.id;
        finalProviderName = providerExists.name;
        finalProviderDistrict = providerExists.district;
      }
    }

    // Create the scheme inquiry
    const inquiry = await prisma.schemeInquiry.create({
      data: {
        userId: userId.trim(),
        schemeCode: schemeCode.trim().toUpperCase(),
        schemeName: schemeName.trim(),
        schemeCategory: schemeCategory?.trim() || 'LOAN',
        purpose: purpose?.trim() || 'Self-Employment',
        requestedLoanAmount: parsedLoanAmount,
        projectCost: parsedProjectCost,
        providerId: validProviderId,
        providerName: finalProviderName,
        providerDistrict: finalProviderDistrict,
        status: 'INQUIRY_SUBMITTED',
        applicantPhone: applicantPhone?.trim() || null,
        applicantState: applicantState?.trim() || null,
        applicantDistrict: applicantDistrict?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    // Auto-create confirmation receipt in citizen's scheme notifications
    const refId = `#${inquiry.id.slice(-6).toUpperCase()}`;
    await prisma.schemeNotification.create({
      data: {
        userId: userId.trim(),
        schemeCode: schemeCode.trim().toUpperCase(),
        schemeName: schemeName.trim(),
        title: `Inquiry Submitted: ${schemeName.trim()}`,
        titleHi: `योजना पूछताछ दर्ज: ${schemeName.trim()}`,
        message: `Your inquiry for ${schemeName.trim()} has been recorded. Reference ID: ${refId}. Authorized channel partner will review your documents.`,
        messageHi: `${schemeName.trim()} के लिए आपका आवेदन दर्ज किया गया है। संदर्भ आईडी: ${refId}। चैनल पार्टनर आपके दस्तावेजों की समीक्षा करेगा।`,
        changeType: 'DOCUMENT_UPDATE',
        verifiedDate: '17 Sep 2026',
        sourceUrl: 'https://nsfdc.nic.in',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Scheme inquiry successfully submitted',
      inquiry,
    });
  } catch (error: any) {
    console.error('[POST /api/user/inquiries] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit scheme inquiry' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/inquiries
 * Update inquiry status, assigned channel partner, or admin review notes
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { id, status, notes, providerId } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Inquiry id is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.schemeInquiry.findUnique({
      where: { id: id.trim() },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Scheme inquiry not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status) {
      if (!VALID_INQUIRY_STATUSES.includes(status as any)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Allowed values: ${VALID_INQUIRY_STATUSES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (providerId) {
      const providerExists = await prisma.schemeProvider.findUnique({
        where: { id: providerId.trim() },
      });
      if (providerExists) {
        updateData.providerId = providerExists.id;
        updateData.providerName = providerExists.name;
        updateData.providerDistrict = providerExists.district;
      }
    }

    const updated = await prisma.schemeInquiry.update({
      where: { id: existing.id },
      data: updateData,
    });

    // If status changed, notify the citizen
    if (status && status !== existing.status) {
      const statusLabels: Record<string, { en: string; hi: string }> = {
        DOCUMENTS_PREPARED: {
          en: 'Documents Verified & Prepared',
          hi: 'दस्तावेज सत्यापित और तैयार',
        },
        FORWARDED_TO_PARTNER: {
          en: 'Forwarded to Channel Partner Bank/SCA',
          hi: 'चैनल पार्टनर बैंक/एससीए को भेजा गया',
        },
        SANCTIONED: {
          en: 'Scheme Assistance Sanctioned',
          hi: 'योजना सहायता स्वीकृत',
        },
        REJECTED: {
          en: 'Application Not Approved',
          hi: 'आवेदन स्वीकृत नहीं किया गया',
        },
      };

      const label = statusLabels[status] || { en: status, hi: status };
      await prisma.schemeNotification.create({
        data: {
          userId: existing.userId,
          schemeCode: existing.schemeCode,
          schemeName: existing.schemeName,
          title: `Application Status Updated: ${label.en}`,
          titleHi: `आवेदन स्थिति अपडेट: ${label.hi}`,
          message: `Your inquiry for ${existing.schemeName} (#${existing.id.slice(-6).toUpperCase()}) status has been updated to: ${status}.`,
          messageHi: `${existing.schemeName} (#${existing.id.slice(-6).toUpperCase()}) के लिए आपकी पूछताछ स्थिति अपडेट की गई: ${label.hi}।`,
          changeType: 'DOCUMENT_UPDATE',
          verifiedDate: '17 Sep 2026',
          sourceUrl: 'https://nsfdc.nic.in',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Scheme inquiry updated successfully',
      inquiry: updated,
    });
  } catch (error: any) {
    console.error('[PATCH /api/user/inquiries] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update scheme inquiry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/inquiries?id=...&userId=...
 * Cancel or delete an inquiry
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    if (!userId && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'userId is required (or admin=true)' },
        { status: 400 }
      );
    }

    const where: any = { id: id.trim() };
    if (!isAdmin && userId) {
      where.userId = userId.trim();
    }

    const deleteResult = await prisma.schemeInquiry.deleteMany({
      where,
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry cancelled successfully',
      count: deleteResult.count,
    });
  } catch (error: any) {
    console.error('[DELETE /api/user/inquiries] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel inquiry' },
      { status: 500 }
    );
  }
}
