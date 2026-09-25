"""
AryaSaarthi Backend Integration Test Suite
Validates the FastAPI backend, authentication, database, profile extraction,
scheme knowledge base, eligibility engine, and deterministic chat pipeline.
Zero external LLM API calls.
"""

import unittest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal, init_db
from backend.app.models.user import User
from backend.app.models.profile import Profile
from backend.app.models.conversation import Conversation, Message


class TestBackendIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)
        # Ensure app lifespan events run
        with cls.client:
            pass

    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_health_check(self):
        """Validates GET /health returns loaded ML model and connected database."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["ml_model"], "loaded")
        self.assertEqual(data["database"], "connected")

    def test_02_auth_register_and_login(self):
        """Validates user registration, duplicate prevention, and JWT login."""
        email = "testfarmer_bengal@aryasaarthi.gov.in"
        # Cleanup existing test user and profile
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            self.db.query(Profile).filter(Profile.user_id == existing.id).delete()
            self.db.query(Conversation).filter(Conversation.user_id == existing.id).delete()
            self.db.delete(existing)
            self.db.commit()

        # 1. Register
        reg_payload = {
            "name": "Subhashish Roy",
            "email": email,
            "password": "SecurePassword123!"
        }
        reg_res = self.client.post("/auth/register", json=reg_payload)
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.json()
        self.assertIn("access_token", reg_data)
        self.assertEqual(reg_data["email"], email)

        # 2. Duplicate registration rejected
        dup_res = self.client.post("/auth/register", json=reg_payload)
        self.assertEqual(dup_res.status_code, 400)

        # 3. Login
        login_res = self.client.post("/auth/login", json={
            "email": email,
            "password": "SecurePassword123!"
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.json()
        self.assertIn("access_token", login_data)

        # 4. GET /auth/me with Bearer token
        token = login_data["access_token"]
        me_res = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["name"], "Subhashish Roy")

    def test_03_profile_management_and_extraction(self):
        """Tests profile extraction, retrieval, and updating."""
        # Test standalone extraction without authentication
        extract_res = self.client.post("/api/profile/extract", json={
            "text": "I am a farmer from West Bengal and I have 2 acres of land."
        })
        self.assertEqual(extract_res.status_code, 200)
        extracted = extract_res.json()
        self.assertEqual(extracted.get("occupation"), "farmer")
        self.assertEqual(extracted.get("state"), "West Bengal")
        self.assertEqual(extracted.get("land_area"), 2.0)
        self.assertEqual(extracted.get("land_unit"), "acre")

        # Test authenticated profile update
        login_res = self.client.post("/auth/login", json={
            "email": "testfarmer_bengal@aryasaarthi.gov.in",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        put_res = self.client.put("/api/profile", headers=headers, json={
            "occupation": "farmer",
            "state": "West Bengal",
            "district": "Nadia",
            "land_area": 2.0,
            "land_unit": "acre",
            "annual_income": 120000.0
        })
        self.assertEqual(put_res.status_code, 200)
        profile = put_res.json()
        self.assertEqual(profile["occupation"], "farmer")
        self.assertEqual(profile["state"], "West Bengal")
        self.assertEqual(profile["annual_income"], 120000.0)

    def test_04_schemes_knowledge_and_search(self):
        """Tests schemes listing, detail retrieval, and semantic search."""
        # 1. List schemes
        list_res = self.client.get("/api/schemes")
        self.assertEqual(list_res.status_code, 200)
        schemes = list_res.json()
        self.assertGreater(len(schemes), 0)

        # 2. Get specific scheme by ID
        scheme_res = self.client.get("/api/schemes/SCHEME_PMKISAN_01")
        self.assertEqual(scheme_res.status_code, 200)
        pm_kisan = scheme_res.json()
        self.assertEqual(pm_kisan["name"], "PM-KISAN Samman Nidhi")

        # 3. Semantic search
        search_res = self.client.post("/api/schemes/search", json={
            "query": "tractor power tiller mechanization subsidy",
            "top_k": 3
        })
        self.assertEqual(search_res.status_code, 200)
        search_data = search_res.json()
        self.assertGreater(len(search_data["results"]), 0)
        top_res = search_data["results"][0]
        self.assertEqual(top_res["scheme_id"], "SCHEME_SMAM_06")

    def test_05_eligibility_and_recommendations(self):
        """Tests eligibility check and transparent recommendation ranking."""
        # 1. Eligibility Check
        elig_res = self.client.post("/api/eligibility/check", json={
            "scheme_id": "SCHEME_PMKISAN_01",
            "profile": {
                "occupation": "farmer",
                "state": "West Bengal",
                "land_area": 2.0,
                "age": 35
            }
        })
        self.assertEqual(elig_res.status_code, 200)
        elig_data = elig_res.json()
        self.assertEqual(elig_data["status"], "eligible")

        # 2. Recommendations
        rec_res = self.client.post("/api/recommendations", json={
            "profile_override": {
                "occupation": "farmer",
                "state": "West Bengal",
                "land_area": 2.0
            },
            "top_k": 3
        })
        self.assertEqual(rec_res.status_code, 200)
        rec_data = rec_res.json()
        self.assertGreater(len(rec_data["recommendations"]), 0)
        top_rec = rec_data["recommendations"][0]
        self.assertGreaterEqual(top_rec["match_score"], 0.70)
        self.assertIn("disclaimer", top_rec)

    def test_06_final_end_to_end_demo_chat_flow(self):
        """
        Validates the complete Final Demo prompt workflow:
        User: 'I am a farmer from West Bengal. I have 2 acres of land. What schemes can I get?'
        Backend executes:
        - Intent: scheme_search
        - Entities: occupation=farmer, state=West Bengal, land_area=2.0
        - Profile updated
        - Recommendation & Eligibility evaluated
        - Deterministic, explainable response returned with verified schemes
        - Conversation history persisted
        """
        login_res = self.client.post("/auth/login", json={
            "email": "testfarmer_bengal@aryasaarthi.gov.in",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Send the exact demo prompt query
        demo_query = "I am a farmer from West Bengal. I have 2 acres of land. What schemes can I get?"
        chat_res = self.client.post("/api/chat", headers=headers, json={"message": demo_query})
        self.assertEqual(chat_res.status_code, 200)
        chat_data = chat_res.json()

        # 1. Intent check
        self.assertEqual(chat_data["intent"], "scheme_search")
        self.assertGreaterEqual(chat_data["confidence"], 0.70)

        # 2. Entity extraction check
        entities = chat_data.get("extracted_entities", {})
        self.assertEqual(entities.get("occupation"), "farmer")
        self.assertEqual(entities.get("state"), "West Bengal")
        self.assertEqual(entities.get("land_area"), 2.0)

        # 3. Recommended schemes check
        schemes = chat_data["schemes"]
        self.assertGreater(len(schemes), 0)
        scheme_ids = [s["scheme_id"] for s in schemes]
        self.assertTrue(
            "SCHEME_KRISHAK_BANDHU_04" in scheme_ids or "SCHEME_PMKISAN_01" in scheme_ids,
            f"Expected Krishak Bandhu or PM-KISAN, got {scheme_ids}"
        )

        # 4. Message content check
        self.assertIn("verified knowledge base", chat_data["message"])

        # 5. Conversation ID persisted
        conv_id = chat_data["conversation_id"]
        self.assertIsNotNone(conv_id)

        # 6. Multi-turn context: user asks for documents in next turn
        follow_up = self.client.post("/api/chat", headers=headers, json={
            "message": "What documents do I need for Krishak Bandhu?",
            "conversation_id": conv_id
        })
        self.assertEqual(follow_up.status_code, 200)
        follow_data = follow_up.json()
        self.assertEqual(follow_data["intent"], "scheme_documents")
        self.assertIn("Krishak Bandhu", follow_data["message"])
        self.assertEqual(follow_data["conversation_id"], conv_id)


if __name__ == "__main__":
    unittest.main()
