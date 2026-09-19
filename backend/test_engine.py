import unittest
from engine import RuleEngine
from models import RecommendationRequest

class TestPythonRuleEngine(unittest.TestCase):
    def setUp(self):
        self.engine = RuleEngine()

    def test_micro_finance_small_shop_business(self):
        """Test small rural shop business with ₹1,00,000 project cost."""
        req = RecommendationRequest(
            age=26,
            gender="MALE",
            annualFamilyIncome=180000.0,
            scCertificate="YES",
            purpose="BUSINESS",
            projectCost=100000.0,
            state="Uttar Pradesh"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertIn(res.bestMatch.schemeCode, ["MFS", "AMY", "UNY"])
        self.assertEqual(res.bestMatch.decision, "STRONG_MATCH")
        self.assertTrue(len(res.bestMatch.reasons) > 0)
        self.assertTrue(len(res.bestMatch.reasonsHi) > 0)
        self.assertGreater(res.bestMatch.financialSummary.eligibleLoanAmount, 0)

    def test_term_loan_commercial_venture(self):
        """Test ₹15 Lakh commercial venture project cost."""
        req = RecommendationRequest(
            age=32,
            gender="MALE",
            annualFamilyIncome=280000.0,
            scCertificate="YES",
            purpose="BUSINESS",
            projectCost=1500000.0,
            state="Maharashtra"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertEqual(res.bestMatch.schemeCode, "TERM_LOAN")
        self.assertGreaterEqual(res.bestMatch.score, 0.80)
        self.assertEqual(res.bestMatch.financialSummary.eligibleLoanAmount, 1350000.0) # 90% of 15L

    def test_education_loan_scheme(self):
        """Test professional degree student applying for education loan."""
        req = RecommendationRequest(
            age=21,
            gender="FEMALE",
            annualFamilyIncome=200000.0,
            scCertificate="YES",
            purpose="EDUCATION",
            projectCost=800000.0,
            state="Karnataka"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertEqual(res.bestMatch.schemeCode, "ELS")
        # Female student receives 0.5% rebate -> 6.0% effective interest rate
        self.assertEqual(res.bestMatch.financialSummary.interestRate, 6.0)

    def test_green_business_solar_ev(self):
        """Test clean mobility EV / solar rooftop project."""
        req = RecommendationRequest(
            age=29,
            gender="MALE",
            annualFamilyIncome=240000.0,
            scCertificate="YES",
            purpose="GREEN_BUSINESS",
            projectCost=350000.0,
            state="Delhi"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertEqual(res.bestMatch.schemeCode, "GBS")

    def test_disability_parallel_track_dsy(self):
        """
        Test PwD citizen with benchmark disability (40%+), NO SC certificate,
        and high income (> ₹3 Lakhs). Should match Divyangjan Swavalamban Yojana (DSY)
        without being blocked by caste or income ceiling!
        """
        req = RecommendationRequest(
            age=30,
            gender="FEMALE",
            annualFamilyIncome=650000.0, # Above NSFDC SC limit
            scCertificate="NO",          # No SC certificate
            hasDisability=True,
            disabilityPercentage=50.0,
            purpose="BUSINESS",
            projectCost=250000.0,
            state="Haryana"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertEqual(res.bestMatch.schemeCode, "DSY")
        self.assertEqual(res.bestMatch.decision, "STRONG_MATCH")
        self.assertTrue(any("disability" in r.lower() or "दिव्यांग" in r for r in res.bestMatch.reasons))

    def test_vmy_microfinance_disability(self):
        """Test Vishesh Microfinance Yojana (VMY) for small micro-credit under ₹60,000."""
        req = RecommendationRequest(
            age=28,
            gender="MALE",
            annualFamilyIncome=120000.0,
            scCertificate="NO",
            hasDisability=True,
            disabilityPercentage=45.0,
            purpose="BUSINESS",
            projectCost=50000.0, # Within VMY ₹60k ceiling
            state="Punjab"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertIn(res.bestMatch.schemeCode, ["VMY", "DSY"])
        self.assertEqual(res.bestMatch.decision, "STRONG_MATCH")
        # Eligible loan is 90% of ₹50,000 = ₹45,000
        self.assertEqual(res.bestMatch.financialSummary.eligibleLoanAmount, 45000.0)

    def test_stand_up_india_large_enterprise(self):
        """Test Stand-Up India for a ₹25 Lakh greenfield manufacturing business."""
        req = RecommendationRequest(
            age=35,
            gender="FEMALE",
            annualFamilyIncome=280000.0,
            scCertificate="YES",
            purpose="BUSINESS",
            projectCost=2500000.0,
            state="Tamil Nadu"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        matching_codes = [res.bestMatch.schemeCode] + [c.schemeCode for c in res.candidateSchemes]
        self.assertIn("STAND_UP_INDIA", matching_codes)
        self.assertIn("TERM_LOAN", matching_codes)

    def test_intellectual_disability_age_relaxation(self):
        """Test age 15 applicant with intellectual disability eligible under relaxed 14+ rule."""
        req = RecommendationRequest(
            age=15,
            gender="MALE",
            annualFamilyIncome=200000.0,
            scCertificate="NO",
            hasDisability=True,
            disabilityPercentage=40.0,
            purpose="BUSINESS",
            projectCost=80000.0,
            state="Rajasthan"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertIn(res.bestMatch.schemeCode, ["DSY", "VMY"])
        self.assertEqual(res.bestMatch.decision, "STRONG_MATCH")

    def test_transport_sector_commercial_vehicle(self):
        """Test commercial vehicle passenger/goods transport purpose."""
        req = RecommendationRequest(
            age=27,
            gender="MALE",
            annualFamilyIncome=220000.0,
            scCertificate="YES",
            purpose="TRANSPORT",
            projectCost=600000.0,
            state="Gujarat"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertIn(res.bestMatch.schemeCode, ["TERM_LOAN", "UNY", "GBS"])
        self.assertEqual(res.bestMatch.decision, "STRONG_MATCH")

    def test_age_under_18_blocked_for_normal_sc(self):
        """Test applicant under 18 years without disability."""
        req = RecommendationRequest(
            age=16,
            gender="MALE",
            annualFamilyIncome=150000.0,
            scCertificate="YES",
            hasDisability=False,
            purpose="BUSINESS",
            projectCost=100000.0,
            state="Uttar Pradesh"
        )
        res = self.engine.evaluate(req)
        self.assertIsNotNone(res.bestMatch)
        self.assertEqual(res.bestMatch.decision, "INELIGIBLE")
        self.assertTrue(any("18" in w for w in res.bestMatch.warnings))

    def test_non_sc_without_disability_blocked(self):
        """Test non-SC applicant without disability is rejected."""
        req = RecommendationRequest(
            age=28,
            gender="MALE",
            annualFamilyIncome=200000.0,
            scCertificate="NO",
            hasDisability=False,
            purpose="BUSINESS",
            projectCost=100000.0,
            state="Bihar"
        )
        res = self.engine.evaluate(req)
        self.assertEqual(res.bestMatch.decision, "INELIGIBLE")

if __name__ == "__main__":
    unittest.main()
