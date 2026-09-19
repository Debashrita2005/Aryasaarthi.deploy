import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../lib/db';
import { syncPartnersToDatabase } from '../lib/seedPartners';
import { syncVerifiedSchemesToDatabase } from '../lib/seedVerifiedSchemes';
import { approveAndPublishSchemeUpdate } from '../lib/activeSchemes';

describe('Scheme Inquiries, Provider Database, and Admin Verification Suite', () => {
  const testUserPhone = '+919876543210';
  let testUserId: string;

  beforeAll(async () => {
    // 1. Sync verified schemes and partners
    await syncVerifiedSchemesToDatabase();
    await syncPartnersToDatabase();

    // 2. Ensure a test user exists
    let user = await prisma.user.findFirst({
      where: { phone: testUserPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'test_user_ramesh_123',
          phone: testUserPhone,
          name: 'Ramesh Kumar (Test Citizen)',
          authMethod: 'phone_otp',
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          role: 'citizen',
        },
      });
    }

    testUserId = user.id;
  });

  it('1. SchemeProvider backend stores all partner providers with health & geo data', async () => {
    const providers = await prisma.schemeProvider.findMany();
    expect(providers.length).toBeGreaterThan(20);

    const sca = providers.find((p) => p.partnerType === 'SCA');
    expect(sca).toBeDefined();
    expect(sca?.latitude).toBeDefined();
    expect(sca?.longitude).toBeDefined();
    expect(sca?.state).toBeTruthy();
    expect(sca?.supportedSchemesJson).toBeTruthy();
  });

  it('2. Citizen can submit a SchemeInquiry and track it in their dashboard', async () => {
    // Create an inquiry for PMS-SC
    const inquiry = await prisma.schemeInquiry.create({
      data: {
        userId: testUserId,
        schemeCode: 'pms-sc',
        schemeName: 'Post Matric Scholarship for SC Students',
        applicantPhone: testUserPhone,
        applicantState: 'Uttar Pradesh',
        applicantDistrict: 'Lucknow',
        requestedLoanAmount: 150000,
        purpose: 'Higher Education M.Sc',
        providerName: 'State Channelizing Agency - UP',
        status: 'INQUIRY_SUBMITTED',
      },
    });

    expect(inquiry.id).toBeDefined();
    expect(inquiry.status).toBe('INQUIRY_SUBMITTED');

    // Query user's inquiries
    const userInquiries = await prisma.schemeInquiry.findMany({
      where: { userId: testUserId },
    });
    expect(userInquiries.length).toBeGreaterThanOrEqual(1);
    const found = userInquiries.find((i) => i.id === inquiry.id);
    expect(found?.schemeCode).toBe('pms-sc');
    expect(found?.requestedLoanAmount).toBe(150000);
  });

  it('3. Admin can retrieve citizen inquiries and update status', async () => {
    const allInquiries = await prisma.schemeInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    expect(allInquiries.length).toBeGreaterThan(0);

    const latest = allInquiries[0];
    const updated = await prisma.schemeInquiry.update({
      where: { id: latest.id },
      data: { status: 'DOCUMENTS_PREPARED' },
    });

    expect(updated.status).toBe('DOCUMENTS_PREPARED');
  });

  it('4. VerifiedScheme stores lastVerifiedDate and displays official government verification timestamp', async () => {
    const pmsScheme = await prisma.verifiedScheme.findUnique({
      where: { code: 'PMS-SC' },
    });

    expect(pmsScheme).toBeDefined();
    expect(pmsScheme?.lastVerifiedDate).toBeTruthy();
    expect(pmsScheme?.officialSourceUrl).toContain('gov.in');
  });

  it('5. Approving crawler update stamps lastVerifiedDate and broadcasts genuine SchemeNotification', async () => {
    // 1. Create a simulated pending update
    const pending = await prisma.pendingSchemeUpdate.create({
      data: {
        schemeCode: 'TL',
        schemeName: 'Term Loan Scheme',
        provider: 'NSFDC',
        sourceUrl: 'https://nsfdc.nic.in/schemes/term-loan',
        newInterestRateMin: 5.5,
        newInterestRateMax: 5.5,
        oldInterestRateMin: 6.0,
        oldInterestRateMax: 6.0,
        newMaxLoan: 5000000,
        newRepaymentMonths: 60,
        changeSummary: 'Interest rate reduced by 50 bps per government gazette notification',
        status: 'PENDING_REVIEW',
      },
    });

    // 2. Approve the update
    const result = await approveAndPublishSchemeUpdate({
      pendingUpdateId: pending.id,
      reviewer: 'admin_test_user',
      reviewNotes: 'Verified against gazette',
    });
    expect(result.success).toBe(true);
    expect(result.pendingUpdate.status).toBe('APPROVED');

    // 3. Verify notification was created
    const notifications = await prisma.schemeNotification.findMany({
      where: { schemeCode: 'TL' },
      orderBy: { createdAt: 'desc' },
    });

    expect(notifications.length).toBeGreaterThan(0);
    const latestNotif = notifications[0];
    expect(latestNotif.changeType).toBe('INTEREST_RATE');
    expect(latestNotif.title).toContain('Term Loan Scheme');
    expect(latestNotif.message).toContain('5.5%');

    // 4. Verify verifiedScheme lastVerifiedDate was updated
    const verifiedTL = await prisma.verifiedScheme.findUnique({
      where: { code: 'TL' },
    });
    if (verifiedTL) {
      expect(verifiedTL.lastVerifiedDate).toBeTruthy();
    }
  });

  it('6. Inquiries API: Handles Indian formatted currency strings and missing providers gracefully', async () => {
    // Import API route handler
    const { POST, GET, PATCH } = await import('../app/api/user/inquiries/route');
    const { NextRequest } = await import('next/server');

    // 1. POST with comma formatted currency and non-existent providerId
    const postReq = new NextRequest('http://127.0.0.1:3000/api/user/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        userId: testUserId,
        schemeCode: 'MFS',
        schemeName: 'Mahila Samriddhi Yojana',
        requestedLoanAmount: '₹1,40,000',
        projectCost: '2,00,000',
        providerId: 'non_existent_partner_id_99999', // Should not crash
        providerName: 'Custom Rural Bank',
        applicantPhone: testUserPhone,
        applicantState: 'Uttar Pradesh',
        applicantDistrict: 'Lucknow',
      }),
    });

    const postRes = await POST(postReq);
    const postData = await postRes.json();
    expect(postRes.status).toBe(200);
    expect(postData.success).toBe(true);
    expect(postData.inquiry.requestedLoanAmount).toBe(140000);
    expect(postData.inquiry.projectCost).toBe(200000);
    expect(postData.inquiry.providerId).toBeNull(); // Safe fallback
    expect(postData.inquiry.providerName).toBe('Custom Rural Bank');

    const createdInquiryId = postData.inquiry.id;

    // 2. PATCH status transition to FORWARDED_TO_PARTNER
    const patchReq = new NextRequest('http://127.0.0.1:3000/api/user/inquiries', {
      method: 'PATCH',
      body: JSON.stringify({
        id: createdInquiryId,
        status: 'FORWARDED_TO_PARTNER',
        notes: 'Documents verified by SCA officer, forwarded to bank branch.',
      }),
    });

    const patchRes = await PATCH(patchReq);
    const patchData = await patchRes.json();
    expect(patchRes.status).toBe(200);
    expect(patchData.success).toBe(true);
    expect(patchData.inquiry.status).toBe('FORWARDED_TO_PARTNER');

    // 3. Confirm citizen notification was automatically created
    const citizenNotif = await prisma.schemeNotification.findFirst({
      where: {
        userId: testUserId,
        schemeCode: 'MFS',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(citizenNotif).toBeDefined();
    expect(citizenNotif?.title).toContain('Forwarded to Channel Partner');

    // 4. GET with status filter
    const getReq = new NextRequest(
      `http://127.0.0.1:3000/api/user/inquiries?userId=${testUserId}&status=FORWARDED_TO_PARTNER`
    );
    const getRes = await GET(getReq);
    const getData = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getData.inquiries.length).toBeGreaterThanOrEqual(1);
    expect(getData.inquiries[0].status).toBe('FORWARDED_TO_PARTNER');
  });
});

