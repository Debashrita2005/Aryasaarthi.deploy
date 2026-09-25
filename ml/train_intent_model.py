"""
AryaSaarthi ML Pipeline — Intent Model Training Script
Trains a TF-IDF + Logistic Regression intent classifier using stratified validation split.
Saves vectorizer, classifier, and model metadata to models/.
"""

import os
import json
import datetime
import logging
from pathlib import Path
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

from .preprocess import clean_text


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ml.train")

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT_DIR / "data" / "intents.json"
MODELS_DIR = ROOT_DIR / "models"


def load_dataset(filepath: Path):
    """Loads intent examples from JSON dataset."""
    if not filepath.exists():
        raise FileNotFoundError(f"Intents dataset not found at {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = []
    labels = []
    intents = data.get("intents", [])

    for item in intents:
        intent_name = item.get("intent")
        examples = item.get("examples", [])
        for ex in examples:
            cleaned = clean_text(ex)
            if cleaned:
                texts.append(cleaned)
                labels.append(intent_name)

    return texts, labels, [item["intent"] for item in intents]


def train():
    """Executes model training, evaluation, and serialization."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("Loading dataset from %s", DATA_PATH)
    texts, labels, unique_intents = load_dataset(DATA_PATH)

    logger.info("Total samples: %d across %d intents", len(texts), len(unique_intents))

    # Stratified 80/20 train/validation split
    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_indices, val_indices = next(sss.split(texts, labels))

    X_train_raw = [texts[i] for i in train_indices]
    y_train = [labels[i] for i in train_indices]
    X_val_raw = [texts[i] for i in val_indices]
    y_val = [labels[i] for i in val_indices]

    logger.info("Training samples: %d, Validation samples: %d", len(X_train_raw), len(X_val_raw))

    # TF-IDF Feature Extraction
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True
    )
    X_train = vectorizer.fit_transform(X_train_raw)
    X_val = vectorizer.transform(X_val_raw)

    # Balanced Logistic Regression Classifier
    classifier = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    )
    classifier.fit(X_train, y_train)

    # Validation Evaluation
    y_pred = classifier.predict(X_val)

    acc = float(accuracy_score(y_val, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_val, y_pred, average="weighted", zero_division=0)
    macro_precision, macro_recall, macro_f1, _ = precision_recall_fscore_support(y_val, y_pred, average="macro", zero_division=0)

    print("\n" + "=" * 60)
    print("AryaSaarthi Intent Classifier — Validation Report")
    print("=" * 60)
    print(f"Accuracy:         {acc:.4f}")
    print(f"Weighted F1:      {f1:.4f}")
    print(f"Macro F1:         {macro_f1:.4f}")
    print(f"Weighted Recall:  {recall:.4f}")
    print(f"Weighted Precision: {precision:.4f}")
    print("=" * 60)
    print("\nDetailed Per-Intent Classification Report:\n")
    print(classification_report(y_val, y_pred, zero_division=0))

    # Save artifacts
    vec_path = MODELS_DIR / "tfidf_vectorizer.pkl"
    clf_path = MODELS_DIR / "intent_classifier.pkl"
    meta_path = MODELS_DIR / "model_metadata.json"

    joblib.dump(vectorizer, vec_path)
    joblib.dump(classifier, clf_path)

    metadata = {
        "model_version": "1.0.0",
        "dataset_version": "1.0.0",
        "model_type": "TF-IDF + Logistic Regression",
        "training_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "training_samples": len(X_train_raw),
        "validation_samples": len(X_val_raw),
        "intent_count": len(classifier.classes_),
        "classes": list(classifier.classes_),
        "accuracy": round(acc, 4),
        "f1_score": round(float(f1), 4),
        "macro_f1": round(float(macro_f1), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4)
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Saved vectorizer to %s", vec_path)
    logger.info("Saved classifier to %s", clf_path)
    logger.info("Saved metadata to %s", meta_path)
    return metadata


if __name__ == "__main__":
    train()
