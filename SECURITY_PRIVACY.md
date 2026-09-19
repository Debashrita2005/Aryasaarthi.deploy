# Security, Privacy & Trust

## Data minimization
The public recommender should work without registration.

Avoid collecting:
- Aadhaar
- bank account details
- passwords
- caste certificate images
- income certificate images
- unnecessary exact GPS history

## If documents are added later
Require a separate threat model, encryption-at-rest review, access control model, retention policy, malware scanning and deletion workflow.

## Security controls
- HTTPS
- secure cookies
- CSRF protection where applicable
- strict input validation
- rate limiting
- CSP
- HSTS
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- dependency scanning
- secret management
- admin MFA
- audit logging

## Authorization
RBAC:
- SUPER_ADMIN
- CONTENT_EDITOR
- PARTNER_MANAGER
- REVIEWER
- ANALYST

## AI safety
Never send unnecessary personal data to an LLM.
Prefer structured, anonymized inputs.
Never allow an LLM to mutate production scheme rules directly.

## Fraud prevention
The website must clearly state that NSFDC does not request unofficial payments through this platform.
Never publish unverified agent/payment details.

## Disclaimer
"Information shown here is for guidance. It is not a loan approval, sanction, legal opinion, or guarantee. Final eligibility, documentation, interest and repayment terms are subject to the applicable official scheme and authorized channel partner."
