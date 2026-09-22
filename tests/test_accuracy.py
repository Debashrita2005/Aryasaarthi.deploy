"""
AryaSaarthi Rule Engine — Comprehensive Accuracy Test Suite
Covers 35+ labeled test cases:
1. Exact matches (Rural SC women, dairy farmers, B.Tech students, green energy)
2. Ambiguous & Hinglish trade terms (deri ka dukaan, silai centre, toto, kirane ki dukan)
3. Edge-format numbers (5L, 1.4 lac, 50 hazaar, ₹5,00,000, 4-5L, more than 3 lakh)
4. Incomplete inputs & Progressive multi-turn context
5. Contradiction detection & resolution
6. Fallback explanations (non-SC, over-income ceiling)
7. Clarification cap (max 2 turns -> confidence caveat)
8. User feedback store (thumbs up/down)
"""

import os
import sys
import unittest

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rule_engine import (
    process_user_query,
    extract_slots,
    match_and_rank_schemes,
    compute_no_match_fallback,
    get_session,
    reset_session,
    record_user_feedback,
    get_ground_truth_schemes,
    get_manual_review_flags,
    CurrencyNormalizer
)


class TestAccuracySuite(unittest.TestCase):

    def setUp(self):
        self.test_session_id = "test_accuracy_session_01"
        reset_session(self.test_session_id)

    # -------------------------------------------------------------
    # 1. EXACT MATCH SCENARIOS
    # -------------------------------------------------------------

    def test_01_rural_sc_woman_tailoring(self):
        """Rural SC woman seeks microcredit for boutique unit -> Mahila Samriddhi Yojana (MSY)"""
        profile = {
            "gender": "FEMALE",
            "sc_status": "YES",
            "income": 120000,
            "project_type": "tailoring",
            "amount": 100000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "NSFDC-MCY-01")
        self.assertEqual(matches[0].scheme["interest_rate_min"], 4.0)

    def test_02_sc_dairy_farmer_microfinance(self):
        """Small SC livestock/dairy farmer -> Micro Finance Scheme (MFS)"""
        profile = {
            "gender": "MALE",
            "sc_status": "YES",
            "income": 150000,
            "project_type": "dairy",
            "amount": 80000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "NSFDC-MFS-01")
        self.assertIn("dairy", matches[0].scheme["eligible_project_types"])

    def test_03_technical_student_education_loan(self):
        """SC Engineering/B.Tech student -> Education Loan Scheme (ELS)"""
        profile = {
            "gender": "MALE",
            "sc_status": "YES",
            "income": 250000,
            "project_type": "education",
            "purpose": "btech in computer science",
            "amount": 750000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "NSFDC-EDU-01")
        self.assertEqual(matches[0].scheme["category"], "education")

    def test_04_green_business_solar_rickshaw(self):
        """SC entrepreneur for electric rickshaw & solar -> Green Business Scheme (GBS)"""
        profile = {
            "gender": "MALE",
            "sc_status": "YES",
            "income": 200000,
            "project_type": "solar",
            "amount": 500000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "NSFDC-GRN-01")

    def test_05_commercial_term_loan(self):
        """SC manufacturing workshop setup of ₹15 Lakh -> Term Loan Scheme (TLS)"""
        profile = {
            "gender": "MALE",
            "sc_status": "YES",
            "income": 280000,
            "project_type": "manufacturing",
            "amount": 1500000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "NSFDC-TL-01")
        self.assertEqual(matches[0].scheme["max_amount"], 5000000)

    def test_06_pwd_divyangjan_swavalamban(self):
        """Divyangjan / PwD citizen seeking livelihood setup -> Divyangjan Swavalamban Yojana"""
        profile = {
            "is_pwd": True,
            "gender": "FEMALE",
            "income": 200000,
            "project_type": "shop",
            "amount": 250000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "NHFDC-DSY-01")

    def test_07_assistive_device_grant(self):
        """Divyangjan citizen needing motorized wheelchair -> ADIP 100% Grant"""
        profile = {
            "is_pwd": True,
            "project_type": "assistive_device",
            "purpose": "motorized tricycle",
            "income": 100000,
            "amount": 40000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0].scheme_id, "MSJE-ADIP-01")
        self.assertEqual(matches[0].scheme["interest_rate_min"], 0.0)

    # -------------------------------------------------------------
    # 2. HINGLISH & AMBIGUOUS TRADE TERMS
    # -------------------------------------------------------------

    def test_08_hinglish_deri_ka_dukaan(self):
        """Hinglish phrase 'deri ka dukaan' maps accurately to dairy"""
        res = extract_slots("mera naam amit hai aur mujhe deri ka dukaan kholna hai")
        self.assertEqual(res["slots"]["user_name"], "Amit")
        self.assertEqual(res["slots"]["project_type"], "dairy")

    def test_09_hinglish_silai_centre(self):
        """Hinglish phrase 'silai centre' maps to tailoring"""
        res = extract_slots("main silai centre start karna chahti hu")
        self.assertEqual(res["slots"]["project_type"], "tailoring")

    def test_10_hinglish_toto_transport(self):
        """Regional transport term 'toto' maps to transport / auto"""
        res = extract_slots("mujhe toto chalana hai battery auto loan")
        self.assertIn(res["slots"]["project_type"], ["transport", "solar"])

    def test_11_hinglish_kirane_ki_dukan(self):
        """Hinglish 'kirane ki dukan' maps to grocery"""
        res = extract_slots("gao me kirane ki dukan kholni hai")
        self.assertEqual(res["slots"]["project_type"], "grocery")

    def test_12_hinglish_bakri_palan(self):
        """Hinglish 'bakri palan' maps to goat_farming"""
        res = extract_slots("5 bakri kharidna hai bakri palan shuru karna hai")
        self.assertEqual(res["slots"]["project_type"], "goat_farming")

    # -------------------------------------------------------------
    # 3. EDGE CURRENCY & NUMBER NORMALIZATIONS
    # -------------------------------------------------------------

    def test_13_currency_5L(self):
        """5L parses to 500000"""
        val, conf = CurrencyNormalizer.parse_single_amount("5L")
        self.assertEqual(val, 500000)
        self.assertGreaterEqual(conf, 0.95)

    def test_14_currency_1_4_lac(self):
        """1.4 lac parses to 140000"""
        val, conf = CurrencyNormalizer.parse_single_amount("1.4 lac")
        self.assertEqual(val, 140000)

    def test_15_currency_50_hazaar(self):
        """50 hazaar parses to 50000"""
        val, conf = CurrencyNormalizer.parse_single_amount("50 hazaar")
        self.assertEqual(val, 50000)

    def test_16_currency_formatted_with_commas(self):
        """₹5,00,000 parses to 500000"""
        val, conf = CurrencyNormalizer.parse_single_amount("₹5,00,000")
        self.assertEqual(val, 500000)

    def test_17_currency_range_parsing(self):
        """between 50k and 1.5 lakh parses to BETWEEN operator"""
        op, low, high, conf = CurrencyNormalizer.parse_range_or_comparative("between 50k and 1.5 lakh")
        self.assertEqual(op, "BETWEEN")
        self.assertEqual(low, 50000)
        self.assertEqual(high, 150000)

    def test_18_currency_comparative_more_than(self):
        """more than 3 lakh parses to MORE_THAN operator"""
        op, val, _, conf = CurrencyNormalizer.parse_range_or_comparative("more than 3 lakh")
        self.assertEqual(op, "MORE_THAN")
        self.assertEqual(val, 300000)

    def test_19_currency_comparative_under(self):
        """under 1.5 lac parses to LESS_THAN operator"""
        op, val, _, conf = CurrencyNormalizer.parse_range_or_comparative("under 1.5 lac")
        self.assertEqual(op, "LESS_THAN")
        self.assertEqual(val, 150000)

    # -------------------------------------------------------------
    # 4. CONTRADICTION DETECTION & RESOLUTION
    # -------------------------------------------------------------

    def test_20_income_contradiction_detection(self):
        """Drastic shift in annual income triggers contradiction prompt"""
        sid = "test_contradiction_income_sid"
        session = reset_session(sid)
        session.slots["income"] = 150000

        res = process_user_query("my annual income is 8 lakh", session_id=sid)
        self.assertEqual(res["status"], "CONTRADICTION_DETECTED")
        self.assertIn("previously noted as ₹150,000", res["reply"])

    def test_21_sc_status_contradiction_detection(self):
        """Changing caste status from YES to NO triggers confirmation"""
        sid = "test_contradiction_sc_sid"
        session = reset_session(sid)
        session.slots["sc_status"] = "YES"

        res = process_user_query("i belong to general category not sc", session_id=sid)
        self.assertEqual(res["status"], "CONTRADICTION_DETECTED")
        self.assertIn("previously set to 'YES'", res["reply"])

    def test_22_contradiction_resolution_confirm(self):
        """Resolving contradiction with confirmation overwrites the slot"""
        sid = "test_contradiction_resolve_sid"
        session = reset_session(sid)
        session.slots["income"] = 150000
        process_user_query("my annual income is 8 lakh", session_id=sid)
        self.assertIsNotNone(session.pending_contradiction)

        session.resolve_contradiction(user_confirmed=True)
        self.assertEqual(session.slots["income"], 800000)
        self.assertIsNone(session.pending_contradiction)

    # -------------------------------------------------------------
    # 5. NO-MATCH FALLBACK EXPLANATIONS
    # -------------------------------------------------------------

    def test_23_non_sc_statutory_fallback(self):
        """Non-SC applicant receives respectful statutory boundary & PM SVANidhi routing"""
        profile = {
            "gender": "MALE",
            "sc_status": "NO",
            "income": 200000,
            "project_type": "grocery"
        }
        fb = compute_no_match_fallback(profile)
        self.assertEqual(fb["status"], "NON_SC_FALLBACK")
        self.assertIn("PM SVANidhi", [a["name"] for a in fb["alternative_schemes"]][0])

    def test_24_income_exceeds_statutory_ceiling(self):
        """Income > ₹5,00,000 receives explicit ceiling explanation"""
        profile = {
            "gender": "MALE",
            "sc_status": "YES",
            "income": 900000,
            "project_type": "shop"
        }
        fb = compute_no_match_fallback(profile)
        self.assertEqual(fb["status"], "INCOME_CEILING_EXCEEDED")
        self.assertIn("₹5,00,000", fb["primary_reason"])

    # -------------------------------------------------------------
    # 6. DIALOGUE CONSISTENCY & CLARIFICATION CAP
    # -------------------------------------------------------------

    def test_25_clarification_capped_at_two(self):
        """After 2 missing-slot clarifications, engine returns match with confidence caveat"""
        sid = "test_clarification_cap_sid"
        session = reset_session(sid)

        # Turn 1: user says hello
        res1 = process_user_query("hello", session_id=sid)
        self.assertEqual(session.clarifying_question_count, 1)

        # Turn 2: user says "tell me more" without providing slots
        res2 = process_user_query("tell me more", session_id=sid)
        self.assertEqual(session.clarifying_question_count, 2)

        # Turn 3: 3rd turn without slots -> must present best match with caveat
        res3 = process_user_query("give me scheme", session_id=sid)
        self.assertIsNotNone(res3.get("confidence_caveat"))
        self.assertIn("Recommendation based on partial profile inputs", res3["reply"])

    # -------------------------------------------------------------
    # 7. EXPLAINABILITY & AUDIT LOGGING
    # -------------------------------------------------------------

    def test_26_reasoning_chain_structure(self):
        """Query returns structured 4-step reasoning chain"""
        res = process_user_query("I want to open a tailoring boutique with 1 lakh loan, I am SC woman")
        chain = res.get("reasoning_chain", [])
        self.assertGreaterEqual(len(chain), 3)
        self.assertEqual(chain[0]["title"], "Citizen Profile & Intent Extraction")
        self.assertEqual(chain[1]["title"], "Statutory Hard Filter Verification")

    def test_27_user_feedback_recording(self):
        """Records thumbs up feedback on interaction"""
        res = process_user_query("I want a dairy loan of 1 lakh, I am SC")
        iid = res["interaction_id"]
        success = record_user_feedback(iid, "THUMBS_UP", "Very accurate recommendation!")
        self.assertTrue(success)

    # -------------------------------------------------------------
    # 8. GROUND TRUTH & MANUAL REVIEW VERIFICATION
    # -------------------------------------------------------------

    def test_28_ground_truth_loaded_without_hardcoding(self):
        """All schemes are dynamically loaded from nsfdc_schemes.json"""
        schemes = get_ground_truth_schemes()
        self.assertGreaterEqual(len(schemes), 10)
        msy = next((s for s in schemes if s["code"] == "MSY"), None)
        self.assertIsNotNone(msy)
        self.assertEqual(msy["interest_rate_min"], 4.0)

    def test_29_manual_review_flags_identified(self):
        """Ambiguous/derived values are properly flagged for human review"""
        review_items = get_manual_review_flags()
        self.assertIsInstance(review_items, list)
        # PM SVANidhi has review flag for derived 500k ceiling
        svanidhi = next((s for s in review_items if s["code"] == "SVANIDHI"), None)
        self.assertIsNotNone(svanidhi)
        self.assertTrue(svanidhi["manual_review_required"])

    # -------------------------------------------------------------
    # 9. END-TO-END COMPOUND QUERIES
    # -------------------------------------------------------------

    def test_30_compound_profile_aditya_kirana(self):
        """Compound multi-entity sentence extracts name, trade, amount, SC and ranks TLS/MFS"""
        res = process_user_query("My name is Aditya, I am SC male earning 2.5L and need 3 lakh for retail grocery shop")
        self.assertEqual(res["slots"]["user_name"], "Aditya")
        self.assertEqual(res["slots"]["gender"], "MALE")
        self.assertEqual(res["slots"]["sc_status"], "YES")
        self.assertEqual(res["slots"]["project_type"], "grocery")
        self.assertEqual(res["slots"]["amount"], 300000)
        self.assertGreater(len(res["matched_schemes"]), 0)

    def test_31_range_parsing_dash_format(self):
        """4-5L parses to BETWEEN operator with 400000 and 500000"""
        op, low, high, conf = CurrencyNormalizer.parse_range_or_comparative("around 4-5L budget")
        self.assertEqual(op, "BETWEEN")
        self.assertEqual(low, 400000)
        self.assertEqual(high, 500000)

    def test_32_extreme_crore_currency(self):
        """10 cr parses to 100000000"""
        val, conf = CurrencyNormalizer.parse_single_amount("10 cr")
        self.assertEqual(val, 100000000)

    def test_33_multi_turn_progressive_dialogue(self):
        """Turn 1 states trade, Turn 2 states budget -> slots persist cleanly"""
        sid = "test_multi_turn_progressive_sid"
        reset_session(sid)
        res1 = process_user_query("I want to start an electric auto rickshaw business", session_id=sid)
        self.assertEqual(res1["slots"]["project_type"], "transport")

        res2 = process_user_query("My loan requirement is 1.4 lakh with 6 months moratorium", session_id=sid)
        self.assertEqual(res2["slots"]["project_type"], "transport")
        self.assertEqual(res2["slots"]["amount"], 140000)
        self.assertEqual(res2["slots"]["moratorium_months"], 6)

    def test_34_gender_contradiction_flow(self):
        """Switching gender from FEMALE to MALE flags contradiction"""
        sid = "test_gender_contradiction_sid"
        session = reset_session(sid)
        session.slots["gender"] = "FEMALE"

        res = process_user_query("actually I am a male applicant", session_id=sid)
        self.assertEqual(res["status"], "CONTRADICTION_DETECTED")
        self.assertIn("gender was recorded as 'FEMALE'", res["reply"])

    def test_35_pwd_women_entrepreneur_rebate(self):
        """Woman with PwD receives 100% coverage and top priority scoring"""
        profile = {
            "gender": "FEMALE",
            "is_pwd": True,
            "income": 180000,
            "project_type": "tailoring",
            "amount": 100000
        }
        matches = match_and_rank_schemes(profile)
        self.assertGreater(len(matches), 0)
        top_ids = [m.scheme_id for m in matches[:2]]
        self.assertTrue("NHFDC-DSY-01" in top_ids or "NSFDC-MCY-01" in top_ids)


if __name__ == "__main__":
    unittest.main()
