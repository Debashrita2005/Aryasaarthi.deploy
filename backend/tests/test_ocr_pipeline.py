import unittest
import base64
import io
from PIL import Image, ImageDraw, ImageFont
from backend.chatbot.ocr import (
    preprocess_image_bytes,
    extract_text_from_image
)
import asyncio
from backend.chatbot.input_handler import input_handler

class TestOCRPipeline(unittest.TestCase):
    def _create_synthetic_image(self, text: str, width: int = 400, height: int = 150) -> bytes:
        img = Image.new("RGB", (width, height), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        # Draw text at center
        draw.text((20, 50), text, fill=(0, 0, 0))
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return buffer.getvalue()

    def test_image_preprocessing_pipeline(self):
        """Test OpenCV preprocessing steps (grayscale, contrast, deskew) execute cleanly."""
        img_bytes = self._create_synthetic_image("Income: Rs 2,50,000 SC Category")
        processed = preprocess_image_bytes(img_bytes)
        self.assertIsInstance(processed, Image.Image)

    def test_extract_text_from_synthetic_image(self):
        """Test OCR extraction returns structured dict with confidence and text."""
        img_bytes = self._create_synthetic_image("Loan needed 200000 for tailoring")
        result = extract_text_from_image(img_bytes)
        self.assertIsInstance(result, dict)
        self.assertIn("text", result)
        self.assertIn("confidence", result)
        self.assertIn("is_low_confidence", result)
        self.assertIn("script_detected", result)

    def test_blank_corrupted_image_handling(self):
        """Test that blank or corrupted images trigger low confidence gracefully."""
        # 1x1 blank image
        blank_img = Image.new("RGB", (10, 10), color=(255, 255, 255))
        buf = io.BytesIO()
        blank_img.save(buf, format="PNG")
        blank_bytes = buf.getvalue()

        result = extract_text_from_image(blank_bytes)
        self.assertTrue(result["is_low_confidence"] or len(result["text"].strip()) == 0)

        # Corrupted bytes
        corrupt_result = extract_text_from_image(b"not_an_image_bytes_12345")
        self.assertTrue(corrupt_result["is_low_confidence"])
        self.assertLessEqual(corrupt_result["confidence"], 0.2)

    def test_input_handler_with_image_input(self):
        """Test full multi-modal routing of image bytes in input_handler.handle_turn."""
        img_bytes = self._create_synthetic_image("Income 180000 SC Tailoring loan 100000")

        response = asyncio.run(
            input_handler.handle_turn(
                session_id="test_ocr_sess_1",
                text="",
                image_bytes=img_bytes,
                site_preference_lang="en",
                voice_mode=False
            )
        )

        self.assertIn("reply", response)
        self.assertIn("slots", response)
        self.assertIn("resolved_lang", response)
        self.assertEqual(response.get("modality"), "image")

if __name__ == "__main__":
    unittest.main()
