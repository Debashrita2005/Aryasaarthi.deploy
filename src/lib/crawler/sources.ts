// AryaSaarthi — Monitored External Data Sources
// Catalog of real Government, Bank, and Central Authority portals monitored by the live crawler.

export interface CrawlerTargetSource {
  id: string;
  name: string;
  category: 'GOVT_PROVIDER' | 'BANK' | 'CENTRAL_GAZETTE';
  portalUrl: string;
  targetSchemeCode: string;
  description: string;
  sectionTag?: string; // HTML section anchor on the portal
}

export const MONITORED_SOURCES: CrawlerTargetSource[] = [
  {
    id: 'src_nsfdc_mfs',
    name: 'NSFDC Official Portal — Micro Finance Scheme (MFS)',
    category: 'GOVT_PROVIDER',
    portalUrl: 'https://nsfdc.nic.in/scheme',
    targetSchemeCode: 'MFS',
    sectionTag: '1. Micro Finance Scheme (MFS)',
    description: 'Monitors micro-credit lending caps (₹1.40L cost, ₹1.25L loan limit), 6.5% beneficiary rate, and 3-year repayment terms.',
  },
  {
    id: 'src_nsfdc_tl',
    name: 'NSFDC Official Portal — Term Loan (TL)',
    category: 'GOVT_PROVIDER',
    portalUrl: 'https://nsfdc.nic.in/scheme',
    targetSchemeCode: 'TERM_LOAN',
    sectionTag: '2. Term Loan',
    description: 'Monitors Term Loan ceilings (₹50.00L cost, ₹45.00L loan limit), 8.0% beneficiary rate, and 7-year repayment guidelines.',
  },
  {
    id: 'src_nsfdc_amy',
    name: 'NSFDC Official Portal — Aajeevika Micro-Finance Yojana (AMY)',
    category: 'GOVT_PROVIDER',
    portalUrl: 'https://nsfdc.nic.in/scheme',
    targetSchemeCode: 'AMY',
    sectionTag: '3. Aajeevika Micro-Finance Yojana',
    description: 'Monitors Aajeevika micro-finance terms, ₹1.40L project caps, and NBFC-MFI / SHG lending guidelines.',
  },
  {
    id: 'src_nsfdc_uny',
    name: 'NSFDC Official Portal — Udyam Nidhi Yojana (UNY)',
    category: 'GOVT_PROVIDER',
    portalUrl: 'https://nsfdc.nic.in/scheme',
    targetSchemeCode: 'UNY',
    sectionTag: '4. Udyam Nidhi Yojana (UNY)',
    description: 'Monitors Udyam Nidhi lending terms through Cooperative Banks & SFBs up to ₹5.00 Lakh unit cost.',
  },
  {
    id: 'src_nsfdc_els',
    name: 'NSFDC Official Portal — Educational Loan Scheme (ELS)',
    category: 'GOVT_PROVIDER',
    portalUrl: 'https://nsfdc.nic.in/scheme',
    targetSchemeCode: 'ELS',
    sectionTag: '5. Educational Loan Scheme (ELS)',
    description: 'Monitors higher education limits (₹40.00 Lakhs Domestic & Abroad) and 12-year repayment terms.',
  },
  {
    id: 'src_pib_msje',
    name: 'Press Information Bureau (PIB) — Ministry of Social Justice & Empowerment',
    category: 'CENTRAL_GAZETTE',
    portalUrl: 'https://www.pib.gov.in/RssMain.aspx?ModId=6',
    targetSchemeCode: 'GENERAL_NOTICES',
    description: 'Monitors live official government press releases, gazette revisions, and policy notifications under MSJE.',
  },
  {
    id: 'src_msje_central',
    name: 'Ministry of Social Justice & Empowerment (MSJE) Central Portal',
    category: 'GOVT_PROVIDER',
    portalUrl: 'https://socialjustice.gov.in/',
    targetSchemeCode: 'CENTRAL_POLICY',
    description: 'Monitors central administrative guidelines, SCA allocations, and nodal policy circulars.',
  },
];
