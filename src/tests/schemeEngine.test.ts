import { describe, it, expect } from 'vitest';
import { evaluateRecommendation } from '../lib/schemeEngine';
import { OFFICIAL_INCOME_CEILING, SCHEME_CONFIG_VERSION } from '../lib/schemeData';

describe('Scheme Recommendation Engine (Deterministic)', () => {
  it('recommends Micro Finance Scheme (MFS) for business with project cost <= 1,40,000 and valid SC cert', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 300000,
      scCertificate: 'YES'
    });

    expect(result.engineVersion).toBe(SCHEME_CONFIG_VERSION);
    expect(result.results.length).toBeGreaterThan(0);

    const mfs = result.results.find((r) => r.schemeCode === 'MFS');
    expect(mfs).toBeDefined();
    expect(mfs?.decision).toBe('LIKELY_MATCH');
    expect(mfs?.reasonCodes).toContain('PURPOSE_BUSINESS');
    expect(mfs?.reasonCodes).toContain('SC_REQUIREMENT_MET');
    expect(mfs?.reasonCodes).toContain('INCOME_WITHIN_LIMIT');
    expect(mfs?.reasonCodes).toContain('PROJECT_COST_IN_RANGE');
  });

  it('recommends Term Loan for business project cost > 1,40,000 up to ₹50 Lakh', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 3500000,
      annualFamilyIncome: 450000,
      scCertificate: 'YES'
    });

    const termLoan = result.results.find((r) => r.schemeCode === 'TERM_LOAN');
    expect(termLoan).toBeDefined();
    expect(termLoan?.decision).toBe('LIKELY_MATCH');
    expect(termLoan?.reasonCodes).toContain('PROJECT_COST_IN_RANGE');
  });

  it('recommends Educational Loan Scheme (ELS) for education purpose and full-time professional course', () => {
    const result = evaluateRecommendation({
      purpose: 'EDUCATION',
      projectCost: 1500000,
      annualFamilyIncome: 400000,
      scCertificate: 'YES',
      courseType: 'FULL_TIME_PROFESSIONAL'
    });

    const els = result.results.find((r) => r.schemeCode === 'ELS');
    expect(els).toBeDefined();
    expect(els?.decision).toBe('LIKELY_MATCH');
    expect(els?.reasonCodes).toContain('PURPOSE_EDUCATION');
    expect(els?.reasonCodes).toContain('COURSE_TYPE_MATCH');
  });

  it('strictly rejects when SC Certificate is NO (Mandatory statutory condition)', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 200000,
      scCertificate: 'NO'
    });

    for (const item of result.results) {
      expect(item.decision).toBe('NOT_MATCHING');
      expect(item.reasonCodes).toContain('MISSING_SC_CERTIFICATE');
    }
  });

  it('handles income ceiling boundary test: income <= ₹5L passes, income > ₹5L flags warning', () => {
    const atCeiling = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: OFFICIAL_INCOME_CEILING, // 500000
      scCertificate: 'YES'
    });
    const mfsAtCeiling = atCeiling.results.find((r) => r.schemeCode === 'MFS');
    expect(mfsAtCeiling?.reasonCodes).toContain('INCOME_WITHIN_LIMIT');

    const aboveCeiling = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: OFFICIAL_INCOME_CEILING + 1, // 500001
      scCertificate: 'YES'
    });
    const mfsAboveCeiling = aboveCeiling.results.find((r) => r.schemeCode === 'MFS');
    expect(mfsAboveCeiling?.reasonCodes).toContain('INCOME_ABOVE_LIMIT');
    expect(mfsAboveCeiling?.decision).not.toBe('LIKELY_MATCH');
  });

  it('returns authoritative official source citations on all responses', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 50000,
      annualFamilyIncome: 100000,
      scCertificate: 'YES'
    });

    expect(result.source.url).toBe('https://nsfdc.nic.in/');
    expect(result.source.checkedAt).toBe('2026-09-11');
  });

  it('unlocks 0.5% female interest rebate on ELS and priority on AMY when gender is FEMALE', () => {
    const result = evaluateRecommendation({
      gender: 'FEMALE',
      purpose: 'EDUCATION',
      projectCost: 1500000,
      annualFamilyIncome: 300000,
      scCertificate: 'YES',
      courseType: 'FULL_TIME_PROFESSIONAL'
    });

    const els = result.results.find((r) => r.schemeCode === 'ELS');
    expect(els).toBeDefined();
    expect(els?.reasonCodes).toContain('GENDER_FEMALE_REBATE');
    expect(els?.reasons.some(r => r.includes('0.5% p.a. interest rebate'))).toBe(true);

    const bizResult = evaluateRecommendation({
      gender: 'FEMALE',
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 250000,
      scCertificate: 'YES'
    });
    const amy = bizResult.results.find((r) => r.schemeCode === 'AMY');
    expect(amy).toBeDefined();
    expect(amy?.reasonCodes).toContain('GENDER_FEMALE_PRIORITY');
  });

  it('warns about Mahila Samriddhi priority when gender is MALE', () => {
    const result = evaluateRecommendation({
      gender: 'MALE',
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 250000,
      scCertificate: 'YES'
    });

    const amy = result.results.find((r) => r.schemeCode === 'AMY');
    expect(amy?.reasonCodes).toContain('GENDER_MALE_WARNING');
    expect(amy?.warnings.some(w => w.includes('prioritize female'))).toBe(true);
  });

  it('recommends Green Business Scheme (GBS) for clean energy & solar transport', () => {
    const result = evaluateRecommendation({
      purpose: 'GREEN_BUSINESS',
      projectCost: 500000,
      annualFamilyIncome: 300000,
      scCertificate: 'YES'
    });

    const gbs = result.results.find((r) => r.schemeCode === 'GBS');
    expect(gbs).toBeDefined();
    expect(gbs?.decision).toBe('LIKELY_MATCH');
    expect(gbs?.reasonCodes).toContain('PURPOSE_GREEN_BUSINESS');

    // Term loan also supports green units up to 50L
    const tls = result.results.find((r) => r.schemeCode === 'TERM_LOAN');
    expect(tls).toBeDefined();
    expect(tls?.reasonCodes).toContain('PURPOSE_GREEN_BUSINESS');
  });

  it('recommends Term Loan and MFS for Agriculture & allied activities', () => {
    const result = evaluateRecommendation({
      purpose: 'AGRICULTURE',
      projectCost: 400000,
      annualFamilyIncome: 300000,
      scCertificate: 'YES'
    });

    const tls = result.results.find((r) => r.schemeCode === 'TERM_LOAN');
    expect(tls).toBeDefined();
    expect(tls?.decision).toBe('LIKELY_MATCH');
    expect(tls?.reasonCodes).toContain('PURPOSE_AGRICULTURE');

    const mfs = result.results.find((r) => r.schemeCode === 'MFS');
    expect(mfs).toBeDefined();
    expect(mfs?.reasonCodes).toContain('PURPOSE_AGRICULTURE');
  });

  it('recommends Term Loan and GBS for Transport & commercial vehicles', () => {
    const result = evaluateRecommendation({
      purpose: 'TRANSPORT',
      projectCost: 600000,
      annualFamilyIncome: 300000,
      scCertificate: 'YES'
    });

    const tls = result.results.find((r) => r.schemeCode === 'TERM_LOAN');
    expect(tls).toBeDefined();
    expect(tls?.decision).toBe('LIKELY_MATCH');
    expect(tls?.reasonCodes).toContain('PURPOSE_TRANSPORT');

    const gbs = result.results.find((r) => r.schemeCode === 'GBS');
    expect(gbs).toBeDefined();
    expect(gbs?.reasonCodes).toContain('PURPOSE_TRANSPORT');
  });

  it('provides explainable recommendation structure with recommended and alternatives', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 300000,
      scCertificate: 'YES'
    });

    expect(result.recommended).not.toBeNull();
    expect(result.recommended?.schemeId).toBeDefined();
    expect(result.recommended?.schemeName).toBeDefined();
    expect(result.recommended?.matchedRule).toMatch(/income/i);
    expect(result.recommended?.fitScore).toBeGreaterThanOrEqual(0);
    expect(result.recommended?.fitScore).toBeLessThanOrEqual(1.0);

    expect(Array.isArray(result.alternatives)).toBe(true);
    if (result.alternatives.length > 0) {
      const alt = result.alternatives[0];
      expect(alt.schemeId).toBeDefined();
      expect(alt.schemeName).toBeDefined();
      expect(alt.matchedRule).toBeDefined();
      expect(alt.whyNotTop).toBeDefined();
      expect(typeof alt.whyNotTop).toBe('string');
      expect(alt.fitScore).toBeLessThanOrEqual(result.recommended!.fitScore);
    }
  });

  it('hard filters reject all schemes and return null recommended when SC certificate is NO', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 200000,
      scCertificate: 'NO'
    });

    expect(result.recommended).toBeNull();
    expect(result.alternatives).toHaveLength(0);
  });

  it('hard filters reject all schemes when age is under 18', () => {
    const result = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 200000,
      scCertificate: 'YES',
      age: 16,
    });

    expect(result.recommended).toBeNull();
    const firstResult = result.results[0];
    expect(firstResult.decision).toBe('NOT_MATCHING');
    expect(firstResult.reasonCodes).toContain('AGE_UNDER_18');
  });


  it('awards youth demographic and self-employment bonuses for young unemployed applicants', () => {
    const youngUnemployed = evaluateRecommendation({
      purpose: 'BUSINESS',
      projectCost: 100000,
      annualFamilyIncome: 200000,
      scCertificate: 'YES',
      age: 24,
      employmentStatus: 'UNEMPLOYED',
      state: 'Uttar Pradesh',
      areaType: 'RURAL',
    });

    expect(youngUnemployed.recommended).not.toBeNull();
    const mfs = youngUnemployed.results.find((r) => r.schemeCode === 'MFS');
    expect(mfs?.reasonCodes).toContain('AGE_ELIGIBLE');
    expect(mfs?.reasons.some(r => r.includes('Uttar Pradesh'))).toBe(true);
    expect(mfs?.reasons.some(r => r.includes('Rural'))).toBe(true);
  });
});


