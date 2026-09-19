import { describe, it, expect } from 'vitest';
import { OFFICIAL_VENTURES, VENTURE_SECTORS, getVenturesBySector, getVenturesForScheme } from '../lib/ventureData';
import { SCHEMES } from '../lib/schemeData';
import { PARTNERS } from '../lib/partnerData';

describe('NSFDC Official Indicative Finance Ventures', () => {
  it('includes indicative ventures across all 3 key sectors', () => {
    expect(VENTURE_SECTORS).toHaveLength(3);
    const sectors = VENTURE_SECTORS.map(s => s.id);
    expect(sectors).toContain('AGRICULTURE');
    expect(sectors).toContain('SMALL_INDUSTRIES');
    expect(sectors).toContain('SERVICE_TRANSPORT');
  });

  it('contains ventures for each sector with valid cost ranges', () => {
    const agri = getVenturesBySector('AGRICULTURE');
    const ind = getVenturesBySector('SMALL_INDUSTRIES');
    const serv = getVenturesBySector('SERVICE_TRANSPORT');

    expect(agri.length).toBeGreaterThan(0);
    expect(ind.length).toBeGreaterThan(0);
    expect(serv.length).toBeGreaterThan(0);

    for (const v of OFFICIAL_VENTURES) {
      expect(v.cost_range_max).toBeGreaterThan(v.cost_range_min);
      expect(v.suitable_schemes.length).toBeGreaterThan(0);
      expect(v.nameHi).toBeDefined();
    }
  });

  it('filters ventures matching NSFDC scheme codes like MFS and TERM_LOAN', () => {
    const mfsVentures = getVenturesForScheme('MFS');
    const termLoanVentures = getVenturesForScheme('TERM_LOAN');

    expect(mfsVentures.length).toBeGreaterThan(0);
    expect(termLoanVentures.length).toBeGreaterThan(0);

    for (const v of mfsVentures) {
      expect(v.suitable_schemes).toContain('MFS');
    }
  });
});

describe('Live NSFDC Scheme Terms & Verification', () => {
  it('verifies live interest rates and limits against official NSFDC specifications', () => {
    // 1. MFS (Micro Finance Scheme)
    const mfs = SCHEMES.find(s => s.code === 'MFS');
    expect(mfs).toBeDefined();
    expect(mfs?.project_cost_max).toBe(140000); // 1.4 Lakh project cost
    expect(mfs?.max_loan_amount).toBe(125000); // Up to 1.25 Lakh NSFDC share
    expect(mfs?.beneficiary_interest_rate_max).toBe(6.5); // 6.5% p.a.

    // 2. Term Loan
    const termLoan = SCHEMES.find(s => s.code === 'TERM_LOAN');
    expect(termLoan).toBeDefined();
    expect(termLoan?.project_cost_max).toBe(5000000); // 50 Lakh project cost
    expect(termLoan?.max_loan_amount).toBe(4500000); // Up to 90% (45 Lakh) NSFDC share
    expect(termLoan?.beneficiary_interest_rate_max).toBe(8.0); // 8% p.a.

    // 3. ELS (Education Loan Scheme)
    const els = SCHEMES.find(s => s.code === 'ELS');
    expect(els).toBeDefined();
    expect(els?.project_cost_max).toBe(4000000); // Up to 40 Lakh for abroad
    expect(els?.max_loan_amount).toBe(3600000); // Up to 90% (36 Lakh) NSFDC share
    expect(els?.beneficiary_interest_rate_max).toBe(6.5); // 6.5% p.a.
    expect(els?.rebate_women_pct).toBe(0.5); // 0.5% rebate for women

    // 4. UNY (Udyam Nidhi Yojana)
    const uny = SCHEMES.find(s => s.code === 'UNY');
    expect(uny).toBeDefined();
    expect(uny?.project_cost_max).toBe(500000); // 5 Lakh project cost
    expect(uny?.max_loan_amount).toBe(450000); // Up to 90% (4.5 Lakh) NSFDC share
  });

  it('ensures all schemes have valid official NSFDC URLs', () => {
    for (const s of SCHEMES) {
      expect(s.official_source_url).toContain('nsfdc.nic.in');
      expect(s.effective_from).toBeDefined();
    }
  });
});

describe('National GIS Partner Network Geolocation Data', () => {
  it('verifies all partners have valid Indian geographic coordinates and contact details', () => {
    expect(PARTNERS.length).toBeGreaterThanOrEqual(25);

    for (const p of PARTNERS) {
      // India lat range ~ 8° to 37° N, lng range ~ 68° to 98° E
      expect(p.latitude).toBeGreaterThan(8.0);
      expect(p.latitude).toBeLessThan(37.5);
      expect(p.longitude).toBeGreaterThan(68.0);
      expect(p.longitude).toBeLessThan(98.0);
      expect(p.phone).toMatch(/^(\+91|0)/);
      expect(p.state).toBeDefined();
      expect(p.supported_scheme_codes.length).toBeGreaterThan(0);
    }
  });

  it('covers major states across North, South, East, West and Central regions', () => {
    const states = new Set(PARTNERS.map(p => p.state));
    expect(states.has('Delhi')).toBe(true);
    expect(states.has('Uttar Pradesh')).toBe(true);
    expect(states.has('Maharashtra')).toBe(true);
    expect(states.has('Rajasthan')).toBe(true);
    expect(states.has('Punjab')).toBe(true);
    expect(states.has('Tamil Nadu')).toBe(true);
    expect(states.has('West Bengal')).toBe(true);
    expect(states.size).toBeGreaterThanOrEqual(15);
  });
});
