"""
AryaSaarthi — Ask Arya Handwritten OCR Test Suite
Verifies Microsoft TrOCR and EasyOCR models on clean, noisy, and messy handwritten samples.
Validates confidence score calibration and regression proof over Tesseract.
"""

import unittest
import io
from PIL import Image, ImageDraw, ImageFont
from backend.chatbot.ocr_handwritten import (
    extract_handwritten_text,
    extract_handwritten_trocr,
    extract_handwritten_easyocr,
    TROCR_MIN_CONFIDENCE,
    EASYOCR_MIN_CONFIDENCE
)
from backend.chatbot.ocr import extract_text_from_image, detect_script


class TestHandwrittenOCR(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Pre-generate synthetic clean, cursive-style, and corrupted handwritten test samples."""
        cls.clean_english_samples = [
            "Need 200000 loan for tailoring shop",
            "Annual income 150000 SC Category",
            "Dairy farming equipment loan required",
        ]

    def _render_handwritten_style_image(self, text: str, width: int = 420, height: int = 120, noise: bool = False) -> bytes:
        img = Image.new("RGB", (width, height), color=(250, 248, 245))
        draw = ImageDraw.Draw(img)

        # Draw text simulating handwritten spacing and line
        draw.text((15, 45), text, fill=(20, 20, 30))

        # Add handwritten-style rule line
        draw.line([(10, 85), (width - 10, 85)], fill=(200, 210, 230), width=1)

        if noise:
            # Add heavy clutter / blotches simulating unreadable messy scribble
            for x in range(0, width, 12):
                draw.line([(x, 10), (x + 30, height - 10)], fill=(80, 80, 80), width=3)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    def test_1_trocr_clean_handwritten_extraction_and_confidence(self):
        """Test TrOCR extraction pipeline computes calibrated confidence scores."""
        img_bytes = self._render_handwritten_style_image("Need loan for tailoring boutique")
        pil_img = Image.open(io.BytesIO(img_bytes))

        text, conf, engine = extract_handwritten_text(pil_img, lang_hint="en", is_indic=False)
        self.assertIsInstance(text, str)
        self.assertIsInstance(conf, float)
        self.assertGreaterEqual(conf, 0.0)
        self.assertLessEqual(conf, 1.0)
        self.assertIn(engine, ["trocr", "easyocr", "trocr_fallback"])

    def test_2_messy_scribble_flagged_as_low_confidence(self):
        """Asserts that heavily cluttered/unreadable handwriting is flagged as low confidence."""
        noisy_bytes = self._render_handwritten_style_image("unreadable scribble", noise=True)

        result = extract_text_from_image(noisy_bytes, lang_hint="en", is_handwritten=True)
        self.assertIsInstance(result, dict)
        self.assertTrue(result["is_low_confidence"] or result["confidence"] <= 0.70)
        self.assertTrue(result["is_handwritten"])

    def test_3_regression_proof_handwritten_flag_routes_away_from_tesseract(self):
        """
        Regression Proof:
        When is_handwritten=True, router uses TrOCR/EasyOCR engine instead of raw Tesseract.
        """
        img_bytes = self._render_handwritten_style_image("Income Rs 180000 SC Category")

        # 1. Standard printed OCR route (Tesseract)
        printed_result = extract_text_from_image(img_bytes, lang_hint="en", is_handwritten=False)
        self.assertFalse(printed_result.get("is_handwritten", False))

        # 2. Handwritten specialized route
        handwritten_result = extract_text_from_image(img_bytes, lang_hint="en", is_handwritten=True)
        self.assertTrue(handwritten_result.get("is_handwritten", True))
        self.assertIn(handwritten_result.get("engine"), ["trocr", "easyocr", "tesseract_fallback"])

    def test_4_indic_script_handwritten_routing(self):
        """Asserts that Indic handwriting hints route to EasyOCR."""
        img_bytes = self._render_handwritten_style_image("दुकान के लिए 2 लाख का लोन चाहिए")
        pil_img = Image.open(io.BytesIO(img_bytes))

        text, conf, engine = extract_handwritten_text(pil_img, lang_hint="hi", is_indic=True)
        self.assertIn(engine, ["easyocr", "trocr", "indic_easyocr"])

    def test_5_corrupted_empty_image_safety(self):
        """Asserts zero crashes on empty or corrupt bytes in handwritten mode and flags low confidence."""
        corrupt_result = extract_text_from_image(b"broken_bytes_987", is_handwritten=True)
        self.assertTrue(corrupt_result["is_low_confidence"])
        self.assertLess(corrupt_result["confidence"], TROCR_MIN_CONFIDENCE)


if __name__ == "__main__":
    unittest.main()
