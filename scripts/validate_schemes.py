#!/usr/bin/env python3
"""
AryaSaarthi — Scheme Database Validation Utility
Scans the schemes collection for:
1. Missing mandatory statutory fields (min_income, max_income, min_amount, max_amount, eligible_project_types).
2. Overlapping loan amount slabs within the same category.
3. Gaps in financing coverage where eligible citizens could be left without a scheme.
4. Income eligibility ceiling mismatches against official NSFDC policy (₹3,00,000 / ₹5,00,000).
"""

import os
import sys
import json
from typing import List, Dict, Any

# Locate data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "backend", "data", "chatbot_schemes.json")
if not os.path.exists(DATA_FILE):
    # Try relative to scripts/
    DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", "data", "chatbot_schemes.json")

REQUIRED_FIELDS = [
    "scheme_id",
    "name",
    "category",
    "min_income",
    "max_income",
    "min_amount",
    "max_amount",
    "interest_rate_min",
    "interest_rate_max",
    "eligible_project_types"
]

def load_schemes() -> List[Dict[str, Any]]:
    if not os.path.exists(DATA_FILE):
        print(f"❌ Error: Data file not found at {DATA_FILE}")
        sys.exit(1)
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_schemes():
    schemes = load_schemes()
    print(f"\n=======================================================")
    print(f"🔍 AryaSaarthi Scheme Validator — Scanning {len(schemes)} Schemes")
    print(f"=======================================================\n")

    warnings_count = 0
    errors_count = 0

    # 1. Field Completeness Check
    print("--- 1. Mandatory Field Completeness Check ---")
    for s in schemes:
        sid = s.get("scheme_id", "UNKNOWN")
        name = s.get("name", "Unknown Name")
        missing = [f for f in REQUIRED_FIELDS if f not in s or s[f] is None]
        if missing:
            print(f"❌ ERROR: [{sid}] '{name}' is missing mandatory fields: {', '.join(missing)}")
            errors_count += 1
        else:
            if not isinstance(s["eligible_project_types"], list) or len(s["eligible_project_types"]) == 0:
                print(f"⚠️ WARNING: [{sid}] '{name}' has empty 'eligible_project_types' list.")
                warnings_count += 1
            if s["min_amount"] > s["max_amount"]:
                print(f"❌ ERROR: [{sid}] min_amount (₹{s['min_amount']:,}) > max_amount (₹{s['max_amount']:,})")
                errors_count += 1
            if s["min_income"] > s["max_income"]:
                print(f"❌ ERROR: [{sid}] min_income (₹{s['min_income']:,}) > max_income (₹{s['max_income']:,})")
                errors_count += 1

    if errors_count == 0:
        print("✅ All schemes possess mandatory statutory fields and valid bounds.\n")

    # 2. Group by category and check for overlaps & gaps
    print("--- 2. Category Range Continuity Analysis (Overlaps & Gaps) ---")
    by_category: Dict[str, List[Dict[str, Any]]] = {}
    for s in schemes:
        cat = s.get("category", "general")
        by_category.setdefault(cat, []).append(s)

    for cat, cat_schemes in by_category.items():
        print(f"\n📂 Category: '{cat}' ({len(cat_schemes)} schemes)")
        sorted_by_amount = sorted(cat_schemes, key=lambda x: (x.get("min_amount", 0), x.get("max_amount", 0)))

        for i in range(len(sorted_by_amount) - 1):
            s1 = sorted_by_amount[i]
            s2 = sorted_by_amount[i + 1]

            s1_min, s1_max = s1.get("min_amount", 0), s1.get("max_amount", 0)
            s2_min, s2_max = s2.get("min_amount", 0), s2.get("max_amount", 0)

            # Check overlap
            if s1_max > s2_min:
                overlap_min = s2_min
                overlap_max = min(s1_max, s2_max)
                print(
                    f"  ⚠️ SLAB OVERLAP: [{s1['scheme_id']}] ({s1['name']}) covers ₹{s1_min:,}–₹{s1_max:,} "
                    f"overlapping with [{s2['scheme_id']}] ({s2['name']}) covering ₹{s2_min:,}–₹{s2_max:,} "
                    f"between ₹{overlap_min:,}–₹{overlap_max:,}. "
                    f"NOTE: Multi-attribute ranking will prioritize by interest rate & loan fit."
                )
                warnings_count += 1

            # Check gap
            elif s2_min > s1_max:
                gap_min = s1_max
                gap_max = s2_min
                print(
                    f"  ⚠️ FINANCING GAP: Gap of ₹{gap_min:,}–₹{gap_max:,} between "
                    f"[{s1['scheme_id']}] (max ₹{s1_max:,}) and [{s2['scheme_id']}] (min ₹{s2_min:,})."
                )
                warnings_count += 1

        # Check Income bounds within category
        for s in cat_schemes:
            if s.get("max_income", 0) > 500000:
                print(
                    f"  ⚠️ STATUTORY NOTICE: [{s['scheme_id']}] max_income ₹{s['max_income']:,} "
                    f"exceeds official NSFDC policy ceiling of ₹5,00,000."
                )
                warnings_count += 1

    print("\n=======================================================")
    print(f"📊 Validation Summary: {errors_count} Critical Errors, {warnings_count} Pre-Demo Warnings detected.")
    print(f"=======================================================\n")

    if errors_count > 0:
        sys.exit(1)
    else:
        print("🎯 Database is verified and demo-safe! No fatal schema corruptions.\n")
        sys.exit(0)

if __name__ == "__main__":
    validate_schemes()
