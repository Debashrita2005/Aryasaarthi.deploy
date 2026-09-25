"""
AryaSaarthi Unit Tests — Recommendation & Eligibility Engine
Tests multi-factor scoring and rule-based eligibility evaluation.
"""

import unittest
from ml.recommendation_engine import recommend_schemes, compute_match_breakdown
from ml.eligibility_engine import evaluate_eligibility
from ml.knowledge_retriever import load_schemes_knowledge


class TestRecommendationAndEligibility(unittest.TestCase):

    def setUp(self):
        self.schemes = load_schemes_knowledge()

    def test_farmer_west_bengal_recommendation(self):
        # The primary benchmark query persona from user prompt
        profile = {
            "occupation": "farmer",
            "state": "West Bengal",
            "land_area": 2.0,
            "land_unit": "acre"
        }
        recs = recommend_schemes(profile, top_k=5)
        self.assertGreater(len(recs), 0)

        # West Bengal farmer schemes like Krishak Bandhu and PM-KISAN should score at top
        top_scheme_ids = [r["scheme_id"] for r in recs[:3]]
        self.assertTrue(
            "SCHEME_KRISHAK_BANDHU_04" in top_scheme_ids or "SCHEME_PMKISAN_01" in top_scheme_ids,
            f"Expected Krishak Bandhu or PM-KISAN in top recommendations, got {top_scheme_ids}"
        )

        top_rec = recs[0]
        self.assertGreaterEqual(top_rec["match_score"], 0.70)
        self.assertIn("disclaimer", top_rec)
        self.assertIn("eligibility", top_rec)

    def test_transparent_score_breakdown(self):
        profile = {
            "occupation": "farmer",
            "state": "West Bengal",
            "land_area": 2.0
        }
        pm_kisan = next(s for s in self.schemes if s["scheme_id"] == "SCHEME_PMKISAN_01")
        breakdown = compute_match_breakdown(profile, pm_kisan)
        self.assertIn("match_score", breakdown)
        self.assertIn("component_breakdown", breakdown)
        self.assertEqual(breakdown["component_breakdown"]["occupation_match"], 1.0)
        self.assertEqual(breakdown["component_breakdown"]["location_match"], 1.0)
        self.assertEqual(breakdown["component_breakdown"]["land_match"], 1.0)

    def test_rule_based_eligibility_states(self):
        # Eligible profile for PM-KISAN
        profile_eligible = {
            "occupation": "farmer",
            "state": "West Bengal",
            "land_area": 2.0,
            "age": 40
        }
        pm_kisan = next(s for s in self.schemes if s["scheme_id"] == "SCHEME_PMKISAN_01")
        res = evaluate_eligibility(profile_eligible, pm_kisan)
        self.assertEqual(res["status"], "eligible")

        # Ineligible due to state restriction (Krishak Bandhu is strictly West Bengal)
        profile_punjab = {
            "occupation": "farmer",
            "state": "Punjab",
            "land_area": 2.0
        }
        krishak_bandhu = next(s for s in self.schemes if s["scheme_id"] == "SCHEME_KRISHAK_BANDHU_04")
        res_punjab = evaluate_eligibility(profile_punjab, krishak_bandhu)
        self.assertEqual(res_punjab["status"], "not_eligible")
        self.assertTrue(len(res_punjab["failed_conditions"]) > 0)

        # Insufficient info (missing land area for scheme requiring land)
        profile_no_land = {
            "occupation": "farmer",
            "state": "West Bengal"
        }
        res_no_land = evaluate_eligibility(profile_no_land, pm_kisan)
        self.assertEqual(res_no_land["status"], "potentially_eligible")
        self.assertIn("land holding area (acres/bigha)", res_no_land["missing_information"])


if __name__ == "__main__":
    unittest.main()
