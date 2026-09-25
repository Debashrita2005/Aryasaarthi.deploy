#!/usr/bin/env python3
"""
CLI helper for Next.js /api/chatbot/upload to run local high-accuracy OCR via EasyOCR and TrOCR.
"""
import sys
import os
import json
import logging

# Suppress verbose warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
logging.getLogger("easyocr").setLevel(logging.ERROR)

def run_ocr(file_path: str, is_handwritten: bool = False):
    try:
        with open(file_path, "rb") as f:
            image_bytes = f.read()

        sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
        from chatbot.ocr import extract_text_from_image

        res = extract_text_from_image(image_bytes, is_handwritten=is_handwritten)
        print(json.dumps({
            "success": True,
            "text": res.get("text", ""),
            "confidence": round(float(res.get("confidence", 0.0)) * 100, 1),
            "is_low_confidence": res.get("is_low_confidence", False),
            "script": res.get("script_detected", "Latin"),
            "engine": res.get("engine", "easyocr")
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "text": "",
            "confidence": 0.0,
            "is_low_confidence": True
        }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
    
    path = sys.argv[1]
    is_hw = len(sys.argv) > 2 and sys.argv[2].lower() in ["true", "1", "yes"]
    run_ocr(path, is_hw)
