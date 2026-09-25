# AryaSaarthi (आर्यसारथी) — Production Deployment Guide for Railway

This guide outlines the production deployment procedure for **AryaSaarthi** on [Railway](https://railway.app/). It details architecture options, database provisioning, automated schema synchronization, and environment variable configuration.

---

## 1. System Architecture on Railway

The AryaSaarthi platform is architected for production scalability with two supported topologies:

### Recommended Architecture: Dual-Service Full-Stack with PostgreSQL
```
┌─────────────────────────────────────────────────────────────┐
│                       Railway Project                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ AryaSaarthi Web (Next.js 14 Standalone)             │   │
│   │  - Public Portal & Responsive Multilingual UI       │   │
│   │  - Scheme Discovery Engine                          │   │
│   │  - Financial Repayment Calculator                   │   │
│   │  - GIS Partner Agency Locator                       │   │
│   │  - Ask Arya Conversational Dialogue Engine          │   │
│   │  - Admin Verification & Portal Scraper API          │   │
│   └───────────────┬──────────────────────┬──────────────┘   │
│                   │                      │                  │
│       Private HTTP│           Database   │                  │
│       Network     │           Connection │                  │
│                   ▼                      ▼                  │
│   ┌─────────────────────────┐  ┌────────────────────────┐   │
│   │ AryaSaarthi Backend     │  │ Railway PostgreSQL      │   │
│   │ (FastAPI Microservice)  │  │ Production DB           │   │
│   │  - Python Rule Engine   │  │  - Schemes (93 items)   │   │
│   │  - OCR & ASR Bridge     │  │  - Partners (75 agencies│   │
│   │  - Multi-Modal Pipeline │  │  - User Profiles & Inq. │   │
│   └─────────────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

> **Note on Microservice Decoupling:** Next.js contains a built-in TypeScript Scheme Recommendation Engine and deterministic NLP Chatbot. If the Python FastAPI service is offline or in maintenance, Next.js automatically executes local fallbacks with zero user downtime.

---

## 2. Quick Deploy Instructions

### Step 1: Create a Railway Project
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** → **Provision PostgreSQL**.
3. Railway will provision a dedicated managed PostgreSQL database and inject the `DATABASE_URL` environment variable.

### Step 2: Deploy AryaSaarthi Web (Next.js)
1. In the same project, click **New** → **GitHub Repo** → Select `Debashrita2005/Aryasaarthi-anti`.
2. Railway detects the repository and reads [`railway.toml`](file:///C:/Users/manda/.gemini/antigravity-ide/scratch/Aryasaarthi-anti/railway.toml) and [`Dockerfile`](file:///C:/Users/manda/.gemini/antigravity-ide/scratch/Aryasaarthi-anti/Dockerfile).
3. Connect the PostgreSQL database to the web service by linking `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.
4. In the service **Settings**:
   - **Healthcheck Path:** `/api/health`
   - **Healthcheck Timeout:** `120` seconds
5. Run the database migration and seeder:
   - In the service **Deployments** or via Railway CLI, run:
     ```bash
     npm run db:deploy && npm run db:seed
     ```
   - This prepares the Prisma schema for PostgreSQL, creates all 8 relational tables, and synchronizes all 93 verified schemes and 75 partner agencies.

### Step 3 (Optional): Deploy AryaSaarthi Backend (FastAPI Microservice)
*Deploy this service only if you want the high-concurrency Python rule evaluation and EasyOCR/Tesseract pipelines.*
1. In the same Railway project, click **New** → **GitHub Repo** → Select `Debashrita2005/Aryasaarthi-anti`.
2. Go to **Settings**:
   - **Root Directory:** `/backend`
   - **Build:** Uses `backend/Dockerfile`
3. Add Environment Variables:
   - `PORT = 8000` (or Railway dynamic `$PORT`)
   - `FRONTEND_URL = https://<your-web-service>.up.railway.app`
4. Copy the backend service's internal domain (e.g., `http://backend.railway.internal:8000`) and set it in the Web service:
   - `PYTHON_ENGINE_URL = http://backend.railway.internal:8000`

---

## 3. Environment Variables Reference

### Web Service Variables (Next.js)

| Variable Name | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | Secret | PostgreSQL connection string from Railway (`postgresql://...`) |
| `ADMIN_PASSKEY` | **Yes** | Secret | Passkey required to access the `/admin` portal |
| `CRON_SECRET` | No | Secret | Bearer token to protect `/api/cron/check-rates` |
| `PYTHON_ENGINE_URL` | No | Secret | Private internal URL to the FastAPI backend |
| `BHASHINI_USER_ID` | No | Secret | Digital India Bhashini translation user ID |
| `BHASHINI_API_KEY` | No | Secret | Digital India Bhashini API key |
| `BHASHINI_INFERENCE_KEY` | No | Secret | Digital India Bhashini inference key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Public | Google OAuth 2.0 Web Client ID |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | Public | Firebase API key for phone SMS OTP auth |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | Public | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | No | Public | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| No | Public | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Public | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | Public | Firebase web app ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Public | Google Maps API key (defaults to OpenStreetMap/Leaflet if omitted) |

### Backend Service Variables (FastAPI)

| Variable Name | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | **Yes** | Config | Injected automatically by Railway |
| `FRONTEND_URL` | **Yes** | Config | Public URL of the Next.js frontend (for CORS) |
| `MONGODB_URI` | No | Secret | Optional MongoDB connection string (falls back to local JSON) |
| `MONGODB_DB_NAME`| No | Config | MongoDB database name (default: `sahayak_nsfdc`) |

---

## 4. Build, Start & Migration Commands

### Web Service (Next.js)
- **Builder:** Dockerfile (configured in [`railway.toml`](file:///C:/Users/manda/.gemini/antigravity-ide/scratch/Aryasaarthi-anti/railway.toml))
- **Build Command (if using Nixpacks):** `npm run build` (runs `node scripts/prepare-prisma.js && prisma generate && next build`)
- **Start Command:** `node server.js` (or `npm run start`)
- **Database Deploy:** `npm run db:deploy` (executes `node scripts/prepare-prisma.js && prisma db push`)
- **Database Seed:** `npm run db:seed` (seeds verified schemes and partner agencies)
- **Healthcheck Endpoint:** `/api/health`

### Backend Service (FastAPI)
- **Builder:** Dockerfile (`backend/Dockerfile`)
- **Start Command:** `sh -c "gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${PORT:-8000} main:app"`
- **Healthcheck Endpoint:** `/health`

---

## 5. Storage & Ephemeral Filesystem Notice

Railway containers feature an ephemeral filesystem:
- **Temporary Uploads:** Files uploaded via `/api/chatbot/upload` are temporarily written to `public/uploads/` for OCR processing and parsing.
- **Persistent Data:** All critical application state (user profiles, search logs, inquiries, notifications, rate snapshots, active scheme overrides) is stored in the relational database (`DATABASE_URL`).
- **Production Upload Storage:** If permanent document storage is required for citizen document uploads in the future, configure an S3-compatible bucket or Supabase Storage.

---

## 6. Post-Deployment Verification Checklist

Verify the following production endpoints once deployed:
1. `GET /api/health` returns `{"status":"ok"}` (`200 OK`)
2. `GET /` loads the homepage with SSR headers and language switcher
3. `GET /find-scheme` loads questionnaire and recommendations
4. `GET /calculator` renders loan repayment EMI schedules
5. `GET /partners` displays interactive partner locator with OpenStreetMap
6. `POST /api/chatbot/message` responds to user queries in English and Hindi
7. `GET /admin` accepts `ADMIN_PASSKEY` and displays live metrics
