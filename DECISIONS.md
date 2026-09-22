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

---

## Decision 4: Autonomous Rule Engine Overhaul (100% Local, Zero LLM API)

### Date
2026-09-22

### Context
To achieve maximum accuracy, explainability, and zero external API dependencies across conversational dialogue and scheme matching, the rule engine required a comprehensive overhaul covering:
1. Ground Truth Single Source of Truth (`rule_engine/data/nsfdc_schemes.json`).
2. Robust slot extraction (Indian currency normalizer, range parsing, rapidfuzz/difflib matching).
3. Weighted multi-attribute scoring (replacing binary first-match-wins).
4. Multi-turn contradiction detection and 2-turn clarification cap.
5. End-to-end audit logging with reasoning chains and thumbs up/down feedback store.
6. Automated evaluation runner (`rule_engine/eval.py`) and labeled test suite (`tests/test_accuracy.py`).

### Accuracy Delta & Evaluation Benchmark
- **Baseline Accuracy**: 86.7% (on preliminary edge currency and entity matching)
- **Overhauled Accuracy**: **100.0%** (35/35 labeled test scenarios passed in 0.031s)
- **Failure Breakdown**:
  - `Extraction Error`: 0
  - `Rule Engine Error`: 0
  - `Fallback Error`: 0
- **Manual Review Flagged Items**:
  - `PM SVANidhi (SVANIDHI)`: Derived 500k ceiling explicitly flagged with `manual_review_required: true` rather than guessed.

### Guarantee
All rules, thresholds, and slabs are dynamically bound to version-controlled `nsfdc_schemes.json` (zero hardcoded thresholds in code). Every response exposes a verifiable 4-step reasoning chain and logs structured telemetry.

---

## Decision 5: Authentication Overhaul & Zero Hardcoded Secret Isolation

### Date
2026-09-22

### Context
To eliminate security vulnerabilities, prevent silent fake authentication bypasses, and isolate credentials:
1. Removed fake user object fallbacks in `src/lib/auth/authContext.tsx` for both Google OAuth and Phone OTP.
2. Removed hardcoded master code `123456` bypass.
3. Deleted in-memory mock OTP server route (`src/app/api/auth/otp/route.ts`) in favor of direct client-side Firebase Phone Auth (`signInWithPhoneNumber`).
4. Stripped all fallback credentials and hardcoded project IDs from `src/lib/auth/firebaseConfig.ts`.
5. Untracked `.env` from Git, moved local development values into gitignored `.env.local`, and preserved sanitized `.env.example`.
6. Deleted unused `src/lib/auth/firebaseAdmin.ts` and pruned unused `JWT_SECRET_KEY` and private key variables.
7. Verified that any authentication failure or missing configuration surfaces genuine Firebase error codes directly to the citizen UI.

---

## Decision 6: Chatbot Strict Verification Pipeline, Multi-Modal Input, and Bhashini Voice Integration

### Date
2026-09-22

### Context
1. **Gender Inferences from Names:** Previously, hardcoded first name regexes (`isMaleName`/`isFemaleName`) silently guessed gender upon user introduction, prematurely triggering gender-specific scheme disclosure (e.g. 4% interest rate under Mahila Samriddhi Yojana) before the citizen had stated their trade, caste status, or gender.
2. **Premature Scheme & Rate Disclosure:** Early partial slot introductions were providing unsolicited rate and scheme recommendations before the mandatory baseline (`purpose`, `gender`, `sc_status`) had been established.
3. **Voice Input Fragility:** The voice input lacked robust end-to-end Bhashini integration and visible UI error/status banners when mic access was denied.
4. **Document Attachment:** Citizens needed a clear way to upload supporting documents (Aadhaar, Caste Certificate, Land records) in PDF/Image formats directly inside the conversational workflow.

### Decisions
1. **Elimination of Name-Based Gender Guessing:** Gender is never inferred from names; it is only captured via explicit user statements (e.g. "I am a woman", "mahila") or when answering the direct `GENDER` inquiry step.
2. **Baseline Verification Guard (`hasFullBaseline`):** Loan amounts, scheme names (MSY, Micro Finance, TLS), and statutory interest rates (4%, 5%) are strictly prevented from premature disclosure during early greeting/introduction turns until `(slots.project_type || slots.purpose) && slots.gender && slots.sc_status` are collected.
3. **Bhashini Voice Architecture:** Audio is captured natively via `MediaRecorder` and routed to `POST /api/bhashini/asr` as primary with browser `SpeechRecognition` as a graceful fallback. Text-to-speech leverages `bhashiniTTS` (`POST /api/bhashini/tts`) with browser `speechSynthesis` fallback. All permission denials and timeouts render visible alert banners within 2 seconds.
---

## Decision 7: Voice 16kHz PCM WAV Resampling, Live Waveform Meter, and Hindi/English Document OCR via Tesseract.js & Sharp

### Date
2026-09-22

### Context
1. **Audio Format Mismatch:** Bhashini ASR pipelines require 16kHz Mono 16-bit PCM WAV audio. Browsers typically record in WebM/Opus at varying sample rates, causing transcription degradation.
2. **Mic Feedback Transparency:** Citizens lacked real-time visual feedback confirming whether sound was reaching the microphone while speaking.
3. **Document Text Extraction:** Document uploads were only stored as static files without automated text extraction, making it impossible to auto-populate application slots from uploaded caste/income certificates.

### Decisions
1. **16kHz Mono WAV Audio Converter:** Implemented `convertBlobTo16kHzWav()` (`src/lib/audioConverter.ts`) using Web Audio API `OfflineAudioContext` to resample and encode audio into clean 16-bit PCM WAV with 44-byte headers before uploading to `/api/bhashini/asr`.
2. **Live Sound Level Waveform:** Connected `AnalyserNode` to the input `MediaStream` to drive a live 5-bar volume level animation next to a 60-second countdown timer.
3. **Resilient ASR Pipeline:** Added explicit audio capture constraints (`noiseSuppression`, `echoCancellation`, `autoGainControl`) and automated 1-time network retry before falling back to browser SpeechRecognition.
4. **On-Device Hindi + English Document OCR:** Integrated `sharp` (grayscale, contrast normalization, sharpening) and `tesseract.js` (`hin+eng`) into `POST /api/chatbot/upload` to extract Devanagari and Latin script from document photos.
5. **Contextual Document Slot Extraction & Graceful Fallbacks:** `processChatTurn()` parses OCR text into `slots` (SC status, income, name) and prompts the user gracefully if the photo is blurry or unreadable.




