"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  RotateCcw,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Building2,
  ExternalLink,
  ShieldCheck,
  Layers,
  MapPin,
  TrendingUp,
  Info,
  Accessibility,
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Radio,
  ArrowLeft,
  Paperclip,
  CheckCheck,
  User,
  Calculator,
} from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { getBhashiniConfig } from "@/lib/bhashini";

interface SchemeMatch {
  scheme_id: string;
  name: string;
  category: string;
  min_income: number;
  max_income: number;
  min_amount: number;
  max_amount: number;
  interest_rate_min: number;
  interest_rate_max: number;
  moratorium_months?: number[];
  eligible_project_types?: string[];
  cost_coverage_pct?: number;
  match_reason?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  quick_replies?: string[];
  matched_schemes?: SchemeMatch[];
  timestamp: string;
}

export function AskAryaChatbot() {
  const { language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [showSlotInspector, setShowSlotInspector] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [slots, setSlots] = useState<Record<string, any>>({
    sc_status: null,
    gender: null,
    is_pwd: null,
    income: null,
    purpose: null,
    project_type: null,
    amount: null,
    state: null,
    district: null,
  });

  // Bhashini Voice Recording & TTS States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );

  const bhashiniConfig = getBhashiniConfig(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Format seconds to mm:ss for WhatsApp voice recording timer
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Start voice recording
  const startRecording = () => {
    if (loading) return;

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    setIsRecording(true);
    setRecordingSeconds(0);

    // Live timer
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // 1. Primary: Web Speech Recognition in user's selected regional language
    if (SpeechRecognition) {
      try {
        const recog = new SpeechRecognition();
        recog.lang = bhashiniConfig.locale;
        recog.continuous = true;
        recog.interimResults = true;

        recog.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput(transcript);
          }
        };

        recog.onerror = (e: any) => {
          console.warn("Speech recognition status:", e);
        };

        recog.start();
        recognitionRef.current = recog;
      } catch (err) {
        console.warn("Speech recognition init error:", err);
      }
    }

    // 2. Secondary: MediaRecorder to capture audio for Bhashini ASR API endpoint
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          try {
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
          } catch (e) {
            console.warn("MediaRecorder error:", e);
          }
        })
        .catch((err) => {
          console.warn("Microphone permission info:", err);
        });
    }
  };

  // Stop recording and send
  const stopRecording = async (cancel = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      } catch (e) {}
    }

    setIsRecording(false);

    if (cancel) {
      setInput("");
      return;
    }

    // Automatically send transcribed text after brief pause
    setTimeout(async () => {
      const currentInput = input.trim();
      if (currentInput) {
        sendMessage(currentInput);
      } else if (audioChunksRef.current.length > 0) {
        // Attempt Bhashini ASR endpoint
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string)?.split(",")[1];
            if (base64Audio) {
              const res = await fetch("/api/bhashini/asr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audio: base64Audio,
                  language: language,
                }),
              });
              const data = await res.json();
              if (data.text) {
                sendMessage(data.text);
              }
            }
          };
        } catch (e) {
          console.warn("Bhashini fallback error:", e);
        }
      }
    }, 250);
  };

  // Text-To-Speech (Arya speaking in user's selected regional language)
  const speakText = (messageId: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters for pleasant speech flow
    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/₹/g, "Rupees ")
      .replace(/p\.a\./g, "per annum");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bhashiniConfig.locale;
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(messageId);
  };

  // Initialize or restore session & global open listener
  useEffect(() => {
    let sid = localStorage.getItem("arya_chat_session_id");
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("arya_chat_session_id", sid);
    }
    setSessionId(sid);

    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ask-arya", handleOpen);
    return () => window.removeEventListener("open-ask-arya", handleOpen);
  }, []);

  // Send initial greeting on open if empty
  useEffect(() => {
    if (isOpen && messages.length === 0 && sessionId) {
      sendMessage("hello", true);
    }
  }, [isOpen, sessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string, isGreeting = false) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!isGreeting) {
      const userMsg: ChatMessage = {
        id: "msg_" + Date.now(),
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          language: bhashiniConfig.code,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: "msg_" + Date.now() + "_bot",
        sender: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        audioUrl: data.audio_base64
          ? `data:audio/mp3;base64,${data.audio_base64}`
          : undefined,
        quick_replies: data.quick_replies || data.quickReplies || [],
        matched_schemes: data.matched_schemes || data.schemes || [],
      };

      setMessages((prev) => [...prev, botMsg]);
      if (data.slots) setSlots(data.slots);

      if (data.audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
        audio.play().catch((e) => console.log("Audio autoplay prevented", e));
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_" + Date.now() + "_err",
          sender: "assistant",
          text: "I am having a brief moment connecting to the central portal. Please ask your question again, or choose a scheme option below!",
          quick_replies: [
            "Small Business / Shop",
            "Dairy Farming Loan",
            "Tailoring Unit",
            "Education Loan"
          ],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/chatbot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      setMessages([]);
      setSlots({
        sc_status: null,
        gender: null,
        is_pwd: null,
        income: null,
        purpose: null,
        project_type: null,
        amount: null,
        state: null,
        district: null,
      });
      sendMessage("hello", true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed z-50 ${isOpen ? "inset-0 md:bottom-5 md:right-5 md:inset-auto" : "bottom-5 right-5"}`}
    >
      {/* Floating Toggle Button with Arya Profile Picture */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ask-arya-chat-trigger"
          className="group relative hidden md:flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-green-700 text-white font-semibold rounded-full shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/40 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          aria-label="Open Ask Arya AI Chatbot"
        >
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/90 shadow-md shrink-0 bg-white">
            <Image
              src="/arya_dp.jpg"
              alt="Ask Arya AI"
              width={44}
              height={44}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              priority
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full ring-1 ring-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold tracking-wide flex items-center gap-1.5">
              Ask Arya{" "}
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-emerald-100">
                100% Free
              </span>
            </div>
            <div className="text-[11px] text-emerald-100/90 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse inline-block" />
              Scheme & Loan Guide
            </div>
          </div>
        </button>
      )}

      {/* Main Chat Modal */}
      {isOpen && (
        <div
          id="ask-arya-chat-modal"
          className="w-full h-full md:w-[94vw] md:max-w-[430px] md:h-[610px] md:max-h-[85vh] bg-white md:rounded-2xl shadow-2xl md:border md:border-emerald-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-b from-emerald-100 to-emerald-50/30 p-3 flex items-center justify-between border-b border-emerald-100/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-800 hover:bg-white/50 rounded-full transition"
                aria-label="Close"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden shrink-0">
                  <Image
                    src="/arya_dp.jpg"
                    alt="AskArya AI DP"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold leading-tight text-slate-800">
                    AskArya AI
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Your Personal Guide to the Right Government Support
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <button
                className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-emerald-200/60 px-2 py-1 rounded-full text-[10px] font-bold text-emerald-800 hover:bg-white transition"
                title="Change Language"
              >
                <Languages className="w-3 h-3 text-emerald-600" />
                <span className="uppercase">{bhashiniConfig.code}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* DP for Assistant */}
                {msg.sender === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto mb-1 border border-slate-100 shadow-sm">
                    <Image
                      src="/arya_dp.jpg"
                      alt="Arya"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  <div
                    className={`inline-block max-w-[90%] p-3 shadow-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-100 text-slate-800 rounded-2xl rounded-tr-sm self-end"
                        : "bg-slate-50 text-slate-700 rounded-2xl rounded-tl-sm self-start border border-slate-100/60"
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed text-[13px]">
                      {msg.sender === "assistant" ? (
                        <div className="space-y-1.5">
                          {msg.text.split("\n").map((line, lIdx) => {
                            if (line.trim() === "---") {
                              return <hr key={lIdx} className="my-2 border-slate-200" />;
                            }
                            if (!line.trim()) {
                              return <div key={lIdx} className="h-1" />;
                            }
                            const isQuestion = line.startsWith("💬") || line.startsWith("🎯");
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p
                                key={lIdx}
                                className={
                                  isQuestion
                                    ? "font-semibold text-emerald-950 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200/70 shadow-xs"
                                    : ""
                                }
                              >
                                {parts.map((part, pIdx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return (
                                      <strong key={pIdx} className="font-bold text-slate-900">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Matched Schemes Display */}
                    {msg.matched_schemes && msg.matched_schemes.length > 0 && (
                      <div className="mt-3 w-full">
                        {msg.matched_schemes.map((scheme) => (
                          <div
                            key={scheme.scheme_id}
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-3 mt-3 w-full"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-slate-800 text-sm leading-snug">
                                {scheme.name}
                              </h4>
                              <div className="flex items-center gap-1 bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0">
                                Best Match{" "}
                                <ArrowLeft className="w-3 h-3 rotate-180" />
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-600 mb-2">
                              For self-employment and income generating
                              activities for SC beneficiaries
                            </div>

                            <div className="grid grid-cols-3 gap-y-2 text-[11px] text-slate-700">
                              <div className="col-span-1 flex items-center gap-1 font-semibold">
                                <User className="w-3 h-3" /> Loan Amount
                              </div>
                              <div className="col-span-2 font-bold text-slate-800">
                                ₹
                                {scheme.min_amount?.toLocaleString() ||
                                  "50,000"}{" "}
                                - ₹{scheme.max_amount?.toLocaleString()}
                              </div>

                              <div className="col-span-1 flex items-center gap-1 font-semibold">
                                <Building2 className="w-3 h-3" /> Purpose
                              </div>
                              <div className="col-span-2 font-medium">
                                Dairy, Agriculture, Small Business
                              </div>

                              <div className="col-span-1 flex items-center gap-1 font-semibold">
                                <TrendingUp className="w-3 h-3" /> Interest Rate
                              </div>
                              <div className="col-span-2 font-medium">
                                Concessional rates ({scheme.interest_rate_min}%)
                              </div>

                              <div className="col-span-1 flex items-center gap-1 font-semibold">
                                <ShieldCheck className="w-3 h-3" /> Repayment
                              </div>
                              <div className="col-span-2 font-medium">
                                Flexible tenure
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <strong className="text-[11px] text-slate-800 flex items-center gap-1 mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                Why this matches you?
                              </strong>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{" "}
                                SC category eligible
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{" "}
                                Self-employment purpose supported
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{" "}
                                Your income falls within the criteria
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{" "}
                                {scheme.match_reason ||
                                  "Available in your state"}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <button
                                onClick={() => sendMessage(`Show me required documents for ${scheme.name}`)}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-blue-600 hover:bg-slate-100 transition active:scale-95"
                              >
                                <ExternalLink className="w-3 h-3" /> Required
                                Documents
                              </button>
                              <button
                                onClick={() => sendMessage(`Find nearest authorized center or bank branch in ${slots.state || "my state"}`)}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-teal-700 hover:bg-slate-100 transition active:scale-95"
                              >
                                <MapPin className="w-3 h-3" /> Find Nearest
                                Centre
                              </button>
                              <button
                                onClick={() => sendMessage(`Calculate monthly EMI installment for ${scheme.name}`)}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-indigo-600 hover:bg-slate-100 transition active:scale-95"
                              >
                                <Calculator className="w-3 h-3" /> EMI
                                Calculator
                              </button>
                              <button
                                onClick={() => sendMessage(`How to apply for ${scheme.name} step by step`)}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50 border border-blue-200 rounded-lg text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition active:scale-95"
                              >
                                <Info className="w-3 h-3" /> How to Apply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Reply Pills */}
                  {msg.quick_replies && msg.quick_replies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 max-w-[85%] self-start">
                      {msg.quick_replies.map((replyText, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(replyText)}
                          disabled={loading}
                          className="text-[11px] bg-white text-blue-600 font-medium border border-blue-200 px-3 py-1.5 rounded-full transition shadow-sm hover:shadow-md hover:border-blue-300 active:scale-95 flex items-center gap-1.5"
                        >
                          <Mic className="w-3 h-3 text-blue-500" />
                          {replyText}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-1 mt-1 text-[9px] ${msg.sender === "user" ? "text-emerald-700 justify-end" : "text-slate-400 justify-start"}`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === "user" && (
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                    )}

                    {/* Audio Speaker Button for Assistant Messages */}
                    {msg.sender === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition ml-1 active:scale-95 ${
                          speakingMessageId === msg.id
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={`Listen in ${bhashiniConfig.name}`}
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 text-xs text-slate-500 py-1">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-sm opacity-70">
                  <Image
                    src="/arya_dp.jpg"
                    alt="Arya"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px]">AskArya AI is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-end gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition bg-slate-50 rounded-full shrink-0 mb-0.5">
              <Paperclip className="w-5 h-5" />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex-1 flex items-center bg-slate-50 rounded-3xl border border-slate-200 pr-1 pl-4 py-1 relative shadow-inner"
            >
              <input
                type="text"
                id="ask-arya-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none py-2"
              />

              {input.trim() ? (
                <button
                  type="submit"
                  disabled={loading}
                  id="ask-arya-submit"
                  className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shrink-0 ml-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={loading}
                  id="ask-arya-voice-btn"
                  className={`w-9 h-9 rounded-full text-white flex items-center justify-center transition shrink-0 ml-2 shadow-md hover:shadow-lg active:scale-95 ${isRecording ? "bg-red-500 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700"}`}
                  title="Voice to text input"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
