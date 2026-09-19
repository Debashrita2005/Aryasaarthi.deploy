# Product Requirements Document — Sahayak

## 1. Product vision
Build a trustworthy, extremely simple web application for rural citizens who need financial assistance for self-employment, small businesses, or professional/technical education.

The user should be able to answer a few questions and receive:
1. likely matching scheme(s),
2. a simple explanation of why,
3. approximate loan/own-contribution figures,
4. an indicative repayment estimate,
5. documents to prepare,
6. the nearest relevant authorized channel partner,
7. the official next step.

## 2. Primary users
### A. Rural entrepreneur
Needs a loan for dairy, poultry, agriculture/allied activity, shop, repair service, transport, handicraft, tailoring, etc.

### B. Student/family
Needs an educational loan for a recognized professional/technical course.

### C. Community facilitator
May help a citizen use the site and understand the result.

### D. Administrator/content manager
Maintains scheme rules, official links, partner data, translations and source metadata.

## 3. Core journey
Home → Choose purpose → Answer eligibility questions → Scheme matches → Compare options → Calculate EMI → Find partner → Prepare documents → Official next step.

The flow must work without account creation for basic scheme discovery.

## 4. MVP features

### 4.1 Smart Scheme Recommender
Inputs:
- purpose: business/education
- estimated project/course cost
- annual family income band
- SC certificate status
- education/course status when relevant
- business/activity category
- location
- optional gender/woman-beneficiary field only where it materially affects displayed scheme benefits

Output:
- match score/label: Strong match / Possible match / Not currently matching
- matched scheme
- reason codes
- relevant limits
- key conditions
- missing information
- official-source timestamp

The engine is rule-based first. AI may help explain results, translate content, or classify free-text activity descriptions, but final scheme eligibility logic must be deterministic and testable.

### 4.2 Scheme Explorer
Simple cards for:
- Micro Finance Scheme
- Aajeevika Micro-Finance Yojana
- Term Loan
- Udyam Nidhi Yojana
- Educational Loan Scheme

The exact current figures must be maintained in versioned configuration from official source material.

### 4.3 Financial Calculator
Inputs:
- project/course cost
- requested loan
- interest rate
- tenure
- moratorium
- repayment frequency

Outputs:
- estimated EMI/installment
- total repayment
- total interest
- financed percentage
- estimated own contribution

Clearly label calculations as estimates.

### 4.4 Partner Locator
Inputs:
- state/district or device location
- scheme category
- optional radius

Output:
- authorized partner name
- category
- address
- phone
- map/directions link
- scheme categories handled
- data freshness
- operational status, only if verified

### 4.5 Documents checklist
Dynamic checklist:
- caste certificate
- income proof
- KYC
- project/activity documents
- course/admission documents for education
- agency-specific requirements

Never claim a universal document list when the channel partner can require additional documents.

### 4.6 Multilingual UI
MVP:
- English
- Hindi

Architecture:
- Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia and other languages can be added without changing business logic.

### 4.7 Offline/low-bandwidth support
- PWA
- compressed assets
- minimal JavaScript on informational pages
- cache static scheme content
- graceful offline message
- no critical flow dependent on large media

## 5. Trust model
Every scheme fact must have:
- source URL
- source title
- source retrieved/published date when known
- effective date when known
- content version
- reviewer/status

The UI should say:
"Information source: NSFDC official website. Please confirm final terms with the authorized channel partner."

## 6. Admin requirements
Admin can:
- version scheme rules
- update partner records
- mark partner status as verified/unverified
- update translations
- publish source citations
- review change history
- roll back a bad configuration

High-impact rule changes require explicit approval.

## 7. Success metrics
- completion rate of recommender
- percentage of users reaching a useful result
- calculator usage
- partner-locator usage
- page load on slow mobile networks
- accessibility audit score
- stale-content incidents
- recommendation false-positive/false-negative review rate
- source freshness SLA

## 8. Non-functional requirements
- responsive from 320px width
- WCAG 2.2 AA target
- secure headers
- rate limiting
- audit logs
- automated tests
- monitoring
- graceful error handling
- SEO for public informational pages
- no sensitive data collection unless required

## 9. Acceptance criteria
A rural user with basic smartphone literacy can:
- understand what the site does within 10 seconds,
- complete the recommendation flow without technical terminology,
- understand why a scheme was suggested,
- see a clear disclaimer,
- calculate an estimate,
- find a partner or understand why a verified live route is unavailable.
