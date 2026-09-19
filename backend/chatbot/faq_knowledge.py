"""
AryaSaarthi — Ask Arya Conversational FAQ & Intent Engine
100% Free, Offline, Local Knowledge Base
Handles general questions, FAQs, document lists, process guidelines,
moratorium explanations, and chit-chat so Arya feels interactive and alive.
"""

import re
from typing import Dict, Any, Optional, List, Tuple

# FAQ & Conversational Knowledge Base
FAQ_TOPICS = [
    {
        "id": "documents",
        "keywords": [
            "document", "documents", "kagaz", "dastavej", "paper", "papers",
            "proof", "certificate", "id proof", "what do i need to bring",
            "documents required", "required documents", "what documents"
        ],
        "reply": (
            "📄 **Required Documents for NSFDC Loan Schemes:**\n\n"
            "1. **Caste Certificate**: SC certificate issued by a competent state authority (Tehsildar/SDM).\n"
            "2. **Income Certificate / BPL Card**: Family annual income proof (or self-declaration if applicable).\n"
            "3. **Identity & Address Proof**: Aadhaar Card, Voter ID, or Ration Card.\n"
            "4. **Project Proposal / Quotation**: Cost estimate/quotation of equipment, machinery, livestock, or course fee.\n"
            "5. **Bank Passbook**: Active savings bank account (preferably Aadhaar-linked) for direct benefit transfer (DBT).\n"
            "6. **Photographs**: 2–3 passport size photos.\n\n"
            "💡 *Tip:* No collateral security is required for micro-loans up to ₹1,00,000!"
        ),
        "quick_replies": ["How to Apply", "Nearest Partner", "Check Schemes"]
    },
    {
        "id": "how_to_apply",
        "keywords": [
            "how to apply", "apply", "process", "kaise apply kare", "kahan jana hoga",
            "application form", "where to submit", "procedure", "steps to apply", "online apply"
        ],
        "reply": (
            "📝 **Step-by-Step Application Process for NSFDC Schemes:**\n\n"
            "1. **Choose Scheme**: Find your matching scheme (like MSY, Micro Finance, or Term Loan).\n"
            "2. **Obtain Form**: Collect the NSFDC loan application form from your nearest **State Channelizing Agency (SCA)**, District Industries Centre (DIC), or participating Regional Rural Bank (RRB).\n"
            "3. **Attach Quotations**: For business/dairy/tailoring, attach quotations from registered dealers for equipment/cattle.\n"
            "4. **Submit to SCA / Bank**: Submit the filled form along with your SC certificate, income proof, and Aadhaar.\n"
            "5. **Verification & Sanction**: The SCA inspects and sanctions the concessional loan with NSFDC refinancing.\n"
            "6. **Disbursement**: Funds are released directly to the equipment vendor or beneficiary bank account."
        ),
        "quick_replies": ["Required Documents", "Show Nearest Partner", "Check Eligibility"]
    },
    {
        "id": "interest_rates",
        "keywords": [
            "interest rate", "interest rates", "byaj", "byaaj", "rate of interest",
            "how much interest", "cheapest loan", "concessional rate", "rebate"
        ],
        "reply": (
            "💰 **Concessional Interest Rates under NSFDC:**\n\n"
            "• **Mahila Samriddhi Yojana (MSY):** `4.0% p.a.` (Lowest for women micro-entrepreneurs)\n"
            "• **Micro Finance Scheme (MFS):** `5.0% p.a.` (Collateral-free for small ventures)\n"
            "• **Term Loan (TL):** `6.0% – 9.0% p.a.` (For larger enterprises up to ₹50 Lakhs)\n"
            "• **Education Loan Scheme:** `6.5% – 8.0% p.a.` (For engineering, medicine, higher studies)\n"
            "• **Green Business Scheme:** `6.0% p.a.` (For battery e-rickshaws and solar units)\n\n"
            "✨ *Rebate:* Prompt repayment often qualifies for an additional 1% interest subsidy!"
        ),
        "quick_replies": ["Check Schemes", "Required Documents", "Show Nearest Partner"]
    },
    {
        "id": "moratorium",
        "keywords": [
            "moratorium", "moratorium meaning", "repayment holiday", "kist kab shuru",
            "grace period", "when to start paying", "emi holiday", "first emi"
        ],
        "reply": (
            "⏳ **What is the Moratorium Period?**\n\n"
            "A **Moratorium** is a repayment grace period (holiday) granted before you have to start paying back loan EMIs.\n\n"
            "• **Micro-loans (MSY, MFS):** 1 to 3 months to start sales before repayment starts.\n"
            "• **Business / Term Loans:** 6 to 12 months for machinery installation and business setup.\n"
            "• **Education Loans:** Course duration + 6 months or until you secure employment (whichever is earlier).\n\n"
            "This ensures you only begin repaying after your venture or employment starts generating income!"
        ),
        "quick_replies": ["How to Apply", "Required Documents", "Show Nearest Partner"]
    },
    {
        "id": "all_subsidies_comprehensive",
        "keywords": [
            "subsidy", "subsidies", "all subsidy", "types of subsidy", "grant", "choot", "anudan", "maafi",
            "capital subsidy", "interest subsidy", "margin money", "सब्सिडी", "अनुदान", "ভর্তুকি", "மானியம்", "సబ్సిడీ"
        ],
        "reply": (
            "💎 **Complete Guide to Government Subsidies & Financial Grants:**\n\n"
            "Eligible SC, PwD, and Women beneficiaries receive 5 distinct types of statutory subsidies:\n\n"
            "1. **Capital Subsidy (पूंजीगत अनुदान):**\n"
            "   • **PMEGP:** Up to **35% of project cost** as outright non-refundable government subsidy for SC/Women/PwD in rural areas (25% in urban).\n"
            "   • **SCA to SCSP Subsidy:** Direct capital subsidy up to **₹10,000** or 50% unit cost for BPL families.\n\n"
            "2. **Interest Subvention / Rebate (ब्याज सब्सिडी):**\n"
            "   • **4% to 6% Concessional Interest:** Compared to 14% commercial bank rates, saving ₹8,000–₹12,000 per lakh every year.\n"
            "   • **1.0% Extra Prompt Repayment Rebate** upon regular EMI payments.\n"
            "   • **0.5% – 1.0% Women & Divyangjan Rebate** across all education and term schemes.\n\n"
            "3. **100% In-Kind Equipment Grants (ADIP):**\n"
            "   • **Zero cost** for motorized tricycles, braille kits, prosthetics, and tools.\n\n"
            "4. **Margin Money Assistance:**\n"
            "   • State Corporations contribute up to **10% to 15% margin money**, lowering your personal stake to just 5% or 0%.\n\n"
            "5. **Credit Guarantee Coverage (CGTMSE):**\n"
            "   • 100% fee-waived credit guarantee so you don't need land, gold, or property collateral."
        ),
        "quick_replies": ["Check My Subsidy", "Required Documents", "How to Apply", "Nearest Partner"]
    },
    {
        "id": "pwd_schemes",
        "keywords": [
            "disable", "disabled", "disability", "handicapped", "divyang", "divyangjan",
            "viklang", "pwd", "blind", "deaf", "orthopedic", "udid", "special needs",
            "दिव्यांग", "विकलांग", "प्रतिबंधी", "প্রতিবন্ধী", "மாற்றுத்திறனாளி", "దివ్యాంగులు", "अपंग"
        ],
        "reply": (
            "♿ **Comprehensive Welfare Schemes for Persons with Disabilities (Divyangjan / PwD):**\n\n"
            "We treat every inquiry with utmost care, patience, and dedicated priority:\n\n"
            "1. **Divyangjan Swavalamban Yojana (NHFDC):**\n"
            "   • Concessional loans up to **₹50 Lakhs** for starting any business, retail shop, dairy, or service unit.\n"
            "   • Interest Rate: **4.0% to 6.0% p.a.** (Women with disabilities get an **extra 1% rebate**).\n"
            "   • No third-party guarantor or collateral needed for micro-credits up to ₹1,00,000.\n\n"
            "2. **ADIP Scheme (100% Free Assistive Aids Grant):**\n"
            "   • **100% Government Grant** for motorized tricycles, smart canes, wheelchairs, digital hearing aids, and artificial limbs.\n"
            "   • Free for families with income up to ₹15,000/month, and 50% grant up to ₹30,000/month.\n\n"
            "3. **Vishesh Microfinance for PwD:**\n"
            "   • Direct loan up to **₹1,00,000 at 5.0%** through Self-Help Groups (SHGs) and State Channelizing Agencies (SCAs).\n\n"
            "4. **Highest Capital Subsidy (PMEGP / Special Component):**\n"
            "   • Divyangjan beneficiaries qualify for the **highest capital subsidy of 35%** in rural areas and 25% in urban areas.\n\n"
            "📋 *Requirement:* Valid Disability Certificate or UDID card (40% or above benchmark disability)."
        ),
        "quick_replies": ["ADIP Assistive Grant", "Divyangjan Loan", "Required Documents", "Show Nearest Partner"]
    },
    {
        "id": "adip_scheme",
        "keywords": [
            "adip", "tricycle", "motorized tricycle", "wheelchair", "hearing aid", "braille",
            "prosthetic", "artificial limb", "aids and appliances", "उपकरण", "ट्राईसाइकिल"
        ],
        "reply": (
            "🦼 **ADIP Scheme — 100% Free Assistive Aids & Motorized Tricycles:**\n\n"
            "Under the Ministry of Social Justice and Empowerment (ALIMCO / ADIP):\n"
            "• **Eligible Items:** Battery-operated motorized tricycles (worth up to ₹42,000), folding wheelchairs, behind-the-ear digital hearing aids, smart white canes, braille kits, and artificial prosthetics.\n"
            "• **Financial Aid:** 100% free of cost for individuals with family income up to ₹15,000/month (50% grant up to ₹30,000/month).\n"
            "• **Where to Apply:** District Disability Rehabilitation Centres (DDRC), ALIMCO assessment camps, or District Social Welfare Office.\n"
            "• **Documents:** UDID Card / Disability Certificate (40%+), Income Certificate, and Aadhaar."
        ),
        "quick_replies": ["Required Documents", "Nearest Partner", "Check Loan Schemes"]
    },
    {
        "id": "udid_guidance",
        "keywords": [
            "udid", "swavlambancard", "disability certificate", "disability card", "divyang card",
            "viklang praman patra", "how to get udid"
        ],
        "reply": (
            "🪪 **How to Obtain a UDID (Unique Disability ID) Card:**\n\n"
            "A UDID card serves as single universal proof of disability across India for all government loans, pensions, and subsidies:\n\n"
            "1. Visit the official portal: **swavlambancard.gov.in**.\n"
            "2. Fill online application with Aadhaar, address proof, and medical reports.\n"
            "3. Visit your designated District Hospital / Chief Medical Officer (CMO) for benchmark disability assessment.\n"
            "4. The Medical Authority issues your digital e-UDID card with verifiable QR code.\n"
            "5. The plastic Smart UDID card is delivered directly to your home via postal mail."
        ),
        "quick_replies": ["Divyangjan Loan", "ADIP Assistive Grant", "How to Apply"]
    },
    {
        "id": "who_is_arya",
        "keywords": [
            "who are you", "what is your name", "who made you", "kaun ho tum", "tum kaun ho",
            "what can you do", "introduce yourself", "about arya", "what is aryasaarthi"
        ],
        "reply": (
            "🤖 **I am Arya**, an AI scheme and loan advisor.\n\n"
            "My mission is to help Scheduled Caste (SC) individuals and families find statutory government loans "
            "with lowest interest rates (4% to 6%), explain eligibility transparently, and connect you with authorized "
            "Channel Partners across India — **100% free, offline, and without any brokers**.\n\n"
            "How can I assist your business or education goal today?"
        ),
        "quick_replies": ["Check Loan Eligibility", "Required Documents", "Find Channel Partner"]
    },
    {
        "id": "eligibility_general",
        "keywords": [
            "who is eligible", "am i eligible", "eligibility", "patrata", "qualify",
            "can i apply", "income limit", "criteria", "rules", "age limit"
        ],
        "reply": (
            "✅ **General Eligibility Criteria for NSFDC Schemes:**\n\n"
            "1. **Caste**: Must belong to the Scheduled Caste (SC) community.\n"
            "2. **Income Ceiling**: Annual family income up to **₹3,00,000** (both rural and urban areas).\n"
            "3. **Age**: Minimum 18 years (no upper age limit for self-employment, up to 50 for training).\n"
            "4. **No Prior Default**: Should not be a defaulter with other government financial corporations or banks.\n"
            "5. **Experience / Training**: Prior training or experience in the chosen trade (like tailoring, driving, electrician) is preferred."
        ),
        "quick_replies": ["Check My Scheme", "Required Documents", "How to Apply"]
    },
    {
        "id": "msy_inquiry",
        "keywords": [
            "msy", "mahila samriddhi", "women loan", "mahila loan", "ladies loan", "boutique loan", "parlor loan"
        ],
        "reply": (
            "🌸 **Mahila Samriddhi Yojana (MSY)** is NSFDC's flagship micro-credit scheme for women:\n\n"
            "• **Max Loan:** Up to ₹1,40,000 per beneficiary.\n"
            "• **Interest Rate:** Flat `4.0% p.a.` (lowest in the country).\n"
            "• **Coverage:** Up to 100% unit cost.\n"
            "• **Eligible Trades:** Tailoring, beauty parlor, handicrafts, dairy, small grocery shops, food processing.\n"
            "• **Collateral:** No collateral required!"
        ),
        "quick_replies": ["Apply for MSY", "Required Documents", "Show Nearest Partner"]
    },
    {
        "id": "mfs_inquiry",
        "keywords": [
            "mfs", "micro finance", "microfinance", "tiny loan", "small business loan", "chota karz", "shg"
        ],
        "reply": (
            "💼 **Micro Finance Scheme (MFS):**\n\n"
            "• **Loan Amount:** Up to ₹1,00,000.\n"
            "• **Interest Rate:** `5.0% p.a.`.\n"
            "• **Target:** Small vendors, vegetable hawkers, artisans, dairy keepers, grocery stores.\n"
            "• **Route:** Direct through Self Help Groups (SHGs) or State Channelizing Agencies (SCAs)."
        ),
        "quick_replies": ["Check My Eligibility", "Required Documents", "How to Apply"]
    },
    {
        "id": "education_inquiry",
        "keywords": [
            "education loan", "higher education", "study loan", "college loan", "engineering loan", "mbbs loan", "abroad study"
        ],
        "reply": (
            "🎓 **NSFDC Education Loan Scheme (ELS):**\n\n"
            "• **In India:** Up to ₹20,00,000 for approved professional / technical courses.\n"
            "• **Abroad:** Up to ₹30,00,000 for postgraduate & doctoral degrees in STEM & medical fields.\n"
            "• **Interest Rate:** `6.5% – 8.0% p.a.` (with 0.5% special rebate for female students).\n"
            "• **Repayment:** Moratorium of course duration + 6 months."
        ),
        "quick_replies": ["Check Eligibility", "Required Documents", "Show Nearest Partner"]
    },
    {
        "id": "chitchat_thanks",
        "keywords": [
            "thank you", "thanks", "dhanyawad", "shukriya", "great", "helpful", "good job", "nice"
        ],
        "reply": (
            "🙏 **You're most welcome!** I am always here to support your journey towards economic self-reliance.\n\n"
            "Feel free to ask any other questions about schemes, documentation, or your nearest partner agency."
        ),
        "quick_replies": ["Show Nearest Partner", "Required Documents", "Restart"]
    },
    {
        "id": "chitchat_greeting",
        "keywords": [
            "hi", "hello", "hey", "namaste", "pranam", "kaise ho", "kya haal hai", "good morning", "good evening"
        ],
        "reply": (
            "**How can I assist you today?**\n\n"
            "You can ask me anything about NSFDC loan schemes, interest rates, required documents, or we can check your personalized loan eligibility right away!"
        ),
        "quick_replies": ["Check Loan Eligibility", "Required Documents", "How to Apply"]
    },
    {
        "id": "solve_it",
        "keywords": [
            "solve", "solve it", "solution", "help me solve", "kya karu", "kya kare", "kaise kare",
            "guide me", "batao", "hal", "upay", "tarika", "what should i do", "what to do", "tell for solve it"
        ],
        "reply": (
            "🎯 **Actionable Solution Blueprint for Government Concessional Funding:**\n\n"
            "1. **Zero-Collateral Micro Funding (up to ₹1,40,000):**\n"
            "   • Available for dairy, tailoring, small shops, e-rickshaws, and artisan trades.\n"
            "   • Concessional interest rate: **4.0% p.a.** for women (MSY) and **5.0% p.a.** for general microcredit.\n"
            "   • Eligible for up to **50% capital subsidy** through your State Channelizing Agency (SCA).\n\n"
            "2. **Commercial Enterprise Loans (up to ₹50 Lakhs):**\n"
            "   • Covers machinery, livestock, and commercial units at **6% to 8.5% interest** with up to 10 years repayment.\n\n"
            "3. **Your Immediate Next Steps:**\n"
            "   • Keep your Aadhaar, SC certificate, and bank passbook ready.\n"
            "   • AryaSaarthi creates your verified inquiry summary for immediate submission to your district SCA or partner bank."
        ),
        "quick_replies": ["Micro Loan (up to ₹1.4L)", "Term Loan (up to ₹50L)", "Required Documents", "Calculate Monthly EMI", "How to Apply"]
    },
    {
        "id": "repetition_frustration",
        "keywords": [
            "same message", "same answer", "always sent", "always send", "repeat", "repeating",
            "boring", "not interesting", "same thing", "stuck", "stop asking", "useless", "why same"
        ],
        "reply": (
            "🙏 **I hear you loud and clear, and I sincerely apologize for sounding repetitive!**\n\n"
            "Let's skip the questionnaire completely. Here are your top government loan options right now:\n\n"
            "• **Mahila Samriddhi Yojana (MSY):** Up to **₹1,40,000 @ 4.0% interest** (exclusive to women entrepreneurs, zero collateral).\n"
            "• **Micro Finance Scheme (MFS):** Up to **₹1,40,000 @ 5.0% interest** (direct micro-credit with up to 50% subsidy, zero guarantee).\n"
            "• **Term Loan Scheme (TLS):** Up to **₹50,00,000 @ 6%–8% interest** for large businesses, shops, and equipment.\n\n"
            "Select an option below to proceed directly without answering any more questions!"
        ),
        "quick_replies": ["Required Documents", "Calculate Monthly EMI", "How to Apply", "Show Nearest Partner", "Restart"]
    },
    {
        "id": "cost_estimates",
        "keywords": [
            "don't know", "dont know", "not sure", "pata nahi", "idea nahi", "how much",
            "kitna lagega", "estimate", "suggest amount", "standard cost", "kitna chahiye"
        ],
        "reply": (
            "📊 **Standard Government Project Cost Benchmarks:**\n\n"
            "• **Dairy Unit (2 Cows/Buffaloes):** Costs **₹1,20,000 to ₹1,40,000** (100% covered under Micro Finance @ 4%-5%, zero collateral).\n"
            "• **Tailoring / Boutique:** Costs **₹60,000 to ₹1,00,000** (covered under MSY with up to 50% subsidy).\n"
            "• **Small Retail Shop:** Costs **₹1,00,000 to ₹2,50,000**.\n"
            "• **Electric Auto / E-Rickshaw:** Costs **₹1,60,000 to ₹1,85,000** (under Green Business Scheme @ 6%).\n\n"
            "💡 Most applicants begin with the **₹1,40,000 collateral-free micro loan**."
        ),
        "quick_replies": ["₹1,00,000 (Micro Loan)", "₹1,40,000 (Full Micro Unit)", "₹3,00,000 (Small Business)", "Required Documents"]
    },
    {
        "id": "emi_calculations",
        "keywords": [
            "emi", "kist", "installment", "monthly payment", "per month", "har mahine", "kitna bharna"
        ],
        "reply": (
            "📊 **Calculated Monthly EMI under NSFDC Concessional Rates:**\n\n"
            "• **₹50,000 Loan @ 4% p.a. (3 Years / 36 Months):** Approx **₹1,476 / month**\n"
            "• **₹1,00,000 Loan @ 5% p.a. (3 Years / 36 Months):** Approx **₹2,997 / month**\n"
            "• **₹1,40,000 Loan @ 4% p.a. (MSY, 3 Years):** Approx **₹4,133 / month**\n"
            "• **₹5,00,000 Term Loan @ 6% p.a. (5 Years / 60 Months):** Approx **₹9,666 / month**\n\n"
            "✨ **Moratorium Advantage:** You get a **1 to 6-month grace period** before paying your first EMI!"
        ),
        "quick_replies": ["Required Documents", "How to Apply", "Show Nearest Partner", "Restart"]
    }
]


def check_faq_or_conversation(text: str) -> Optional[Dict[str, Any]]:
    """
    Checks if user text matches any conversational FAQ intent.
    Uses regex boundaries and keyword inclusion.
    """
    clean = text.lower().strip()
    if not clean:
        return None

    # Do not treat pure slot responses like "yes", "250000", "delhi" as FAQs
    if clean in ("yes", "haan", "ha", "no", "sc", "general", "obc"):
        return None

    best_match = None
    max_matches = 0

    for topic in FAQ_TOPICS:
        matches = 0
        for kw in topic["keywords"]:
            # Word boundary check or substring match for multi-word phrases
            if " " in kw:
                if kw in clean:
                    matches += 2
            else:
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, clean):
                    matches += 1

        if matches > max_matches:
            max_matches = matches
            best_match = topic

    if max_matches > 0 and best_match:
        return {
            "topic_id": best_match["id"],
            "reply": best_match["reply"],
            "quick_replies": best_match["quick_replies"]
        }

    return None
