import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../lib/db';
import { syncVerifiedSchemesToDatabase } from '../lib/seedVerifiedSchemes';
import {
  VERIFIED_CENTRAL_SCHEMES,
  VERIFIED_STATE_SCHEMES,
  ALL_VERIFIED_SCHEMES,
  COMMON_DOCUMENT_CHECKLIST,
} from '../lib/verifiedSchemesData';

describe('Verified SC Welfare Schemes Directory & Backend Storage', () => {
  beforeAll(async () => {
    // Seed and sync all verified schemes to Prisma / SQLite
    await syncVerifiedSchemesToDatabase();
  });

  it('1. Contains exactly 17 Central Schemes and 76 State/UT Schemes in dataset', () => {
    expect(VERIFIED_CENTRAL_SCHEMES.length).toBe(17);
    expect(VERIFIED_STATE_SCHEMES.length).toBe(76);
    expect(ALL_VERIFIED_SCHEMES.length).toBe(93);
  });

  it('2. Successfully stores all 93 schemes in SQLite backend via Prisma', async () => {
    const count = await prisma.verifiedScheme.count();
    expect(count).toBeGreaterThanOrEqual(93);
  });

  it('3. Successfully filters schemes by level (CENTRAL vs STATE_UT) from database', async () => {
    const centralSchemes = await prisma.verifiedScheme.findMany({
      where: { level: 'CENTRAL' },
    });
    expect(centralSchemes.length).toBe(17);

    const stateSchemes = await prisma.verifiedScheme.findMany({
      where: { level: 'STATE_UT' },
    });
    expect(stateSchemes.length).toBe(76);
  });

  it('4. Correctly retrieves state-specific schemes with full document checklists', async () => {
    const mhSchemes = await prisma.verifiedScheme.findMany({
      where: { state: 'Maharashtra' },
    });
    expect(mhSchemes.length).toBe(3);
    const banrf = mhSchemes.find((s) => s.code === 'MH-BANRF');
    expect(banrf).toBeDefined();
    expect(banrf?.name).toContain('BARTI BANRF');
    expect(banrf?.category).toBe('FELLOWSHIP');

    // Parse documents JSON
    const docs = JSON.parse(banrf!.documentsJson);
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0]).toHaveProperty('name');
    expect(docs[0]).toHaveProperty('mandatory');
  });

  it('5. Verifies official routes and verification timestamps for key central schemes', async () => {
    const pms = await prisma.verifiedScheme.findUnique({
      where: { code: 'PMS-SC' },
    });
    expect(pms).toBeDefined();
    expect(pms?.officialRoute).toBe('scholarships.gov.in');
    expect(pms?.verifiedAt).toBe('2026-09');

    const nos = await prisma.verifiedScheme.findUnique({
      where: { code: 'NOS-SC' },
    });
    expect(nos).toBeDefined();
    expect(nos?.officialRoute).toBe('nosmsje.gov.in');

    const cegssc = await prisma.verifiedScheme.findUnique({
      where: { code: 'CEGSSC' },
    });
    expect(cegssc).toBeDefined();
    expect(cegssc?.officialRoute).toBe('cegssc.in');
  });

  it('6. Common document checklist includes all standard statutory verifications', () => {
    expect(COMMON_DOCUMENT_CHECKLIST.length).toBe(7);
    const docIds = COMMON_DOCUMENT_CHECKLIST.map((d) => d.id);
    expect(docIds).toContain('doc_sc_caste');
    expect(docIds).toContain('doc_aadhaar_otr');
    expect(docIds).toContain('doc_income_cert');
    expect(docIds).toContain('doc_domicile');
    expect(docIds).toContain('doc_bank_proof');
  });
});
