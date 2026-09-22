#!/usr/bin/env python3
"""
AryaSaarthi Rule Engine — Accuracy Evaluation Runner
Runs the labeled test suite, calculates accuracy percentage, categorizes failures
(extraction error vs rule error vs fallback error), and outputs a structured diagnostic report.

Usage:
    python rule_engine/eval.py
"""

import os
import sys
import unittest
import time
from typing import Dict, Any, List

# Setup paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.test_accuracy import TestAccuracySuite
from rule_engine.ground_truth import get_manual_review_flags, get_schema_version
from rule_engine.versioning import get_rule_engine_version_info


def categorize_failure(test_name: str, error_msg: str) -> str:
    """Classifies test failure into root-cause category."""
    name_lower = test_name.lower()
    err_lower = str(error_msg).lower()

    if any(k in name_lower for k in ["hinglish", "currency", "extract", "name", "trade", "slot"]) or "extract" in err_lower:
        return "Extraction Error"
    elif any(k in name_lower for k in ["fallback", "ceiling", "non_sc"]) or "fallback" in err_lower:
        return "Fallback Error"
    else:
        return "Rule Engine Error"


def run_evaluation() -> Dict[str, Any]:
    print("=" * 75)
    print("  ARYASAARTHI — ASK ARYA RULE ENGINE ACCURACY BENCHMARK & EVALUATION")
    print("=" * 75)

    vinfo = get_rule_engine_version_info()
    print(f"📦 Rule Engine Version : {vinfo.get('version', '1.1.0')}")
    print(f"📊 Scheme Master Records: {vinfo.get('scheme_count', 11)} statutory schemes")
    print(f"🔒 SHA-256 Checksum    : {vinfo.get('current_sha256', '')[:16]}...")
    print("-" * 75)

    suite = unittest.TestLoader().loadTestsFromTestCase(TestAccuracySuite)
    total_tests = suite.countTestCases()

    start_time = time.time()
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)
    elapsed = time.time() - start_time

    passed = total_tests - len(result.failures) - len(result.errors)
    accuracy_pct = (passed / total_tests) * 100 if total_tests > 0 else 0.0

    failure_categories: Dict[str, List[Dict[str, str]]] = {
        "Extraction Error": [],
        "Rule Engine Error": [],
        "Fallback Error": []
    }

    for test, traceback in result.failures + result.errors:
        tname = test._testMethodName
        cat = categorize_failure(tname, traceback)
        failure_categories[cat].append({"test": tname, "traceback": traceback[:200]})

    print(f"\n📈 RESULTS SUMMARY:")
    print(f"   • Total Labeled Test Cases: {total_tests}")
    print(f"   • Passed                  : {passed}")
    print(f"   • Failed / Errors         : {len(result.failures) + len(result.errors)}")
    print(f"   • Execution Time          : {elapsed:.3f} seconds")
    print(f"   • Overall Accuracy        : {accuracy_pct:.1f}%\n")

    print("-" * 75)
    print("🔍 ERROR CATEGORIZATION:")
    for cat, items in failure_categories.items():
        count = len(items)
        status_icon = "✅" if count == 0 else "❌"
        print(f"   {status_icon} {cat:<20}: {count} failure(s)")
        for item in items:
            print(f"      ↳ {item['test']}: {item['traceback'].strip()}")

    print("-" * 75)
    print("⚠️  MANUAL REVIEW FLAGS (Requiring Human Verification):")
    review_flags = get_manual_review_flags()
    if review_flags:
        for idx, item in enumerate(review_flags, 1):
            print(f"   {idx}. Scheme: {item['name']} ({item['code']})")
            print(f"      Reason: {item.get('review_notes') or 'Flagged for verification'}")
            print(f"      Statutory Reference: {item.get('statutory_reference', 'N/A')}")
    else:
        print("   ✅ Zero unverified ambiguous data points.")

    print("=" * 75)

    return {
        "total_tests": total_tests,
        "passed": passed,
        "failed": len(result.failures) + len(result.errors),
        "accuracy_pct": round(accuracy_pct, 2),
        "failure_categories": {k: len(v) for k, v in failure_categories.items()},
        "manual_review_items": review_flags,
        "version_info": vinfo
    }


if __name__ == "__main__":
    res = run_evaluation()
    if res["failed"] > 0:
        sys.exit(1)
    sys.exit(0)
