"""
AryaSaarthi Rule Engine — Robust Slot Extractor
Features:
- Indian Currency numeric normalizer (5L, 5 lakh, 5,00,000, ₹500000, 50k, 1.4 lac, 10 cr)
- Comparative and range parsing ("more than 3 lakh", "around 4-5L", "under 1.5 lac")
- Fuzzy matching (rapidfuzz with seamless pure-Python fallback)
- Expanded Hinglish/regional synonym dictionary per slot
- Confidence score (0.0 - 1.0) returned alongside each extracted slot
"""

import re
import difflib
from typing import Dict, Any, Optional, Tuple, List, Union
from .ground_truth import get_ground_truth_synonyms

# Attempt rapidfuzz import; fallback gracefully to difflib
try:
    from rapidfuzz import fuzz as rf_fuzz
    HAS_RAPIDFUZZ = True
except ImportError:
    HAS_RAPIDFUZZ = False
    rf_fuzz = None


def string_similarity(s1: str, s2: str) -> float:
    """Computes string similarity score between 0.0 and 1.0."""
    if not s1 or not s2:
        return 0.0
    s1, s2 = s1.lower().strip(), s2.lower().strip()
    if s1 == s2:
        return 1.0
    if HAS_RAPIDFUZZ and rf_fuzz is not None:
        return rf_fuzz.token_set_ratio(s1, s2) / 100.0
    return difflib.SequenceMatcher(None, s1, s2).ratio()


def normalize_text(text: str) -> str:
    """Normalizes raw input text by stripping noise, standardizing spaces and punctuation."""
    if not text:
        return ""
    t = text.lower().strip()
    t = t.replace("₹", "rs ").replace("rs.", "rs ")
    # Strip commas between digits e.g. 5,00,000 -> 500000
    t = re.sub(r'(?<=\d),(?=\d)', '', t)
    # Convert hyphen ranges like 4-5L or 50k-1L to standard ' to '
    t = re.sub(r'(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?)\s*-\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?)', r'\1 to \2', t)
    t = re.sub(r"[,_\/\\#@!$%^&*()]", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


class CurrencyNormalizer:
    """
    Normalizes Indian Currency expressions and amounts into single canonical integers.
    Supports: 5L, 5 lakh, 5,00,000, ₹500000, 50k, 1.4 lac, 10 cr, hazaar, etc.
    """

    @staticmethod
    def parse_single_amount(text: str) -> Optional[Tuple[int, float]]:
        """
        Parses a single canonical amount and returns (amount_in_inr, confidence).
        """
        norm = normalize_text(text)

        # 1. Crore pattern (e.g. "1.5 cr", "2 crore", "10cr")
        cr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:crore|crores|cr\b)", norm)
        if cr_match:
            val = float(cr_match.group(1)) * 10000000
            return int(round(val)), 0.98

        # 2. Lakh / Lac pattern (e.g. "5L", "1.4 lakh", "3.5 lac", "50l")
        lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l\b)", norm)
        if lakh_match:
            val = float(lakh_match.group(1)) * 100000
            return int(round(val)), 0.98

        # 3. Thousand / K / Hazaar pattern (e.g. "50k", "80 thousand", "50 hazaar")
        k_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:k\b|thousand|thousands|hazaar|hazar)", norm)
        if k_match:
            val = float(k_match.group(1)) * 1000
            return int(round(val)), 0.95

        # 4. Standard digits with/without commas (e.g. "500000", "140000", "50000")
        clean_num_text = norm.replace(",", "")
        digit_matches = re.findall(r"\b\d{4,8}\b", clean_num_text)
        if digit_matches:
            val = int(digit_matches[0])
            if val >= 1000:
                return val, 0.92

        return None

    @staticmethod
    def parse_range_or_comparative(text: str) -> Optional[Tuple[str, int, Optional[int], float]]:
        """
        Parses comparative ("more than 3 lakh", "under 1.5L", "around 5L")
        or range expressions ("between 50k and 1.5L", "4-5L").
        Returns (operator, primary_val, secondary_val, confidence)
        Operators: 'EXACT', 'MORE_THAN', 'LESS_THAN', 'BETWEEN', 'AROUND'
        """
        norm = normalize_text(text)

        # Range: "between X and Y" or "X to Y" or "X-Y"
        range_match = re.search(
            r"(?:between|from)?\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?)\s*(?:to|-|and)\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?)",
            norm
        )
        if range_match:
            g1 = range_match.group(1).strip()
            g2 = range_match.group(2).strip()
            unit_match = re.search(r"(lakh|lac|k|cr|l\b)", g2)
            if unit_match and not re.search(r"(lakh|lac|k|cr|l\b)", g1):
                num_matches = re.findall(r"\d+(?:\.\d+)?", g1)
                if num_matches and float(num_matches[0]) < 100:
                    g1 = f"{g1} {unit_match.group(1)}"

            p1 = CurrencyNormalizer.parse_single_amount(g1)
            p2 = CurrencyNormalizer.parse_single_amount(g2)
            if p1 and p2:
                low = min(p1[0], p2[0])
                high = max(p1[0], p2[0])
                return "BETWEEN", low, high, 0.95

        # Comparative: "more than X", "above X", "greater than X", "> X"
        more_match = re.search(r"(?:more than|above|greater than|exceeding|over|>)\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?|\d{4,8})", norm)
        if more_match:
            parsed = CurrencyNormalizer.parse_single_amount(more_match.group(1))
            if parsed:
                return "MORE_THAN", parsed[0], None, 0.93

        # Comparative: "less than X", "below X", "under X", "< X"
        less_match = re.search(r"(?:less than|below|under|within|upto|up to|<)\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?|\d{4,8})", norm)
        if less_match:
            parsed = CurrencyNormalizer.parse_single_amount(less_match.group(1))
            if parsed:
                return "LESS_THAN", parsed[0], None, 0.93

        # Approximate: "around X", "approx X", "nearby X", "~ X"
        approx_match = re.search(r"(?:around|approx|approximately|about|roughly|~)\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|k|cr|l\b)?|\d{4,8})", norm)
        if approx_match:
            parsed = CurrencyNormalizer.parse_single_amount(approx_match.group(1))
            if parsed:
                return "AROUND", parsed[0], None, 0.90

        # Direct exact match
        single = CurrencyNormalizer.parse_single_amount(norm)
        if single:
            return "EXACT", single[0], None, single[1]

        return None


