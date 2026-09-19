"""
Unit tests for Ask Arya Chatbot (NSFDC Scheme & Loan Recommender)
Tests cover:
1. Exact keyword match profile
2. Semantic similarity fallback profile (tailoring/boutique shop)
3. Multi-slot single-shot short-circuit extraction
4. Non-SC category rejection handling
5. No-match / over-ceiling income or loan amount
6. Explainable rule engine reasons & sorting
"""

import unittest
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from chatbot.nlu import (
    extract_slots,
    extract_sc_status,
    parse_indian_amount,
    parse_contextual_amounts,
    extract_purpose_and_project_type_regex,
    extract_location_regex,
)
from chatbot.similarity_matcher import match_project_type
from chatbot.rule_engine import recommend_schemes, build_reason
from chatbot.dialogue_manager import DialogueManager, SESSIONS


# Sample mock schemes conforming to exact user MongoDB data contract
MOCK_SCHEMES = [
    {
        "scheme_id": "NSFDC-EDU-01",
        "name": "Education Loan Scheme",
        "category": "education",
        "min_income": 0,
        "max_income": 500000,
        "min_amount": 10000,
        "max_amount": 2000000,
        "interest_rate_min": 6.5,
        "interest_rate_max": 8.0,
        "moratorium_months": [3, 12],
        "eligible_project_types": ["higher_education", "vocational", "education"],
        "cost_coverage_pct": 90,
    },
    {
        "scheme_id": "NSFDC-MCY-01",
        "name": "Mahila Samriddhi Yojana",
        "category": "self_employment",
        "min_income": 0,
        "max_income": 350000,
        "min_amount": 10000,
        "max_amount": 140000,
        "interest_rate_min": 4.0,
        "interest_rate_max": 4.0,
        "moratorium_months": [3, 6],
        "eligible_project_types": ["tailoring", "beauty_parlor", "handicrafts", "petty_shop", "small_business"],
        "cost_coverage_pct": 95,
    },
    {
        "scheme_id": "NSFDC-MFS-01",
        "name": "Micro Finance Scheme",
        "category": "micro_finance",
        "min_income": 0,
        "max_income": 350000,
        "min_amount": 10000,
        "max_amount": 140000,
        "interest_rate_min": 5.0,
        "interest_rate_max": 5.0,
        "moratorium_months": [1, 3],
        "eligible_project_types": ["small_business", "dairy", "poultry", "tailoring", "retail_shop"],
        "cost_coverage_pct": 90,
    },
    {
        "scheme_id": "NSFDC-TL-01",
        "name": "Term Loan Scheme",
        "category": "business",
        "min_income": 0,
        "max_income": 500000,
        "min_amount": 100000,
        "max_amount": 5000000,
        "interest_rate_min": 6.0,
        "interest_rate_max": 9.0,
        "moratorium_months": [6, 12],
        "eligible_project_types": ["manufacturing", "transport", "agro_processing", "dairy", "services"],
        "cost_coverage_pct": 90,
    },
]


