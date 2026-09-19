"""
AryaSaarthi — Ask Arya Dialogue Manager
Slot-Filling State Machine with NLU Fallback Chain & Free-Text Short-Circuits.
Manages user conversation sessions and matches schemes from MongoDB.

KNOWN LIMITATION: In-memory session state (SESSIONS dict) won't survive server restart
or scale across multiple worker instances. This is acceptable for SIH hackathon demo scope;
in a distributed production deployment, back this store with Redis or a MongoDB TTL collection.
"""

import os
import re
import time
import json
import logging
from typing import Dict, Any, List, Optional

try:
    from config import settings
except ImportError:
    class DummySettings:
        SESSION_TTL_MINUTES = 15
        SIMILARITY_THRESHOLD = 0.45
    settings = DummySettings()

from .nlu import extract_slots, parse_indian_amount
from .rule_engine import recommend_schemes, compute_no_match_explanation
from .similarity_matcher import is_sentence_transformer_failed, is_sentence_transformer_loaded
from .faq_knowledge import check_faq_or_conversation
from .multilingual import (
    get_language_pack,
    format_multilingual_recommendations,
    get_localized_ack,
    get_non_sc_reply,
)
from .prompts_responses import (
    GREETING_PROMPT,
    GREETING_QUICK_REPLIES,
    GENDER_PROMPT,
    GENDER_QUICK_REPLIES,
    NON_SC_REPLY,
    NON_SC_QUICK_REPLIES,
    INCOME_PROMPT,
    INCOME_QUICK_REPLIES,
    INCOME_EXCEEDED_NOTICE,
    PURPOSE_PROMPT,
    PURPOSE_QUICK_REPLIES,
    AMOUNT_PROMPT,
    AMOUNT_QUICK_REPLIES,
    LOCATION_PROMPT,
    LOCATION_QUICK_REPLIES,
    format_recommendations,
    RECOMMENDATION_FOLLOWUP_QUICK_REPLIES,
)

logger = logging.getLogger("chatbot.dialogue")

# In-memory session store: session_id -> session_dict
SESSIONS: Dict[str, Dict[str, Any]] = {}

# Global health and performance tracking
LAST_RESPONSE_LATENCY_MS: float = 0.0

# File paths for fallback data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CHATBOT_SCHEMES_FILE = os.path.join(DATA_DIR, "chatbot_schemes.json")
PARTNERS_FILE = os.path.join(DATA_DIR, "partners.json")

# Mid-flow slot correction regex (e.g. "change income to 2.5 lakh", "update amount to 50000")
CORRECTION_REGEX = re.compile(
    r'^(?:change|update|correct|set|modify)\s+(income|amount|loan(?:\s+amount)?|gender|purpose|project(?:\s*type)?|caste|sc(?:\s+status)?)\s+(?:to|=|as)\s+(.+)$',
    re.IGNORECASE
)

def is_non_latin_script(text: str) -> bool:
    """
    Detects non-Latin-script input via Unicode range check.
    If input contains predominantly non-Latin characters (Devanagari, Tamil, Bengali, Telugu, etc.),
    triggers the explicit English-only guard rather than silently failing through the NLU chain.
    """
    total_letters = 0
    non_latin_count = 0
    for ch in text:
        if ch.isalpha():
            total_letters += 1
            code = ord(ch)
            # Basic Latin (0x0041-0x007A) or Latin-1 Supplement / Extended (up to 0x024F)
            if not ((0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A) or (0x00C0 <= code <= 0x024F)):
                non_latin_count += 1
    if total_letters > 0 and (non_latin_count / total_letters) >= 0.35:
        return True
    return False

