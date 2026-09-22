"""
AryaSaarthi Rule Engine — Autonomous Ground-Truth Decision & Dialogue Engine
100% Local, Zero External LLM Implementation.
"""

import uuid
from typing import Dict, Any, Optional, List

from .ground_truth import (
    get_ground_truth_schemes,
    get_ground_truth_synonyms,
    get_manual_review_flags,
    get_schema_version
)
from .slot_extractor import extract_slots, CurrencyNormalizer
from .weighted_matcher import (
    match_and_rank_schemes,
    compute_no_match_fallback,
    SchemeMatchResult
)
from .dialogue_consistency import (
    get_session,
    reset_session,
    DialogueSession
)
from .explainability import (
    ReasoningChainBuilder,
    log_rule_execution,
    record_user_feedback
)
from .versioning import get_rule_engine_version_info


def process_user_query(
    user_text: str,
    session_id: Optional[str] = None,
    last_question_asked: Optional[str] = None
) -> Dict[str, Any]:
    """
    Unified end-to-end entrypoint:
    1. Retrieves/creates conversation session state.
    2. Runs robust slot extraction & currency normalization.
    3. Handles contradiction detection & clarification capping.
    4. Evaluates statutory hard filters & multi-attribute weighted ranking.
    5. Builds explainable step-by-step reasoning chain.
    6. Logs structured audit record and returns typed response.
    """
    sid = session_id or str(uuid.uuid4())
    session = get_session(sid)
    interaction_id = str(uuid.uuid4())

    # 1. Slot Extraction
    extract_res = extract_slots(user_text, session.slots, last_question_asked)
    new_slots = extract_res["slots"]
    confidences = extract_res["confidence"]

    # 2. Contradiction & Consistency Management
    updated, contradiction_prompt = session.update_slots(new_slots, confidences)
    if contradiction_prompt:
        reasoning_chain = [{
            "step": 1,
            "title": "Contradiction Detection",
            "summary": "Detected significant change in previously committed slot.",
            "prompt": contradiction_prompt
        }]
        log_rule_execution(
            interaction_id, sid, user_text, session.slots, confidences,
            ["CONTRADICTION_RULE"], "CONTRADICTION_CONFIRMATION", contradiction_prompt, reasoning_chain
        )
        return {
            "interaction_id": interaction_id,
            "session_id": sid,
            "status": "CONTRADICTION_DETECTED",
            "reply": contradiction_prompt,
            "quick_replies": ["Yes, update", "No, keep previous"],
            "slots": session.slots,
            "slot_confidences": session.slot_confidence,
            "matched_schemes": [],
            "reasoning_chain": reasoning_chain,
            "confidence_caveat": None
        }

    # 3. Missing Slot Assessment & Clarification Cap
    missing_slots = []
    if not session.slots.get("project_type") and not session.slots.get("purpose"):
        missing_slots.append("purpose")
    if not session.slots.get("amount"):
        missing_slots.append("amount")

    should_clarify, caveat = session.should_ask_clarification(missing_slots)

    # 4. Weighted Scheme Matching
    ranked_results = match_and_rank_schemes(session.slots)
    ranked_dicts = [r.to_dict() for r in ranked_results]

    fallback_info = None
    if not ranked_results:
        fallback_info = compute_no_match_fallback(session.slots)

    # 5. Reasoning Chain Generation
    reasoning_chain = ReasoningChainBuilder.build_chain(
        user_text, session.slots, session.slot_confidence, ranked_dicts, fallback_info, caveat
    )

    # 6. Response Construction
    if ranked_dicts:
        top = ranked_dicts[0]
        rule_fired = f"MATCH_{top['scheme_id']}"
        reply_header = f"🎯 **Recommended Scheme:** {top['name']} (Fit Score: {top['score']:.0%})\n\n💡 {top['match_reason']}"
    else:
        fb = fallback_info or {}
        rule_fired = fb.get("status", "ZERO_MATCH_FALLBACK")
        reply_header = f"ℹ️ **No Statutory Match:** {fb.get('primary_reason', '')}"

    if caveat:
        reply_header += f"\n\n{caveat}"

    # 7. Audit Logging
    log_rule_execution(
        interaction_id, sid, user_text, session.slots, session.slot_confidence,
        [r["scheme_id"] for r in ranked_dicts] if ranked_dicts else ["HARD_FILTERS"],
        rule_fired, reply_header, reasoning_chain, caveat
    )

    return {
        "interaction_id": interaction_id,
        "session_id": sid,
        "status": "SUCCESS" if ranked_dicts else "FALLBACK",
        "reply": reply_header,
        "matched_schemes": ranked_dicts,
        "fallback_info": fallback_info,
        "slots": session.slots,
        "slot_confidences": session.slot_confidence,
        "reasoning_chain": reasoning_chain,
        "confidence_caveat": caveat
    }


__all__ = [
    "process_user_query",
    "get_ground_truth_schemes",
    "get_manual_review_flags",
    "get_schema_version",
    "extract_slots",
    "match_and_rank_schemes",
    "compute_no_match_fallback",
    "get_session",
    "reset_session",
    "record_user_feedback",
    "get_rule_engine_version_info",
    "CurrencyNormalizer",
    "SchemeMatchResult"
]
