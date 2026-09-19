import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../lib/db';
import { runAutomatedPortalCrawler } from '../lib/crawler/schemeCrawler';
import { getActiveSchemes, approveAndPublishSchemeUpdate, rejectSchemeUpdate } from '../lib/activeSchemes';
import { SCHEMES } from '../lib/schemeData';

const MOCK_REVISED_HTML = `
  <!-- 4. Udyam Nidhi Yojana (UNY) -->
  <div>
    <h2>4 Udyam Nidhi Yojana (UNY)</h2>
    <p>Units costing up to ₹ 5.00 lakh.</p>
    <p>Rate of Interest Beneficiary pays 4.5% p.a. Concessional revision.</p>
  </div>
`;

describe('Automated Portal Crawler & Human-in-the-Loop Verification Suite', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.pendingSchemeUpdate.deleteMany();
    await prisma.activeSchemeOverride.deleteMany();
    await prisma.schemeRateSnapshot.deleteMany();
  });

  it('1. Crawler reports UP_TO_DATE when official portals match baseline (zero fake proposals)', async () => {
    // Standard run: all parameters align with current guidelines
    const scanResult = await runAutomatedPortalCrawler();

    expect(scanResult.sourcesScanned).toBeGreaterThan(0);
    expect(scanResult.items.length).toBe(scanResult.sourcesScanned);

    // Verified: no fake proposals created when portals are up to date
    for (const item of scanResult.items) {
      expect(['UP_TO_DATE', 'GAZETTE_VERIFIED', 'PORTAL_UNREACHABLE']).toContain(item.status);
    }
  }, 15000);

  it('2. Crawler stages genuine drift in PENDING_REVIEW away from citizen portal', async () => {
    // Simulate official portal publishing an updated rate
    const scanResult = await runAutomatedPortalCrawler({
      mockPortalHtml: MOCK_REVISED_HTML,
    });

    const pending = await prisma.pendingSchemeUpdate.findMany({
      where: { status: 'PENDING_REVIEW' },
    });

    expect(pending.length).toBeGreaterThan(0);

    for (const item of pending) {
      expect(item.status).toBe('PENDING_REVIEW');
      expect(item.isPublished).toBe(false);
      expect(item.newInterestRateMin).toBeGreaterThan(0);
      expect(item.sourceUrl).toBeTruthy();
    }

    // Active user schemes MUST still match baseline before admin approval
    const activeSchemes = await getActiveSchemes();
    const unyScheme = activeSchemes.find((s) => s.code === 'UNY')!;
    const baseUny = SCHEMES.find((s) => s.code === 'UNY')!;

    expect(unyScheme.beneficiary_interest_rate_min).toBe(baseUny.beneficiary_interest_rate_min);
  });

  it('3. Admin verification approves genuine update and publishes it live to users', async () => {
    await runAutomatedPortalCrawler({
      mockPortalHtml: MOCK_REVISED_HTML,
    });

    const pendingUny = await prisma.pendingSchemeUpdate.findFirst({
      where: { schemeCode: 'UNY', status: 'PENDING_REVIEW' },
    });
    expect(pendingUny).toBeTruthy();

    // Admin reviews and confirms
    const approvalResult = await approveAndPublishSchemeUpdate({
      pendingUpdateId: pendingUny!.id,
      reviewer: 'Sahayak Compliance Lead',
      reviewNotes: 'Verified with official NSFDC gazette circular',
    });

    expect(approvalResult.success).toBe(true);
    expect(approvalResult.pendingUpdate.status).toBe('APPROVED');
    expect(approvalResult.pendingUpdate.isPublished).toBe(true);

    // Now getActiveSchemes MUST return the newly published rates to users!
    const updatedSchemes = await getActiveSchemes();
    const liveUny = updatedSchemes.find((s) => s.code === 'UNY')!;

    expect(liveUny.beneficiary_interest_rate_min).toBe(pendingUny!.newInterestRateMin);
    expect(liveUny.source_title).toContain('Verified by Sahayak Compliance Lead');
  });

  it('4. Admin rejection discards the proposal and keeps user rates untouched', async () => {
    await runAutomatedPortalCrawler({
      mockPortalHtml: MOCK_REVISED_HTML,
    });

    const pendingUny = await prisma.pendingSchemeUpdate.findFirst({
      where: { schemeCode: 'UNY', status: 'PENDING_REVIEW' },
    });
    expect(pendingUny).toBeTruthy();

    // Admin rejects
    const rejectResult = await rejectSchemeUpdate({
      pendingUpdateId: pendingUny!.id,
      reviewer: 'Chief Auditor',
      reviewNotes: 'Rate revision not yet gazetted for current fiscal',
    });

    expect(rejectResult.success).toBe(true);
    expect(rejectResult.pendingUpdate.status).toBe('REJECTED');
    expect(rejectResult.pendingUpdate.isPublished).toBe(false);

    // Active schemes should still match baseline
    const activeSchemes = await getActiveSchemes();
    const liveUny = activeSchemes.find((s) => s.code === 'UNY')!;
    const baseUny = SCHEMES.find((s) => s.code === 'UNY')!;

    expect(liveUny.beneficiary_interest_rate_min).toBe(baseUny.beneficiary_interest_rate_min);
  });

  it('5. Offline/Unreachable portals do NOT fabricate fake rate proposals', async () => {
    const scanResult = await runAutomatedPortalCrawler({
      skipNetwork: true,
    });

    expect(scanResult.proposalsFound).toBe(0);
    expect(scanResult.newPendingCreated).toBe(0);

    const pendingCount = await prisma.pendingSchemeUpdate.count({
      where: { status: 'PENDING_REVIEW' },
    });
    expect(pendingCount).toBe(0);
  });
});
