import { describe, it, expect } from 'vitest';
import {
  searchPartners,
  computeHaversineDistance,
  computeEligibilityStatus,
  generateEligibilityReason,
  getCapacityBadge
} from '../lib/partnerService';

describe('Geospatial Partner Service & Partner Health', () => {
  it('computes accurate Haversine distance in km between two geo coordinates', () => {
    // Distance between Delhi (28.7041, 77.1025) and Lucknow (26.8467, 80.9462) ~ 416 km
    const dist = computeHaversineDistance(28.7041, 77.1025, 26.8467, 80.9462);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(450);
  });

  it('filters partners by state accurately', () => {
    const delhiPartners = searchPartners({ state: 'Delhi' });
    expect(delhiPartners.length).toBeGreaterThan(0);
    for (const p of delhiPartners) {
      expect(p.state).toBe('Delhi');
    }

    const upPartners = searchPartners({ state: 'Uttar Pradesh' });
    expect(upPartners.length).toBeGreaterThan(0);
    for (const p of upPartners) {
      expect(p.state).toBe('Uttar Pradesh');
    }
  });

  it('filters partners by supported scheme code', () => {
    const elsPartners = searchPartners({ schemeCode: 'ELS' });
    expect(elsPartners.length).toBeGreaterThan(0);
    for (const p of elsPartners) {
      expect(p.supported_scheme_codes).toContain('ELS');
    }
  });

  it('strictly preserves capacity UNKNOWN status and never converts to available', () => {
    const partners = searchPartners({});
    for (const partner of partners) {
      const badge = getCapacityBadge(partner.capacity_status);
      if (partner.capacity_status === 'UNKNOWN') {
        expect(badge.label).not.toBe('Verified Active');
        expect(badge.description).toContain('Live processing capacity is not available in our data');
      }
    }
  });

  it('sorts partners by proximity when coordinates are provided', () => {
    // Search from nearby Rohini, Delhi (28.72, 77.12)
    const nearby = searchPartners({
      latitude: 28.72,
      longitude: 77.12
    });

    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby[0].name).toContain('Delhi'); // Delhi DSFDC is within ~2km
    expect(nearby[0].distanceKm).toBeLessThan(10);
  });

  // TASK 1: Partner Health & Eligibility Status Unit Tests
  it('correctly derives eligibilityStatus via pure computeEligibilityStatus', () => {
    // 1. Ineligible due to NPA > 10%
    expect(
      computeEligibilityStatus({
        partnerHealth: { npaPercentage: 11.2, overdueFlag: false, fundUtilizationPercentage: 60 }
      })
    ).toBe('ineligible');

    // 2. Ineligible due to overdueFlag === true
    expect(
      computeEligibilityStatus({
        partnerHealth: { npaPercentage: 4.5, overdueFlag: true, fundUtilizationPercentage: 70 }
      })
    ).toBe('ineligible');

    // 3. Restricted due to fundUtilization > 85%
    expect(
      computeEligibilityStatus({
        partnerHealth: { npaPercentage: 5.0, overdueFlag: false, fundUtilizationPercentage: 89 }
      })
    ).toBe('restricted');

    // 4. Eligible when healthy
    expect(
      computeEligibilityStatus({
        partnerHealth: { npaPercentage: 4.2, overdueFlag: false, fundUtilizationPercentage: 65 }
      })
    ).toBe('eligible');
  });

  it('excludes ineligible partners by default and includes them when includeIneligible=true', () => {
    const defaultPartners = searchPartners({});
    const hasIneligibleDefault = defaultPartners.some((p) => p.eligibilityStatus === 'ineligible');
    expect(hasIneligibleDefault).toBe(false);

    const allPartners = searchPartners({ includeIneligible: true });
    const hasIneligibleIncluded = allPartners.some((p) => p.eligibilityStatus === 'ineligible');
    expect(hasIneligibleIncluded).toBe(true);
    expect(allPartners.length).toBeGreaterThan(defaultPartners.length);
  });

  it('sorts eligible partners before restricted partners', () => {
    const results = searchPartners({ includeIneligible: true });
    let seenRestricted = false;
    let seenIneligible = false;

    for (const p of results) {
      if (p.eligibilityStatus === 'restricted') {
        seenRestricted = true;
      }
      if (p.eligibilityStatus === 'ineligible') {
        seenIneligible = true;
      }

      if (p.eligibilityStatus === 'eligible') {
        expect(seenRestricted).toBe(false);
        expect(seenIneligible).toBe(false);
      }
      if (p.eligibilityStatus === 'restricted') {
        expect(seenIneligible).toBe(false);
      }
    }
  });

  it('attaches server-generated eligibilityReason to each partner', () => {
    const results = searchPartners({ state: 'Delhi' });
    for (const p of results) {
      expect(p.eligibilityReason).toBeDefined();
      expect(typeof p.eligibilityReason).toBe('string');
      expect(p.eligibilityReason.length).toBeGreaterThan(5);
    }
  });
});
