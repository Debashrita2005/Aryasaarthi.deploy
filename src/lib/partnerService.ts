import { Partner, CapacityStatus, PartnerEligibilityStatus, PartnerHealth } from './types';
import { PARTNERS } from './partnerData';

export interface PartnerQueryParams {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  schemeCode?: string;
  state?: string;
  district?: string;
  includeIneligible?: boolean;
}

export interface PartnerWithDistance extends Partner {
  distanceKm?: number;
  eligibilityStatus: PartnerEligibilityStatus;
  eligibilityReason: string;
  adminMetrics?: {
    npaPercentage: number;
    overdueFlag: boolean;
    fundUtilizationPercentage: number;
  };
}

/**
 * Pure function to derive eligibilityStatus server-side:
 * - ineligible if npaPercentage > 10 OR overdueFlag === true
 * - restricted if fundUtilizationPercentage > 85
 * - else eligible
 */
export function computeEligibilityStatus(partner: { partnerHealth?: PartnerHealth }): PartnerEligibilityStatus {
  const health = partner.partnerHealth;
  if (!health) return 'eligible';

  if (health.npaPercentage > 10 || health.overdueFlag === true) {
    return 'ineligible';
  }
  if (health.fundUtilizationPercentage > 85) {
    return 'restricted';
  }
  return 'eligible';
}

/**
 * Generates user-facing, human-friendly eligibility reason without exposing raw financial metrics publicly.
 */
export function generateEligibilityReason(
  status: PartnerEligibilityStatus,
  distanceKm?: number
): string {
  switch (status) {
    case 'eligible':
      return distanceKm !== undefined
        ? `Nearest eligible partner — verified channel capacity & active quota`
        : `Eligible partner — active operational intake & healthy capacity`;
    case 'restricted':
      return `Restricted partner — high fund absorption (>85%). Confirm branch quota before travel`;
    case 'ineligible':
      return `Temporarily ineligible partner — institutional portfolio under regulatory review`;
  }
}

// Haversine formula to compute distance in km (PostGIS ST_Distance equivalent)
export function computeHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function searchPartners(params: PartnerQueryParams): PartnerWithDistance[] {
  // Base verified partner list
  let filtered: Partner[] = PARTNERS.filter(
    (p) => p.operational_status === 'VERIFIED'
  );

  // Filter by state
  if (params.state && params.state !== 'ALL') {
    filtered = filtered.filter(
      (p) => p.state.toLowerCase() === params.state?.toLowerCase()
    );
  }

  // Filter by district
  if (params.district && params.district !== 'ALL') {
    filtered = filtered.filter(
      (p) => p.district.toLowerCase() === params.district?.toLowerCase()
    );
  }

  // Filter by supported scheme code
  if (params.schemeCode && params.schemeCode !== 'ALL') {
    const codeUpper = params.schemeCode.toUpperCase();
    filtered = filtered.filter((p) =>
      p.supported_scheme_codes.map((c) => c.toUpperCase()).includes(codeUpper)
    );
  }

  // Compute distance and derive eligibility status on read
  const hasCoords =
    params.latitude !== undefined &&
    params.longitude !== undefined &&
    !isNaN(params.latitude) &&
    !isNaN(params.longitude);

  let partnersWithMeta: PartnerWithDistance[] = filtered.map((p) => {
    const dist = hasCoords
      ? computeHaversineDistance(params.latitude!, params.longitude!, p.latitude, p.longitude)
      : undefined;

    const eligibilityStatus = computeEligibilityStatus(p);
    const eligibilityReason = generateEligibilityReason(eligibilityStatus, dist);

    return {
      ...p,
      distanceKm: dist,
      eligibilityStatus,
      eligibilityReason,
      adminMetrics: {
        npaPercentage: p.partnerHealth.npaPercentage,
        overdueFlag: p.partnerHealth.overdueFlag,
        fundUtilizationPercentage: p.partnerHealth.fundUtilizationPercentage,
      },
    };
  });

  // Filter by radius if coordinates & radius are provided
  if (hasCoords && params.radiusKm && params.radiusKm > 0) {
    partnersWithMeta = partnersWithMeta.filter(
      (p) => (p.distanceKm ?? 999999) <= params.radiusKm!
    );
  }

  // Exclude ineligible partners unless explicitly requested via includeIneligible=true
  if (!params.includeIneligible) {
    partnersWithMeta = partnersWithMeta.filter(
      (p) => p.eligibilityStatus !== 'ineligible'
    );
  }

  // Tier helper for priority sorting: eligible (0) -> restricted (1) -> ineligible (2)
  const getTier = (status: PartnerEligibilityStatus) => {
    if (status === 'eligible') return 0;
    if (status === 'restricted') return 1;
    return 2;
  };

  // Sorting: Prioritize eligible before restricted
  if (hasCoords) {
    partnersWithMeta.sort((a, b) => {
      const tierDiff = getTier(a.eligibilityStatus) - getTier(b.eligibilityStatus);
      if (tierDiff !== 0) return tierDiff;
      return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
    });
  } else {
    partnersWithMeta.sort((a, b) => {
      const tierDiff = getTier(a.eligibilityStatus) - getTier(b.eligibilityStatus);
      if (tierDiff !== 0) return tierDiff;
      if (a.state === b.state) {
        return a.name.localeCompare(b.name);
      }
      return a.state.localeCompare(b.state);
    });
  }

  return partnersWithMeta;
}

export function getPartnerById(id: string): Partner | undefined {
  return PARTNERS.find((p) => p.id === id);
}

export function getCapacityBadge(status: CapacityStatus): {
  label: string;
  labelHi: string;
  className: string;
  description: string;
  descriptionHi: string;
} {
  switch (status) {
    case 'VERIFIED_AVAILABLE':
      return {
        label: 'Verified Active',
        labelHi: 'सक्रिय रूप से उपलब्ध',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Verified operational capacity confirmed by recent channel update.',
        descriptionHi: 'हालिया अपडेट के अनुसार आवेदन स्वीकार किए जा रहे हैं।'
      };
    case 'VERIFIED_LIMITED':
      return {
        label: 'Confirm First',
        labelHi: 'पहले पुष्टि करें',
        className: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Limited operational quota; citizen must call agency prior to visit.',
        descriptionHi: 'सीमित कोटा उपलब्ध; जाने से पहले कार्यालय से संपर्क करें।'
      };
    case 'VERIFIED_UNAVAILABLE':
      return {
        label: 'Currently Paused',
        labelHi: 'वर्तमान में स्थगित',
        className: 'bg-red-100 text-red-800 border-red-300',
        description: 'Agency is currently not processing this category.',
        descriptionHi: 'इस श्रेणी के आवेदन वर्तमान में स्थगित हैं।'
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'Capacity Unconfirmed',
        labelHi: 'स्थिति असत्यापित (संपर्क करें)',
        className: 'bg-slate-100 text-slate-800 border-slate-300',
        description: 'Live processing capacity is not available in our data. Please call before travelling.',
        descriptionHi: 'वर्तमान क्षमता का लाइव डेटा उपलब्ध नहीं है। कृपया जाने से पहले दूरभाष पर संपर्क करें।'
      };
  }
}
