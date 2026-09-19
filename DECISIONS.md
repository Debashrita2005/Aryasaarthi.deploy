# Architectural Decisions Log (DECISIONS.md)

This log records foundational design choices, constraints, and trade-offs made in the Sahayak codebase.

---

## Decision 1: Partner Health & Eligibility Status — Compute on Read

### Date
2026-09-13

### Context
NSFDC channel partners (State Channelizing Agencies, Regional Rural Banks, Public Sector Banks) exhibit varying financial and operational health. The system needs to classify partner institutions into three operational tiers:
- **`ineligible`**: Partner has high NPA (`npaPercentage > 10%`) or active default status (`overdueFlag === true`).
- **`restricted`**: Partner has constrained remaining credit absorption capacity (`fundUtilizationPercentage > 85%`).
- **`eligible`**: Healthy operational capacity ready for citizen intake.

### Decision
`eligibilityStatus` is computed purely on read via the pure function `computeEligibilityStatus(partner)` in `src/lib/partnerService.ts`.

### Rationale
1. **No Background Worker**: The application is a serverless Next.js architecture without an active background queue/cron daemon.
2. **State Drift Avoidance**: Storing derived status redundantly in persistent models risks stale or contradictory states if underlying NPA or utilization rates change.
3. **Pure Function Predictability**: Deriving the status on read guarantees 100% deterministic evaluation across search, GIS map rendering, and API queries.
4. **Privacy & Security**: Raw NPA and overdue metrics are withheld from public citizen responses and exposed only through admin-scoped interfaces; citizens receive human-friendly explanation strings (`eligibilityReason`).

---

## Decision 2: Recommender Architecture — Deterministic Hard Filters First

### Date
2026-09-13

### Context
NSFDC concessional lending schemes (MFS, AMY, Term Loan, ELS, GBS, UNY) have statutory eligibility constraints established by the Government of India and the Ministry of Social Justice and Empowerment (MoSJE):
- Caste Certificate requirement (statutory mandate for NSFDC assistance)
- Family income ceiling (statutory ceiling: ₹5,00,000/year)
- Scheme project cost brackets (e.g. MFS up to ₹1,50,000; Term Loan up to ₹50,00,000)
- Purpose eligibility (Education vs Enterprise vs Green Business)

Relying on a single probabilistic LLM prompt to decide citizen loan eligibility introduces a severe failure mode: hallucinating non-existent scheme rules or misqualifying ineligible citizens.

### Decision
We enforce a strict two-stage pipeline in `src/lib/schemeEngine.ts`:
1. **Stage 1 (Deterministic Hard Filters)**: Code-level rule verification evaluates caste certificate validity, income limits, purpose compatibility, and project cost boundaries. Only schemes passing these statutory constraints qualify as eligible and produce an immutable `matchedRule`.
2. **Stage 2 (Ranking & Presentation)**: Fit scoring (normalized `0.0 - 1.0`) and natural language explanations rank among strictly pre-filtered eligible schemes. The top match is designated as `recommended`, and next-best eligible options form `alternatives` with deterministic `whyNotTop` explanations.

### Guarantee
An AI or presentation layer can never promote or sanction a scheme that failed statutory hard filters.

---

## Decision 3: Brand Identity & Tripartite Mission — AryaSaarthi

### Date
2026-09-13

### Brand Name
**AryaSaarthi** (Devanagari: **आर्यसारथी**)
- *Arya* (Noble, Honorable, Dignified) + *Saarthi* (Charioteer, Guide, Trusted Companion).
- Signifies a dignified, ethical, citizen-first navigator empowering Scheduled Caste entrepreneurs and learners.

### Official Tagline
**"Sahi Vyakti. Sahi Yojna. Sahi Marg."** (Hindi: **सही व्यक्ति। सही योजना। सही मार्ग।**)

### Tripartite Architecture Alignment
The tagline directly reflects the 3 core pillars of the technical architecture:
1. **Sahi Vyakti (Right Person)**: Statutory, rule-based beneficiary eligibility verification (SC certification, ₹5L family income ceiling) safeguarding affirmative action and public funds from misuse.
2. **Sahi Yojna (Right Scheme)**: Deterministic, two-stage recommendation engine pairing citizen ambitions (business, education, transport, green energy) with the exact concessional loan scheme and lowest interest rate without black-box bias.
3. **Sahi Marg (Right Path)**: GIS-powered, eligibility-aware routing guiding citizens directly to active, healthy State Channelizing Agencies (SCAs) and rural partner bank branches, eliminating predatory middlemen.

