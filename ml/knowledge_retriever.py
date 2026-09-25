"""
AryaSaarthi ML Pipeline — Local Knowledge Retriever
Uses TF-IDF + Cosine Similarity over local verified schemes dataset (data/schemes.json).
Never fabricates missing scheme information.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .preprocess import clean_text


ROOT_DIR = Path(__file__).resolve().parent.parent
SCHEMES_DATA_PATH = ROOT_DIR / "data" / "schemes.json"

_schemes_cache: Optional[List[Dict[str, Any]]] = None
_retriever_vectorizer: Optional[TfidfVectorizer] = None
_scheme_matrix = None


def load_schemes_knowledge() -> List[Dict[str, Any]]:
    """Loads schemes from data/schemes.json or backend/data/schemes.json."""
    global _schemes_cache
    if _schemes_cache is not None:
        return _schemes_cache

    path = SCHEMES_DATA_PATH
    if not path.exists():
        alt_path = ROOT_DIR / "backend" / "data" / "schemes.json"
        if alt_path.exists():
            path = alt_path
        else:
            raise FileNotFoundError(f"Schemes database not found at {path}")

    with open(path, "r", encoding="utf-8") as f:
        _schemes_cache = json.load(f)

    return _schemes_cache


def init_retriever():
    """Builds TF-IDF index across verified scheme text fields."""
    global _retriever_vectorizer, _scheme_matrix
    schemes = load_schemes_knowledge()

    corpus = []
    for s in schemes:
        name = s.get("name", "")
        desc = s.get("description", "")
        benefits = s.get("benefits", "")
        cat = s.get("category", "")
        keywords = " ".join(s.get("keywords", []))

        elig = s.get("eligibility_data", {})
        elig_text = ""
        if isinstance(elig, dict):
            occs = " ".join(elig.get("occupations", []))
            states = " ".join(elig.get("states", []))
            crops = " ".join(elig.get("crops", []))
            elig_text = f"{occs} {states} {crops}"

        doc_text = f"{name} {cat} {desc} {benefits} {keywords} {elig_text}"
        corpus.append(clean_text(doc_text))

    _retriever_vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
    _scheme_matrix = _retriever_vectorizer.fit_transform(corpus)


def retrieve_schemes(query: str, top_k: int = 3, threshold: float = 0.05) -> List[Dict[str, Any]]:
    """
    Retrieves top_k most relevant schemes based on semantic TF-IDF cosine similarity.
    Returns list of schemes with relevance score.
    """
    if not query or not query.strip():
        return []

    if _retriever_vectorizer is None or _scheme_matrix is None:
        init_retriever()

    schemes = load_schemes_knowledge()
    q_clean = clean_text(query)
    q_vec = _retriever_vectorizer.transform([q_clean])

    if q_vec.nnz == 0:
        # Fallback to direct substring keyword matching
        results = []
        q_lower = query.lower()
        for s in schemes:
            name = s.get("name", "").lower()
            keywords = [k.lower() for k in s.get("keywords", [])]
            if any(k in q_lower for k in keywords) or name in q_lower:
                s_copy = dict(s)
                s_copy["similarity_score"] = 0.50
                results.append(s_copy)
        return results[:top_k]

    sims = cosine_similarity(q_vec, _scheme_matrix)[0]
    top_indices = np.argsort(sims)[::-1]

    results = []
    for idx in top_indices:
        score = float(sims[idx])
        if score >= threshold:
            s_copy = dict(schemes[idx])
            s_copy["similarity_score"] = round(score, 4)
            results.append(s_copy)
        if len(results) >= top_k:
            break

    return results
