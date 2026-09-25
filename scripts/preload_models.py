#!/usr/bin/env python3
"""
AryaSaarthi — Ask Arya Model Preloader
One-time setup script to download and cache spaCy ('en_core_web_sm')
and SentenceTransformers ('all-MiniLM-L6-v2') ahead of demo.
After running this once, the demo machine requires ZERO internet at runtime.
"""

import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

def preload_sentence_transformers():
    print("⏳ Preloading SentenceTransformer model: all-MiniLM-L6-v2...")
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        # Warmup inference
        emb = model.encode("I want to start a tailoring boutique", convert_to_tensor=True)
        print(f"✅ SentenceTransformer loaded and cached successfully. Embedding shape: {emb.shape}")
        return True
    except Exception as e:
        print(f"⚠️ SentenceTransformer download/load error: {e}")
        return False

def preload_spacy():
    print("⏳ Preloading spaCy model: en_core_web_sm...")
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_web_sm")
        except Exception:
            print("Downloading en_core_web_sm via spacy.cli...")
            from spacy.cli import download
            download("en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        doc = nlp("I need 2 lakh rupees for education in Lucknow")
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        print(f"✅ spaCy loaded and verified. Detected entities: {entities}")
        return True
    except Exception as e:
        print(f"⚠️ spaCy preload error: {e}")
        return False

def preload_ollama():
    print("⏳ Checking Ollama local daemon and phi3:mini...")
    try:
        import requests
        res = requests.get("http://127.0.0.1:11434/api/tags", timeout=2.0)
        if res.status_code == 200:
            models = [m.get("name", "") for m in res.json().get("models", [])]
            if any("phi3" in m for m in models):
                print(f"✅ Ollama running with phi3:mini available: {models}")
                return True
            else:
                print(f"ℹ️ Ollama is running, but phi3:mini not yet pulled. Run: 'ollama pull phi3:mini'")
                return True
        else:
            print("⚠️ Ollama returned non-200 status.")
            return False
    except Exception as e:
        print(f"ℹ️ Ollama not reachable on 127.0.0.1:11434 ({e}). Fallback NLU chain is ready.")
        return False

def preload_trocr():
    print("⏳ Preloading TrOCR Transformer model for handwriting...")
    try:
        from transformers import TrOCRProcessor, VisionEncoderDecoderModel
        model_name = os.getenv("TROCR_MODEL_NAME", "microsoft/trocr-small-handwritten")
        processor = TrOCRProcessor.from_pretrained(model_name)
        model = VisionEncoderDecoderModel.from_pretrained(model_name)
        print(f"✅ TrOCR loaded and cached successfully ({model_name}).")
        return True
    except Exception as e:
        print(f"⚠️ TrOCR preload error: {e}")
        return False

def preload_ml_models():
    print("⏳ Preloading AryaSaarthi Local ML Intent & Recommendation Models...")
    try:
        from ml import load_models, load_schemes_knowledge, predict_intent, extract_profile, recommend_schemes
        vec, clf = load_models()
        schemes = load_schemes_knowledge()
        test_pred = predict_intent("I am a farmer from West Bengal. I have 2 acres of land. What schemes can I get?")
        test_ent = extract_profile("I am a farmer from West Bengal. I have 2 acres of land.")
        test_recs = recommend_schemes(test_ent, top_k=2)
        print(f"✅ Local ML Models loaded successfully! Intent: {test_pred['intent']} (Conf: {test_pred['confidence']}), {len(schemes)} verified schemes cached.")
        return True
    except Exception as e:
        print(f"⚠️ Local ML preload error: {e}")
        return False

def main():
    print("=" * 60)
    print("AryaSaarthi — Offline AI/NLU Model Preloader")
    print("=" * 60)
    
    ml_ok = preload_ml_models()
    ollama_ok = preload_ollama()
    st_ok = preload_sentence_transformers()
    spacy_ok = preload_spacy()
    trocr_ok = preload_trocr()

    print("=" * 60)
    if ml_ok:
        print("🎉 AryaSaarthi 100% Local ML Engine is online, preloaded, and ready for offline demo!")
    else:
        print("ℹ️ Preload completed with fallback warnings. AryaSaarthi fallback engine remains active.")
    print("=" * 60)

if __name__ == "__main__":
    main()
