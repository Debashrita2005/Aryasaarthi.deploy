"""
AryaSaarthi Backend Service — Chat Service
Coordinates the end-to-end conversational workflow:
Intent classification -> Profile entity extraction -> Database profile persistence ->
Knowledge retrieval / Recommendations -> Deterministic response templating -> Conversation storage.
Operates 100% locally without external LLM inference APIs.
"""

import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from .ml_service import ml_service
from .scheme_service import scheme_service
from .recommendation_service import recommendation_service
from .eligibility_service import eligibility_service
from ..models.user import User
from ..models.profile import Profile
from ..models.conversation import Conversation, Message


class ChatService:

    @staticmethod
    def process_message(
        db: Session,
        message_text: str,
        conversation_id: Optional[int] = None,
        user: Optional[User] = None
    ) -> Dict[str, Any]:
        """
        Executes the full conversational pipeline:
        1. Maintain conversation session
        2. ML Intent & confidence classification
        3. ML Profile entity extraction & progressive profile persistence
        4. Knowledge retrieval / Recommendation ranking / Eligibility checking
        5. Deterministic, explainable response generation
        6. Message logging in database
        """
        clean_text = message_text.strip()
        user_id = user.id if user else None

        # 1. Retrieve or create Conversation session
        conversation = None
        if conversation_id:
            conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()

        if not conversation:
            conversation = Conversation(user_id=user_id, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
            db.add(conversation)
            db.flush()
        else:
            conversation.updated_at = datetime.utcnow()
            if user_id and not conversation.user_id:
                conversation.user_id = user_id
            db.flush()

        conv_id = conversation.id

        # 2. Retrieve or create Profile for user
        profile_obj = None
        profile_dict = {}
        if user_id:
            profile_obj = db.query(Profile).filter(Profile.user_id == user_id).first()
            if not profile_obj:
                profile_obj = Profile(user_id=user_id)
                db.add(profile_obj)
                db.flush()
            profile_dict = profile_obj.to_dict()

        # 3. ML Intent classification
        intent_res = ml_service.predict_intent(clean_text)
        intent = intent_res.get("intent", "unknown")
        confidence = intent_res.get("confidence", 0.0)

        # 4. ML Entity & profile extraction
        extracted_entities = ml_service.extract_profile(clean_text)

        # Update profile with newly extracted entities
        if extracted_entities and profile_obj:
            for k, v in extracted_entities.items():
                if v is not None and hasattr(profile_obj, k):
                    setattr(profile_obj, k, v)
            profile_obj.updated_at = datetime.utcnow()
            db.flush()
            profile_dict = profile_obj.to_dict()
        elif extracted_entities:
            # Guest session: use in-memory profile dictionary
            profile_dict.update(extracted_entities)

        # 5. Execute domain logic according to intent
        schemes_output = []
        eligibility_output = None
        next_action = None
        bot_reply = ""

        # Case A: greeting
        if intent == "greeting":
            bot_reply = (
                "Namaste! I am Arya, your AI assistant for Indian government schemes and welfare programs. "
                "You can tell me about yourself (for example: *'I am a farmer from West Bengal with 2 acres of land'*), "
                "or ask about loans, subsidies, eligibility, and required documents."
            )
            next_action = "provide_profile_or_ask_scheme"

        # Case B: goodbye
        elif intent == "goodbye":
            bot_reply = "Thank you for using AryaSaarthi. Have a wonderful day, and please feel free to return whenever you need assistance with government schemes!"
            next_action = "session_concluded"

        # Case C: help
        elif intent == "help":
            bot_reply = (
                "Here is how I can assist you:\n"
                "• **Find Schemes**: Tell me your occupation, state, and land/income to see matching schemes.\n"
                "• **Check Eligibility**: Ask if you qualify for schemes like PM-KISAN, KCC, or Krishak Bandhu.\n"
                "• **Required Documents**: Check what paperwork you need before applying.\n"
                "• **Subsidies & Loans**: Inquire about tractor subsidies, drip irrigation grants, or crop loans."
            )
            next_action = "ask_query"

        # Case D: scheme_search
        elif intent == "scheme_search":
            # Recommend schemes using profile
            recommendations = recommendation_service.get_recommendations(
                db, user_id=user_id, profile_override=profile_dict, top_k=3
            )
            schemes_output = recommendations

            if recommendations:
                top_scheme = recommendations[0]
                rec_lines = []
                for idx, r in enumerate(recommendations, 1):
                    status_text = r.get("eligibility", {}).get("status", "potentially_eligible").replace("_", " ").title()
                    score_pct = int(r["match_score"] * 100)
                    rec_lines.append(
                        f"**{idx}. {r['name']}** ({score_pct}% Match — {status_text})\n"
                        f"   • *Why it matches*: Aligns with your occupation ({profile_dict.get('occupation', 'profile')}) and location ({profile_dict.get('state', 'India')}).\n"
                        f"   • *Benefits*: {r['benefits']}\n"
                        f"   • *Official Source*: {r['official_source']}"
                    )

                bot_reply = (
                    f"Based on the information you've provided, these schemes in our verified knowledge base match your profile:\n\n"
                    + "\n\n".join(rec_lines) +
                    "\n\n*Note: Matching score is an analytical recommendation and does not constitute official legal sanction.*"
                )
                next_action = f"view_scheme_details:{top_scheme['scheme_id']}"
            else:
                bot_reply = (
                    "To accurately match you with verified government schemes, could you please tell me your occupation, "
                    "your state of residence, and whether you own agricultural land?"
                )
                next_action = "request_profile_details"

        # Case E: scheme_documents
        elif intent == "scheme_documents":
            retrieved = ml_service.retrieve_schemes(clean_text, top_k=1)
            if retrieved:
                top_s = retrieved[0]
                docs = top_s.get("documents", [])
                doc_list_str = "\n".join([f"• {d}" for d in docs]) if docs else "• Aadhaar card, Bank passbook, and land/income certificates."
                bot_reply = (
                    f"I found information about **{top_s['name']}**.\n"
                    f"The required documents listed in our verified knowledge base are:\n{doc_list_str}\n\n"
                    f"You can submit these at your nearest CSC center or official portal: {top_s.get('official_source', '')}"
                )
                schemes_output = [top_s]
                next_action = "check_application_process"
            else:
                bot_reply = "Which scheme do you need documents for? For example, you can ask *'What documents are needed for Kisan Credit Card?'* or *'PM-KISAN documents'*."
                next_action = "specify_scheme"

        # Case F: scheme_eligibility
        elif intent == "scheme_eligibility":
            retrieved = ml_service.retrieve_schemes(clean_text, top_k=1)
            if retrieved:
                top_s = retrieved[0]
                elig = ml_service.evaluate_eligibility(profile_dict, top_s)
                eligibility_output = elig
                schemes_output = [top_s]

                matched_str = "; ".join(elig["matched_conditions"]) if elig["matched_conditions"] else "None evaluated yet"
                bot_reply = (
                    f"Eligibility Assessment for **{top_s['name']}**:\n"
                    f"• **Status**: {elig['status'].replace('_', ' ').title()}\n"
                    f"• **Matched Conditions**: {matched_str}\n"
                )
                if elig["failed_conditions"]:
                    bot_reply += f"• **Failed Conditions**: {'; '.join(elig['failed_conditions'])}\n"
                if elig["missing_information"]:
                    bot_reply += f"• **Missing Information**: Please provide your {', '.join(elig['missing_information'])} to confirm.\n"

                bot_reply += f"\n*Official source*: {top_s.get('official_source', '')}"
                next_action = "verify_missing_fields"
            else:
                bot_reply = "Which scheme would you like to check eligibility for? (e.g., PM-KISAN, Kisan Credit Card, or Krishak Bandhu)."
                next_action = "specify_scheme_name"

        # Case G: scheme_benefits
        elif intent == "scheme_benefits":
            retrieved = ml_service.retrieve_schemes(clean_text, top_k=1)
            if retrieved:
                top_s = retrieved[0]
                bot_reply = (
                    f"Key Benefits for **{top_s['name']}**:\n"
                    f"{top_s['benefits']}\n\n"
                    f"• **Category**: {top_s['category']}\n"
                    f"• **Official Portal**: {top_s.get('official_source', '')}"
                )
                schemes_output = [top_s]
                next_action = "check_eligibility"
            else:
                bot_reply = "Which scheme's benefits would you like to view? For example: *'What are the benefits of PM-KISAN?'*"
                next_action = "specify_scheme"

        # Case H: scheme_application
        elif intent == "scheme_application":
            retrieved = ml_service.retrieve_schemes(clean_text, top_k=1)
            if retrieved:
                top_s = retrieved[0]
                app_proc = top_s.get("application_process", "Apply via official portal or nearest CSC center.")
                bot_reply = (
                    f"Application Process for **{top_s['name']}**:\n"
                    f"{app_proc}\n\n"
                    f"• **Official Website**: {top_s.get('official_source', '')}"
                )
                schemes_output = [top_s]
                next_action = "view_documents"
            else:
                bot_reply = "How can I help you apply? Please mention the scheme name (such as PM-KISAN or KCC)."
                next_action = "specify_scheme"

        # Case I: subsidy_information
        elif intent == "subsidy_information":
            retrieved = ml_service.retrieve_schemes("subsidy machinery tractor irrigation " + clean_text, top_k=2)
            schemes_output = retrieved
            if retrieved:
                lines = [f"• **{s['name']}**: {s['benefits']}" for s in retrieved]
                bot_reply = (
                    "Here are the relevant government subsidy schemes available in our verified knowledge base:\n\n"
                    + "\n\n".join(lines)
                )
            else:
                bot_reply = "Government subsidies are available for farm machinery (SMAM), drip irrigation (PMKSY), and solar pumps. Which one would you like details on?"
            next_action = "apply_subsidy"

        # Case J: loan_information / loan_calculation
        elif intent in ("loan_information", "loan_calculation"):
            kcc_scheme = next((s for s in scheme_service.get_all_schemes(db) if "KCC" in s["scheme_id"]), None)
            if kcc_scheme:
                schemes_output = [kcc_scheme]
                bot_reply = (
                    f"For agricultural loans, the **{kcc_scheme['name']}** provides credit up to ₹3,00,000 at a subsidized 4% per annum interest rate.\n"
                    f"• **Repayment**: Flexible post-harvest schedule.\n"
                    f"• **Collateral**: No collateral required for loans up to ₹1.60 Lakh.\n"
                    f"• **Where to apply**: Nearest public sector or rural bank branch."
                )
            else:
                bot_reply = "Subsidized agricultural loans are available under Kisan Credit Card (4% interest) and NSFDC Micro Finance (up to ₹1.4 Lakh). Would you like to check eligibility?"
            next_action = "check_loan_eligibility"

        # Case K: profile_update
        elif intent == "profile_update":
            updated_fields = ", ".join([f"{k}: {v}" for k, v in extracted_entities.items()]) if extracted_entities else "details"
            bot_reply = f"Your profile has been updated successfully ({updated_fields}). Would you like to see matching schemes now?"
            next_action = "search_schemes_with_new_profile"

        # Default / Unknown
        else:
            bot_reply = (
                "I'm not completely sure what you're asking. You can ask me about scheme eligibility, "
                "benefits, required documents, applications, loans, subsidies, or available schemes matching your profile."
            )
            next_action = "clarify_query"

        # 6. Store User Message and Bot Response in Database
        user_msg = Message(
            conversation_id=conv_id,
            sender="user",
            message=clean_text,
            intent=intent,
            confidence=confidence,
            created_at=datetime.utcnow()
        )
        db.add(user_msg)

        bot_msg = Message(
            conversation_id=conv_id,
            sender="bot",
            message=bot_reply,
            intent=intent,
            confidence=confidence,
            created_at=datetime.utcnow()
        )
        db.add(bot_msg)
        db.commit()

        return {
            "message": bot_reply,
            "intent": intent,
            "confidence": confidence,
            "schemes": schemes_output,
            "eligibility": eligibility_output,
            "next_action": next_action,
            "conversation_id": conv_id,
            "extracted_entities": extracted_entities
        }


chat_service = ChatService()
