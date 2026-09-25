"""
AryaSaarthi Unit Tests — Knowledge Retrieval
Tests local TF-IDF cosine similarity search over data/schemes.json without hallucination.
"""

import unittest
from ml.knowledge_retriever import retrieve_schemes, load_schemes_knowledge


class TestKnowledgeRetrieval(unittest.TestCase):

    def setUp(self):
        self.schemes = load_schemes_knowledge()
        self.assertGreater(len(self.schemes), 0)

    def test_pm_kisan_retrieval(self):
        results = retrieve_schemes("PM KISAN financial assistance direct income support", top_k=3)
        self.assertGreater(len(results), 0)
        top_scheme = results[0]
        self.assertEqual(top_scheme["scheme_id"], "SCHEME_PMKISAN_01")
        self.assertGreater(top_scheme["similarity_score"], 0.20)

    def test_kcc_crop_loan_retrieval(self):
        results = retrieve_schemes("Kisan Credit Card crop loan subsidized interest", top_k=3)
        self.assertGreater(len(results), 0)
        scheme_ids = [r["scheme_id"] for r in results]
        self.assertIn("SCHEME_KCC_02", scheme_ids)

    def test_krishak_bandhu_west_bengal(self):
        results = retrieve_schemes("Krishak Bandhu financial aid for farmers in West Bengal", top_k=3)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0]["scheme_id"], "SCHEME_KRISHAK_BANDHU_04")

    def test_tractor_subsidy_smam(self):
        results = retrieve_schemes("Sub-Mission Agricultural Mechanization tractor power tiller subsidy", top_k=3)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0]["scheme_id"], "SCHEME_SMAM_06")

    def test_empty_query(self):
        results = retrieve_schemes("")
        self.assertEqual(results, [])


if __name__ == "__main__":
    unittest.main()
