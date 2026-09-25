"""
AryaSaarthi Unit Tests — Local Deterministic Entity Extraction
Validates profile extraction without external LLM calls.
"""

import unittest
from ml.entity_extractor import extract_profile


class TestEntityExtraction(unittest.TestCase):

    def test_farmer_west_bengal_extraction(self):
        query = "I am a farmer from West Bengal and I have 2 acres of land."
        entities = extract_profile(query)
        self.assertEqual(entities.get("occupation"), "farmer")
        self.assertEqual(entities.get("state"), "West Bengal")
        self.assertEqual(entities.get("land_area"), 2.0)
        self.assertEqual(entities.get("land_unit"), "acre")

    def test_marginal_farmer_bihar(self):
        query = "Can a marginal farmer with 1.5 acres in Bihar apply for this scheme?"
        entities = extract_profile(query)
        self.assertEqual(entities.get("occupation"), "marginal farmer")
        self.assertEqual(entities.get("state"), "Bihar")
        self.assertEqual(entities.get("land_area"), 1.5)

    def test_dairy_farmer_loan_extraction(self):
        query = "I need a low interest loan of 2 lakh rupees for my small dairy farm."
        entities = extract_profile(query)
        self.assertEqual(entities.get("occupation"), "dairy farmer")
        self.assertEqual(entities.get("loan_requirement"), 200000.0)

    def test_tailor_profile_extraction(self):
        query = "I am 35 years old living in Hooghly, my income is 180000 and I do tailoring."
        entities = extract_profile(query)
        self.assertEqual(entities.get("age"), 35)
        self.assertEqual(entities.get("district"), "Hooghly")
        self.assertEqual(entities.get("state"), "West Bengal")
        self.assertEqual(entities.get("annual_income"), 180000.0)
        self.assertEqual(entities.get("occupation"), "tailor")

    def test_crop_extraction(self):
        query = "What is the recommended sowing period and fertilizer for mustard crop?"
        entities = extract_profile(query)
        self.assertEqual(entities.get("crop"), "mustard")

    def test_income_update_pattern(self):
        query = "Please update my annual income to 240000 and my state to West Bengal."
        entities = extract_profile(query)
        self.assertEqual(entities.get("annual_income"), 240000.0)
        self.assertEqual(entities.get("state"), "West Bengal")

    def test_empty_string(self):
        entities = extract_profile("")
        self.assertEqual(entities, {})


if __name__ == "__main__":
    unittest.main()
