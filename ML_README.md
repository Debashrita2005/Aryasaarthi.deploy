# AryaSaarthi — Machine Learning Subsystem Documentation

## 1. Executive Summary & Zero-External-LLM Guarantee
AryaSaarthi's machine learning architecture runs **100% locally and deterministically** on backend infrastructure without calling any external LLM inference APIs (No OpenAI, Gemini, Claude, Groq, or cloud LLM endpoints). The platform achieves sub-10ms response latencies, zero operational API costs, strict data privacy, explainable outputs, and predictable behavior required for Indian public sector government scheme recommendation.

```
Citizen Query 
      ↓
Text Preprocessing (clean_text, typo normalization, semantic preservation)
      ↓
TF-IDF Vectorization (1-2 ngrams, sublinear TF)
      ↓
Intent Classification (Balanced Logistic Regression, 21 classes)
      ↓
Confidence Estimation (Temperature-scaled multi-class calibration)
      ↓
Entity / Profile Extraction (Deterministic lightweight extractor)
      ↓
Knowledge Retrieval (TF-IDF + Cosine Similarity over verified schemes)
      ↓
Scheme Matching & Ranking (Transparent multi-factor scoring)
      ↓
Eligibility Engine (Rule-based condition evaluation)
      ↓
Structured Deterministic Response
```

---

## 2. Supported Intents (21 Classes)
The model classifies queries across 21 core domain intents without architectural changes needed to add new intents:

| # | Intent | Description | Example Query |
|---|---|---|---|
| 1 | `greeting` | Salutations and conversation initiation | *"Hello Arya, good morning!"* |
| 2 | `goodbye` | Conversation termination | *"Thank you for your help, goodbye!"* |
| 3 | `help` | Capabilities and platform usage guidance | *"What can you do for me?"* |
| 4 | `scheme_search` | Candidate scheme discovery and matching | *"I am a farmer from West Bengal. I have 2 acres of land. What schemes can I get?"* |
| 5 | `scheme_eligibility` | Eligibility verification questions | *"Am I eligible for PM-KISAN?"* |
| 6 | `scheme_benefits` | Payout amounts, grants, interest rates | *"What are the benefits of this scheme?"* |
| 7 | `scheme_documents` | Required document and verification checklist | *"What documents do I need for Kisan Credit Card?"* |
| 8 | `scheme_application` | Application procedures, portals, forms | *"Where and how do I submit my application?"* |
| 9 | `scheme_status` | Tracking disbursement / application status | *"Why has my installment not arrived?"* |
| 10 | `subsidy_information`| Capital subsidies on tractors, implements, solar | *"How much subsidy can I get on a tractor?"* |
| 11 | `loan_information` | Concessional credit and loan options | *"I need a low interest loan of 2 lakh rupees for dairy farm."* |
| 12 | `loan_eligibility` | Credit criteria, collateral, credit score rules | *"Can tenant farmers without land ownership get an agricultural loan?"* |
| 13 | `loan_calculation` | EMI, tenure, and repayment computation | *"What is the monthly EMI for 100000 at 4% for 3 years?"* |
| 14 | `financial_assistance`| Direct income support and distress grants | *"Are there emergency financial grants for flood damage?"* |
| 15 | `farmer_registration`| Agristack, state farmer registry, farmer ID | *"How can a new cultivator register in the farmer database?"* |
| 16 | `profile_update` | In-flow profile editing and corrections | *"Please update my annual income to 240000 and state to West Bengal."* |
| 17 | `nearest_agency` | Physical office, KVK, block office locator | *"Where is the nearest Krishi Vigyan Kendra or CSC center?"* |
| 18 | `crop_information` | Cultivation advisory, sowing seasons, MSP | *"What is the recommended sowing period and fertilizer for mustard?"* |
| 19 | `complaint` | Grievances, bank officer refusal, bribery | *"The local bank officer refused to accept my KCC application."* |
| 20 | `contact_support` | Official toll-free helplines and desks | *"What is the official toll-free customer care number?"* |
| 21 | `unknown` | Out-of-domain queries or gibberish input | *"asdfghjkl zxcvbnm 987654321"* |

---

## 3. Dataset Architecture
- **`data/intents.json`**: 534 curated, high-diversity training examples featuring formal English, conversational English, Indian English idiom, agricultural terminology (*porcha, khatian, bhagchasi, kisan, bigha*), typos, and punctuation variations.
- **`data/test_queries.json`**: Unseen benchmark dataset containing diverse real-world citizen queries strictly isolated from training.
- **`data/schemes.json`**: Verified scheme knowledge base with structured fields for central and state schemes (PM-KISAN, KCC, Krishak Bandhu, SMAM, PMFBY, MSY, MFS, AIF, etc.).

---

