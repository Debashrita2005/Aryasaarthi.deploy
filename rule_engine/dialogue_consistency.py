"""
AryaSaarthi Rule Engine — Dialogue & Consistency Manager
Features:
- Multi-turn slot persistence
- Contradiction detection and resolution prompt generation
- Strict 2-turn clarifying question cap (pivots to best match with confidence caveat)
"""

from typing import Dict, Any, Optional, Tuple, List


MAX_CLARIFYING_TURNS = 2


class DialogueSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.slots: Dict[str, Any] = {
            "user_name": None,
            "sc_status": None,
            "gender": None,
            "is_pwd": None,
            "income": None,
            "purpose": None,
            "project_type": None,
            "amount": None,
            "moratorium_months": None,
            "state": None,
        }
        self.slot_confidence: Dict[str, float] = {}
        self.clarifying_question_count: int = 0
        self.pending_contradiction: Optional[Dict[str, Any]] = None
        self.history: List[Dict[str, Any]] = []

    def check_contradiction(
        self,
        new_slots: Dict[str, Any],
        confidence_map: Optional[Dict[str, float]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Detects significant conflicts between previously committed slots and new inputs.
        Example: income changed from ₹1.5L to ₹8.0L, or sc_status from YES to NO.
        """
        conf = confidence_map or {}

        # 1. Income contradiction (> 100% difference)
        old_inc = self.slots.get("income")
        new_inc = new_slots.get("income")
        if old_inc and new_inc and old_inc > 0 and new_inc > 0:
            if abs(old_inc - new_inc) >= max(old_inc, new_inc) * 0.5:
                return {
                    "slot": "income",
                    "old_value": old_inc,
                    "new_value": new_inc,
                    "confidence": conf.get("income", 0.90),
                    "prompt": (
                        f"I noticed your annual income was previously noted as ₹{old_inc:,.0f}, "
                        f"and you just mentioned ₹{new_inc:,.0f}. Would you like to update your income to ₹{new_inc:,.0f}?"
                    )
                }

        # 2. SC Status contradiction
        old_sc = self.slots.get("sc_status")
        new_sc = new_slots.get("sc_status")
        if old_sc and new_sc and old_sc != new_sc:
            return {
                "slot": "sc_status",
                "old_value": old_sc,
                "new_value": new_sc,
                "confidence": conf.get("sc_status", 0.95),
                "prompt": (
                    f"Your category was previously set to '{old_sc}'. "
                    f"Would you like to confirm updating it to '{new_sc}'?"
                )
            }

        # 3. Gender contradiction
        old_gen = self.slots.get("gender")
        new_gen = new_slots.get("gender")
        if old_gen and new_gen and old_gen != new_gen:
            return {
                "slot": "gender",
                "old_value": old_gen,
                "new_value": new_gen,
                "confidence": conf.get("gender", 0.95),
                "prompt": (
                    f"Your gender was recorded as '{old_gen}'. "
                    f"Please confirm if you wish to change it to '{new_gen}'."
                )
            }

        return None

    def update_slots(
        self,
        new_slots: Dict[str, Any],
        confidence_map: Optional[Dict[str, float]] = None,
        force: bool = False
    ) -> Tuple[bool, Optional[str]]:
        """
        Updates session slots while managing contradictions and confidence.
        Returns: (updated_successfully, contradiction_prompt_if_any)
        """
        conf = confidence_map or {}

        if not force:
            contradiction = self.check_contradiction(new_slots, conf)
            if contradiction:
                self.pending_contradiction = contradiction
                return False, contradiction["prompt"]

        for k, v in new_slots.items():
            if v is not None:
                self.slots[k] = v
                if k in conf:
                    self.slot_confidence[k] = conf[k]

        self.pending_contradiction = None
        return True, None

    def resolve_contradiction(self, user_confirmed: bool) -> None:
        if not self.pending_contradiction:
            return
        if user_confirmed:
            slot_name = self.pending_contradiction["slot"]
            new_val = self.pending_contradiction["new_value"]
            self.slots[slot_name] = new_val
            self.slot_confidence[slot_name] = self.pending_contradiction.get("confidence", 0.90)
        self.pending_contradiction = None

    def should_ask_clarification(self, missing_required_slots: List[str]) -> Tuple[bool, Optional[str]]:
        """
        Enforces maximum 2 clarifying questions per session.
        If cap exceeded, returns (False, confidence_caveat_message).
        """
        if not missing_required_slots:
            return False, None

        if self.clarifying_question_count < MAX_CLARIFYING_TURNS:
            self.clarifying_question_count += 1
            return True, None

        # Clarification cap reached -> Return best match with confidence caveat
        caveat = (
            "⚠️ *Note: Recommendation based on partial profile inputs. "
            "Final loan sanction and exact interest rebate will be verified by your district State Channelizing Agency.*"
        )
        return False, caveat


class SessionManager:
    """Manages active dialogue sessions in-memory with TTL-like access."""
    def __init__(self):
        self._sessions: Dict[str, DialogueSession] = {}

    def get_or_create(self, session_id: str) -> DialogueSession:
        if session_id not in self._sessions:
            self._sessions[session_id] = DialogueSession(session_id)
        return self._sessions[session_id]

    def reset_session(self, session_id: str) -> DialogueSession:
        self._sessions[session_id] = DialogueSession(session_id)
        return self._sessions[session_id]


# Global instance
_session_mgr = SessionManager()

def get_session(session_id: str) -> DialogueSession:
    return _session_mgr.get_or_create(session_id)

def reset_session(session_id: str) -> DialogueSession:
    return _session_mgr.reset_session(session_id)
