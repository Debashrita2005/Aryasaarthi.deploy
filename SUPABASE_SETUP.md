# Supabase & Drizzle Setup Guide — AryaSaarthi (आर्यसारथी)

This guide shows you how to connect **Supabase (Free Cloud PostgreSQL)** to AryaSaarthi with **Drizzle ORM**, and how to deploy the entire full-stack app in **one single place** (100% free).

---

## 1. Single Full-Stack Deployment (Frontend + Backend in One Place)

### Do you need to deploy frontend and backend separately?
**NO.** 
* **Next.js** handles both the React frontend and the backend API routes (`/api/...`) inside the **same application**.
* When you deploy to **Vercel** (or Render / Railway), you connect your single GitHub repository. Vercel hosts both the pages and the backend API endpoints together for **₹0.00 / free forever**.
* **Supabase** acts as your cloud database. Your deployed Next.js backend connects to Supabase via `DATABASE_URL`.

```
┌─────────────────────────────────────────────────────────────┐
│          SINGLE DEPLOYMENT (Vercel — 100% Free)             │
│                                                             │
│   ┌───────────────────────────┐  ┌───────────────────────┐  │
│   │   Frontend (React UI)     │  │   Backend API Routes  │  │
│   │   /find-scheme, /dashboard│──│   /api/user/inquiries │  │
│   │   /admin, /schemes/[slug] │  │   /api/crawler        │  │
│   └───────────────────────────┘  └───────────┬───────────┘  │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                      DATABASE_URL             │ (Drizzle / Postgres)
                                               ▼
                         ┌──────────────────────────────┐
                         │   Supabase Cloud Database    │
                         │      (Free PostgreSQL)       │
                         └──────────────────────────────┘
```

---

## 2. Step-by-Step: Setting Up Supabase (Takes 2 Minutes)

### Step 1: Create a Free Project
1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (Sign in with GitHub or Google).
2. Click **"New Project"**.
3. Choose:
   - **Name**: `aryasaarthi`
   - **Database Password**: Choose a strong password (save this!).
   - **Region**: Select **`South Asia (Mumbai)`** for the lowest latency in India.
4. Click **"Create new project"**.

---

### Step 2: Initialize Database (1-Click SQL)
1. In your Supabase project dashboard, click on the **SQL Editor** tab on the left sidebar.
2. Click **"New Query"**.
3. Open the file [supabase_schema.sql](file:///Users/adityasingh/092/supabase_schema.sql) in this repository.
4. Copy and paste the entire content into the SQL Editor.
5. Click **"Run"** (green button).
   - All tables (`users`, `verified_schemes`, `scheme_providers`, `scheme_inquiries`, `scheme_notifications`, `active_scheme_overrides`) will be created instantly with Row-Level Security (RLS).

---

### Step 3: Get Your Connection String
1. Go to **Project Settings** (gear icon at bottom left) $\rightarrow$ **Database**.
2. Scroll to **Connection string** and select **URI**.
3. Choose the **Transaction pooler** tab (port `6543`).
4. Copy the connection URI:
   ```bash
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Paste it in your `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

---

### Step 4: Get Your Public API Keys (Optional for Storage / Realtime)
1. Go to **Project Settings** $\rightarrow$ **API**.
2. Copy:
   - **Project URL** $\rightarrow$ `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys (`anon` `public`)** $\rightarrow$ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste both into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

---

## 3. Useful Commands

```bash
# Push any Drizzle schema changes directly to Supabase
npm run drizzle:push

# Open Drizzle Studio (web UI to browse and edit database rows locally)
npm run drizzle:studio
```