class TestAskAryaChatbot(unittest.TestCase):

    def setUp(self):
        self.dm = DialogueManager(schemes_loader=lambda: MOCK_SCHEMES)

    def test_1_exact_keyword_match_profile(self):
        """Profile 1: Higher education loan with exact keyword and eligible bounds"""
        session_id = "test_profile_exact_edu"
        res1 = self.dm.process_message(session_id, "Hello, I want to check loan schemes")
        self.assertIn("Scheduled Caste", res1["reply"])

        # Confirm SC
        res2 = self.dm.process_message(session_id, "Yes, I belong to Scheduled Caste")
        self.assertIn("gender", res2["reply"].lower())

        # Give Gender: Female
        res2b = self.dm.process_message(session_id, "Female")
        self.assertIn("annual family income", res2b["reply"].lower())

        # Give income 2.5 Lakh
        res3 = self.dm.process_message(session_id, "Annual family income is 2,50,000 INR")
        self.assertIn("purpose", res3["reply"].lower())

        # Exact purpose: higher education
        res4 = self.dm.process_message(session_id, "I need it for higher education in engineering")
        self.assertTrue(any(w in res4["reply"].lower() for w in ["loan", "funding", "amount"]))

        # Give loan amount 6 Lakh and state
        res5 = self.dm.process_message(session_id, "6 lakh rupees in Uttar Pradesh")
        
        # Schemes should be matched!
        matched = res5.get("matched_schemes", [])
        self.assertGreater(len(matched), 0, "Should match NSFDC-EDU-01")
        top_scheme = matched[0]
        self.assertEqual(top_scheme["scheme_id"], "NSFDC-EDU-01")
        self.assertIn("match_reason", top_scheme)
        self.assertIn("income", top_scheme["match_reason"].lower())
        self.assertIn("higher education", top_scheme["match_reason"].lower().replace("_", " "))

    def test_2_similarity_fallback_profile(self):
        """Profile 2: Loose phrasing requiring semantic / token fallback ('tailoring and boutique shop')"""
        eligible = ["higher_education", "vocational", "tailoring", "beauty_parlor", "dairy", "manufacturing"]
        matched_label = match_project_type("I want to start a tailoring and boutique shop", eligible)
        self.assertEqual(matched_label, "tailoring")

        # Now test through rule engine
        profile = {
            "income": 120000,
            "amount": 80000,
            "project_type": matched_label,
            "category": "self_employment",
        }
        recs = recommend_schemes(profile, MOCK_SCHEMES)
        self.assertGreater(len(recs), 0)
        # Mahila Samriddhi Yojana has lower interest rate (4.0%) than Micro Finance (5.0%) -> must be sorted first
        self.assertEqual(recs[0]["scheme_id"], "NSFDC-MCY-01")
        self.assertEqual(recs[0]["interest_rate_min"], 4.0)
        self.assertIn("tailoring", recs[0]["match_reason"].lower())

    def test_3_multi_slot_single_shot_short_circuit(self):
        """Profile 3: Extract multiple slots from a single detailed user utterance"""
        text = "Yes I am female SC from Lucknow Uttar Pradesh. My annual income is 1.8 lakh and I need 1 lakh loan for a tailoring shop"
        slots = extract_slots(text)
        
        self.assertEqual(slots.get("sc_status"), "YES")
        self.assertEqual(slots.get("gender"), "FEMALE")
        self.assertEqual(slots.get("state"), "Uttar Pradesh")
        self.assertEqual(slots.get("district"), "Lucknow")
        self.assertEqual(slots.get("income"), 180000.0)
        self.assertEqual(slots.get("amount"), 100000.0)
        self.assertIn("tailoring", slots.get("project_type", ""))

        # Direct dialogue single-turn completion
        session_id = "test_single_shot_circuit"
        res = self.dm.process_message(session_id, text)
        self.assertIn("matched_schemes", res)
        self.assertGreater(len(res["matched_schemes"]), 0)
        scheme_ids = [s["scheme_id"] for s in res["matched_schemes"]]
        self.assertIn("NSFDC-MCY-01", scheme_ids)

    def test_4_non_sc_rejection_handling(self):
        """Profile 4: User explicitly states non-SC category (General/OBC)"""
        session_id = "test_non_sc"
        self.dm.process_message(session_id, "Hi")
        res = self.dm.process_message(session_id, "No, I am from General category")
        
        self.assertIn("Scheduled Caste", res["reply"])
        self.assertEqual(res.get("matched_schemes", []), [])
        
        # Session slot reflects rejection
        session_data = self.dm.get_session(session_id)
        self.assertEqual(session_data["slots"].get("sc_status"), "NO")
        self.assertEqual(session_data["stage"], "NON_SC")

    def test_5_no_match_over_ceiling_profile(self):
        """Profile 5: Income or amount exceeds NSFDC ceilings (No match case)"""
        profile = {
            "income": 1200000,  # 12 Lakh (Ceiling is 3.5L to 5L)
            "amount": 800000,
            "project_type": "higher_education",
        }
        recs = recommend_schemes(profile, MOCK_SCHEMES)
        self.assertEqual(len(recs), 0, "Should return 0 matches for income above ceiling")

        # Test through Dialogue Manager
        session_id = "test_over_ceiling"
        self.dm.process_message(session_id, "Yes SC")
        self.dm.process_message(session_id, "Female")
        self.dm.process_message(session_id, "Income 1500000") # 15 Lakh
        self.dm.process_message(session_id, "higher education")
        res = self.dm.process_message(session_id, "loan amount 500000 in Delhi")

        self.assertTrue("no exact match found" in res["reply"].lower() or "no direct scheme matched" in res["reply"].lower())
        self.assertEqual(len(res.get("matched_schemes", [])), 0)

    def test_6_contextual_amount_parsing(self):
        """Helper test: Ensures income and loan amount in one sentence are distinguished accurately"""
        text = "My family income is 2 lakh and I require 7.5 lakh loan for dairy"
        income, amount = parse_contextual_amounts(text)
        self.assertEqual(income, 200000)
        self.assertEqual(amount, 750000)

    def test_7_channel_partner_routing_followup(self):
        """Follow-up test: 'show nearest partner' returns localized SCA details"""
        session_id = "test_partner_followup"
        self.dm.process_message(session_id, "Yes SC female, income 2 lakh, dairy business, amount 2 lakh in Bihar Patna")
        res = self.dm.process_message(session_id, "show nearest partner")
        
        self.assertIn("Channel Partner", res["reply"])
        self.assertIn("Bihar", res["reply"])

    def test_8_gender_specific_schemes(self):
        """Profile 8: Gender filtering (Male applicants cannot access Mahila Samriddhi Yojana)"""
        # Male applicant for tailoring
        male_profile = {
            "income": 120000,
            "amount": 80000,
            "project_type": "tailoring",
            "gender": "MALE",
        }
        male_recs = recommend_schemes(male_profile, MOCK_SCHEMES)
        male_ids = [s["scheme_id"] for s in male_recs]
        self.assertNotIn("NSFDC-MCY-01", male_ids, "Male applicant must be excluded from Mahila Samriddhi Yojana")

        # Female applicant for tailoring
        female_profile = {
            "income": 120000,
            "amount": 80000,
            "project_type": "tailoring",
            "gender": "FEMALE",
        }
        female_recs = recommend_schemes(female_profile, MOCK_SCHEMES)
        female_ids = [s["scheme_id"] for s in female_recs]
        self.assertIn("NSFDC-MCY-01", female_ids, "Female applicant must be matched with Mahila Samriddhi Yojana")
        self.assertEqual(female_recs[0]["scheme_id"], "NSFDC-MCY-01")
        self.assertIn("women", female_recs[0]["match_reason"].lower())

    def test_9_disability_pwd_schemes_and_concessions(self):
        """Profile 9: Divyangjan / PwD detection and prioritization of NHFDC/ADIP schemes"""
        # Test NLU extraction of disability
        slots = extract_slots("I am a disabled person from Delhi with 40% handicap")
        self.assertTrue(slots.get("is_pwd"))

        pwd_schemes_mock = [
            {
                "scheme_id": "NHFDC-DSY-01",
                "name": "Divyangjan Swavalamban Yojana",
                "category": "self_employment",
                "target_beneficiary": "pwd",
                "min_income": 0,
                "max_income": 500000,
                "min_amount": 10000,
                "max_amount": 5000000,
                "interest_rate_min": 4.0,
                "interest_rate_max": 6.0,
                "eligible_project_types": ["small_business", "dairy", "tailoring", "shop", "general"],
                "cost_coverage_pct": 100,
            },
            {
                "scheme_id": "MSJE-ADIP-01",
                "name": "ADIP Scheme (100% Grant for Assistive Aids)",
                "category": "assistive_grant",
                "target_beneficiary": "pwd",
                "min_income": 0,
                "max_income": 360000,
                "min_amount": 0,
                "max_amount": 50000,
                "interest_rate_min": 0.0,
                "interest_rate_max": 0.0,
                "eligible_project_types": ["assistive_device", "wheelchair", "motorized_tricycle"],
                "cost_coverage_pct": 100,
            }
        ]

        # Recommend for PwD user
        profile = {
            "income": 150000,
            "amount": 40000,
            "project_type": "assistive_device",
            "purpose": "assistive_grant",
            "is_pwd": True,
        }
        recs = recommend_schemes(profile, pwd_schemes_mock)
        self.assertGreater(len(recs), 0)
        self.assertEqual(recs[0]["scheme_id"], "MSJE-ADIP-01")
        self.assertIn("divyangjan", recs[0]["match_reason"].lower())

    def test_10_all_subsidies_comprehensive_faq(self):
        """Test 10: Inquiries on all types of subsidy return patient, exhaustive breakdown"""
        session_id = "test_subsidy_faq"
        res = self.dm.process_message(session_id, "What are all the types of subsidy and grants available for me?")
        self.assertIn("Capital Subsidy", res["reply"])
        self.assertIn("Interest Subvention", res["reply"])
        self.assertIn("ADIP", res["reply"])
        self.assertIn("35%", res["reply"])

    def test_11_multilingual_dialogue_support(self):
        """Test 11: Ask Arya supports multiple languages seamlessly (Hindi, Bengali, English)"""
        # Hindi
        res_hi = self.dm.process_message("sess_hi", "hello", lang="hi")
        self.assertIn("अनुसूचित जाति", res_hi["reply"])

        # Bengali
        res_bn = self.dm.process_message("sess_bn", "hello", lang="bn")
        self.assertIn("তপশিলি জাতি", res_bn["reply"])

        # English
        res_en = self.dm.process_message("sess_en", "hello", lang="en")
        self.assertIn("Scheduled Caste", res_en["reply"])

    def test_12_multilingual_slot_extraction_accuracy(self):
        """Test 12: High-accuracy NLU extraction across regional languages (Tamil, Telugu, Bengali, Marathi, Hindi)"""
        # 1. Tamil: Female, tailoring, 1.5 lakh loan
        slots_ta = extract_slots("நான் பெண், எனக்கு தையல் தொழில் செய்ய 1.5 லட்சம் கடன் தேவை")
        self.assertEqual(slots_ta.get("gender"), "FEMALE")
        self.assertEqual(slots_ta.get("project_type"), "tailoring")
        self.assertEqual(slots_ta.get("amount"), 150000.0)

        # 2. Bengali: PwD, dairy, 2.5 lakh
        slots_bn = extract_slots("আমি প্রতিবন্ধী, ডেইরি ফার্মের জন্য আড়াই লাখ টাকা চাই")
        self.assertTrue(slots_bn.get("is_pwd"))
        self.assertEqual(slots_bn.get("project_type"), "dairy")
        self.assertEqual(slots_bn.get("amount"), 250000.0)

        # 3. Telugu: Male, kirana shop, 50,000
        slots_te = extract_slots("నేను పురుషుడు, కిరాణా షాపు కోసం యాభై వేలు రుణం కావాలి")
        self.assertEqual(slots_te.get("gender"), "MALE")
        self.assertEqual(slots_te.get("project_type"), "grocery")
        self.assertEqual(slots_te.get("amount"), 50000.0)

        # 4. Hindi Devanagari numerals: SC status, annual income 1.5 lakh, loan 2 lakh, tailoring
        slots_hi = extract_slots("हाँ SC, मेरी वार्षिक आय १.५ लाख और २ लाख का सिलाई ऋण चाहिए")
        self.assertEqual(slots_hi.get("sc_status"), "YES")
        self.assertEqual(slots_hi.get("income"), 150000.0)
        self.assertEqual(slots_hi.get("amount"), 200000.0)
        self.assertEqual(slots_hi.get("project_type"), "tailoring")

        # 5. Marathi: Female, tailoring, 1 lakh
        slots_mr = extract_slots("मी महिला आहे, मला शिलाई कामासाठी १ लाख कर्ज हवे")
        self.assertEqual(slots_mr.get("gender"), "FEMALE")
        self.assertEqual(slots_mr.get("project_type"), "tailoring")
        self.assertEqual(slots_mr.get("amount"), 100000.0)

    def test_13_all_23_official_languages_supported(self):
        """Test 13: All 23 official Indian languages are loaded in multilingual engine without fallback loss"""
        from chatbot.multilingual import LANG_PACKS, get_language_pack, format_multilingual_recommendations
        expected_languages = [
            "hi", "en", "bn", "mr", "te", "ta", "gu", "kn", "ml", "pa",
            "or", "as", "ur", "mai", "sat", "ks", "ne", "sd", "kok", "doi",
            "mni", "brx", "sa"
        ]
        for lang in expected_languages:
            self.assertIn(lang, LANG_PACKS, f"Language pack missing: {lang}")
            pack = get_language_pack(lang)
            self.assertIn("greeting", pack)
            self.assertIn("sc_quick_replies", pack)
            self.assertIn("gender_prompt", pack)
            self.assertIn("income_prompt", pack)
            self.assertIn("purpose_prompt", pack)
            self.assertIn("amount_prompt", pack)
            self.assertIn("location_prompt", pack)
            self.assertIn("found_schemes", pack)
            self.assertIn("no_schemes", pack)

        # Test localized scheme recommendations in Tamil
        mock_matched = [MOCK_SCHEMES[1]]  # MSY
        profile_ta = {"gender": "FEMALE", "project_type": "tailoring", "income": 120000, "amount": 100000}
        recs_ta = format_multilingual_recommendations(profile_ta, mock_matched, lang_code="ta")
        self.assertIn("வட்டி விகிதம்", recs_ta)  # Interest Rate localized
        self.assertIn("அதிகபட்ச கடன் வரம்பு", recs_ta)  # Max Loan Limit localized

    def test_14_boundary_values_income_and_amount(self):
        """Test 14: Exact boundary values (min_income, max_income, min_amount, max_amount) must qualify"""
        # Exactly at min_amount (₹10,000) and min_income (₹0)
        profile_min = {
            "income": 0.0,
            "amount": 10000.0,
            "project_type": "higher_education",
            "gender": "MALE",
        }
        recs_min = recommend_schemes(profile_min, MOCK_SCHEMES)
        self.assertTrue(any(s["scheme_id"] == "NSFDC-EDU-01" for s in recs_min), "Min boundary must qualify")

        # Exactly at max_income (₹5,00,000) and max_amount (₹20,00,000) for ELS
        profile_max = {
            "income": 500000.0,
            "amount": 2000000.0,
            "project_type": "higher_education",
            "gender": "MALE",
        }
        recs_max = recommend_schemes(profile_max, MOCK_SCHEMES)
        self.assertTrue(any(s["scheme_id"] == "NSFDC-EDU-01" for s in recs_max), "Max boundary must qualify")

    def test_15_malformed_and_missing_user_input(self):
        """Test 15: Empty strings, punctuation noise, and malformed inputs do not crash dialogue manager"""
        session_id = "test_malformed_sess"
        # Empty string
        res_empty = self.dm.process_message(session_id, "")
        self.assertIsNotNone(res_empty.get("reply"))

        # Punctuation / symbol noise
        res_symbols = self.dm.process_message(session_id, "!@#$%^&*()_+=-~`")
        self.assertIsNotNone(res_symbols.get("reply"))

        # Arbitrary non-lexical words
        res_gibberish = self.dm.process_message(session_id, "qwerty asdfgh zxcvbn")
        self.assertIsNotNone(res_gibberish.get("reply"))

    def test_16_genuine_tie_deterministic_tiebreaker(self):
        """Test 16: Two schemes with identical parameters sort deterministically by interest rate / scheme_id"""
        tied_schemes = [
            {
                "scheme_id": "TIE-SCHEME-B",
                "name": "Scheme B",
                "category": "business",
                "min_income": 0,
                "max_income": 300000,
                "min_amount": 50000,
                "max_amount": 500000,
                "interest_rate_min": 6.0,
                "interest_rate_max": 6.0,
                "moratorium_months": [3],
                "eligible_project_types": ["shop"],
            },
            {
                "scheme_id": "TIE-SCHEME-A",
                "name": "Scheme A",
                "category": "business",
                "min_income": 0,
                "max_income": 300000,
                "min_amount": 50000,
                "max_amount": 500000,
                "interest_rate_min": 5.0,  # Lower interest rate must win tiebreaker
                "interest_rate_max": 5.0,
                "moratorium_months": [3],
                "eligible_project_types": ["shop"],
            },
        ]
        profile = {"income": 150000, "amount": 200000, "project_type": "shop"}
        matches = recommend_schemes(profile, tied_schemes)
        self.assertEqual(len(matches), 2)
        # Scheme A has lower interest rate (5.0% vs 6.0%) -> must be ranked first
        self.assertEqual(matches[0]["scheme_id"], "TIE-SCHEME-A")
        self.assertEqual(matches[1]["scheme_id"], "TIE-SCHEME-B")

    def test_17_determinism_test(self):
        """Test 17: Same input profile run repeatedly returns 100% identical scheme matches and rankings"""
        profile = {
            "income": 180000,
            "amount": 75000,
            "project_type": "tailoring",
            "gender": "FEMALE",
            "is_pwd": False
        }
        run1 = recommend_schemes(profile, MOCK_SCHEMES)
        run2 = recommend_schemes(profile, MOCK_SCHEMES)

        self.assertEqual(len(run1), len(run2))
        for s1, s2 in zip(run1, run2):
            self.assertEqual(s1["scheme_id"], s2["scheme_id"])
            self.assertEqual(s1["ranking_score"], s2["ranking_score"])
            self.assertEqual(s1["match_reason"], s2["match_reason"])

    def test_18_explicit_english_only_guard(self):
        """Test 18: Non-Latin-script inputs trigger explicit English-only guard message"""
        session_id = "test_guard_hindi"
        res = self.dm.process_message(session_id, "मुझे एक सिलाई मशीन के लिए ऋण चाहिए")
        self.assertIn("currently supports English input", res["reply"])
        self.assertIn("Start in English", res["quick_replies"])

    def test_19_conflict_resolution_detection(self):
        """Test 19: Re-stating an existing slot with a materially different value triggers conflict confirmation"""
        session_id = "test_conflict_sess"
        # 1. State income first time
        self.dm.process_message(session_id, "Hello, I am SC female")
        self.dm.process_message(session_id, "My annual income is 1.5 lakh")

        session = self.dm.get_session(session_id)
        self.assertEqual(session["slots"]["income"], 150000.0)

        # 2. State income a second time with different value (3.5 lakh)
        res_conflict = self.dm.process_message(session_id, "Actually my income is 3.5 lakh")
        self.assertIn("Conflict Detected", res_conflict["reply"])
        self.assertIn("₹150,000", res_conflict["reply"])
        self.assertIn("₹350,000", res_conflict["reply"])
        self.assertTrue(any("350,000" in qr for qr in res_conflict["quick_replies"]))

    def test_20_mid_flow_correction_command(self):
        """Test 20: Mid-flow correction command updates slot directly without resetting conversation"""
        session_id = "test_correction_sess"
        self.dm.process_message(session_id, "Hello, SC female")
        self.dm.process_message(session_id, "Income 1.5 lakh")
        self.dm.process_message(session_id, "Need 50000 for tailoring")

        session = self.dm.get_session(session_id)
        self.assertEqual(session["slots"]["amount"], 50000.0)

        # Execute correction command
        res_correct = self.dm.process_message(session_id, "change amount to 1.2 lakh")
        self.assertTrue("Updated your" in res_correct["reply"] and "loan requirement" in res_correct["reply"])
        self.assertEqual(session["slots"]["amount"], 120000.0)
        # Verify previous slots remain intact
        self.assertEqual(session["slots"]["income"], 150000.0)
        self.assertEqual(session["slots"]["gender"], "FEMALE")

    def test_21_session_expiry_and_inactivity_reset(self):
        """Test 21: Inactivity past TTL clears slots and provides polite reset notice"""
        import time
        session_id = "test_expiry_sess"
        self.dm.process_message(session_id, "Hello, SC female with income 2 lakh")
        session = self.dm.get_session(session_id)
        self.assertIsNotNone(session["slots"]["gender"])

        # Simulate 20 minutes of inactivity
        session["last_activity_time"] = time.time() - (20 * 60)

        # Next message should trigger expiry reset
        res_expired = self.dm.process_message(session_id, "Hello again")
        self.assertIn("expired after 15 minutes of inactivity", res_expired["reply"])

    def test_22_proper_no_match_closest_scheme_explanation(self):
        """Test 22: When profile exceeds ceilings, advisor states what would make citizen eligible"""
        from chatbot.rule_engine import compute_no_match_explanation
        profile_over = {
            "income": 650000.0,
            "amount": 200000.0,
            "project_type": "higher_education",
            "gender": "MALE",
        }
        reason = compute_no_match_explanation(profile_over, MOCK_SCHEMES)
        self.assertIn("No exact match found", reason)
        self.assertIn("under ₹500,000", reason)
        self.assertIn("Education Loan Scheme", reason)

    def test_23_solve_it_and_repetition_frustration(self):
        """Test 23: Direct problem solving ('solve it') and repetition complaint handling"""
        sess = "test_solve_sess"
        # User asks to solve it
        res_solve = self.dm.process_message(sess, "can you please solve it for me?")
        self.assertIn("Actionable Solution Blueprint", res_solve["reply"])
        self.assertIn("Micro Funding", res_solve["reply"])

        # User expresses repetition frustration
        res_frust = self.dm.process_message(sess, "always sent same message whatever I write")
        self.assertIn("apologize for sounding repetitive", res_frust["reply"])
        self.assertIn("Mahila Samriddhi Yojana", res_frust["reply"])


if __name__ == "__main__":
    unittest.main(verbosity=2)

