"""
AryaSaarthi — Ask Arya 'No Distraction' & Noise Filtering Test Suite
Asserts that extraneous user details (such as age, family occupations, unrelated debts,
weddings, or vehicle ownership) are never reflected back or acknowledged in assistant responses.
"""

import os
import sys
import unittest

# Setup import path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from chatbot.dialogue_manager import DialogueManager

MOCK_SCHEMES = [
    {
        "scheme_id": "NSFDC-MSY-01",
        "name": "Mahila Samriddhi Yojana (MSY)",
        "category": "self_employment",
        "min_income": 0,
        "max_income": 350000,
        "min_amount": 10000,
        "max_amount": 140000,
        "interest_rate_min": 4.0,
        "interest_rate_max": 4.0,
        "moratorium_months": [3, 6],
        "eligible_project_types": ["tailoring", "beauty_parlor", "handicrafts", "small_business"],
        "cost_coverage_pct": 100,
        "target_gender": "FEMALE"
    },
    {
        "scheme_id": "NSFDC-MFS-01",
        "name": "Micro Finance Scheme (MFS)",
        "category": "micro_finance",
        "min_income": 0,
        "max_income": 350000,
        "min_amount": 10000,
        "max_amount": 140000,
        "interest_rate_min": 5.0,
        "interest_rate_max": 5.0,
        "moratorium_months": [1, 3],
        "eligible_project_types": ["small_business", "dairy", "poultry", "tailoring"],
        "cost_coverage_pct": 100,
    }
]

class TestNoDistraction(unittest.TestCase):

    def setUp(self):
        self.dm = DialogueManager(schemes_loader=lambda: MOCK_SCHEMES)

    def test_no_distraction_on_heavy_oversharing(self):
        """
        Input with extreme noise: age, father occupation, unrelated bank loans.
        Verifies that final scheme recommendation has zero mention of noise tokens.
        """
        session_id = "test_no_distract_01"
        noisy_input = (
            "I am 24 years old, my father is a farmer, I have an existing debt from ICICI bank "
            "and own a motorcycle. I am an SC female with annual family income of 1.2 lakh, "
            "and I need a 80000 rupees loan for my tailoring boutique."
        )

        res = self.dm.process_message(session_id, noisy_input)
        reply = res["reply"]

        # Assert schemes matched cleanly
        self.assertTrue(len(res["matched_schemes"]) > 0)
        self.assertIn("Mahila Samriddhi Yojana", reply)

        # Assert NO distraction / noise keywords leaked into the response
        irrelevant_keywords = [
            "father",
            "farmer",
            "24",
            "icici",
            "motorcycle",
            "existing debt",
            "unrelated bank"
        ]

        reply_lower = reply.lower()
        for kw in irrelevant_keywords:
            self.assertNotIn(
                kw,
                reply_lower,
                f"Distraction violation! Irrelevant keyword '{kw}' leaked into the assistant reply:\n{reply}"
            )

    def test_no_distraction_on_family_and_event_noise(self):
        """
        Input with family and personal event noise: sister's wedding, village politics.
        """
        session_id = "test_no_distract_02"
        noisy_input = (
            "Hello, my sister is getting married in November and my cousin works in Mumbai. "
            "I am an SC woman with 1.5 lakh income seeking 60000 loan for opening a beauty parlor."
        )

        res = self.dm.process_message(session_id, noisy_input)
        reply = res["reply"]

        self.assertTrue(len(res["matched_schemes"]) > 0)
        reply_lower = reply.lower()

        family_noise = ["sister", "married", "wedding", "november", "cousin", "mumbai"]
        for kw in family_noise:
            self.assertNotIn(
                kw,
                reply_lower,
                f"Distraction violation! Family event noise '{kw}' leaked into the assistant reply!"
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
