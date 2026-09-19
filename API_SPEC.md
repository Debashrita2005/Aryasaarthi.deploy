# API Specification

## GET /api/schemes
Returns currently published scheme summaries.

## POST /api/recommend
Request:
```json
{
  "purpose": "BUSINESS",
  "projectCost": 250000,
  "annualFamilyIncome": 350000,
  "scCertificate": "YES",
  "location": {
    "state": "West Bengal",
    "district": "Birbhum"
  }
}
```

Response:
```json
{
  "engineVersion": "2026.09.1",
  "results": [
    {
      "schemeCode": "TERM_LOAN",
      "decision": "LIKELY_MATCH",
      "reasonCodes": [
        "PURPOSE_BUSINESS",
        "PROJECT_COST_IN_RANGE",
        "INCOME_WITHIN_CONFIGURED_LIMIT"
      ],
      "warnings": [
        "Final eligibility is subject to document and channel-partner verification."
      ]
    }
  ],
  "source": {
    "url": "https://nsfdc.nic.in/",
    "checkedAt": "2026-09-11"
  }
}
```

## POST /api/calculate
Request:
```json
{
  "principal": 225000,
  "annualRate": 8,
  "tenureMonths": 84,
  "moratoriumMonths": 6,
  "frequency": "MONTHLY"
}
```

Response:
```json
{
  "payment": 3507.12,
  "totalRepayment": 294598.08,
  "totalInterest": 69598.08,
  "assumptions": [
    "Indicative reducing-balance calculation",
    "Actual schedule may differ by scheme/channel partner"
  ]
}
```

## GET /api/partners
Query:
`?lat=...&lng=...&radiusKm=25&scheme=TERM_LOAN`

Return only verified partner records. Include freshness.

## GET /api/partners/:id
Return partner details and source metadata.

## Admin API
All mutation endpoints require authentication, authorization and audit logging.

## API rules
- Validate all inputs server-side.
- Never trust client-side eligibility.
- Rate-limit public APIs.
- Use consistent error codes.
- Do not expose internal rule configuration unnecessarily.
- Do not expose personal data.