## 4. Text Preprocessing (`ml/preprocess.py`)
1. **Unicode Normalization**: NFKD decomposition for character uniformity.
2. **Case Normalization**: Case folding to lowercase.
3. **Punctuation & Currency Normalization**: Normalizes ₹, `rs.`, hyphens, and slashes while strictly preserving word tokens (e.g. `\brs\.?\b` boundary regex prevents corruption of words like `farmers` or `years`).
4. **Typo Correction**: Normalizes common citizen typos (*elgible* → *eligible*, *benifit* → *benefit*, *subcidy* → *subsidy*, *farmar* → *farmer*).
5. **Critical Token Preservation**: Preserves negation markers (*not*, *no*, *without*) and domain keywords (*sc*, *st*, *kcc*, *bengal*, *acre*).

---

## 5. Model Architecture & Training Pipeline (`ml/train_intent_model.py`)
- **Vectorizer**: `TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)`
- **Classifier**: `LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)`
- **Split**: 80/20 Stratified Shuffle Split ensuring equal representation across all 21 classes.
- **Serialization**: Saved via `joblib` to `models/tfidf_vectorizer.pkl` and `models/intent_classifier.pkl`.
- **Model Metadata**: Versioned in `models/model_metadata.json`.

---

## 6. Model Evaluation & Unseen Benchmark Performance (`ml/evaluate_model.py`)
Evaluated strictly against unseen test cases in `data/test_queries.json`:
- **Accuracy**: **92.0%**
- **Weighted Precision**: **0.9733**
- **Weighted Recall**: **0.9200**
- **Weighted F1-Score**: **0.9200**
- **Macro F1-Score**: **0.9524**
- **Entity Field Accuracy**: **100.0%** (25/25 fields extracted without error)

---

## 7. Confidence Calibration & Thresholding (`ml/predict.py`)
To prevent softmax degradation across 21 classes, temperature scaling ($T=0.28$) is applied to decision function logits:

$$\hat{p}_i = \frac{e^{z_i / T}}{\sum_{j=1}^{21} e^{z_j / T}}$$

Configured thresholds:
- **$\text{confidence} \ge 0.70$ (`confident`)**: Process intent with high certainty.
- **$0.50 \le \text{confidence} < 0.70$ (`cautious`)**: Process cautiously with affirmative confirmation/clarification.
- **$\text{confidence} < 0.50$ (`uncertain`)**: Classify as `unknown` and ask the user to rephrase.

---

## 8. Entity & Profile Extraction (`ml/entity_extractor.py`)
Deterministic extraction without external LLM calls extracts:
- `age`: Multi-pattern integer parser (16–100 years).
- `state`: All 28 Indian States & UTs.
- `district`: Common districts mapped to canonical states (e.g. Hooghly, Nadia, Malda → West Bengal).
- `occupation`: Farmer, marginal farmer, small farmer, tenant farmer, sharecropper, dairy farmer, poultry farmer, tailor, artisan, weaver, beautician, shopkeeper, student, agricultural laborer (supporting plural forms).
- `land_area` & `land_unit`: Acres, bighas, hectares, cents, decimals.
- `crop`: Paddy, wheat, mustard, potato, jute, maize, cotton, pulses, vegetables.
- `annual_income`: Currency parser handling Lakhs, Crores, thousands, and formatted strings.
- `loan_requirement`: Target loan amount.
- `assistance_requirement`: Machinery subsidy, drip irrigation, crop insurance, KCC, direct cash grant.

---

## 9. Transparent Recommendation Engine (`ml/recommendation_engine.py`)
Uses explainable linear multi-factor scoring (sums to 1.0):

$$\text{score} = 0.30 \cdot \text{occ} + 0.20 \cdot \text{loc} + 0.15 \cdot \text{land} + 0.10 \cdot \text{crop} + 0.15 \cdot \text{inc} + 0.10 \cdot \text{req}$$

The recommendation engine strictly separates **Matching Score** from **Official Eligibility**. Every recommendation includes an explicit disclaimer stating that algorithmic matching is not legal sanction.

---

## 10. Rule-Based Eligibility Engine (`ml/eligibility_engine.py`)
Controlled eligibility states:
- `eligible`: All verified conditions met.
- `potentially_eligible`: High criteria alignment but requires additional unprovided profile fields.
- `not_eligible`: One or more statutory criteria explicitly violated (e.g. out-of-state resident for state scheme).
- `insufficient_information`: Core profile fields missing.

---

## 11. Backend Integration Interface (`ml/__init__.py`)
Clean, framework-agnostic Python functions exposed to FastAPI:
```python
from ml import predict_intent, extract_profile, retrieve_schemes, recommend_schemes

# 1. Classify citizen intent
intent_res = predict_intent(user_text)

# 2. Extract profile entities
entities = extract_profile(user_text)

# 3. Retrieve scheme knowledge
schemes = retrieve_schemes(user_text, top_k=3)

# 4. Compute transparent recommendations
recommendations = recommend_schemes(user_profile, top_k=5)
```
