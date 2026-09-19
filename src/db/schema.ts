import { pgTable, text, timestamp, boolean, integer, doublePrecision, index, uniqueIndex } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  authMethod: text('auth_method').notNull().default('phone_otp'),
  role: text('role').notNull().default('beneficiary'),
  gender: text('gender'), // MALE, FEMALE, TRANSGENDER, OTHER
  state: text('state'),
  district: text('district'),
  profileCompleted: boolean('profile_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 2. Verified Schemes Table (All 93 Schemes)
export const verifiedSchemes = pgTable('verified_schemes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  nameHi: text('name_hi'),
  level: text('level').notNull().default('CENTRAL'), // CENTRAL or STATE_UT
  state: text('state'),
  category: text('category').notNull(),
  typeLabel: text('type_label').notNull(),
  eligibility: text('eligibility').notNull(),
  documentsJson: text('documents_json').notNull().default('[]'),
  officialRoute: text('official_route').notNull(),
  officialSourceUrl: text('official_source_url').notNull(),
  verifiedAt: text('verified_at').notNull().default('2026-09'),
  lastVerifiedDate: text('last_verified_date').notNull().default('17 Sep 2026'),
  status: text('status').notNull().default('VERIFIED_ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('verified_schemes_code_idx').on(table.code),
  slugIdx: uniqueIndex('verified_schemes_slug_idx').on(table.slug),
  levelStateIdx: index('verified_schemes_level_state_idx').on(table.level, table.state),
  categoryIdx: index('verified_schemes_category_idx').on(table.category),
}));

// 3. Scheme Channel Partners / Providers (SCAs, Banks, RRBs)
export const schemeProviders = pgTable('scheme_providers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  nameHi: text('name_hi'),
  partnerType: text('partner_type').notNull(), // SCA, BANK, RRB, OTHER
  state: text('state').notNull(),
  district: text('district').notNull(),
  address: text('address').notNull(),
  pincode: text('pincode'),
  phone: text('phone'),
  email: text('email'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  supportedSchemesJson: text('supported_schemes_json').notNull().default('[]'),
  npaPercentage: doublePrecision('npa_percentage').notNull().default(4.2),
  fundUtilizationPercentage: doublePrecision('fund_utilization_percentage').notNull().default(68.0),
  overdueFlag: boolean('overdue_flag').notNull().default(false),
  operationalStatus: text('operational_status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  stateDistrictIdx: index('scheme_providers_state_district_idx').on(table.state, table.district),
  partnerTypeIdx: index('scheme_providers_partner_type_idx').on(table.partnerType),
}));

// 4. Scheme Inquiries Submitted by Citizens
export const schemeInquiries = pgTable('scheme_inquiries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schemeCode: text('scheme_code').notNull(),
  schemeName: text('scheme_name').notNull(),
  schemeCategory: text('scheme_category'),
  purpose: text('purpose'),
  requestedLoanAmount: integer('requested_loan_amount'),
  projectCost: integer('project_cost'),
  providerId: text('provider_id').references(() => schemeProviders.id, { onDelete: 'set null' }),
  providerName: text('provider_name'),
  providerDistrict: text('provider_district'),
  status: text('status').notNull().default('INQUIRY_SUBMITTED'),
  applicantPhone: text('applicant_phone'),
  applicantState: text('applicant_state'),
  applicantDistrict: text('applicant_district'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('scheme_inquiries_user_id_idx').on(table.userId, table.createdAt),
  schemeCodeIdx: index('scheme_inquiries_scheme_code_idx').on(table.schemeCode),
  statusIdx: index('scheme_inquiries_status_idx').on(table.status),
}));

// 5. Scheme Notifications & Real-Time Alerts
export const schemeNotifications = pgTable('scheme_notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // null = broadcast
  schemeCode: text('scheme_code').notNull(),
  schemeName: text('scheme_name').notNull(),
  title: text('title').notNull(),
  titleHi: text('title_hi'),
  message: text('message').notNull(),
  messageHi: text('message_hi'),
  changeType: text('change_type').notNull(), // INTEREST_RATE, ELIGIBILITY_REVISION, DOCUMENT_UPDATE
  oldValue: text('old_value'),
  newValue: text('new_value'),
  verifiedDate: text('verified_date').notNull().default('17 Sep 2026'),
  sourceUrl: text('source_url').notNull().default('https://nsfdc.nic.in'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userReadIdx: index('scheme_notifications_user_read_idx').on(table.userId, table.isRead),
  schemeDateIdx: index('scheme_notifications_scheme_date_idx').on(table.schemeCode, table.createdAt),
}));

// 6. Active Scheme Overrides (Approved Crawler Updates)
export const activeSchemeOverrides = pgTable('active_scheme_overrides', {
  id: text('id').primaryKey(),
  schemeCode: text('scheme_code').notNull().unique(),
  schemeName: text('scheme_name').notNull(),
  interestRateMin: doublePrecision('interest_rate_min').notNull(),
  interestRateMax: doublePrecision('interest_rate_max').notNull(),
  maxLoanAmount: integer('max_loan_amount').notNull(),
  repaymentMonths: integer('repayment_months').notNull(),
  rebateWomenPct: doublePrecision('rebate_women_pct'),
  sourceProvider: text('source_provider').notNull(),
  sourceUrl: text('source_url').notNull(),
  approvedBy: text('approved_by').notNull(),
  approvedAt: timestamp('approved_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 7. Crawler Pending Updates
export const pendingSchemeUpdates = pgTable('pending_scheme_updates', {
  id: text('id').primaryKey(),
  schemeCode: text('scheme_code').notNull(),
  schemeName: text('scheme_name').notNull(),
  provider: text('provider').notNull(),
  sourceUrl: text('source_url').notNull(),
  status: text('status').notNull().default('PENDING_REVIEW'), // PENDING_REVIEW, APPROVED, REJECTED
  oldInterestRateMin: doublePrecision('old_interest_rate_min'),
  newInterestRateMin: doublePrecision('new_interest_rate_min').notNull(),
  oldInterestRateMax: doublePrecision('old_interest_rate_max'),
  newInterestRateMax: doublePrecision('new_interest_rate_max').notNull(),
  oldMaxLoan: integer('old_max_loan'),
  newMaxLoan: integer('new_max_loan'),
  oldRepaymentMonths: integer('old_repayment_months'),
  newRepaymentMonths: integer('new_repayment_months'),
  changeSummary: text('change_summary').notNull(),
  confidenceScore: doublePrecision('confidence_score').notNull().default(0.95),
  isPublished: boolean('is_published').notNull().default(false),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
}, (table) => ({
  statusIdx: index('pending_updates_status_idx').on(table.status, table.detectedAt),
  schemeIdx: index('pending_updates_scheme_idx').on(table.schemeCode),
}));
