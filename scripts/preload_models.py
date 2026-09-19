#!/usr/bin/env python3
"""
AryaSaarthi — Ask Arya Model Preloader
One-time setup script to download and cache spaCy ('en_core_web_sm')
and SentenceTransformers ('all-MiniLM-L6-v2') ahead of demo.
After running this once, the demo machine requires ZERO internet at runtime.
"""

import sys
import os

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

def main():
    print("=" * 60)
    print("AryaSaarthi — Offline AI/NLU Model Preloader")
    print("=" * 60)
    
    st_ok = preload_sentence_transformers()
    spacy_ok = preload_spacy()

    print("=" * 60)
    if st_ok and spacy_ok:
        print("🎉 All AI models successfully preloaded and cached for 100% offline demo!")
    else:
        print("ℹ️ Preload completed with fallback warnings. AryaSaarthi fallback engine remains active.")
    print("=" * 60)

if __name__ == "__main__":
    main()
