# AryaSaarthi — Statutory Rules & Data Sources (RULES_SOURCE.md)

This document provides a transparent, defensible audit trail mapping every hardcoded rate, income ceiling, financing slab, and moratorium period implemented in the **AryaSaarthi** rule engine directly back to official statutory Government of India (NSFDC / MoSJE / NHFDC) policy documents.

---

## 1. Statutory Ceilings & Policy Authority

| Rule / Field | Value | Official Statutory Reference | Defense for Jury / Q&A |
|---|---|---|---|
| **Standard Income Ceiling** | **₹3,00,000 p.a.** | NSFDC Credit Policy Revised Guidelines (Sec. 3.1) | Beneficiaries belonging to the Scheduled Caste (SC) community whose annual family income is up to ₹3.00 Lakh are eligible for concessional term loans and microfinance. |
| **Higher Education Income Ceiling** | **₹5,00,000 p.a.** | NSFDC Educational Loan Scheme (ELS) Operational Manual | Higher income ceiling permitted specifically for professional/technical graduation and post-graduation degrees. |
| **Minimum Legal Age** | **18 Years** | Indian Contract Act & NSFDC Beneficiary Criteria | Applicants must be majors capable of entering legal credit agreements. |
| **Maximum Eligible Age** | **60 Years** | NSFDC Lending Norms | Upper ceiling to ensure viable loan repayment tenure before retirement. |

---

## 2. Scheme-by-Scheme Statutory Parameter Mapping

### 1. Mahila Samriddhi Yojana (MSY)
- **Target Beneficiaries:** Exclusively Scheduled Caste women entrepreneurs and Self-Help Groups (SHGs).
- **Maximum Unit Cost / Loan:** **₹1,40,000**
- **Financing Coverage:** **100% of project cost** (zero beneficiary margin money required).
- **Beneficiary Interest Rate:** **4.0% p.a.** (Statutory concessional rate fixed by MoSJE).
- **Moratorium Period:** **1 to 3 months** before principal repayment commencement.
- **Repayment Tenure:** 36 to 48 months in monthly/quarterly installments.
- **Source:** *NSFDC Guidelines for Mahila Samriddhi Yojana (Rev. 2024)*.

---

### 2. Micro Finance Scheme (MFS)
- **Target Beneficiaries:** SC artisans, street vendors, agricultural and allied workers (poultry, dairy, kirana).
- **Financing Slab:** **₹5,000 to ₹1,40,000**
- **Financing Coverage:** Up to **100% of project cost**.
- **Beneficiary Interest Rate:** **5.0% to 6.5% p.a.** (channeling agency pass-through).
- **Collateral Policy:** **100% Collateral-Free** by statutory mandate through SHGs / SCAs.
- **Moratorium:** **1 to 3 months**.
- **Source:** *NSFDC Micro Credit Policy & Annual Report Scheme Chapter*.

---

### 3. Term Loan Scheme (TLS)
- **Target Beneficiaries:** SC individuals, proprietary firms, and partnerships establishing commercial, transport, retail, or service units.
- **Financing Slab:** **₹50,000 to ₹50,00,000 (₹50 Lakhs)**
- **Financing Coverage:** Up to **90% to 95%** of project cost; promoter margin is 5%–10%.
- **Beneficiary Interest Rate:**
  - Up to ₹5 Lakh: **6.0% p.a.**
  - Above ₹5 Lakh to ₹50 Lakh: **8.0% to 9.0% p.a.**
- **Moratorium Period:** **3 to 6 months** (extendable to 12 months for heavy capital manufacturing).
- **Repayment Tenure:** Up to 10 years.
- **Source:** *NSFDC Operational Lending Guidelines - Term Loan Component*.

---

### 4. Educational Loan Scheme (ELS)
- **Target Beneficiaries:** SC students securing admission to approved professional courses (B.Tech, MBBS, MBA, Law, MCA) or foreign universities.
- **Financing Slab:**
  - Studies in India: Up to **₹20,00,000**
  - Studies Abroad: Up to **₹30,00,000**
- **Beneficiary Interest Rate:**
  - Male Students: **8.0% p.a.**
  - Female Students: **4.0% p.a.** (0.5%–4.0% special gender concession).
- **Moratorium Period:** **Full Course Duration + 6 Months** (or upon securing employment, whichever is earlier).
- **Source:** *NSFDC Education Loan Scheme Brochure & MoSJE Directives*.

---

### 5. Green Business Scheme (GBS)
- **Target Beneficiaries:** SC entrepreneurs starting eco-friendly, solar, or battery mobility enterprises.
- **Financing Slab:** Up to **₹30,00,000**
- **Financing Coverage:** Up to **95%** project cost.
- **Beneficiary Interest Rate:** **6.0% p.a.**
- **Moratorium:** **3 to 6 months**.
- **Eligible Activities:** Rooftop solar installations, e-rickshaws, battery charging hubs, waste management.
- **Source:** *National SC/ST Hub & NSFDC Green Energy Initiative*.

---

### 6. Divyangjan Swavalamban Yojana (DSY / NHFDC)
- **Target Beneficiaries:** Persons with Disabilities (PwD with >= 40% benchmark disability).
- **Financing Slab:** **₹10,000 to ₹50,00,000**
- **Interest Rate:** **5.0% to 8.0% p.a.** (with 0.5% rebate for women with disabilities).
- **Aids & Appliances Assistance:** 100% grant under ADIP scheme convergence.
- **Moratorium:** **3 to 6 months**.
- **Source:** *National Handicapped Finance and Development Corporation (NHFDC) Credit Scheme Guidelines*.

---

## 3. Explaining Ranking Formula to Judges

In our rule engine, ranking is multi-attribute, objective, and deterministic:
$$\text{Score} = (0.40 \times \text{NormInterest}) + (0.35 \times \text{NormAmountFit}) + (0.25 \times \text{NormMoratorium})$$

- **Interest Rate (40% Weight):** Lower statutory rate directly minimizes debt servicing burden.
- **Loan Fit (35% Weight):** Evaluates how naturally the requested loan fits within statutory unit costs.
- **Moratorium (25% Weight):** Evaluates financial cushion before first EMI installment.
- **Tiebreaker:** If two schemes achieve identical weighted scores, the lowest statutory interest rate wins, followed by unique `scheme_id`.
