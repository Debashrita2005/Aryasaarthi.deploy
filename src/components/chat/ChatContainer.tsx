'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Mic, MicOff, Bot, Sparkles, Volume2, VolumeX, Globe } from 'lucide-react';
import MessageBubble, { ChatMessage } from './MessageBubble';
import ProgressIndicator from './ProgressIndicator';
import TypingIndicator from './TypingIndicator';
import ImageInputButton from './ImageInputButton';
import { useAskAryaSession } from '@/lib/useAskAryaSession';

interface ChatContainerProps {
  initialLanguage?: string;
  onClose?: () => void;
  isDrawer?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

export default function ChatContainer({
  initialLanguage = 'en',
  onClose,
  isDrawer = false,
}: ChatContainerProps) {
  const {
    messages,
    slots,
    isLoading,
    language,
    setLanguage,
    voiceMode,
    setVoiceMode,
    sendMessage,
    sendImageMessage,
    resetSession,
  } = useAskAryaSession(initialLanguage);

  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    const msg = inputVal;
    setInputVal('');
    sendMessage(msg);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleImageSend = (base64Data: string, caption?: string, isHandwritten?: boolean) => {
    sendImageMessage(base64Data, caption, isHandwritten);
  };

  // Voice search / Speech to Text
  const toggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecog =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecog) {
      alert(language === 'hi' ? 'वॉइस इनपुट इस ब्राउज़र में समर्थित नहीं है।' : 'Voice input is not supported in this browser.');
      return;
    }

    try {
      const recog = new SpeechRecog();
      recog.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
      recog.continuous = true;
      recog.interimResults = true;

      let baseInput = inputVal;

      recog.onstart = () => {
        setIsRecording(true);
        baseInput = inputVal;
      };

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputVal(baseInput ? `${baseInput} ${transcript}` : transcript);
        }
      };

      recog.onerror = (e: any) => {
        console.warn('Speech recognition status:', e);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recog;
      recog.start();
    } catch (err) {
      console.warn('Voice input error:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-slate-100 ${isDrawer ? '' : 'rounded-2xl border border-slate-800 shadow-2xl overflow-hidden'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-700 text-white flex items-center justify-center shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white leading-none">
                {language === 'hi' ? 'आर्या — योजना सहायक' : language === 'bn' ? 'আর্য — স্কিম সহকারী' : 'Ask Arya'}
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'hi'
                ? 'एनएसएफडीसी एवं सरकारी योजना सलाहकार'
                : 'Deterministic NSFDC Scheme Recommender'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 relative">
          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu((prev) => !prev)}
              title="Change Language"
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span className="uppercase">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute top-8 right-0 z-50 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto no-scrollbar animate-fade-in">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      language === l.code
                        ? 'bg-brand-900/60 text-brand-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.name}</span>
                    {language === l.code && <span className="text-[10px] text-brand-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Mode Toggle */}
          <button
            type="button"
            onClick={() => setVoiceMode((prev) => !prev)}
            title={voiceMode ? 'Voice Mode Active' : 'Enable Voice Mode'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              voiceMode
                ? 'bg-brand-900/80 text-brand-300 border border-brand-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {voiceMode ? <Volume2 className="w-4 h-4 text-brand-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Conversation Button */}
          <button
            type="button"
            onClick={resetSession}
            title={language === 'hi' ? 'सत्र रीसेट करें' : 'Reset Conversation'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-semibold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator slots={slots} language={language} />

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onQuickReplySelect={handleQuickReply}
            language={language}
          />
        ))}

        {isLoading && <TypingIndicator language={language} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Camera / Image OCR Button */}
          <ImageInputButton
            onImageSelected={handleImageSend}
            disabled={isLoading}
            language={language}
          />

          {/* Voice Microphone Input */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isRecording ? 'Stop Recording' : 'Voice Input'}
            className={`p-2 rounded-xl transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'अपनी स्थिति बताएं या फ़ोटो अपलोड करें...'
                : language === 'bn'
                ? 'আপনার প্রয়োজন জানান বা ছবি তুলুন...'
                : 'Describe your need or upload document photo...'
            }
            className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="p-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
