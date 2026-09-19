-- =====================================================================
-- AryaSaarthi (आर्यसारथी) — Complete Supabase PostgreSQL Schema
-- Run this in Supabase Dashboard -> SQL Editor to initialize all tables!
-- =====================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    auth_method TEXT NOT NULL DEFAULT 'phone_otp',
    role TEXT NOT NULL DEFAULT 'beneficiary',
    gender TEXT, -- MALE, FEMALE, TRANSGENDER, OTHER
    state TEXT,
    district TEXT,
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Verified Schemes Table (All 93 Verified National & State Schemes)
CREATE TABLE IF NOT EXISTS verified_schemes (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_hi TEXT,
    level TEXT NOT NULL DEFAULT 'CENTRAL',
    state TEXT,
    category TEXT NOT NULL,
    type_label TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    documents_json TEXT NOT NULL DEFAULT '[]',
    official_route TEXT NOT NULL,
    official_source_url TEXT NOT NULL,
    verified_at TEXT NOT NULL DEFAULT '2026-09',
    last_verified_date TEXT NOT NULL DEFAULT '17 Sep 2026',
    status TEXT NOT NULL DEFAULT 'VERIFIED_ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verified_schemes_level_state_idx ON verified_schemes (level, state);
CREATE INDEX IF NOT EXISTS verified_schemes_category_idx ON verified_schemes (category);

-- 4. Scheme Channel Partners / Providers (SCAs, Nationalized Banks, RRBs)
CREATE TABLE IF NOT EXISTS scheme_providers (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_hi TEXT,
    partner_type TEXT NOT NULL, -- SCA, BANK, RRB, OTHER
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    supported_schemes_json TEXT NOT NULL DEFAULT '[]',
    npa_percentage DOUBLE PRECISION NOT NULL DEFAULT 4.2,
    fund_utilization_percentage DOUBLE PRECISION NOT NULL DEFAULT 68.0,
    overdue_flag BOOLEAN NOT NULL DEFAULT FALSE,
    operational_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scheme_providers_state_district_idx ON scheme_providers (state, district);
CREATE INDEX IF NOT EXISTS scheme_providers_partner_type_idx ON scheme_providers (partner_type);

-- 5. Scheme Inquiries Submitted by Citizens
CREATE TABLE IF NOT EXISTS scheme_inquiries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    scheme_code TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    scheme_category TEXT,
    purpose TEXT,
    requested_loan_amount INTEGER,
    project_cost INTEGER,
    provider_id TEXT REFERENCES scheme_providers (id) ON DELETE SET NULL,
    provider_name TEXT,
    provider_district TEXT,
    status TEXT NOT NULL DEFAULT 'INQUIRY_SUBMITTED', -- INQUIRY_SUBMITTED, DOCUMENTS_PREPARED, FORWARDED_TO_PARTNER, SANCTIONED
    applicant_phone TEXT,
    applicant_state TEXT,
    applicant_district TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scheme_inquiries_user_id_idx ON scheme_inquiries (user_id, created_at);
CREATE INDEX IF NOT EXISTS scheme_inquiries_scheme_code_idx ON scheme_inquiries (scheme_code);
CREATE INDEX IF NOT EXISTS scheme_inquiries_status_idx ON scheme_inquiries (status);

-- 6. Scheme Notifications & Real-Time Alerts
CREATE TABLE IF NOT EXISTS scheme_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users (id) ON DELETE CASCADE, -- NULL = Broadcast to all citizens
    scheme_code TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    title TEXT NOT NULL,
    title_hi TEXT,
    message TEXT NOT NULL,
    message_hi TEXT,
    change_type TEXT NOT NULL, -- INTEREST_RATE, ELIGIBILITY_REVISION, DOCUMENT_UPDATE
    old_value TEXT,
    new_value TEXT,
    verified_date TEXT NOT NULL DEFAULT '17 Sep 2026',
    source_url TEXT NOT NULL DEFAULT 'https://nsfdc.nic.in',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scheme_notifications_user_read_idx ON scheme_notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS scheme_notifications_scheme_date_idx ON scheme_notifications (scheme_code, created_at);

-- 7. Active Scheme Overrides (Approved Crawler Updates)
CREATE TABLE IF NOT EXISTS active_scheme_overrides (
    id TEXT PRIMARY KEY,
    scheme_code TEXT NOT NULL UNIQUE,
    scheme_name TEXT NOT NULL,
    interest_rate_min DOUBLE PRECISION NOT NULL,
    interest_rate_max DOUBLE PRECISION NOT NULL,
    max_loan_amount INTEGER NOT NULL,
    repayment_months INTEGER NOT NULL,
    rebate_women_pct DOUBLE PRECISION,
    source_provider TEXT NOT NULL,
    source_url TEXT NOT NULL,
    approved_by TEXT NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Crawler Pending Updates
CREATE TABLE IF NOT EXISTS pending_scheme_updates (
    id TEXT PRIMARY KEY,
    scheme_code TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    source_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED
    old_interest_rate_min DOUBLE PRECISION,
    new_interest_rate_min DOUBLE PRECISION NOT NULL,
    old_interest_rate_max DOUBLE PRECISION,
    new_interest_rate_max DOUBLE PRECISION NOT NULL,
    old_max_loan INTEGER,
    new_max_loan INTEGER,
    old_repayment_months INTEGER,
    new_repayment_months INTEGER,
    change_summary TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    review_notes TEXT,
    reviewed_by TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS pending_updates_status_idx ON pending_scheme_updates (status, detected_at);
CREATE INDEX IF NOT EXISTS pending_updates_scheme_idx ON pending_scheme_updates (scheme_code);

-- Enable Row Level Security (RLS) policies as recommended by Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified schemes and partners
CREATE POLICY "Public read for verified schemes" ON verified_schemes FOR SELECT USING (true);
CREATE POLICY "Public read for scheme partners" ON scheme_providers FOR SELECT USING (true);
CREATE POLICY "Public read for public notifications" ON scheme_notifications FOR SELECT USING (user_id IS NULL);
