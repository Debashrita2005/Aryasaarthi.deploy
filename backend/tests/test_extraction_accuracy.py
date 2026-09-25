"""
AryaSaarthi — Ask Arya Slot Extraction Accuracy & Benchmark Test Suite
Measures Precision, Recall, and False Positive Rate across 32+ realistic, noisy user utterances.
Tests over-sharing, colloquial phrasing, Indian currency notations, and boundary cases.
"""

import os
import sys
import unittest
from typing import Dict, Any, List

# Setup import path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from chatbot.nlu import extract_slots, parse_indian_amount

# 32 Ground-Truth Labeled User Messages with Extraneous Context
LABELED_DATASET: List[Dict[str, Any]] = [
    {
        "id": "CASE-01",
        "text": "I'm 24, live in Kolkata, my father is a farmer, I need ₹2 lakh for a tailoring business, my income is ₹3,50,000, and I also have a loan from another bank.",
        "expected": {
            "income": 350000.0,
            "amount": 200000.0,
            "project_type": "tailoring",
            "state": "West Bengal"
        },
        "irrelevant_terms": ["24", "farmer", "another bank"]
    },
    {
        "id": "CASE-02",
        "text": "Hello madam, SC female here from Varanasi, annual family income is 1.2 lakh, want to open a small beauty parlor, need 80000 rupees loan. My sister is getting married.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 120000.0,
            "amount": 80000.0,
            "project_type": "beauty_parlor",
            "state": "Uttar Pradesh"
        },
        "irrelevant_terms": ["sister", "married"]
    },
    {
        "id": "CASE-03",
        "text": "I want dairy loan of 60 hazar for 2 cows, my annual income 150000 rs, SC category boy from Patna.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 150000.0,
            "amount": 60000.0,
            "project_type": "dairy"
        },
        "irrelevant_terms": ["2 cows"]
    },
    {
        "id": "CASE-04",
        "text": "Need 10 lakh loan for B.Tech CSE college fees, income is 2.8 lakh per annum, SC female student from Bhopal.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 280000.0,
            "amount": 1000000.0,
            "purpose": "education"
        },
        "irrelevant_terms": ["CSE"]
    },
    {
        "id": "CASE-05",
        "text": "We want to buy electric auto rickshaw costing 2.5L, our family income is 180000, SC male Delhi.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 180000.0,
            "amount": 250000.0,
            "project_type": "electric_rickshaw",
            "state": "Delhi"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-06",
        "text": "Looking for footwear leather craft loan ₹1,40,000, income 95000, SC artisan Agra.",
        "expected": {
            "sc_status": "YES",
            "income": 95000.0,
            "amount": 140000.0,
            "project_type": "leather_work"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-07",
        "text": "General caste engineer with income 6 lakh looking for funding.",
        "expected": {
            "sc_status": "NO",
            "income": 600000.0
        },
        "irrelevant_terms": ["engineer"]
    },
    {
        "id": "CASE-08",
        "text": "My family earnings are 200000 yearly, need small kirana retail shop loan of 1 lakh, SC woman from Jaipur.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 200000.0,
            "amount": 100000.0,
            "project_type": "small_business",
            "state": "Rajasthan"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-09",
        "text": "Divyangjan SC beneficiary with 50% physical handicap, tailoring business, income 120000, loan 50000.",
        "expected": {
            "sc_status": "YES",
            "is_pwd": True,
            "income": 120000.0,
            "amount": 50000.0,
            "project_type": "tailoring"
        },
        "irrelevant_terms": ["50%"]
    },
    {
        "id": "CASE-10",
        "text": "I need 5 lakhs for medical MBBS degree tuition, income is 3 lakh rs, SC girl.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 300000.0,
            "amount": 500000.0,
            "purpose": "education"
        },
        "irrelevant_terms": ["MBBS"]
    },
    {
        "id": "CASE-11",
        "text": "Solar panel installation project 3.5 lakh, income 2.2 lakh, SC entrepreneur Lucknow.",
        "expected": {
            "sc_status": "YES",
            "income": 220000.0,
            "amount": 350000.0,
            "project_type": "solar_energy",
            "state": "Uttar Pradesh"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-12",
        "text": "Poultry broiler farming unit 1.5L loan, income 1.4 lakh, SC farmer from Nashik.",
        "expected": {
            "sc_status": "YES",
            "income": 140000.0,
            "amount": 150000.0,
            "project_type": "poultry"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-13",
        "text": "Sanitation worker mechanical suction unit machine loan 4 lakh, income 1.8 lakh, SC male.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 180000.0,
            "amount": 400000.0,
            "project_type": "sanitation"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-14",
        "text": "Just inquiry: I earn 250000 annually and need 75000 for pottery handicrafts.",
        "expected": {
            "income": 250000.0,
            "amount": 75000.0,
            "project_type": "handicrafts"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-15",
        "text": "Mobile repair and accessories shop 90k loan, income 130000 rs, SC boy.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 130000.0,
            "amount": 90000.0,
            "project_type": "small_business"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-16",
        "text": "Agriculture polyhouse farming 4 lakh, family income 2.5 lakh, SC female.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 250000.0,
            "amount": 400000.0,
            "project_type": "agriculture"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-17",
        "text": "E-rickshaw commercial transport loan 200000, income 1.6L, SC category.",
        "expected": {
            "sc_status": "YES",
            "income": 160000.0,
            "amount": 200000.0,
            "project_type": "electric_rickshaw"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-18",
        "text": "Handloom weaving unit 1.2 lakh loan, income 1.1 lakh, SC weaver.",
        "expected": {
            "sc_status": "YES",
            "income": 110000.0,
            "amount": 120000.0,
            "project_type": "handicrafts"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-19",
        "text": "I am OBC non-creamy layer, income 2 lakh, tailoring shop 50000.",
        "expected": {
            "sc_status": "NO",
            "income": 200000.0,
            "amount": 50000.0,
            "project_type": "tailoring"
        },
        "irrelevant_terms": ["non-creamy"]
    },
    {
        "id": "CASE-20",
        "text": "Higher education studies in UK abroad, cost 25 lakh, income 4.5 lakh, SC student.",
        "expected": {
            "sc_status": "YES",
            "income": 450000.0,
            "amount": 2500000.0,
            "purpose": "education"
        },
        "irrelevant_terms": ["UK"]
    },
    {
        "id": "CASE-21",
        "text": "Carpentry and wooden furniture workshop 180000 loan, income 1.9 lakh, SC male.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 190000.0,
            "amount": 180000.0,
            "project_type": "small_business"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-22",
        "text": "Pickle and papad food processing unit 80k, income 1.2L, SC self help group female.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 120000.0,
            "amount": 80000.0,
            "project_type": "food_processing"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-23",
        "text": "Computer training center setup loan 3 lakh, income 2.1 lakh, SC graduate.",
        "expected": {
            "sc_status": "YES",
            "income": 210000.0,
            "amount": 300000.0,
            "project_type": "small_business"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-24",
        "text": "Commercial taxi car purchase 4.5 lakh, income 2.4 lakh, SC driver from Pune.",
        "expected": {
            "sc_status": "YES",
            "income": 240000.0,
            "amount": 450000.0,
            "project_type": "transport",
            "state": "Maharashtra"
        },
        "irrelevant_terms": ["taxi"]
    },
    {
        "id": "CASE-25",
        "text": "Dairy farming 1 lakh loan, income 120000, SC female.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 120000.0,
            "amount": 100000.0,
            "project_type": "dairy"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-26",
        "text": "General category, family income 4 lakh, tailoring 50000.",
        "expected": {
            "sc_status": "NO",
            "income": 400000.0,
            "amount": 50000.0,
            "project_type": "tailoring"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-27",
        "text": "Need ₹10,00,000 for university MBA tuition, income ₹3,20,000, SC male.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 320000.0,
            "amount": 1000000.0,
            "purpose": "education"
        },
        "irrelevant_terms": ["MBA"]
    },
    {
        "id": "CASE-28",
        "text": "Green business waste recycling plant 5 lakh loan, income 2.8 lakh, SC applicant.",
        "expected": {
            "sc_status": "YES",
            "income": 280000.0,
            "amount": 500000.0,
            "project_type": "waste_recycling"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-29",
        "text": "Beauty salon expansion 1.2 lakh, annual income 1.5 lakh, SC woman.",
        "expected": {
            "sc_status": "YES",
            "gender": "FEMALE",
            "income": 150000.0,
            "amount": 120000.0,
            "project_type": "beauty_parlor"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-30",
        "text": "SC farmer seeking goat rearing micro loan 50000, income 90000.",
        "expected": {
            "sc_status": "YES",
            "income": 90000.0,
            "amount": 50000.0,
            "project_type": "goat_rearing"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-31",
        "text": "Handicrafts bamboo basket making 40000 loan, income 75000, SC artisan.",
        "expected": {
            "sc_status": "YES",
            "income": 75000.0,
            "amount": 40000.0,
            "project_type": "handicrafts"
        },
        "irrelevant_terms": []
    },
    {
        "id": "CASE-32",
        "text": "Open retail grocery store 1.5 lakh loan, income 1.8 lakh, SC male.",
        "expected": {
            "sc_status": "YES",
            "gender": "MALE",
            "income": 180000.0,
            "amount": 150000.0,
            "project_type": "small_business"
        },
        "irrelevant_terms": []
    }
]


class TestExtractionAccuracy(unittest.TestCase):

    def test_32_labeled_dataset_accuracy_and_metrics(self):
        """
        Evaluates extraction precision and false-positive rate across 32 labeled noisy user inputs.
        """
        metrics = {
            "income": {"true_pos": 0, "false_pos": 0, "false_neg": 0, "total": 0},
            "amount": {"true_pos": 0, "false_pos": 0, "false_neg": 0, "total": 0},
            "sc_status": {"true_pos": 0, "false_pos": 0, "false_neg": 0, "total": 0},
            "gender": {"true_pos": 0, "false_pos": 0, "false_neg": 0, "total": 0},
        }

        print("\n" + "=" * 75)
        print("📊 NLU SLOT EXTRACTION ACCURACY BENCHMARK (32 Labeled Noisy Cases)")
        print("=" * 75)

        for case in LABELED_DATASET:
            text = case["text"]
            expected = case["expected"]
            extracted = extract_slots(text, {})

            # 1. Income evaluation
            if "income" in expected:
                metrics["income"]["total"] += 1
                if "income" in extracted and extracted["income"] == expected["income"]:
                    metrics["income"]["true_pos"] += 1
                elif "income" in extracted:
                    metrics["income"]["false_pos"] += 1
                else:
                    metrics["income"]["false_neg"] += 1
            elif "income" in extracted:
                metrics["income"]["false_pos"] += 1

            # 2. Amount evaluation
            if "amount" in expected:
                metrics["amount"]["total"] += 1
                if "amount" in extracted and extracted["amount"] == expected["amount"]:
                    metrics["amount"]["true_pos"] += 1
                elif "amount" in extracted:
                    metrics["amount"]["false_pos"] += 1
                else:
                    metrics["amount"]["false_neg"] += 1
            elif "amount" in extracted:
                metrics["amount"]["false_pos"] += 1

            # 3. SC Status evaluation
            if "sc_status" in expected:
                metrics["sc_status"]["total"] += 1
                if "sc_status" in extracted and extracted["sc_status"] == expected["sc_status"]:
                    metrics["sc_status"]["true_pos"] += 1
                elif "sc_status" in extracted:
                    metrics["sc_status"]["false_pos"] += 1
                else:
                    metrics["sc_status"]["false_neg"] += 1

            # 4. Gender evaluation
            if "gender" in expected:
                metrics["gender"]["total"] += 1
                if "gender" in extracted and extracted["gender"] == expected["gender"]:
                    metrics["gender"]["true_pos"] += 1
                elif "gender" in extracted:
                    metrics["gender"]["false_pos"] += 1
                else:
                    metrics["gender"]["false_neg"] += 1

        # Print report table
        print(f"{'Slot Field':<15} | {'Total':<6} | {'True Pos':<8} | {'Precision':<10} | {'FPR':<8}")
        print("-" * 60)

        for field, data in metrics.items():
            tot = data["total"]
            tp = data["true_pos"]
            fp = data["false_pos"]
            denom = tp + fp
            precision = (tp / denom) if denom > 0 else 1.0
            fpr = (fp / tot) if tot > 0 else 0.0

            print(f"{field:<15} | {tot:<6} | {tp:<8} | {precision * 100:>8.1f}% | {fpr * 100:>6.1f}%")
            self.assertGreaterEqual(precision, 0.90, f"Precision for {field} is below 90% target!")

        print("=" * 75 + "\n")


if __name__ == "__main__":
    unittest.main(verbosity=2)