class SlotExtractor:
    """
    Full contextual slot extraction engine using Indian domain heuristics,
    synonym dictionaries, currency normalization, and fuzzy scoring.
    """

    def __init__(self):
        self.synonyms = get_ground_truth_synonyms()

    def extract_slots(
        self,
        raw_text: str,
        current_slots: Optional[Dict[str, Any]] = None,
        last_question_asked: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extracts all identifiable slots with confidence scores.
        Returns:
            {
                "slots": { ... },
                "confidence": { "slot_name": float },
                "newly_detected": [ ... ],
                "raw_text": raw_text
            }
        """
        norm = normalize_text(raw_text)
        slots = dict(current_slots or {})
        confidence: Dict[str, float] = {}
        newly_detected: List[str] = []

        # 1. User Name Extraction
        name_info = self._extract_name(raw_text, norm)
        if name_info:
            name, conf = name_info
            if slots.get("user_name") != name:
                slots["user_name"] = name
                confidence["user_name"] = conf
                newly_detected.append("user_name")

        # 2. Trade / Project Type Extraction
        trade_info = self._extract_trade(raw_text, norm)
        if trade_info:
            ptype, purpose, conf = trade_info
            if slots.get("project_type") != ptype or slots.get("purpose") != purpose:
                slots["project_type"] = ptype
                slots["purpose"] = purpose
                confidence["project_type"] = conf
                confidence["purpose"] = conf
                newly_detected.append("project_type")

        # 3. Scheduled Caste (SC) Status
        sc_info = self._extract_sc_status(norm, last_question_asked)
        if sc_info:
            status, conf = sc_info
            if slots.get("sc_status") != status:
                slots["sc_status"] = status
                confidence["sc_status"] = conf
                newly_detected.append("sc_status")

        # 4. Gender
        gender_info = self._extract_gender(norm, slots.get("user_name"))
        if gender_info:
            gender, conf = gender_info
            if slots.get("gender") != gender:
                slots["gender"] = gender
                confidence["gender"] = conf
                newly_detected.append("gender")

        # 5. Disability (PwD) Status
        pwd_info = self._extract_pwd(norm)
        if pwd_info:
            is_pwd, conf = pwd_info
            if slots.get("is_pwd") != is_pwd:
                slots["is_pwd"] = is_pwd
                confidence["is_pwd"] = conf
                newly_detected.append("is_pwd")

        # 6. Currency / Loan Amount vs Annual Income (Handling multi-entity sentences)
        income_match = re.search(r"\b(?:earning|income|aay|salary|kamai|earns?)\s*(?:is|of|around)?\s*([₹\d\.,]+\s*(?:lakh|lac|k|cr|l\b)?|\d{4,8})", raw_text, re.IGNORECASE)
        if income_match:
            inc_val = CurrencyNormalizer.parse_single_amount(income_match.group(1))
            if inc_val:
                slots["income"] = inc_val[0]
                confidence["income"] = inc_val[1]
                newly_detected.append("income")

        loan_match = re.search(r"\b(?:need|loan|chahiye|budget|funding|cost|require|want)\s*(?:of|for|around)?\s*([₹\d\.,]+\s*(?:lakh|lac|k|cr|l\b)?|\d{4,8})", raw_text, re.IGNORECASE)
        if loan_match:
            loan_val = CurrencyNormalizer.parse_single_amount(loan_match.group(1))
            if loan_val:
                slots["amount"] = loan_val[0]
                confidence["amount"] = loan_val[1]
                newly_detected.append("amount")

        # Fallback to general range or single amount if neither specific pattern matched
        if not income_match and not loan_match:
            amount_res = CurrencyNormalizer.parse_range_or_comparative(raw_text)
            if amount_res:
                op, val1, val2, conf = amount_res
                is_income_context = (
                    last_question_asked == "INCOME" or
                    bool(re.search(r"\b(income|aay|salana|kamai|salary|earning|annual)\b", norm))
                )
                target_amount = val1 if op != "BETWEEN" else int(round((val1 + (val2 or val1)) / 2))

                if is_income_context:
                    if slots.get("income") != target_amount:
                        slots["income"] = target_amount
                        confidence["income"] = conf
                        newly_detected.append("income")
                else:
                    if not slots.get("amount") or last_question_asked == "AMOUNT" or re.search(r"\b(loan|need|chahiye|budget|funding|cost)\b", norm):
                        if slots.get("amount") != target_amount:
                            slots["amount"] = target_amount
                            confidence["amount"] = conf
                            newly_detected.append("amount")
                    elif not slots.get("income"):
                        slots["income"] = target_amount
                        confidence["income"] = conf * 0.85
                        newly_detected.append("income")

        # 7. Moratorium Period Extraction
        morat_info = self._extract_moratorium(norm)
        if morat_info:
            months, conf = morat_info
            if slots.get("moratorium_months") != months:
                slots["moratorium_months"] = months
                confidence["moratorium_months"] = conf
                newly_detected.append("moratorium_months")

        return {
            "slots": slots,
            "confidence": confidence,
            "newly_detected": newly_detected,
            "raw_text": raw_text
        }

    def _extract_name(self, raw_text: str, norm: str) -> Optional[Tuple[str, float]]:
        name_pattern = re.compile(
            r"\b(?:my name is|my name|mera naam|mera name|naam hai|call me|i am|i'm|im|this is|myself|name:)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b",
            re.IGNORECASE
        )
        match = name_pattern.search(raw_text)
        if not match:
            hindi_match = re.search(r"\b(?:mera naam|mera name|naam)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+hai\b", raw_text, re.IGNORECASE)
            match = hindi_match

        if match:
            candidate = match.group(1).strip()
            candidate = re.sub(r"\b(hai|and|aur|i|who|from|in|at|with|want|need|to|looking|planning)\b.*$", "", candidate, flags=re.IGNORECASE).strip()
            invalid_names = {
                "here", "ready", "looking", "planning", "interested", "applying", "asking",
                "want", "need", "trying", "going", "not", "a", "an", "sc", "male", "female",
                "arya", "from", "in", "at", "just", "only", "very", "new", "good", "fine",
                "okay", "yes", "no", "sure", "student", "farmer", "entrepreneur", "citizen"
            }
            if len(candidate) >= 2 and candidate.lower() not in invalid_names:
                clean_name = " ".join([w.capitalize() for w in candidate.split()])
                return clean_name, 0.95
        return None

    def _extract_trade(self, raw_text: str, norm: str) -> Optional[Tuple[str, str, float]]:
        trade_dict = self.synonyms.get("trades", {})
        best_type = None
        best_score = 0.0
        best_label = None

        # 1. Direct and Synonym Matching
        for ptype, synonyms in trade_dict.items():
            for syn in synonyms:
                # Exact word-boundary match
                if re.search(r"\b" + re.escape(syn) + r"\b", norm):
                    return ptype, syn, 0.98

                # Fuzzy token match
                score = string_similarity(syn, norm)
                if score > best_score and score >= 0.85:
                    best_score = score
                    best_type = ptype
                    best_label = syn

        if best_type and best_score >= 0.85:
            return best_type, best_label or best_type, round(best_score, 2)

        # 2. Pattern Matching ("business of X", "want to open X")
        biz_match = re.search(r"\b(?:business of|shop of|unit of|store of|work of)\s+([a-zA-Z\s]{3,25})\b", norm)
        if biz_match:
            captured = biz_match.group(1).strip()
            return "shop", f"{captured} business", 0.88

        want_match = re.search(r"\b(?:want to (?:open|start|run|set up)|planning to (?:open|start|run|set up))\s+(?:a|an)?\s*([a-zA-Z\s]{3,30})\b", norm)
        if want_match:
            captured = want_match.group(1).strip()
            if not re.search(r"\b(help|loan|scheme|money|fund|information|business)\b", captured):
                return "shop", captured, 0.85

        return None

    def _extract_sc_status(self, norm: str, last_q: Optional[str]) -> Optional[Tuple[str, float]]:
        sc_dict = self.synonyms.get("sc_status_terms", {})
        for term in sc_dict.get("affirmative", []):
            if re.search(r"\b" + re.escape(term) + r"\b", norm) and not re.search(r"\b(not sc|non sc|general|obc)\b", norm):
                return "YES", 0.98

        for term in sc_dict.get("in_progress", []):
            if re.search(r"\b" + re.escape(term) + r"\b", norm):
                return "IN_PROGRESS", 0.95

        for term in sc_dict.get("negative", []):
            if re.search(r"\b" + re.escape(term) + r"\b", norm):
                return "NO", 0.95

        if last_q == "SC_STATUS":
            if re.search(r"\b(yes|haan|ha|hanji|han|belong|i am|sure)\b", norm):
                return "YES", 0.92
            elif re.search(r"\b(no|nahi|na|other|general)\b", norm):
                return "NO", 0.92

        return None

    def _extract_gender(self, norm: str, user_name: Optional[str]) -> Optional[Tuple[str, float]]:
        gender_dict = self.synonyms.get("gender_terms", {})
        for term in gender_dict.get("female", []):
            if re.search(r"\b" + re.escape(term) + r"\b", norm):
                return "FEMALE", 0.98

        for term in gender_dict.get("male", []):
            if re.search(r"\b" + re.escape(term) + r"\b", norm):
                return "MALE", 0.95

        for term in gender_dict.get("other", []):
            if re.search(r"\b" + re.escape(term) + r"\b", norm):
                return "OTHER", 0.95

        # Heuristic name gender detection
        if user_name:
            female_names = {"sneha", "priya", "pooja", "puja", "neha", "anjali", "sunita", "anita", "geeta", "rekha", "radha", "laxmi", "kavita", "monika", "divya", "asha"}
            male_names = {"aditya", "amit", "rahul", "rohit", "rajesh", "suresh", "ramesh", "vijay", "ajay", "anil", "sunil", "deepak", "vikas", "sanjay"}
            first_name = user_name.split()[0].lower()
            if first_name in female_names:
                return "FEMALE", 0.88
            elif first_name in male_names:
                return "MALE", 0.88

        return None

    def _extract_pwd(self, norm: str) -> Optional[Tuple[bool, float]]:
        pwd_terms = self.synonyms.get("pwd_terms", [])
        for term in pwd_terms:
            if re.search(r"\b" + re.escape(term) + r"\b", norm):
                return True, 0.98
        return None

    def _extract_moratorium(self, norm: str) -> Optional[Tuple[int, float]]:
        match = re.search(r"(\d{1,2})\s*(?:months?|m|mahine)\s*(?:moratorium|grace period|holiday)?", norm)
        if not match:
            match = re.search(r"(?:moratorium|grace period|holiday)\s*(?:of|for)?\s*(\d{1,2})\s*(?:months?|m|mahine)?", norm)
        if match:
            months = int(match.group(1))
            if 1 <= months <= 60:
                return months, 0.95
        return None


# Global extractor helper
_extractor = SlotExtractor()

def extract_slots(
    raw_text: str,
    current_slots: Optional[Dict[str, Any]] = None,
    last_question_asked: Optional[str] = None
) -> Dict[str, Any]:
    return _extractor.extract_slots(raw_text, current_slots, last_question_asked)
