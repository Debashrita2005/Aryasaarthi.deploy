"""
AryaSaarthi ML Pipeline — Unseen Test Dataset Evaluation Script
Evaluates trained models against data/test_queries.json.
Reports Accuracy, Precision, Recall, F1, Per-intent performance, and Confusion Matrix.
"""

import json
from pathlib import Path
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

from .predict import predict_intent
from .entity_extractor import extract_profile


ROOT_DIR = Path(__file__).resolve().parent.parent
TEST_DATA_PATH = ROOT_DIR / "data" / "test_queries.json"


def evaluate():
    """Runs evaluation on unseen test dataset."""
    if not TEST_DATA_PATH.exists():
        raise FileNotFoundError(f"Test queries file not found: {TEST_DATA_PATH}")

    with open(TEST_DATA_PATH, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    y_true = []
    y_pred = []
    queries = []
    confidences = []

    print("\n" + "=" * 70)
    print("AryaSaarthi — Unseen Test Set Evaluation (data/test_queries.json)")
    print("=" * 70)

    for item in test_cases:
        q = item["query"]
        expected = item["expected_intent"]
        result = predict_intent(q)
        pred_intent = result["intent"]
        conf = result["confidence"]

        queries.append(q)
        y_true.append(expected)
        y_pred.append(pred_intent)
        confidences.append(conf)

        match_str = "MATCH" if expected == pred_intent else "MISMATCH"
        print(f"[{match_str}] Conf: {conf:.2f} | Exp: {expected:20s} | Pred: {pred_intent:20s} | Query: '{q[:50]}'")

    acc = float(accuracy_score(y_true, y_pred))
    p, r, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)

    print("\n" + "=" * 70)
    print("Aggregate Unseen Test Metrics")
    print("=" * 70)
    print(f"Total Test Cases:    {len(y_true)}")
    print(f"Accuracy:            {acc:.4f} ({acc*100:.1f}%)")
    print(f"Weighted Precision:  {p:.4f}")
    print(f"Weighted Recall:     {r:.4f}")
    print(f"Weighted F1-Score:   {f1:.4f}")
    print(f"Macro F1-Score:      {macro_f1:.4f}")
    print(f"Average Confidence:  {float(np.mean(confidences)):.4f}")
    print("=" * 70)

    unique_labels = sorted(list(set(y_true + y_pred)))
    print("\nPer-Intent Classification Report (Unseen Test):\n")
    print(classification_report(y_true, y_pred, labels=unique_labels, zero_division=0))

    cm = confusion_matrix(y_true, y_pred, labels=unique_labels)
    print("Confusion Matrix:")
    print("Labels:", unique_labels)
    print(cm)

    # Also test Entity Extraction on test queries with ground-truth entities
    print("\n" + "=" * 70)
    print("Entity Extraction Verification on Test Queries")
    print("=" * 70)
    entity_tests = 0
    entity_correct = 0
    for item in test_cases:
        expected_entities = item.get("entities", {})
        if expected_entities:
            extracted = extract_profile(item["query"])
            all_match = True
            for k, expected_v in expected_entities.items():
                entity_tests += 1
                extracted_v = extracted.get(k)
                if extracted_v == expected_v or (isinstance(expected_v, float) and extracted_v is not None and abs(extracted_v - expected_v) < 1e-4):
                    entity_correct += 1
                else:
                    all_match = False
                    print(f"Entity Mismatch on query '{item['query']}': Key '{k}' expected {expected_v}, got {extracted_v}")
            if all_match:
                print(f"[OK] Extracted: {extracted} from '{item['query'][:45]}...'")

    if entity_tests > 0:
        ent_acc = (entity_correct / entity_tests) * 100
        print(f"\nEntity Field Accuracy: {entity_correct}/{entity_tests} ({ent_acc:.1f}%)")

    return {
        "accuracy": round(acc, 4),
        "f1_score": round(float(f1), 4),
        "macro_f1": round(float(macro_f1), 4),
        "precision": round(float(p), 4),
        "recall": round(float(r), 4)
    }


if __name__ == "__main__":
    evaluate()
