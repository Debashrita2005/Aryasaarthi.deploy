"""
AryaSaarthi — Ask Arya Chatbot Prompts & Response Templates
Pure templated strings without LLM hallucination risk.
Deterministic, judge-friendly, transparent.
"""

from typing import List, Dict, Any

GREETING_PROMPT = (
    "To help you find the exact government scheme, loan limit, and lowest interest rate, "
    "may I confirm if you or your family belong to the **Scheduled Caste (SC)** community?"
)

GREETING_QUICK_REPLIES = [
    "Yes, I belong to SC",
    "No",
    "Certificate In Progress"
]

GENDER_PROMPT = (
    "👤 What is your **gender**?\n"
    "(Certain NSFDC schemes like **Mahila Samriddhi Yojana (MSY)** offer special 4% interest rates and subsidies exclusively for women entrepreneurs):"
)

GENDER_QUICK_REPLIES = [
    "Female (महिला)",
    "Male (पुरुष)",
    "Other / Transgender"
]

NON_SC_REPLY = (
    "ℹ️ **AryaSaarthi NSFDC schemes** are statutory concessional programs primarily for "
    "Scheduled Caste (SC) individuals with family income up to ₹3,00,000.\n\n"
    "However, you can still apply for national open schemes like **Stand-Up India** or **PM-SVANidhi**.\n"
    "Would you like to restart or check general eligibility?"
)

NON_SC_QUICK_REPLIES = ["Restart", "Check Stand-Up India"]

INCOME_PROMPT = (
    "✅ Verified! Next, what is your **annual family income**?\n"
    "(e.g., *₹1.2 Lakh*, *250000*, or select a range below):"
)

INCOME_QUICK_REPLIES = [
    "Below ₹1.5 Lakh",
    "₹1.5 Lakh – ₹3.0 Lakh",
    "Above ₹3.0 Lakh"
]

INCOME_EXCEEDED_NOTICE = (
    "⚠️ Note: NSFDC concessional interest rates require annual family income up to ₹3,00,000. "
    "For income above ₹3 Lakh, special criteria or national credit guarantee schemes apply."
)

PURPOSE_PROMPT = (
    "What is the **purpose** of the loan or project you wish to pursue?\n"
    "(You can type freely, e.g. *'I want to open a tailoring shop'*, *'College degree loan'*, *'Buy a dairy buffalo'*, *'Electric auto'*):"
)

PURPOSE_QUICK_REPLIES = [
    "Higher Education Loan",
    "Start a Tailoring / Boutique Unit",
    "Dairy / Livestock Farming",
    "Small Business / Retail Shop",
    "Electric Auto / Commercial Transport",
    "Skill Development Training"
]

AMOUNT_PROMPT = (
    "Approximately **how much loan or funding** do you require?\n"
    "(e.g., *₹50,000*, *2 Lakhs*, *10 Lakhs*):"
)

AMOUNT_QUICK_REPLIES = [
    "₹50,000",
    "₹1,00,000",
    "₹2,50,000",
    "₹5,00,000",
    "₹10,00,000+"
]

LOCATION_PROMPT = (
    "Which **State** and **District** do you live in?\n"
    "This helps me connect you directly to your nearest State Channelizing Agency (SCA) or Bank branch."
)

LOCATION_QUICK_REPLIES = [
    "Delhi",
    "Uttar Pradesh",
    "Maharashtra",
    "Bihar",
    "Karnataka",
    "Rajasthan"
]

def format_recommendations(user_profile: Dict[str, Any], matched_schemes: List[Dict[str, Any]]) -> str:
    """Formats matching schemes into a clean, transparent summary."""
    if not matched_schemes:
        return (
            "🔍 **No direct scheme matched all exact criteria.**\n\n"
            f"• Purpose: {user_profile.get('project_type') or user_profile.get('purpose')}\n"
            f"• Required Amount: ₹{user_profile.get('amount', 0):,}\n"
            f"• Annual Income: ₹{user_profile.get('income', 0):,}\n\n"
            "💡 **Recommendation:** Try requesting a lower amount within NSFDC statutory limits (e.g., ₹1,00,000 to ₹5,00,000) "
            "or explore our Skill Training programs.\n\n"
            "Would you like to restart or view channel partners?"
        )

    count = len(matched_schemes)
    lines = [
        f"🎉 **Great news! Found {count} matching government scheme{'s' if count > 1 else ''} for you:**\n"
    ]

    for i, s in enumerate(matched_schemes, 1):
        rate_str = f"{s.get('interest_rate_min', 0)}% – {s.get('interest_rate_max', 0)}% p.a."
        moratorium = s.get('moratorium_months', [0, 0])
        mora_str = f"{moratorium[0]} to {moratorium[1]} months" if len(moratorium) == 2 and moratorium[1] > 0 else "N/A"
        coverage = s.get('cost_coverage_pct', 90)

        lines.append(f"### {i}. **{s.get('name')}** ({s.get('scheme_id')})")
        lines.append(f"• **Interest Rate:** `{rate_str}` (concessional)")
        lines.append(f"• **Max Loan Limit:** ₹{s.get('max_amount', 0):,}")
        lines.append(f"• **NSFDC Coverage:** Up to {coverage}% of project cost")
        lines.append(f"• **Moratorium (Repayment Holiday):** {mora_str}")
        lines.append(f"• **Why it matched:** {s.get('match_reason', 'Satisfies income and category requirements.')}")
        lines.append("")

    lines.append("👇 **What would you like to do next?**")
    return "\n".join(lines)

RECOMMENDATION_FOLLOWUP_QUICK_REPLIES = [
    "Explain Eligibility",
    "Show Nearest Partner",
    "Restart"
]
