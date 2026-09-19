# Data Model

## Scheme
```text
Scheme
- id
- code
- name
- category
- description
- purpose
- project_cost_min
- project_cost_max
- max_loan_amount
- beneficiary_interest_rate_min
- beneficiary_interest_rate_max
- repayment_period_months
- moratorium_months
- financing_percentage_max
- eligibility_rules_json
- documents_json
- official_source_url
- source_title
- source_checked_at
- effective_from
- effective_to
- version
- status
```

## Partner
```text
Partner
- id
- name
- partner_type
- state
- district
- address
- latitude
- longitude
- phone
- email
- website
- supported_scheme_codes
- verified_at
- verification_source_url
- operational_status
- capacity_status
- capacity_status_source
- capacity_status_checked_at
```

`capacity_status` must support:
- UNKNOWN
- VERIFIED_AVAILABLE
- VERIFIED_LIMITED
- VERIFIED_UNAVAILABLE

Never default UNKNOWN to AVAILABLE.

## Recommendation
```text
Recommendation
- request_id
- scheme_code
- decision
- reason_codes[]
- missing_information[]
- rule_version
- created_at
```

## Source
```text
Source
- id
- url
- title
- source_type
- retrieved_at
- published_at
- effective_date
- content_hash
- reviewer
- status
```

## AuditEvent
```text
AuditEvent
- id
- actor_id
- action
- entity_type
- entity_id
- before_json
- after_json
- reason
- source_url
- created_at
```

## Privacy
Do not store recommendation inputs by default. If analytics are required, use anonymized/aggregated events.

Never store caste certificates, Aadhaar, bank credentials, or identity documents in the MVP unless a legally/operationally necessary integration is added with a separate security review.
