import { Scheme } from './types';

export const OFFICIAL_INCOME_CEILING = 500000; // ₹5,00,000 as per official NSFDC FAQ & policy
export const SCHEME_CONFIG_VERSION = '2026.09.2-live';

export const SCHEMES: Scheme[] = [
  {
    id: 'scheme_mfs_01',
    code: 'MFS',
    slug: 'micro-finance-scheme',
    name: 'Micro Finance Scheme (MFS)',
    nameHi: 'लघु वित्त योजना (माइक्रो फाइनेंस)',
    category: 'MICRO_FINANCE',
    tagline: 'Direct micro-credit up to ₹1.40 Lakhs for small village shops, rural crafts, and micro income activities',
    taglineHi: 'छोटी दुकानों, कारीगरी और आजीविका कार्यों के लिए ₹1.40 लाख तक का त्वरित सूक्ष्म ऋण',
    description: 'Provides direct financial assistance to Scheduled Caste entrepreneurs for setting up or expanding small income-generating micro-enterprises with minimal paperwork. Channelizing agencies charge 6.5% p.a. from beneficiaries.',
    descriptionHi: 'अनुसूचित जाति के उद्यमियों को छोटी आजीविका इकाइयों या दुकानों को शुरू करने अथवा विस्तार देने हेतु आसान शर्तों पर 6.5% वार्षिक ब्याज पर वित्तीय सहायता।',
    purpose: 'BUSINESS',
    project_cost_min: 10000,
    project_cost_max: 140000,
    max_loan_amount: 125000, // up to 90% of project cost (max ₹1.25 Lakh per unit)
    beneficiary_interest_rate_min: 6.5,
    beneficiary_interest_rate_max: 6.5,
    rebate_women_pct: 0,
    repayment_period_months: 36,
    moratorium_months: 3,
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: OFFICIAL_INCOME_CEILING,
      requireScCertificate: true,
      notes: 'Applicant must belong to Scheduled Caste community and have valid income certificate <= ₹5,00,000. Beneficiary rate is 6.5% p.a.',
      notesHi: 'आवेदक अनुसूचित जाति से होना चाहिए तथा वार्षिक पारिवारिक आय ₹5,00,000 से कम होनी चाहिए। लाभार्थी ब्याज दर 6.5% वार्षिक है।'
    },
    documents: [
      {
        id: 'doc_sc_cert',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by authorized Revenue Officer / Tehsildar',
        descriptionHi: 'सक्षम राजस्व अधिकारी या तहसीलदार द्वारा जारी'
      },
      {
        id: 'doc_income_cert',
        name: 'Family Income Certificate',
        nameHi: 'पारिवारिक आय प्रमाण पत्र',
        mandatory: true,
        description: 'Income proof showing annual family income <= ₹5 Lakh',
        descriptionHi: 'वार्षिक पारिवारिक आय ₹5 लाख से कम दर्शाने वाला प्रमाण'
      },
      {
        id: 'doc_aadhaar',
        name: 'Identity & Address Proof (Aadhaar/Voter Card)',
        nameHi: 'पहचान व निवास प्रमाण (आधार / मतदाता पहचान पत्र)',
        mandatory: true,
        description: 'Valid government identity proof',
        descriptionHi: 'मान्य सरकारी पहचान पत्र'
      },
      {
        id: 'doc_bank_passbook',
        name: 'Bank Account Passbook / Statement',
        nameHi: 'बैंक खाता पासबुक / विवरण',
        mandatory: true,
        description: 'Active savings account for loan disbursement',
        descriptionHi: 'ऋण वितरण हेतु सक्रिय बचत खाता'
      }
    ],
    official_source_url: 'https://nsfdc.nic.in/scheme',
    source_title: 'NSFDC Official Lending Policies & Micro Finance Guidelines',
    source_checked_at: '2026-09-12',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_amy_02',
    code: 'AMY',
    slug: 'aajeevika-micro-finance-yojana',
    name: 'Aajeevika Micro-Finance Yojana (AMY)',
    nameHi: 'आजीविका माइक्रो-फाइनेंस योजना (AMY)',
    category: 'MICRO_FINANCE',
    tagline: 'Prompt micro-finance delivered through accredited NBFC-MFIs for small business pursuits',
    taglineHi: 'गैर-बैंकिंग वित्तीय कंपनियों (NBFC-MFIs) के माध्यम से त्वरित आजीविका ऋण',
    description: 'Provides prompt and need-based micro finance to eligible Scheduled Caste persons at reasonable interest rates through selected NBFC-MFIs for small/micro business activities. Beneficiary interest rate is 15% p.a.',
    descriptionHi: 'अनुसूचित जाति के पात्र व्यक्तियों को चयनित NBFC-MFI के माध्यम से छोटे व्यवसाय व आजीविका गतिविधियों हेतु 15% वार्षिक ब्याज पर त्वरित ऋण।',
    purpose: 'BUSINESS',
    project_cost_min: 10000,
    project_cost_max: 140000,
    max_loan_amount: 125000, // up to 90% of project cost
    beneficiary_interest_rate_min: 15.0,
    beneficiary_interest_rate_max: 15.0,
    rebate_women_pct: 0,
    repayment_period_months: 36,
    moratorium_months: 3,
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: OFFICIAL_INCOME_CEILING,
      requireScCertificate: true,
      notes: 'Delivered via accredited NBFC-MFIs. Quarterly installments within 3 years with 3-month moratorium.',
      notesHi: 'मान्यता प्राप्त NBFC-MFI के माध्यम से प्रदत्त। 3 माह की छूट अवधि सहित 3 वर्षों में त्रैमासिक किश्तों में अदायगी।'
    },
    documents: [
      {
        id: 'doc_sc_cert',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by competent authority',
        descriptionHi: 'सक्षम प्राधिकारी द्वारा जारी'
      },
      {
        id: 'doc_income_cert',
        name: 'Income Proof',
        nameHi: 'आय प्रमाण पत्र',
        mandatory: true,
        description: 'Income certification under ₹5 Lakh',
        descriptionHi: '₹5 लाख से कम आय का प्रमाण'
      },
      {
        id: 'doc_kyc_mfi',
        name: 'KYC & Residence Proof',
        nameHi: 'केवाईसी व निवास प्रमाण',
        mandatory: true,
        description: 'Aadhaar / Voter ID and bank account details',
        descriptionHi: 'आधार / मतदाता पहचान पत्र और बैंक खाता'
      }
    ],
    official_source_url: 'https://nsfdc.nic.in/scheme',
    source_title: 'NSFDC Aajeevika Micro-Finance Guidelines',
    source_checked_at: '2026-09-12',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_tls_03',
    code: 'TERM_LOAN',
    slug: 'term-loan-scheme',
    name: 'Term Loan Scheme (TLS)',
    nameHi: 'मियादी ऋण योजना (टर्म लोन)',
    category: 'TERM_LOAN',
    tagline: 'Substantial capital assistance up to ₹50 Lakhs for viable commercial, service, agriculture, and transport ventures',
    taglineHi: 'व्यवसाय, दुकान, वाहन, उद्योग और सेवा इकाइयों के लिए ₹50 लाख तक का पूंजीगत मियादी ऋण',
    description: 'Provides medium to long-term funding for viable self-employment projects above ₹1.40 Lakh and up to ₹50.00 Lakh. Beneficiaries pay 8% interest p.a., with up to 7-year repayment and 6-to-12-month moratorium.',
    descriptionHi: '₹1.40 लाख से अधिक और ₹50.00 लाख तक की व्यवहार्य स्वरोजगार परियोजनाओं के लिए 8% वार्षिक ब्याज दर पर 7 वर्ष तक की अवधि का ऋण।',
    purpose: 'BUSINESS',
    project_cost_min: 140001,
    project_cost_max: 5000000,
    max_loan_amount: 4500000, // up to 90% of ₹50L
    beneficiary_interest_rate_min: 8.0,
    beneficiary_interest_rate_max: 8.0,
    rebate_women_pct: 1.0, // Women rebate under special state/central women provisions
    repayment_period_months: 84, // up to 7 years (84 months)
    moratorium_months: 6, // 12 months for plantation and construction
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: OFFICIAL_INCOME_CEILING,
      requireScCertificate: true,
      notes: 'Units above ₹1.40 Lakh up to ₹50.00 Lakh. Beneficiary rate is 8% p.a. Moratorium is 6 months (12 months for construction/plantation).',
      notesHi: '₹1.40 लाख से ₹50.00 लाख तक की इकाइयां। लाभार्थी ब्याज दर 8% वार्षिक। निर्माण/बागवानी हेतु 12 माह तक की छूट अवधि।'
    },
    documents: [
      {
        id: 'doc_sc_cert',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by competent revenue authority',
        descriptionHi: 'सक्षम राजस्व अधिकारी द्वारा जारी'
      },
      {
        id: 'doc_income_cert',
        name: 'Income Certificate',
        nameHi: 'आय प्रमाण पत्र',
        mandatory: true,
        description: 'Under ₹5 Lakh annual family income',
        descriptionHi: 'वार्षिक पारिवारिक आय ₹5 लाख से कम'
      },
      {
        id: 'doc_project_report',
        name: 'Project Profile / Business Plan',
        nameHi: 'परियोजना रिपोर्ट / व्यवसाय योजना',
        mandatory: true,
        description: 'Cost estimate, quotation of machinery/equipment, and revenue projection',
        descriptionHi: 'मशीनरी/उपकरण का कोटेशन और अनुमानित आय-व्यय'
      },
      {
        id: 'doc_kyc',
        name: 'KYC & Residence Proof',
        nameHi: 'केवाईसी व निवास प्रमाण',
        mandatory: true,
        description: 'Aadhaar, PAN, Voter card, and passport-size photos',
        descriptionHi: 'आधार, पैन, मतदाता पहचान पत्र और फोटो'
      }
    ],
    official_source_url: 'https://nsfdc.nic.in/scheme',
    source_title: 'NSFDC Term Loan Operational Policies',
    source_checked_at: '2026-09-12',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_uny_04',
    code: 'UNY',
    slug: 'udyam-nidhi-yojana',
    name: 'Udyam Nidhi Yojana (UNY)',
    nameHi: 'उद्यम निधि योजना (UNY)',
    category: 'ENTREPRENEURSHIP',
    tagline: 'Loans up to ₹5.00 Lakhs through Cooperative Banks and Small Finance Banks for micro-enterprises',
    taglineHi: 'सहकारी बैंकों व स्मॉल फाइनेंस बैंकों के माध्यम से लघु उद्यमों हेतु ₹5.00 लाख तक का ऋण',
    description: 'Provides loans up to ₹5.00 Lakh (max loan ₹4.50 Lakh, 90%) through Cooperative Banks/Societies (13% interest) and Small Finance Banks (15% interest) to pursue small and micro activities.',
    descriptionHi: 'सहकारी समितियों/बैंकों (13% ब्याज) तथा स्मॉल फाइनेंस बैंकों (15% ब्याज) के माध्यम से ₹5.00 लाख तक की सूक्ष्म व्यावसायिक गतिविधियों हेतु ऋण।',
    purpose: 'BUSINESS',
    project_cost_min: 50000,
    project_cost_max: 500000,
    max_loan_amount: 450000, // up to 90% of ₹5 Lakh
    beneficiary_interest_rate_min: 13.0,
    beneficiary_interest_rate_max: 15.0,
    rebate_women_pct: 0,
    repayment_period_months: 60, // up to 5 years
    moratorium_months: 3,
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: OFFICIAL_INCOME_CEILING,
      requireScCertificate: true,
      notes: 'Available through Cooperative Banks (13% p.a.) and Small Finance Banks (15% p.a.). Repaid within 5 years.',
      notesHi: 'सहकारी बैंकों (13% वार्षिक) व लघु वित्त बैंकों (15% वार्षिक) द्वारा उपलब्ध। 5 वर्षों में अदायगी।'
    },
    documents: [
      {
        id: 'doc_sc_cert',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by Tehsildar / District Magistrate',
        descriptionHi: 'सक्षम राजस्व अधिकारी द्वारा जारी'
      },
      {
        id: 'doc_income_cert',
        name: 'Income Certificate',
        nameHi: 'आय प्रमाण पत्र',
        mandatory: true,
        description: 'Family income <= ₹5 Lakh',
        descriptionHi: 'पारिवारिक आय ₹5 लाख से कम'
      },
      {
        id: 'doc_skill_cert',
        name: 'Skill / Trade Certificate (Optional but Preferred)',
        nameHi: 'प्रशिक्षण / कौशल प्रमाण पत्र (वैकल्पिक)',
        mandatory: false,
        description: 'ITI, PMKVY, or vocational trade certificate',
        descriptionHi: 'आईटीआई या व्यावसायिक ट्रेड प्रमाण पत्र'
      }
    ],
    official_source_url: 'https://nsfdc.nic.in/scheme',
    source_title: 'NSFDC Udyam Nidhi Yojana Guidelines',
    source_checked_at: '2026-09-12',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_els_05',
    code: 'ELS',
    slug: 'educational-loan-scheme',
    name: 'Educational Loan Scheme (ELS)',
    nameHi: 'शिक्षा ऋण योजना (एजुकेशनल लोन)',
    category: 'EDUCATION',
    tagline: 'Concessional education loan up to ₹40 Lakhs (Domestic & Abroad) for 25 recognized professional courses',
    taglineHi: 'भारत व विदेश में 25 मान्यता प्राप्त व्यावसायिक व तकनीकी पाठ्यक्रमों हेतु ₹40 लाख तक रियायती शिक्षा ऋण',
    description: 'Provides education loans up to ₹40.00 Lakh or 90% of course fee for regular full-time technical and professional degree/diploma courses approved by Government in India or abroad. Interest rate is 6.5% p.a., with a 0.5% rebate for women students (net 6.0% p.a.). Repayment up to 12 years.',
    descriptionHi: 'भारत या विदेश में इंजीनियरिंग, मेडिकल, मैनेजमेंट, लॉ व 25 मान्यता प्राप्त तकनीकी पाठ्यक्रमों हेतु ₹40 लाख तक का ऋण। ब्याज दर 6.5% (छात्राओं हेतु 0.5% छूट सहित 6.0%) तथा 12 वर्ष तक की चुकौती अवधि।',
    purpose: 'EDUCATION',
    project_cost_min: 50000,
    project_cost_max: 4000000, // up to ₹40 Lakhs Domestic & Abroad
    max_loan_amount: 3600000, // 90% of course fee up to ₹40L
    beneficiary_interest_rate_min: 6.0, // 6.0% for female students (0.5% rebate)
    beneficiary_interest_rate_max: 6.5, // 6.5% standard
    rebate_women_pct: 0.5,
    repayment_period_months: 144, // up to 12 years
    moratorium_months: 12, // Course period plus 1 year
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 16,
      maxAnnualFamilyIncome: OFFICIAL_INCOME_CEILING,
      requireScCertificate: true,
      educationCourseTypeRequired: true,
      notes: 'Must have secured confirmed admission in recognized professional/technical course. Beneficiary rate is 6.5% p.a. (6.0% for female students). Repayment up to 12 years. Moratorium is Course Period plus 1 year.',
      notesHi: 'मान्यता प्राप्त तकनीकी/व्यावसायिक पाठ्यक्रम में प्रवेश अनिवार्य। छात्राओं हेतु 6.0% व अन्य हेतु 6.5% ब्याज दर। पाठ्यक्रम अवधि + 1 वर्ष की छूट तथा 12 वर्ष तक अदायगी।'
    },
    documents: [
      {
        id: 'doc_sc_cert',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by competent authority',
        descriptionHi: 'सक्षम राजस्व अधिकारी द्वारा जारी'
      },
      {
        id: 'doc_income_cert',
        name: 'Income Certificate',
        nameHi: 'आय प्रमाण पत्र',
        mandatory: true,
        description: 'Family income <= ₹5 Lakh',
        descriptionHi: 'पारिवारिक आय ₹5 लाख से कम'
      },
      {
        id: 'doc_admission_letter',
        name: 'Admission Confirmation Letter',
        nameHi: 'प्रवेश पुष्टि पत्र',
        mandatory: true,
        description: 'Letter of admission from recognized university or institute',
        descriptionHi: 'मान्यता प्राप्त विश्वविद्यालय/संस्थान से प्रवेश पत्र'
      },
      {
        id: 'doc_fee_structure',
        name: 'Official Course Fee Breakdown',
        nameHi: 'संस्थान का अधिकृत शुल्क विवरण',
        mandatory: true,
        description: 'Tuition, hostel, books, and examination fee estimate from institution',
        descriptionHi: 'संस्थान द्वारा जारी ट्यूशन व छात्रावास शुल्क का आधिकारिक ब्योरा'
      },
      {
        id: 'doc_academic_records',
        name: 'Prior Academic Marksheets',
        nameHi: 'पूर्व शैक्षणिक अंकतालिकाएं',
        mandatory: true,
        description: '10th, 12th, or graduation marksheets demonstrating qualifying marks',
        descriptionHi: '10वीं, 12वीं या स्नातक की अंकतालिकाएं'
      }
    ],
    official_source_url: 'https://nsfdc.nic.in/scheme',
    source_title: 'NSFDC Educational Loan Scheme Official Policies',
    source_checked_at: '2026-09-12',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_gbs_06',
    code: 'GBS',
    slug: 'green-business-scheme',
    name: 'Green Business Scheme (GBS)',
    nameHi: 'ग्रीन बिजनेस योजना (GBS)',
    category: 'GREEN_BUSINESS',
    tagline: 'Eco-friendly loans up to ₹30 Lakhs for solar power, e-rickshaws, battery vehicles, and green ventures',
    taglineHi: 'सौर ऊर्जा, ई-रिक्शा, बैटरी वाहन, कंप्रेस्ड बायोगैस और हरित उद्यमों हेतु ₹30 लाख तक का ऋण',
    description: 'Financial assistance for clean energy, climate-friendly, and green business activities including solar rooftop units, e-rickshaws, battery-operated transport, polyhouses, and waste recycling.',
    descriptionHi: 'स्वच्छ ऊर्जा, पर्यावरण अनुकूल उद्यमों जैसे सोलर रूफटॉप, ई-रिक्शा, बैटरी चालित वाहन, पॉलीहाउस और अपशिष्ट पुनर्चक्रण हेतु 8% ब्याज दर पर ₹30 लाख तक का ऋण।',
    purpose: 'BUSINESS',
    project_cost_min: 100000,
    project_cost_max: 3000000,
    max_loan_amount: 2700000, // up to 90%
    beneficiary_interest_rate_min: 8.0,
    beneficiary_interest_rate_max: 8.0,
    rebate_women_pct: 1.0,
    repayment_period_months: 84, // up to 7 years
    moratorium_months: 6,
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: OFFICIAL_INCOME_CEILING,
      requireScCertificate: true,
      notes: 'Eligible for solar lighting/pumps, e-rickshaws, bio-gas, and eco-friendly technologies.',
      notesHi: 'सोलर पंप, ई-रिक्शा, बैटरी चालित वाहन व हरित तकनीकों हेतु मान्य।'
    },
    documents: [
      {
        id: 'doc_sc_cert',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by competent authority',
        descriptionHi: 'सक्षम राजस्व अधिकारी द्वारा जारी'
      },
      {
        id: 'doc_income_cert',
        name: 'Income Certificate',
        nameHi: 'आय प्रमाण पत्र',
        mandatory: true,
        description: 'Family income <= ₹5 Lakh',
        descriptionHi: 'पारिवारिक आय ₹5 लाख से कम'
      },
      {
        id: 'doc_quotation',
        name: 'Quotation / Invoice of Green Equipment',
        nameHi: 'ग्रीन उपकरण का कोटेशन / इनवॉइस',
        mandatory: true,
        description: 'Authorized dealer quotation for solar unit, e-rickshaw, or machinery',
        descriptionHi: 'अधिकृत डीलर द्वारा जारी सोलर यूनिट, वाहन या उपकरण का कोटेशन'
      }
    ],
    official_source_url: 'https://nsfdc.nic.in/scheme',
    source_title: 'NSFDC Green Business Guidelines',
    source_checked_at: '2026-09-12',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  }
];

