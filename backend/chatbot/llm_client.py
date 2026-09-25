"""
AryaSaarthi — Ask Arya LLM Client
Handles local inference via Ollama with strict JSON enforcement, retry-once policy,
and hard timeout fallback triggers for anti-hallucination slot extraction.

Constraint: Extract ONLY schema-defined fields. Ignore all irrelevant context
(age, family occupation, unrelated loans, vehicle ownership, etc.). Never invent fields.
"""

import json
import logging
import re
from typing import Dict, Any, Optional, Tuple
import requests

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://127.0.0.1:11434"
DEFAULT_MODEL = "phi3:mini"
DEFAULT_TIMEOUT_SEC = 3.5

SYSTEM_PROMPT = """You are the specialized NLU slot extractor for AryaSaarthi, an NSFDC government scheme recommender for Scheduled Caste (SC) beneficiaries.

CRITICAL EXTRACTION RULES:
1. Extract ONLY the fields explicitly defined in the JSON schema below.
2. COMPLETELY IGNORE all extraneous, irrelevant user details (such as user's age, father/family occupation, existing debts from other banks, marital status, vehicle ownership, etc.).
3. DO NOT add extra keys to the output JSON, ever.
4. If a value is ambiguous, vague, or not clearly stated, leave it null rather than inferring or guessing.
5. Return a confidence score between 0.0 and 1.0 for each extracted field based on how explicitly it was stated in the message.

Adhere strictly to this JSON schema:
{
  "extracted_slots": {
    "income": <integer annual family income in rupees or null>,
    "category_confirmed": <boolean true if SC/scheduled caste mentioned or affirmed, false if explicitly other category, null if not mentioned>,
    "purpose": <string: one of "EDUCATION", "GREEN_BUSINESS", "AGRICULTURE", "TRANSPORT", "BUSINESS", "SANITATION" or null>,
    "amount": <integer requested loan/project amount in rupees or null>,
    "education_status": <string: one of "PURSUING_HIGHER_ED", "STUDENT", "GRADUATED", "PROFESSIONAL_COURSE" or null>,
    "location": <string state name or null>
  },
  "confidence": {
    "income": <float 0.0 to 1.0>,
    "category_confirmed": <float 0.0 to 1.0>,
    "purpose": <float 0.0 to 1.0>,
    "amount": <float 0.0 to 1.0>,
    "location": <float 0.0 to 1.0>
  },
  "clarification_needed": <list of slot names as strings if vague or ambiguous, e.g. ["purpose"] or []>
}
Output valid JSON only. Do not wrap in markdown or include conversational text."""


class OllamaLLMClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = DEFAULT_MODEL, timeout: float = DEFAULT_TIMEOUT_SEC):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def is_available(self) -> bool:
        """Check if local Ollama daemon is reachable."""
        try:
            res = requests.get(f"{self.base_url}/api/tags", timeout=1.5)
            return res.status_code == 200
        except Exception:
            return False

    def extract_slots(self, text: str, current_slots: Optional[Dict[str, Any]] = None, lang: str = "en") -> Tuple[Optional[Dict[str, Any]], str]:
        """
        Extracts slots using Ollama with a retry-once policy.
        Returns:
            (parsed_json_dict, source_tag: "llm" | "llm_retry" | "failed")
        """
        prompt = f"User message: \"{text}\"\nCurrent filled slots: {json.dumps(current_slots or {})}\nLanguage: {lang}\nExtract slots strictly matching schema:"

        # Attempt 1
        success, res_json = self._call_ollama(prompt)
        if success and res_json:
            return self._sanitize_output(res_json), "llm"

        # Retry once on failure/malformed JSON
        logger.warning("Ollama call 1 failed or returned malformed JSON, retrying once...")
        success_retry, res_json_retry = self._call_ollama(prompt + "\nRemember: Output strict valid JSON only adhering to schema with no extra keys.")
        if success_retry and res_json_retry:
            return self._sanitize_output(res_json_retry), "llm_retry"

        return None, "failed"

    def _sanitize_output(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensures strict schema compliance, removes any hallucinated extra keys,
        and bounds confidence values between 0.0 and 1.0.
        """
        allowed_slots = {"income", "category_confirmed", "purpose", "amount", "education_status", "location"}
        raw_slots = parsed.get("extracted_slots", {})
        clean_slots = {k: raw_slots.get(k) for k in allowed_slots}

        raw_conf = parsed.get("confidence", {})
        clean_conf = {}
        for k in allowed_slots:
            val = raw_conf.get(k, 0.0)
            try:
                clean_conf[k] = max(0.0, min(1.0, float(val)))
            except (ValueError, TypeError):
                clean_conf[k] = 0.8 if clean_slots.get(k) is not None else 0.0

        clarifications = parsed.get("clarification_needed", [])
        if not isinstance(clarifications, list):
            clarifications = []

        return {
            "extracted_slots": clean_slots,
            "confidence": clean_conf,
            "clarification_needed": [str(c) for c in clarifications]
        }

    def _call_ollama(self, prompt: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": SYSTEM_PROMPT,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.05,
                "top_p": 0.85,
                "num_predict": 256
            }
        }
        try:
            resp = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout
            )
            if resp.status_code != 200:
                logger.warning(f"Ollama returned HTTP {resp.status_code}: {resp.text}")
                return False, None

            data = resp.json()
            raw_response = data.get("response", "").strip()
            
            # Clean possible markdown wrap
            if raw_response.startswith("```json"):
                raw_response = raw_response[7:]
            if raw_response.startswith("```"):
                raw_response = raw_response[3:]
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3]
            raw_response = raw_response.strip()

            parsed = json.loads(raw_response)
            
            # Validate required top-level keys
            if "extracted_slots" in parsed:
                return True, parsed
            return False, None
        except Exception as e:
            logger.warning(f"Ollama generation exception: {e}")
            return False, None


# Global singleton instance
llm_client = OllamaLLMClient()
