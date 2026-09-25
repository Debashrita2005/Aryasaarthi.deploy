"""
AryaSaarthi Unit Tests — Intent Classification & Confidence Handling
Tests high-confidence, low-confidence, and edge case intent predictions.
"""

import unittest
from ml.predict import predict_intent, HIGH_CONFIDENCE, LOW_CONFIDENCE


class TestIntentClassification(unittest.TestCase):

    def test_greeting_intent(self):
        res = predict_intent("Hello Arya, good morning!")
        self.assertEqual(res["intent"], "greeting")
        self.assertGreaterEqual(res["confidence"], LOW_CONFIDENCE)

    def test_goodbye_intent(self):
        res = predict_intent("Thank you for your help, goodbye!")
        self.assertEqual(res["intent"], "goodbye")
        self.assertGreaterEqual(res["confidence"], LOW_CONFIDENCE)

    def test_scheme_search_intent(self):
        query = "I am a farmer from West Bengal. I have 2 acres of land. What schemes can I get?"
        res = predict_intent(query)
        self.assertEqual(res["intent"], "scheme_search")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_scheme_eligibility_intent(self):
        res = predict_intent("Am I eligible for this scheme?")
        self.assertEqual(res["intent"], "scheme_eligibility")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_scheme_documents_intent(self):
        res = predict_intent("What documents are required to apply for Kisan Credit Card?")
        self.assertEqual(res["intent"], "scheme_documents")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_scheme_benefits_intent(self):
        res = predict_intent("What are the benefits of this scheme?")
        self.assertEqual(res["intent"], "scheme_benefits")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_loan_information_intent(self):
        res = predict_intent("I need a low interest loan of 2 lakh rupees for my small dairy farm.")
        self.assertEqual(res["intent"], "loan_information")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_loan_calculation_intent(self):
        res = predict_intent("What is the monthly EMI if I borrow 100000 at 4 percent interest for 3 years?")
        self.assertEqual(res["intent"], "loan_calculation")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_farmer_registration_intent(self):
        res = predict_intent("How can a new cultivator register in the state farmer database?")
        self.assertEqual(res["intent"], "farmer_registration")
        self.assertGreaterEqual(res["confidence"], HIGH_CONFIDENCE)

    def test_unknown_gibberish_query(self):
        # Gibberish edge cases specified in prompt
        res = predict_intent("asdfgh")
        self.assertEqual(res["intent"], "unknown")
        self.assertEqual(res["status"], "uncertain")

    def test_empty_query(self):
        res = predict_intent("")
        self.assertEqual(res["intent"], "unknown")
        self.assertEqual(res["confidence"], 0.0)

    def test_dont_know_help(self):
        res = predict_intent("I don't know what to do here, please advise")
        self.assertIn(res["intent"], ["help", "unknown"])


if __name__ == "__main__":
    unittest.main()
