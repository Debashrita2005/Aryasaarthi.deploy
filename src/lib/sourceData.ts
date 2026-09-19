import { SourceMetadata, AuditEvent } from './types';

export const SOURCES: SourceMetadata[] = [
  {
    id: 'src_nsfdc_portal',
    url: 'https://nsfdc.nic.in/',
    title: 'National Scheduled Castes Finance and Development Corporation (NSFDC) Official Portal',
    sourceType: 'OFFICIAL_PORTAL',
    retrievedAt: '2026-09-11',
    effectiveDate: '2024-04-01',
    contentHash: 'sha256_nsfdc_official_portal_2026',
    reviewer: 'Sahayak Compliance Officer',
    status: 'CURRENT_VERIFIED',
    notes: 'PSU under Department of Social Justice & Empowerment, Govt. of India. Establishes core beneficiary mandate.'
  },
  {
    id: 'src_nsfdc_faq',
    url: 'https://nsfdc.nic.in/faqs',
    title: 'NSFDC Official Frequently Asked Questions & Operational Guidelines',
    sourceType: 'OFFICIAL_FAQ',
    retrievedAt: '2026-09-11',
    effectiveDate: '2024-04-01',
    contentHash: 'sha256_nsfdc_faq_v2026',
    reviewer: 'Sahayak Lead Product Engineer',
    status: 'CURRENT_VERIFIED',
    notes: 'Confirms annual family income ceiling of ₹5.00 Lakh for concessional loans and SCA routing structure.'
  },
  {
    id: 'src_nsfdc_schemes',
    url: 'https://nsfdc.nic.in/schemes',
    title: 'NSFDC Lending Policies & Scheme Term Specifications',
    sourceType: 'POLICY_DOCUMENT',
    retrievedAt: '2026-09-11',
    effectiveDate: '2024-04-01',
    contentHash: 'sha256_nsfdc_schemes_policy_2024',
    reviewer: 'Sahayak Financial Logic Auditor',
    status: 'CURRENT_VERIFIED',
    notes: 'Documents unit cost caps (MFS ₹1.4L, Term Loan up to ₹50L, ELS up to ₹40L abroad), rates (3.5% - 8%), and tenure.'
  },
  {
    id: 'src_nsfdc_partners',
    url: 'https://nsfdc.nic.in/channel-partners',
    title: 'State Channelizing Agencies (SCAs) & Banking Partners Directory',
    sourceType: 'NOTIFICATION',
    retrievedAt: '2026-09-11',
    effectiveDate: '2024-04-01',
    contentHash: 'sha256_nsfdc_channel_partners_v1',
    reviewer: 'Sahayak Operations Lead',
    status: 'CURRENT_VERIFIED',
    notes: 'List of authorized State Channelizing Agencies and RRB agreements. Emphasizes applications are submitted through SCAs.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'audit_001',
    actorId: 'admin_sys_init',
    action: 'CREATE',
    entityType: 'SCHEME_RULE',
    entityId: 'SCHEME_CONFIG_2026.09.1',
    beforeJson: undefined,
    afterJson: JSON.stringify({
      version: '2026.09.1',
      incomeCeiling: 500000,
      schemesActive: ['MFS', 'AMY', 'TERM_LOAN', 'UNY', 'ELS']
    }),
    reason: 'Initial production rule baseline established from official NSFDC documentation.',
    sourceUrl: 'https://nsfdc.nic.in/faqs',
    createdAt: '2026-09-11T12:00:00Z'
  },
  {
    id: 'audit_002',
    actorId: 'admin_sys_init',
    action: 'VERIFY',
    entityType: 'SOURCE',
    entityId: 'src_nsfdc_faq',
    afterJson: JSON.stringify({ incomeCeiling: 500000, status: 'CURRENT_VERIFIED' }),
    reason: 'Revalidated ₹5 Lakh annual family income ceiling per official FAQ update.',
    sourceUrl: 'https://nsfdc.nic.in/faqs',
    createdAt: '2026-09-11T12:15:00Z'
  },
  {
    id: 'audit_003',
    actorId: 'admin_compliance',
    action: 'VERIFY',
    entityType: 'PARTNER',
    entityId: 'PARTNERS_SCA_DIRECTORY',
    afterJson: JSON.stringify({ totalVerifiedAgencies: 11, capacityPolicy: 'UNKNOWN_PRESERVED' }),
    reason: 'Strict enforcement that unverified partner capacity remains UNKNOWN and never defaults to available.',
    sourceUrl: 'https://nsfdc.nic.in/channel-partners',
    createdAt: '2026-09-11T12:30:00Z'
  }
];