// Extended Schemes from September 2026 Directory (NDFDC Disability & Central Enterprise)
export const EXTENDED_SCHEMES: Scheme[] = [
  {
    id: 'scheme_dsy_07',
    code: 'DSY',
    slug: 'divyangjan-swavalamban-yojana',
    name: 'Divyangjan Swavalamban Yojana (DSY)',
    nameHi: 'दिव्यांगजन स्वावलंबन योजना (DSY)',
    category: 'DISABILITY_ENTERPRISE',
    tagline: 'Concessional credit up to ₹50 Lakhs for persons with disabilities for self-employment and small business',
    taglineHi: 'दिव्यांगजनों के स्वरोजगार, व्यवसाय व उच्च शिक्षा हेतु ₹50 लाख तक का रियायती ऋण',
    description: 'Apex concessional finance scheme by NDFDC for citizens with 40%+ benchmark disability for income-generating activities and education. No income ceiling and no caste barrier. Interest to beneficiary is 5% to 9% p.a.',
    descriptionHi: '40% या अधिक दिव्यांगता वाले नागरिकों हेतु बिना किसी आय सीमा व बिना जाति बंधन के 5%-9% ब्याज पर ₹50 लाख तक का ऋण।',
    purpose: 'BUSINESS',
    project_cost_min: 25000,
    project_cost_max: 5000000,
    max_loan_amount: 4500000,
    beneficiary_interest_rate_min: 5.0,
    beneficiary_interest_rate_max: 9.0,
    rebate_women_pct: 1.0,
    repayment_period_months: 120,
    moratorium_months: 6,
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: 0,
      requireScCertificate: false,
      requiresBenchmarkDisability: true,
      noIncomeCeiling: true,
      notes: 'Requires 40%+ disability certificate under RPwD Act. Age relaxed to 14 for intellectual disability. No income ceiling.',
      notesHi: 'RPwD अधिनियम के तहत 40%+ दिव्यांगता प्रमाण पत्र अनिवार्य। कोई आय सीमा नहीं।'
    },
    documents: [
      {
        id: 'doc_udid',
        name: 'Disability Certificate (UDID Card)',
        nameHi: 'दिव्यांगता प्रमाण पत्र (UDID कार्ड)',
        mandatory: true,
        description: '40% or more benchmark disability certificate',
        descriptionHi: '40% या अधिक मानक दिव्यांगता प्रमाण'
      },
      {
        id: 'doc_kyc',
        name: 'Aadhaar / Address Proof',
        nameHi: 'पहचान व निवास प्रमाण',
        mandatory: true,
        description: 'Valid identity proof',
        descriptionHi: 'मान्य सरकारी पहचान पत्र'
      },
      {
        id: 'doc_project',
        name: 'Project Proposal / Quotation',
        nameHi: 'परियोजना प्रस्ताव / कोटेशन',
        mandatory: true,
        description: 'Trade quotation or machinery estimate',
        descriptionHi: 'व्यावसायिक कोटेशन या उपकरण अनुमान'
      }
    ],
    official_source_url: 'https://ndfdc.nic.in',
    source_title: 'NDFDC Divyangjan Swavalamban Yojana Guidelines',
    source_checked_at: '2026-09-19',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_vmy_08',
    code: 'VMY',
    slug: 'vishesh-microfinance-yojana',
    name: 'Vishesh Microfinance Yojana (VMY)',
    nameHi: 'विशेष माइक्रोफाइनेंस योजना (VMY)',
    category: 'DISABILITY_MICROFINANCE',
    tagline: 'Need-based microfinance up to ₹60,000 for small trades with 1% interest subvention on timely repayment',
    taglineHi: 'दिव्यांगजनों हेतु ₹60,000 तक का सूक्ष्म ऋण एवं समय पर अदायगी पर 1% ब्याज अनुदान',
    description: 'Provides prompt micro-credit up to ₹60,000 for micro-enterprises through NBFC-MFIs and SHGs for persons with benchmark disabilities. 1% interest subvention applies on timely repayment.',
    descriptionHi: 'चयनित MFIs व स्वयं सहायता समूहों के माध्यम से सूक्ष्म गतिविधियों हेतु ₹60,000 तक का ऋण। समय पर अदायगी पर 1% ब्याज छूट।',
    purpose: 'BUSINESS',
    project_cost_min: 10000,
    project_cost_max: 60000,
    max_loan_amount: 54000,
    beneficiary_interest_rate_min: 11.5,
    beneficiary_interest_rate_max: 12.5,
    rebate_women_pct: 1.0,
    repayment_period_months: 36,
    moratorium_months: 3,
    financing_percentage_max: 90,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: 0,
      requireScCertificate: false,
      requiresBenchmarkDisability: true,
      noIncomeCeiling: true,
      notes: '40%+ benchmark disability certificate. No income ceiling. 1% interest subvention on timely repayment.',
      notesHi: '40%+ दिव्यांगता प्रमाण पत्र। कोई आय सीमा नहीं। समय पर अदायगी पर 1% ब्याज छूट।'
    },
    documents: [
      {
        id: 'doc_udid',
        name: 'Disability Certificate (UDID)',
        nameHi: 'दिव्यांगता प्रमाण पत्र (UDID)',
        mandatory: true,
        description: 'Valid 40%+ disability certificate',
        descriptionHi: '40% या अधिक दिव्यांगता प्रमाण'
      },
      {
        id: 'doc_shg',
        name: 'SHG / MFI Registration Details',
        nameHi: 'एसएचजी / एमएफआई विवरण',
        mandatory: true,
        description: 'Self-Help Group or MFI channel membership',
        descriptionHi: 'स्वयं सहायता समूह या एमएफआई चैनल सदस्यता'
      }
    ],
    official_source_url: 'https://ndfdc.nic.in',
    source_title: 'NDFDC Vishesh Microfinance Yojana Guidelines',
    source_checked_at: '2026-09-19',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_sui_09',
    code: 'STAND_UP_INDIA',
    slug: 'stand-up-india',
    name: 'Stand-Up India Scheme',
    nameHi: 'स्टैंड-अप इंडिया योजना',
    category: 'ENTERPRISE',
    tagline: 'Composite bank loans from ₹10 Lakhs to ₹1 Crore for greenfield enterprises with margin money convergence',
    taglineHi: 'अनुसूचित जाति/जनजाति व महिला उद्यमियों हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण',
    description: 'Bank-led composite credit facility facilitating commercial loans between ₹10 Lakh and ₹1 Crore for greenfield manufacturing, service, or trading ventures.',
    descriptionHi: 'विनिर्माण, सेवा, व्यापार व कृषि-संबद्ध क्षेत्रों में नए उद्यम शुरू करने हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।',
    purpose: 'BUSINESS',
    project_cost_min: 1000000,
    project_cost_max: 10000000,
    max_loan_amount: 8500000,
    beneficiary_interest_rate_min: 8.25,
    beneficiary_interest_rate_max: 10.5,
    rebate_women_pct: 0.0,
    repayment_period_months: 84,
    moratorium_months: 18,
    financing_percentage_max: 85,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: 0,
      requireScCertificate: true,
      noIncomeCeiling: true,
      notes: 'First-time greenfield enterprise in manufacturing, services, or trading. Non-defaulter.',
      notesHi: 'विनिर्माण या सेवा क्षेत्र में पहला नया उद्यम। बैंक डिफाल्टर नहीं होना चाहिए।'
    },
    documents: [
      {
        id: 'doc_sc',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Issued by competent authority',
        descriptionHi: 'सक्षम राजस्व अधिकारी द्वारा जारी'
      },
      {
        id: 'doc_dpr',
        name: 'Detailed Project Report (DPR)',
        nameHi: 'विस्तृत परियोजना रिपोर्ट (DPR)',
        mandatory: true,
        description: 'Comprehensive business model & financial projections',
        descriptionHi: 'व्यावसायिक मॉडल और वित्तीय अनुमान'
      }
    ],
    official_source_url: 'https://standupmitra.in',
    source_title: 'Stand-Up India Official Guidelines',
    source_checked_at: '2026-09-19',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  },
  {
    id: 'scheme_pmajay_10',
    code: 'PMAJAY',
    slug: 'pm-ajay-livelihood',
    name: 'PM-AJAY Comprehensive Livelihood Scheme',
    nameHi: 'पीएम-अजय समग्र आजीविका योजना',
    category: 'LIVELIHOOD',
    tagline: 'Capital subsidy up to ₹50,000 or 50% of project cost for lower-income SC households',
    taglineHi: 'अनुसूचित जाति के परिवारों हेतु ₹50,000 अथवा 50% तक पूंजीगत आजीविका अनुदान',
    description: 'Livelihood component providing capital subsidy up to ₹50,000 or 50% of project cost (whichever is less) for eligible SC households.',
    descriptionHi: 'अनुसूचित जाति के पात्र परिवारों हेतु ₹50,000 या परियोजना लागत का 50% तक पूंजीगत अनुदान।',
    purpose: 'BUSINESS',
    project_cost_min: 10000,
    project_cost_max: 200000,
    max_loan_amount: 100000,
    beneficiary_interest_rate_min: 4.0,
    beneficiary_interest_rate_max: 4.0,
    rebate_women_pct: 0.0,
    repayment_period_months: 36,
    moratorium_months: 3,
    financing_percentage_max: 100,
    eligibility_rules: {
      minAge: 18,
      maxAnnualFamilyIncome: 250000,
      requireScCertificate: true,
      notes: 'Capital subsidy up to ₹50,000 or 50% of project cost for lower-income SC households.',
      notesHi: 'आजीविका परियोजनाओं हेतु ₹50,000 तक पूंजी अनुदान।'
    },
    documents: [
      {
        id: 'doc_sc',
        name: 'Caste Certificate',
        nameHi: 'जाति प्रमाण पत्र',
        mandatory: true,
        description: 'Revenue authority issued',
        descriptionHi: 'सक्षम राजस्व अधिकारी द्वारा जारी'
      },
      {
        id: 'doc_income',
        name: 'Income Certificate',
        nameHi: 'आय प्रमाण पत्र',
        mandatory: true,
        description: 'Income verification',
        descriptionHi: 'आय सत्यापन प्रमाण'
      }
    ],
    official_source_url: 'https://pmajay.dosje.gov.in',
    source_title: 'PM-AJAY Guidelines',
    source_checked_at: '2026-09-19',
    effective_from: '2024-04-01',
    version: SCHEME_CONFIG_VERSION,
    status: 'ACTIVE'
  }
];

export const ALL_REGISTERED_SCHEMES: Scheme[] = [...SCHEMES, ...EXTENDED_SCHEMES];

export function getSchemeBySlug(slug: string): Scheme | undefined {
  return ALL_REGISTERED_SCHEMES.find((s) => s.slug === slug || s.code.toLowerCase() === slug.toLowerCase());
}

export function getSchemeByCode(code: string): Scheme | undefined {
  return ALL_REGISTERED_SCHEMES.find((s) => s.code.toUpperCase() === code.toUpperCase());
}
