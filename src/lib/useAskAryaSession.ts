'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/components/chat/MessageBubble';
import { SchemeRecommendation } from '@/components/chat/SchemeRecommendationCard';

export interface ChatSessionSlots {
  sc_status?: string | null;
  gender?: string | null;
  is_pwd?: boolean | null;
  income?: number | null;
  purpose?: string | null;
  project_type?: string | null;
  amount?: number | null;
  state?: string | null;
  district?: string | null;
}

export function useAskAryaSession(initialLanguage: string = 'en') {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [slots, setSlots] = useState<ChatSessionSlots>({});
  const [matchedSchemes, setMatchedSchemes] = useState<SchemeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const isInitialized = useRef<boolean>(false);

  // Initialize or restore session on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      let savedId = typeof window !== 'undefined' ? localStorage.getItem('ask_arya_session_id') : null;
      if (!savedId) {
        savedId = `arya_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem('ask_arya_session_id', savedId);
        }
      }
      setSessionId(savedId);

      // Initial greeting message
      const initialGreeting: ChatMessage = {
        id: `msg_init_${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'hi'
            ? 'नमस्ते! मैं **आर्या** हूँ — आपकी समर्पित एनएसएफडीसी (NSFDC) सरकारी योजना सहायक।\n\nक्या आप या आपका परिवार **अनुसूचित जाति (SC)** समुदाय से संबंधित है?'
            : 'Hello! I am **Arya** — your dedicated NSFDC government scheme & concessional loan advisor.\n\nDo you or your family belong to the **Scheduled Caste (SC)** category?',
        quick_replies:
          language === 'hi'
            ? ['हाँ, हम SC श्रेणी से हैं', 'नहीं, अन्य श्रेणी', 'योजनाओं के बारे में बताएं']
            : ['Yes, SC Category', 'No, Other Category', 'Tell me about NSFDC'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([initialGreeting]);
    } catch (e) {
      console.warn('Could not initialize Ask Arya session:', e);
    }
  }, [language]);

  const playAudio = (audioBase64: string) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audio.play().catch((err) => console.warn('Audio auto-playback notice:', err));
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || isLoading || !sessionId) return;

      const userMsg: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        sender: 'user',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch('/api/chatbot/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            text: cleanText,
            lang: language,
            voice_mode: voiceMode,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.slots) {
          setSlots(data.slots);
        }

        if (data.matched_schemes && data.matched_schemes.length > 0) {
          setMatchedSchemes(data.matched_schemes);
        }

        if (data.resolved_lang && data.resolved_lang !== language) {
          setLanguage(data.resolved_lang);
        }

        if (data.audio_base64) {
          playAudio(data.audio_base64);
        }

        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          sender: 'assistant',
          text: data.reply || (language === 'hi' ? 'कृपया अधिक विवरण प्रदान करें।' : 'Please provide more details.'),
          quick_replies: data.quick_replies || [],
          matched_schemes: data.matched_schemes || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('Failed to send message to Ask Arya:', err);
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'hi'
              ? 'क्षमा करें, संदेश संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें।'
              : 'Sorry, I encountered a connection issue. Please try sending your message again.',
          quick_replies: ['Restart', 'Try Again'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading, language, voiceMode]
  );

  const sendImageMessage = useCallback(
    async (imageBase64: string, caption?: string, isHandwritten?: boolean) => {
      if (!imageBase64 || isLoading || !sessionId) return;

      const prefix = isHandwritten ? '✍️ [Handwritten Note]' : '📷 [Uploaded Document Photo]';
      const userMsg: ChatMessage = {
        id: `msg_user_img_${Date.now()}`,
        sender: 'user',
        text: caption ? `${prefix} ${caption}` : prefix,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch('/api/chatbot/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            text: caption || '',
            image_base64: imageBase64,
            lang: language,
            voice_mode: voiceMode,
            is_handwritten: isHandwritten || false,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.slots) {
          setSlots(data.slots);
        }

        if (data.matched_schemes && data.matched_schemes.length > 0) {
          setMatchedSchemes(data.matched_schemes);
        }

        if (data.resolved_lang && data.resolved_lang !== language) {
          setLanguage(data.resolved_lang);
        }

        if (data.audio_base64) {
          playAudio(data.audio_base64);
        }

        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          sender: 'assistant',
          text: data.reply || (language === 'hi' ? 'दस्तावेज़ की समीक्षा की गई।' : 'Document reviewed.'),
          quick_replies: data.quick_replies || [],
          matched_schemes: data.matched_schemes || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('Failed to process image in Ask Arya:', err);
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'hi'
              ? 'छवि संसाधित करने में समस्या हुई। कृपया स्पष्ट फ़ोटो अपलोड करें या विवरण टाइप करें।'
              : 'Could not process the image. Please upload a clearer photo or type your details.',
          quick_replies: ['Try Again', 'Type Details', 'Restart'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading, language, voiceMode]
  );

  const resetSession = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      await fetch('/api/chatbot/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (e) {
      console.warn('Reset endpoint failed, clearing locally:', e);
    }

    const newId = `arya_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ask_arya_session_id', newId);
    }
    setSessionId(newId);
    setSlots({});
    setMatchedSchemes([]);

    const initialGreeting: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते! मैंने सत्र रीसेट कर दिया है। क्या आप या आपका परिवार **अनुसूचित जाति (SC)** श्रेणी से है?'
          : 'Hello! I have reset our conversation. Do you or your family belong to the **Scheduled Caste (SC)** category?',
      quick_replies:
        language === 'hi'
          ? ['हाँ, हम SC श्रेणी से हैं', 'नहीं, अन्य श्रेणी', 'योजनाओं के बारे में बताएं']
          : ['Yes, SC Category', 'No, Other Category', 'Tell me about NSFDC'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([initialGreeting]);
    setIsLoading(false);
  }, [sessionId, language]);

  return {
    sessionId,
    messages,
    slots,
    matchedSchemes,
    isLoading,
    language,
    setLanguage,
    voiceMode,
    setVoiceMode,
    sendMessage,
    sendImageMessage,
    resetSession,
  };
}
