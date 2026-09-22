"""
AryaSaarthi Rule Engine — Explainability & Structured Audit Logger
Features:
- Full reasoning chain exposure for "Why this scheme?" UI inspections
- Structured JSON audit logging (inputs, extracted slots + confidence, rules evaluated/fired, answer, timestamp)
- In-memory & file-based persistent audit trail with user thumbs up/down feedback store
"""

import os
import time
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
AUDIT_LOG_FILE = os.path.join(LOG_DIR, "rule_engine_audit.jsonl")


class ReasoningChainBuilder:
    """
    Builds an explainable, step-by-step reasoning audit chain for citizen transparency.
    """

    @staticmethod
    def build_chain(
        raw_text: str,
        slots: Dict[str, Any],
        slot_confidences: Dict[str, float],
        ranked_schemes: List[Dict[str, Any]],
        fallback_info: Optional[Dict[str, Any]] = None,
        caveat: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        steps: List[Dict[str, Any]] = []

        # Step 1: Input Analysis & Slot Extraction
        active_slots = {k: v for k, v in slots.items() if v is not None}
        avg_confidence = (
            sum(slot_confidences.values()) / len(slot_confidences)
            if slot_confidences else 0.90
        )
        steps.append({
            "step": 1,
            "title": "Citizen Profile & Intent Extraction",
            "summary": f"Extracted {len(active_slots)} parameters with average confidence {avg_confidence:.0%}.",
            "extracted_attributes": active_slots,
            "confidence_scores": slot_confidences
        })

        # Step 2: Statutory Criteria Validation
        if ranked_schemes:
            top_match = ranked_schemes[0]
            steps.append({
                "step": 2,
                "title": "Statutory Hard Filter Verification",
                "summary": f"Verified compliance against NSFDC and MoSJE income, trade, and beneficiary criteria.",
                "passed_schemes_count": len(ranked_schemes),
                "top_qualifying_scheme": top_match["name"]
            })

            # Step 3: Multi-Factor Weighted Ranking
            steps.append({
                "step": 3,
                "title": "Multi-Attribute Weighted Scoring",
                "summary": f"Ranked #{top_match['name']} with highest composite fit score ({top_match['score']:.1%}).",
                "score_breakdown": top_match.get("score_breakdown", {}),
                "tie_breaker_applied": f"Concessional interest rate: {top_match['interest_rate_min']}% p.a."
            })

            # Step 4: Final Recommendation & Explanations
            steps.append({
                "step": 4,
                "title": "Final Benefit Recommendation",
                "recommendation": top_match["name"],
                "statutory_reference": top_match.get("statutory_reference", "NSFDC Statutory Guidelines"),
                "justification": top_match.get("match_reason", "")
            })
        else:
            # Fallback reasoning
            fb = fallback_info or {}
            steps.append({
                "step": 2,
                "title": "Statutory Filter Assessment",
                "summary": "No statutory NSFDC scheme passed hard eligibility constraints.",
                "rejection_reason": fb.get("primary_reason", "Out of bounds for concessional ceiling.")
            })
            steps.append({
                "step": 3,
                "title": "Open-Credit Fallback Recommendation",
                "summary": "Routed to universal national self-employment and credit guarantees.",
                "alternative_options": [a["name"] for a in fb.get("alternative_schemes", [])]
            })

        if caveat:
            steps.append({
                "step": 5,
                "title": "Confidence & Partial Profile Caveat",
                "notice": caveat
            })

        return steps


class AuditLogger:
    """
    Structured JSON log recorder for deterministic traceability and user feedback attribution.
    """

    def __init__(self, log_path: str = AUDIT_LOG_FILE):
        self.log_path = log_path
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
        self._in_memory_logs: Dict[str, Dict[str, Any]] = {}

    def log_interaction(
        self,
        interaction_id: str,
        session_id: str,
        input_text: str,
        slots: Dict[str, Any],
        slot_confidences: Dict[str, float],
        rules_evaluated: List[str],
        rule_fired: str,
        final_answer: str,
        reasoning_chain: List[Dict[str, Any]],
        confidence_caveat: Optional[str] = None
    ) -> Dict[str, Any]:
        entry = {
            "interaction_id": interaction_id,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "unix_timestamp": time.time(),
            "input_text": input_text,
            "slots": slots,
            "slot_confidences": slot_confidences,
            "rules_evaluated": rules_evaluated,
            "rule_fired": rule_fired,
            "final_answer": final_answer,
            "reasoning_chain": reasoning_chain,
            "confidence_caveat": confidence_caveat,
            "user_feedback": None  # Optional: {"rating": "THUMBS_UP" | "THUMBS_DOWN", "comment": str}
        }

        self._in_memory_logs[interaction_id] = entry

        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except Exception as e:
            # Safe non-blocking log write
            pass

        return entry

    def record_feedback(
        self,
        interaction_id: str,
        rating: str,
        comment: Optional[str] = None
    ) -> bool:
        """
        Attaches thumbs up/down user feedback (+1 / -1) to the interaction record.
        Rating: 'THUMBS_UP' | 'THUMBS_DOWN' | 'UP' | 'DOWN'
        """
        normalized_rating = "THUMBS_UP" if rating.upper() in ["THUMBS_UP", "UP", "1", "LIKE"] else "THUMBS_DOWN"

        if interaction_id in self._in_memory_logs:
            self._in_memory_logs[interaction_id]["user_feedback"] = {
                "rating": normalized_rating,
                "comment": comment or "",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            return True
        return False

    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return list(self._in_memory_logs.values())[-limit:]


# Global logger instance
_logger = AuditLogger()

def log_rule_execution(
    interaction_id: str,
    session_id: str,
    input_text: str,
    slots: Dict[str, Any],
    slot_confidences: Dict[str, float],
    rules_evaluated: List[str],
    rule_fired: str,
    final_answer: str,
    reasoning_chain: List[Dict[str, Any]],
    confidence_caveat: Optional[str] = None
) -> Dict[str, Any]:
    return _logger.log_interaction(
        interaction_id, session_id, input_text, slots, slot_confidences,
        rules_evaluated, rule_fired, final_answer, reasoning_chain, confidence_caveat
    )

def record_user_feedback(interaction_id: str, rating: str, comment: Optional[str] = None) -> bool:
    return _logger.record_feedback(interaction_id, rating, comment)