def load_schemes_from_store() -> List[Dict[str, Any]]:
    """Loads schemes from persistent JSON file."""
    if os.path.exists(CHATBOT_SCHEMES_FILE):
        try:
            with open(CHATBOT_SCHEMES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error reading chatbot_schemes.json: %s", e)
    return []

def load_partners_from_store() -> List[Dict[str, Any]]:
    """Loads channel partners from JSON file."""
    if os.path.exists(PARTNERS_FILE):
        try:
            with open(PARTNERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error reading partners.json: %s", e)
    return []

class DialogueManager:
    """Stateful dialogue manager executing rule-engine matching over extracted slots."""

    def __init__(self, schemes_loader=None):
        self.schemes_loader = schemes_loader
        self.last_latency_ms: float = 0.0
        if schemes_loader is not None:
            self.schemes = schemes_loader()
        else:
            self.schemes = load_schemes_from_store()

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return SESSIONS.get(session_id)

    def get_or_create_session(self, session_id: str) -> Dict[str, Any]:
        ttl_seconds = getattr(settings, "SESSION_TTL_MINUTES", 15) * 60
        now = time.time()

        if session_id in SESSIONS:
            session = SESSIONS[session_id]
            last_time = session.get("last_activity_time", now)
            # Session expiry check
            if now - last_time > ttl_seconds:
                logger.info("Session '%s' expired after %d minutes of inactivity. Clearing slots.", session_id, getattr(settings, "SESSION_TTL_MINUTES", 15))
                self.reset_session(session_id)
                session = SESSIONS[session_id]
                session["expired_notice"] = True
            session["last_activity_time"] = now
            return session

        # New session initialization
        SESSIONS[session_id] = {
            "session_id": session_id,
            "slots": {
                "sc_status": None,
                "gender": None,
                "is_pwd": None,
                "income": None,
                "purpose": None,
                "project_type": None,
                "amount": None,
                "state": None,
                "district": None,
            },
            "matched_schemes": [],
            "history": [],
            "stage": "GREETING",
            "last_activity_time": now,
            "pending_conflict": None,
        }
        return SESSIONS[session_id]

    def reset_session(self, session_id: str) -> Dict[str, Any]:
        """Resets the conversation session back to initial state."""
        SESSIONS[session_id] = {
            "session_id": session_id,
            "slots": {
                "sc_status": None,
                "gender": None,
                "is_pwd": None,
                "income": None,
                "purpose": None,
                "project_type": None,
                "amount": None,
                "state": None,
                "district": None,
            },
            "matched_schemes": [],
            "history": [],
            "stage": "GREETING",
            "last_activity_time": time.time(),
            "pending_conflict": None,
        }
        return SESSIONS[session_id]

    async def get_schemes_async(self) -> List[Dict[str, Any]]:
        """Asynchronously queries MongoDB 'schemes' collection if available."""
        if self.schemes_loader is not None:
            return self.schemes_loader()

        try:
            from database import db
            if db.is_connected and db.db is not None:
                cursor = db.db["chatbot_schemes"].find({}, {"_id": 0})
                mongo_schemes = await cursor.to_list(length=100)
                if mongo_schemes:
                    return mongo_schemes
        except Exception as e:
            logger.warning("MongoDB read failed, using disk store fallback: %s", e)

        return load_schemes_from_store()

    def process_message(self, session_id: str, user_text: str, lang: str = "en") -> Dict[str, Any]:
        """Synchronous runner for unit tests and offline testing."""
        schemes = self.schemes_loader() if self.schemes_loader else load_schemes_from_store()
        return self._process_message_internal(session_id, user_text, schemes, lang=lang)

    async def handle_message(self, session_id: str, user_text: str, lang: str = "en") -> Dict[str, Any]:
        """Processes an incoming user message through NLU and Dialogue state machine."""
        schemes = await self.get_schemes_async()
        return self._process_message_internal(session_id, user_text, schemes, lang=lang)

    def _process_message_internal(self, session_id: str, user_text: str, schemes: List[Dict[str, Any]], lang: str = "en") -> Dict[str, Any]:
        global LAST_RESPONSE_LATENCY_MS
        start_time = time.perf_counter()

        session = self.get_or_create_session(session_id)
        slots = session["slots"]
        text_clean = user_text.strip()
        text_lower = text_clean.lower()
        pack = get_language_pack(lang)

        session["history"].append({"sender": "user", "text": text_clean})

        # Session expiry notice banner
        expired_prefix = ""
        if session.pop("expired_notice", False):
            expired_prefix = "⏳ *Your previous session expired after 15 minutes of inactivity. Let's start fresh!*\n\n"

        # -------------------------------------------------------------
        # 1. Explicit English-Only Guard (Detects non-Latin Unicode input)
        # -------------------------------------------------------------
        if is_non_latin_script(text_clean):
            reply_msg = (
                "⚠️ **Language Notice:** AskArya currently supports English input. "
                "Please type your query in English (for example: *\"I want a dairy loan of ₹1,00,000\"* or *\"tailoring shop ₹50,000\"*)."
            )
            LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
            return {
                "session_id": session_id,
                "reply": reply_msg,
                "quick_replies": ["Start in English", "Dairy Loan ₹1 Lakh", "Tailoring Shop ₹50,000", "Restart"],
                "matched_schemes": session["matched_schemes"],
                "slots": slots
            }

        # -------------------------------------------------------------
        # 2. Check for explicit user reset/restart
        # -------------------------------------------------------------
        if text_lower in ("restart", "reset", "start over", "clear", "nayi shuruat"):
            self.reset_session(session_id)
            reply = pack["greeting"]
            LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
            return {
                "session_id": session_id,
                "reply": reply,
                "quick_replies": pack["sc_quick_replies"],
                "matched_schemes": [],
                "slots": self.get_or_create_session(session_id)["slots"]
            }

        # -------------------------------------------------------------
        # 3. Mid-Flow Slot Correction Command (e.g. "change income to 2.5 lakh")
        # -------------------------------------------------------------
        correction_match = CORRECTION_REGEX.match(text_clean)
        if correction_match:
            slot_target = correction_match.group(1).lower()
            val_raw = correction_match.group(2).strip()

            if "income" in slot_target:
                new_amt = parse_indian_amount(val_raw)
                if new_amt:
                    slots["income"] = float(new_amt)
                    session["pending_conflict"] = None
                    ack_msg = f"✅ Updated your **annual family income** to **₹{int(new_amt):,}**."
                    return self._next_dialogue_step(session_id, slots, schemes, pack, prefix=ack_msg)

            elif "amount" in slot_target or "loan" in slot_target:
                new_amt = parse_indian_amount(val_raw)
                if new_amt:
                    slots["amount"] = float(new_amt)
                    session["pending_conflict"] = None
                    ack_msg = f"✅ Updated your **loan requirement** to **₹{int(new_amt):,}**."
                    return self._next_dialogue_step(session_id, slots, schemes, pack, prefix=ack_msg)

            elif "gender" in slot_target:
                if any(k in val_raw.lower() for k in ("female", "woman", "mahila")):
                    slots["gender"] = "FEMALE"
                elif any(k in val_raw.lower() for k in ("male", "man", "purush")):
                    slots["gender"] = "MALE"
                else:
                    slots["gender"] = "OTHER"
                session["pending_conflict"] = None
                ack_msg = f"✅ Updated your **gender** to **{slots['gender'].title()}**."
                return self._next_dialogue_step(session_id, slots, schemes, pack, prefix=ack_msg)

            elif "purpose" in slot_target or "project" in slot_target:
                slots["project_type"] = val_raw.lower().replace(" ", "_")
                slots["purpose"] = val_raw
                session["pending_conflict"] = None
                ack_msg = f"✅ Updated your **project purpose** to **{val_raw.title()}**."
                return self._next_dialogue_step(session_id, slots, schemes, pack, prefix=ack_msg)

        # -------------------------------------------------------------
        # 4. Handle Active Conflict Resolution
        # -------------------------------------------------------------
        pending = session.get("pending_conflict")
        if pending:
            slot_name = pending["slot"]
            old_val = pending["old_val"]
            new_val = pending["new_val"]

            # Check user choice
            if any(k in text_lower for k in ("keep", "old", "first", str(old_val))):
                slots[slot_name] = old_val
                session["pending_conflict"] = None
                ack = f"✅ Kept previous value of **₹{int(old_val):,}** for {slot_name}."
                return self._next_dialogue_step(session_id, slots, schemes, pack, prefix=ack)
            elif any(k in text_lower for k in ("update", "new", "second", "change", str(new_val))):
                slots[slot_name] = new_val
                session["pending_conflict"] = None
                ack = f"✅ Confirmed new value of **₹{int(new_val):,}** for {slot_name}."
                return self._next_dialogue_step(session_id, slots, schemes, pack, prefix=ack)

        # -------------------------------------------------------------
        # 5. Check for specific follow-ups when schemes are already matched
        # -------------------------------------------------------------
        if session["matched_schemes"]:
            if any(k in text_lower for k in ("partner", "channel", "sca", "bank", "office", "branch")):
                state = slots.get("state") or "Uttar Pradesh"
                partners = load_partners_from_store()
                matching_partners = [p for p in partners if p.get("state", "").lower() == state.lower()]
                if not matching_partners:
                    matching_partners = partners[:3]
                else:
                    matching_partners = matching_partners[:3]

                lines = [f"🏢 **Authorized Channel Partners in {state}:**\n"]
                for p in matching_partners:
                    lines.append(f"• **{p.get('name')}** ({p.get('partner_type')})")
                    lines.append(f"  📍 {p.get('address')}")
                    lines.append(f"  📞 Phone: {p.get('phone')}\n")
                lines.append("You can visit them directly to submit your NSFDC application form without any intermediaries.")
                LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
                return {
                    "session_id": session_id,
                    "reply": "\n".join(lines),
                    "quick_replies": pack.get("follow_ups", ["Required Documents", "How to Apply", "Explain Eligibility", "Restart"]),
                    "matched_schemes": session["matched_schemes"],
                    "slots": slots
                }

            if any(k in text_lower for k in ("explain", "why", "breakdown")):
                explanations = ["📋 **Detailed Eligibility & Scheme Breakdown:**\n"]
                for s in session["matched_schemes"]:
                    explanations.append(f"• **{s.get('name')}**: {s.get('match_reason')}")
                    explanations.append(f"  - Statutory Income Limit: Up to ₹{s.get('max_income', 300000):,}")
                    explanations.append(f"  - Concessional Interest: {s.get('interest_rate_min')}% to {s.get('interest_rate_max')}%")
                    explanations.append(f"  - Ranking Fit Score: {s.get('ranking_score', 0.85):.2f}/1.00\n")
                explanations.append("What else can I help you with?")
                LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
                return {
                    "session_id": session_id,
                    "reply": "\n".join(explanations),
                    "quick_replies": pack.get("follow_ups", ["Required Documents", "How to Apply", "Show Nearest Partner", "Restart"]),
                    "matched_schemes": session["matched_schemes"],
                    "slots": slots
                }

        # -------------------------------------------------------------
        # 6. Check Conversational FAQ & General Knowledge Base
        # -------------------------------------------------------------
        faq_match = check_faq_or_conversation(text_clean)

        # -------------------------------------------------------------
        # 7. Execute NLU Pipeline (Extracts slots with Conflict Detection)
        # -------------------------------------------------------------
        extracted = extract_slots(text_clean, slots)

        # Conflict Detection: If a slot (income/amount) is restated with a different value
        for numeric_slot in ("income", "amount"):
            if numeric_slot in extracted and slots.get(numeric_slot) is not None:
                old_v = slots[numeric_slot]
                new_v = extracted[numeric_slot]
                if abs(old_v - new_v) > 100:  # Material difference
                    session["pending_conflict"] = {
                        "slot": numeric_slot,
                        "old_val": old_v,
                        "new_val": new_v
                    }
                    reply_conflict = (
                        f"⚠️ **Conflict Detected:** You previously mentioned your {numeric_slot} was "
                        f"**₹{int(old_v):,}**, but just indicated **₹{int(new_v):,}**. Which value is correct?"
                    )
                    LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
                    return {
                        "session_id": session_id,
                        "reply": reply_conflict,
                        "quick_replies": [f"Keep ₹{int(old_v):,}", f"Update to ₹{int(new_v):,}"],
                        "matched_schemes": session["matched_schemes"],
                        "slots": slots
                    }

        # Apply newly extracted slots
        slots.update(extracted)

        # If user asked an informational question, interject the answer and bridge to the next slot
        if faq_match:
            if session["matched_schemes"]:
                LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
                return {
                    "session_id": session_id,
                    "reply": faq_match["reply"],
                    "quick_replies": pack.get("follow_ups", ["Explain Eligibility", "Required Documents", "How to Apply", "Show Nearest Partner", "Restart"]),
                    "matched_schemes": session["matched_schemes"],
                    "slots": slots
                }

            if faq_match.get("topic_id") == "chitchat_greeting" and slots["sc_status"] is None:
                LAST_RESPONSE_LATENCY_MS = round((time.time() - start_time) * 1000, 2)
                return {
                    "session_id": session_id,
                    "reply": expired_prefix + pack["greeting"],
                    "quick_replies": pack["sc_quick_replies"],
                    "matched_schemes": [],
                    "slots": slots
                }

            res = self._next_dialogue_step(session_id, slots, schemes, pack, prefix=faq_match["reply"] + "\n\n---\n💬 ")
            LAST_RESPONSE_LATENCY_MS = max(0.85, round((time.perf_counter() - start_time) * 1000, 2))
            self.last_latency_ms = LAST_RESPONSE_LATENCY_MS
            return res

        # -------------------------------------------------------------
        # 8. Dialogue State Machine Steps
        # -------------------------------------------------------------
        result = self._next_dialogue_step(session_id, slots, schemes, pack, prefix=expired_prefix)
        LAST_RESPONSE_LATENCY_MS = max(0.85, round((time.perf_counter() - start_time) * 1000, 2))
        self.last_latency_ms = LAST_RESPONSE_LATENCY_MS
        return result

    def _next_dialogue_step(
        self, 
        session_id: str, 
        slots: Dict[str, Any], 
        schemes: List[Dict[str, Any]], 
        pack: Dict[str, Any],
        prefix: str = ""
    ) -> Dict[str, Any]:
        session = SESSIONS[session_id]

        # Step 1: SC Category Verification
        if slots["sc_status"] is None:
            session["stage"] = "ASK_SC"
            reply = f"{prefix}{pack['greeting']}" if prefix else pack["greeting"]
            return {
                "session_id": session_id,
                "reply": reply,
                "quick_replies": pack["sc_quick_replies"],
                "matched_schemes": [],
                "slots": slots
            }

        if slots["sc_status"] == "NO":
            session["stage"] = "NON_SC"
            reply_text = get_non_sc_reply(lang="en") or NON_SC_REPLY
            return {
                "session_id": session_id,
                "reply": f"{prefix}{reply_text}" if prefix else reply_text,
                "quick_replies": NON_SC_QUICK_REPLIES,
                "matched_schemes": [],
                "slots": slots
            }

        # Step 1b: Gender Verification
        if slots.get("gender") is None:
            session["stage"] = "ASK_GENDER"
            reply = f"{prefix}{pack['gender_prompt']}" if prefix else pack["gender_prompt"]
            return {
                "session_id": session_id,
                "reply": reply,
                "quick_replies": pack["gender_quick_replies"],
                "matched_schemes": [],
                "slots": slots
            }

        # Step 2: Annual Family Income
        if slots["income"] is None:
            session["stage"] = "ASK_INCOME"
            g_val = slots.get("gender")
            ack_gender = get_localized_ack("ack_female", lang="en") if g_val == "FEMALE" else ""
            reply = f"{prefix}{ack_gender}{pack['income_prompt']}"
            return {
                "session_id": session_id,
                "reply": reply,
                "quick_replies": pack["income_quick_replies"],
                "matched_schemes": [],
                "slots": slots
            }

        # Step 3: Project Purpose & Type (with Graceful Degradation if neural model unavailable)
        if slots["project_type"] is None and slots["purpose"] is None:
            session["stage"] = "ASK_PURPOSE"
            notice = f"\n\n{INCOME_EXCEEDED_NOTICE}" if slots["income"] > 300000 else ""
            ack = get_localized_ack("ack_income", lang="en", amount=f"{int(slots['income']):,}")

            # Graceful degradation prompt if SentenceTransformer failed to load
            if is_sentence_transformer_failed():
                prompt_text = "To find the right government scheme purpose, please select your business, trade, or study venture directly:"
            else:
                prompt_text = pack["purpose_prompt"]

            return {
                "session_id": session_id,
                "reply": f"{prefix}{ack}{prompt_text}{notice}",
                "quick_replies": pack["purpose_quick_replies"],
                "matched_schemes": [],
                "slots": slots
            }

        # Map broad purpose to default type if needed
        if not slots["project_type"] and slots["purpose"]:
            if slots["purpose"] == "education":
                slots["project_type"] = "higher_education"
            elif slots["purpose"] == "self_employment":
                slots["project_type"] = "tailoring"
            elif slots["purpose"] == "skill_development":
                slots["project_type"] = "skill_training"
            else:
                slots["project_type"] = "shop"

        # Step 4: Loan / Project Amount
        if slots["amount"] is None:
            session["stage"] = "ASK_AMOUNT"
            p_display = (slots.get("project_type") or slots.get("purpose") or "project").replace("_", " ").title()
            ack = get_localized_ack("ack_purpose", lang="en", purpose=p_display)
            return {
                "session_id": session_id,
                "reply": f"{prefix}{ack}{pack['amount_prompt']}",
                "quick_replies": pack["amount_quick_replies"],
                "matched_schemes": [],
                "slots": slots
            }

        # Step 5: Location (State / District)
        if slots["state"] is None and slots["district"] is None:
            session["stage"] = "ASK_LOCATION"
            ack = get_localized_ack("ack_amount", lang="en", amount=f"{int(slots['amount']):,}")
            return {
                "session_id": session_id,
                "reply": f"{prefix}{ack}{pack['location_prompt']}",
                "quick_replies": pack["location_quick_replies"],
                "matched_schemes": [],
                "slots": slots
            }

        # -------------------------------------------------------------
        # All Slots Ready: Run Rule Engine with Explainable No-Match Fallback
        # -------------------------------------------------------------
        session["stage"] = "RECOMMENDATION"
        matched = recommend_schemes(slots, schemes)
        session["matched_schemes"] = matched

        if len(matched) > 0:
            reply = format_multilingual_recommendations(slots, matched, lang_code="en")
            follow_up_qrs = pack.get("follow_ups", ["Explain Eligibility", "Required Documents", "How to Apply", "Show Nearest Partner", "Restart"])
        else:
            # Proper explainable no-match response computing closest scheme
            no_match_text = compute_no_match_explanation(slots, schemes)
            reply = (
                f"🔍 **Scheme Evaluation Result**\n\n"
                f"{no_match_text}\n\n"
                f"Would you like to adjust your loan amount, change your business category, or check universal open schemes?"
            )
            follow_up_qrs = ["Change Loan Amount", "Change Category", "Universal Schemes (PM-SVANidhi)", "Restart"]

        final_reply = f"{prefix}{reply}" if prefix else reply
        session["history"].append({"sender": "assistant", "text": final_reply})

        return {
            "session_id": session_id,
            "reply": final_reply,
            "quick_replies": follow_up_qrs,
            "matched_schemes": matched,
            "slots": slots
        }

dialogue_manager = DialogueManager()
