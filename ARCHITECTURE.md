# Production Architecture

## Recommended stack
### Frontend
- Next.js + TypeScript
- App Router
- Tailwind CSS
- accessible component system
- PWA support
- i18n

### Backend
Option A for MVP:
- Next.js server/API routes

Option B for scale:
- NestJS/FastAPI service behind an API gateway

### Database
- PostgreSQL
- PostGIS for geospatial queries

### Cache
- Redis-compatible cache for public scheme/partner reads

### Maps
Prefer MapLibre + OpenStreetMap-compatible provider for MVP.
Keep the map provider behind an abstraction so it can be changed without rewriting the partner system.

### Authentication
No login for basic public use.
Admin authentication must use a proper identity provider and MFA.

## High-level components
Browser/PWA
→ Web application
→ API layer
→ Recommendation service
→ Scheme configuration store
→ Partner/geospatial service
→ Calculation service
→ CMS/admin
→ Audit log
→ Monitoring

## Key architectural rule
Business rules must NOT live only in UI components.

Example:
`schemeRules.ts` or database configuration is the source for eligibility/routing rules.
UI consumes an API response.

## Rule versioning
Each scheme configuration:
- id
- version
- effective_from
- effective_to
- source_url
- source_title
- source_checked_at
- status
- approved_by
- rule_json

Never silently overwrite historical rules.

## AI boundary
LLM may:
- simplify language
- translate
- classify user-entered business activity
- explain deterministic rule results

LLM must not:
- decide legal eligibility without deterministic rules
- invent schemes
- invent rates
- invent partner status
- infer caste/income from unrelated data
- approve loans
- claim government endorsement

## Reliability
All critical calculations and recommendation rules must be deterministic and unit-tested.

## Observability
Track:
- API latency
- error rate
- recommendation engine errors
- stale source alerts
- partner-data freshness
- calculation failures
- admin changes
