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
  Check,
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
  ArrowRight,
  Paperclip,
  Camera,
  Image as ImageIcon,
  Upload,
  CheckCheck,
  User,
  Calculator,
  FileText,
  AlertCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { getBhashiniConfig } from "@/lib/bhashini";
import { convertBlobTo16kHzWav } from "@/lib/audioConverter";

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

interface ChatAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
  extractedText?: string;
  ocrConfidence?: number;
  isLowConfidence?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  attachments?: ChatAttachment[];
  quick_replies?: string[];
  matched_schemes?: SchemeMatch[];
  audioUrl?: string;
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

  // Attachments State
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const attachMenuRef = useRef<HTMLDivElement | null>(null);

  // Bhashini Voice Recording & TTS States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const bhashiniConfig = getBhashiniConfig(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Format seconds to mm:ss for voice recording timer
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const transcriptAccumulatorRef = useRef<string>("");
  const accumulatedTranscriptRef = useRef<string>("");
  const isRecordingRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceLang, setVoiceLang] = useState<string>(language === "hi" ? "hi-IN" : "en-IN");
  const isSyncingRef = useRef<boolean>(false);

  // Background Whisper sync for continuous live transcription during long recordings
  const syncWhisperTranscript = async () => {
    if (isSyncingRef.current || !isRecordingRef.current) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
      } catch (_e) {}
    }
    if (audioChunksRef.current.length === 0) return;
    isSyncingRef.current = true;
    try {
      const currentBlob = new Blob([...audioChunksRef.current], {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });
      const converted = await convertBlobTo16kHzWav(currentBlob);
      if (converted.base64 && isRecordingRef.current) {
        const targetLang = voiceLang.startsWith("hi") ? "hi" : (bhashiniConfig.bhashiniCode || "en");
        const res = await fetch("/api/bhashini/asr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: converted.base64,
            language: targetLang,
          }),
        });
        if (res.ok && isRecordingRef.current) {
          const data = await res.json();
          if (data && data.success && data.text && data.text.trim()) {
            const whisperText = data.text.trim();
            // If Whisper transcribed extra words that Web Speech missed or paused on, update live!
            const currentAcc = (transcriptAccumulatorRef.current || "").trim();
            if (whisperText.length > currentAcc.length || whisperText.split(/\s+/).length > currentAcc.split(/\s+/).length) {
              transcriptAccumulatorRef.current = whisperText;
              accumulatedTranscriptRef.current = whisperText;
              setInput(whisperText);
            }
          }
        }
      }
    } catch (_e) {
      // Background sync is non-blocking
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Start voice recording (Bhashini primary via MediaRecorder + Web Speech concurrent fallback)
  const startRecording = async () => {
    if (loading) return;
    setVoiceError(null);
    setUploadError(null);
    setVoiceStatus(null);

    // 1. Request microphone permission with noise suppression, echo cancellation
    let stream: MediaStream | null = null;
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone API not supported in this browser.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setVoiceError("Microphone access was denied. Please allow microphone permission or type your message.");
      setIsRecording(false);
      return;
    }

    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordingSeconds(0);
    setAudioLevel(0);
    accumulatedTranscriptRef.current = "";
    transcriptAccumulatorRef.current = "";
    audioChunksRef.current = [];

    // Setup live audio visualizer via Web Audio API AnalyserNode
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        if (audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(normalized);
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      }
    } catch (e) {
      console.warn("Audio visualizer init error:", e);
    }

    // Continuous timer counting up — also runs background Whisper sync every 3s to capture long speech
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        const nextSec = prev + 1;
        // Background live Whisper sync every 3 seconds for continuous speech
        if (nextSec >= 3 && nextSec % 3 === 0 && isRecordingRef.current) {
          syncWhisperTranscript();
        }
        return nextSec;
      });
    }, 1000);

    // 2. Initialize MediaRecorder for ASR pipeline (flushed every 1s for long inputs)
    try {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn("MediaRecorder init error:", err);
    }

    // 3. Initialize continuous Web Speech Recognition with automatic fresh instance recycling on pauses
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      const launchRecognitionInstance = () => {
        if (!isRecordingRef.current) return;

        try {
          const recog = new SpeechRecognition();
          recog.lang = voiceLang || bhashiniConfig.locale;
          recog.continuous = true;
          recog.interimResults = true;

          let lastInstanceText = "";

          recog.onresult = (event: any) => {
            let interim = "";
            let currentFinal = "";
            for (let i = 0; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                currentFinal += transcript + " ";
              } else {
                interim += transcript;
              }
            }

            lastInstanceText = (currentFinal + " " + interim).trim();
            const combined = [accumulatedTranscriptRef.current, lastInstanceText]
              .filter(Boolean)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();

            if (combined) {
              transcriptAccumulatorRef.current = combined;
              setInput(combined);
            }
          };

          recog.onerror = (e: any) => {
            // Ignore non-fatal pause/aborted/network glitches during continuous speech
            if (e?.error === "no-speech" || e?.error === "aborted" || e?.error === "network") {
              return;
            }
            console.warn("Speech recognition notice:", e?.error || e);
          };

          recog.onend = () => {
            // Commit any speech from this session into persistent accumulator
            if (lastInstanceText) {
              accumulatedTranscriptRef.current = [accumulatedTranscriptRef.current, lastInstanceText]
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();
              lastInstanceText = "";
            }

            // In Chromium and Safari, continuous mode pauses after short speech.
            // Wait 200ms for hardware release, then restart cleanly to continue recording extra speech!
            if (isRecordingRef.current) {
              if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
              restartTimerRef.current = setTimeout(() => {
                if (isRecordingRef.current) {
                  launchRecognitionInstance();
                }
              }, 200);
            }
          };

          recog.start();
          recognitionRef.current = recog;
        } catch (err) {
          console.warn("Speech recognition restart catch:", err);
          if (isRecordingRef.current) {
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              if (isRecordingRef.current) {
                launchRecognitionInstance();
              }
            }, 300);
          }
        }
      };

      launchRecognitionInstance();
    }
  };

  // Stop recording and process audio (user decides when to finish)
  const stopRecording = async (cancel = false, autoSend = true) => {
    isRecordingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    const duration = recordingSeconds;
    setRecordingSeconds(0);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // Unhook onend to prevent re-launch
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recordedRecorder = mediaRecorderRef.current;
    if (recordedRecorder) {
      try {
        if (recordedRecorder.state === "recording") {
          recordedRecorder.requestData();
        }
        recordedRecorder.stop();
        recordedRecorder.stream?.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    if (cancel) {
      accumulatedTranscriptRef.current = "";
      transcriptAccumulatorRef.current = "";
      setInput("");
      setVoiceStatus(null);
      return;
    }

    // Wait 80ms for final audio recorder chunks to flush into audioChunksRef
    await new Promise((r) => setTimeout(r, 80));

    const capturedText = (transcriptAccumulatorRef.current || input || "").trim();

    // If audio buffer exists and user spoke for >= 3 seconds or capturedText is empty:
    // ALWAYS run full-audio Whisper transcription so the complete speech from start to finish is preserved!
    if (audioChunksRef.current.length > 0 && (duration >= 3 || !capturedText)) {
      setVoiceStatus(language === "hi" ? "पूरी आवाज़ ट्रांसक्राइब हो रही है (Local Whisper)..." : "Transcribing complete audio (Local Whisper)...");
      try {
        const rawBlob = new Blob(audioChunksRef.current, {
          type: recordedRecorder?.mimeType || "audio/webm",
        });

        let base64Audio = "";
        try {
          const converted = await convertBlobTo16kHzWav(rawBlob);
          base64Audio = converted.base64;
        } catch (convErr) {
          console.warn("WAV conversion error, falling back to raw base64:", convErr);
          const arrayBuffer = await rawBlob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          base64Audio = btoa(binary);
        }

        if (base64Audio) {
          const targetLang = voiceLang.startsWith("hi") ? "hi" : (bhashiniConfig.bhashiniCode || "en");
          const res = await fetch("/api/bhashini/asr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio: base64Audio,
              language: targetLang,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const whisperText = (data && data.success && data.text ? data.text.trim() : "");
            // Choose whichever transcript is more complete
            const bestText = whisperText.length >= capturedText.length ? whisperText : capturedText;

            if (bestText) {
              setVoiceStatus(null);
              if (autoSend) {
                sendMessage(bestText);
                accumulatedTranscriptRef.current = "";
                transcriptAccumulatorRef.current = "";
                setInput("");
              } else {
                setInput(bestText);
              }
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Audio processing error:", e);
      }
    }

    // Quick short recording (< 3s) where Web Speech captured transcript
    if (capturedText) {
      setVoiceStatus(null);
      if (autoSend) {
        sendMessage(capturedText);
        accumulatedTranscriptRef.current = "";
        transcriptAccumulatorRef.current = "";
        setInput("");
      } else {
        setInput(capturedText);
      }
      return;
    }

    setVoiceStatus(null);
    setVoiceError(
      language === "hi"
        ? "कोई आवाज़ नहीं सुनी गई। कृपया माइक के पास बोलें या टाइप करें।"
        : "No speech detected. Please speak closer to your microphone or type your message."
    );
  };

  // Text-To-Speech (Arya speaking in user's selected regional language via Bhashini or Web Speech)
  const speakText = async (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clean markdown characters for pleasant speech flow
    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/₹/g, "Rupees ")
      .replace(/p\.a\./g, "per annum");

    // For Indian Regional Languages, attempt Bhashini TTS
    if (bhashiniConfig.code !== "en" && bhashiniConfig.code !== "hi") {
      try {
        const res = await fetch("/api/bhashini/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText.slice(0, 400),
            language: bhashiniConfig.bhashiniCode,
          }),
        });
        const data = await res.json();
        if (data && data.success && data.audio) {
          const audio = new Audio("data:audio/wav;base64," + data.audio);
          audioPlayerRef.current = audio;
          setSpeakingMessageId(messageId);
          audio.onended = () => setSpeakingMessageId(null);
          audio.onerror = () => setSpeakingMessageId(null);
          audio.play();
          return;
        }
      } catch (err) {
        console.warn("Bhashini TTS attempt error:", err);
      }
    }

    // Web Speech Synthesis (Hindi, English, or browser fallback)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = bhashiniConfig.locale;
      utterance.rate = 0.95;

      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);

      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(messageId);
    }
  };

  // Compresses image on client canvas before upload to ensure instant, high-efficiency transmission
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
      return file;
    }
    // Files under 1.5MB transmit in milliseconds without needing canvas re-compression
    if (file.size <= 1.5 * 1024 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      // 1.2s safety timeout: guarantees upload proceeds even if canvas decoding lags
      const safetyTimer = setTimeout(() => resolve(file), 1200);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.onload = () => {
          clearTimeout(safetyTimer);
          let { width, height } = img;
          const maxDim = 1280;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressed);
            },
            "image/jpeg",
            0.82
          );
        };
        img.onerror = () => {
          clearTimeout(safetyTimer);
          resolve(file);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        clearTimeout(safetyTimer);
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload single file object (from camera or gallery)
  const uploadFileObject = async (rawFile: File) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
    ];

    if (!allowed.includes(rawFile.type) && !rawFile.type.startsWith("image/")) {
      setUploadError(`Unsupported format (${rawFile.name}). Please upload an image (PNG, JPG, WEBP) or PDF.`);
      return;
    }

    if (rawFile.size > 15 * 1024 * 1024) {
      setUploadError(`File ${rawFile.name} exceeds the 15MB limit.`);
      return;
    }

    setUploading(true);
    try {
      const processedFile = await compressImage(rawFile);
      const formData = new FormData();
      formData.append("file", processedFile);

      const res = await fetch("/api/chatbot/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data && data.success && data.file) {
        setAttachments((prev) => [...prev, data.file]);
      } else {
        setUploadError(data.error || `Failed to upload ${rawFile.name}`);
      }
    } catch (err: any) {
      setUploadError(`Upload error for ${rawFile.name}: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle Gallery/File Picker Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      await uploadFileObject(files[i]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Live Camera Capture Selection
  const handleCameraSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFileObject(file);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Initialize fresh session & global open listener
  useEffect(() => {
    const sid = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    setSessionId(sid);

    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ask-arya", handleOpen);
    if (typeof window !== "undefined") {
      (window as any).openAskArya = handleOpen;
    }
    return () => {
      window.removeEventListener("open-ask-arya", handleOpen);
      if (typeof window !== "undefined") {
        delete (window as any).openAskArya;
      }
    };
  }, []);

  // Close attachment dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachMenu]);

  // Send initial greeting on open if empty
  useEffect(() => {
    if (isOpen && messages.length === 0 && sessionId) {
      sendMessage("hello", true);
    }
  }, [isOpen, sessionId]);

  // Messages container and latest message refs for user-friendly starting-point scroll
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Scroll to starting part of Arya's replies (or bottom for user messages)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg?.sender === "assistant") {
      // Keep view at the starting top part of Arya's reply so user can read smoothly from the beginning
      if (lastMessageRef.current && messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const target = lastMessageRef.current;
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const scrollOffset = targetRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({
          top: Math.max(0, scrollOffset - 8),
          behavior: "smooth",
        });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Keep typing indicator visible when loading
  useEffect(() => {
    if (loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  const sendMessage = async (textToSend?: string, isGreeting = false, overrideSid?: string) => {
    const text = (textToSend || input).trim();
    const currentAttachments = [...attachments];
    if ((!text && currentAttachments.length === 0) || loading) return;

    if (!isGreeting) {
      const userMsg: ChatMessage = {
        id: "msg_" + Date.now(),
        sender: "user",
        text: text || (currentAttachments.length > 0 ? `[Attached: ${currentAttachments.map((a) => a.name).join(", ")}]` : ""),
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setAttachments([]);
      setUploadError(null);
      setVoiceError(null);
      setVoiceStatus(null);
    }

    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: overrideSid || sessionId,
          message: text,
          language,
          attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
        }),
      });

      const data = await res.json();
      if (data && data.reply) {
        const botMsg: ChatMessage = {
          id: "msg_" + Date.now() + "_bot",
          sender: "assistant",
          text: data.reply,
          quick_replies: data.quick_replies,
          matched_schemes: data.matched_schemes || data.recommended_schemes,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (data.slots) {
          setSlots((prev) => ({ ...prev, ...data.slots }));
        }
      }
    } catch (err: any) {
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
            "Education Loan",
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
      const freshSid = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      setSessionId(freshSid);
      await fetch("/api/chatbot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: freshSid }),
      });
      setMessages([]);
      setAttachments([]);
      setUploadError(null);
      setVoiceError(null);
      setVoiceStatus(null);
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
      sendMessage("hello", true, freshSid);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Chat Modal */}
      {isOpen && (
        <div
          className="fixed z-50 inset-0 md:bottom-5 md:right-5 md:inset-auto flex items-center justify-center md:block"
        >
          <div
            id="ask-arya-chat-modal"
            className="w-full h-full md:w-[94vw] md:max-w-[430px] md:h-[610px] md:max-h-[85vh] bg-white md:rounded-2xl shadow-2xl md:border md:border-emerald-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-b from-emerald-100 to-emerald-50/30 p-3 flex items-center justify-between border-b border-emerald-100/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-emerald-800 hover:bg-white/50 rounded-full transition cursor-pointer"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden shrink-0">
                    <Image
                      src="/arya_dp.jpg"
                      alt="AskArya DP"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold leading-tight text-slate-800">
                      AskArya
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Your Personal Guide to the Right Government Scheme
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => sendMessage("restart")}
                  disabled={loading}
                  className="p-1.5 text-emerald-800 hover:bg-white/60 rounded-full transition text-[11px] flex items-center gap-1 cursor-pointer"
                  title="Reset Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-emerald-200/60 px-2 py-1 rounded-full text-[10px] font-bold text-emerald-800 hover:bg-white transition"
                  title="Active Language"
                >
                  <Languages className="w-3 h-3 text-emerald-600" />
                  <span className="uppercase">{bhashiniConfig.code}</span>
                </button>
              </div>
            </div>

            {/* Interactive Profile Qualification Stepper */}
            {(() => {
              const completedCount = [
                Boolean(slots.purpose || slots.project_type),
                Boolean(slots.amount),
                Boolean(slots.sc_status),
                Boolean(slots.income),
                Boolean(slots.state),
              ].filter(Boolean).length;
              const progressPercent = Math.round((completedCount / 5) * 100);

              return (
                <div className="bg-emerald-50/70 border-b border-emerald-100/70 px-3 py-1.5 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Profile Qualification Funnel ({completedCount}/5)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                      {progressPercent === 100 ? "🎯 Schemes Unlocked" : `${progressPercent}% Complete`}
                    </span>
                  </div>

                  {/* Micro progress bar */}
                  <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Micro Step Badges */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 shrink-0 font-medium transition ${
                        slots.purpose || slots.project_type
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-semibold"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {slots.purpose || slots.project_type ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="max-w-[85px] truncate">{slots.purpose || "Venture"}</span>
                        </>
                      ) : (
                        <span>1. Venture</span>
                      )}
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 shrink-0 font-medium transition ${
                        slots.amount
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-semibold"
                          : slots.purpose || slots.project_type
                          ? "bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {slots.amount ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>₹{slots.amount >= 100000 ? `${(slots.amount / 100000).toFixed(1)}L` : slots.amount.toLocaleString()}</span>
                        </>
                      ) : (
                        <span>2. Budget</span>
                      )}
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 shrink-0 font-medium transition ${
                        slots.sc_status
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-semibold"
                          : slots.amount
                          ? "bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {slots.sc_status ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>{slots.sc_status === "YES" ? "SC Cat." : "Open Cat."}</span>
                        </>
                      ) : (
                        <span>3. Category</span>
                      )}
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 shrink-0 font-medium transition ${
                        slots.income
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-semibold"
                          : slots.sc_status
                          ? "bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {slots.income ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>₹{(slots.income / 100000).toFixed(1)}L</span>
                        </>
                      ) : (
                        <span>4. Income</span>
                      )}
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 shrink-0 font-medium transition ${
                        slots.state
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-semibold"
                          : slots.income
                          ? "bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {slots.state ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="max-w-[70px] truncate">{slots.state}</span>
                        </>
                      ) : (
                        <span>5. Location</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Container */}
            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-white text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  ref={idx === messages.length - 1 ? lastMessageRef : null}
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

                  <div className="flex flex-col flex-1 max-w-[92%]">
                    <div
                      className={`inline-block p-3.5 shadow-sm ${
                        msg.sender === "user"
                          ? "bg-emerald-100 text-slate-800 rounded-2xl rounded-tr-sm self-end font-medium text-[13px]"
                          : "bg-white text-slate-800 rounded-2xl rounded-tl-sm self-start border border-emerald-100/80 shadow-2xs"
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed text-[13px]">
                        {msg.sender === "assistant" ? (
                          <div className="space-y-2">
                            {msg.text.split("\n").map((line, lIdx) => {
                              if (line.trim() === "---") {
                                return <hr key={lIdx} className="my-2 border-emerald-100" />;
                              }
                              if (!line.trim()) {
                                return <div key={lIdx} className="h-0.5" />;
                              }
                              const isQuestion = line.startsWith("💬") || line.startsWith("🎯");
                              const isSectionHeader = line.startsWith("📋");
                              const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
                              const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);

                              if (isQuestion) {
                                const rawContent = line.replace(/^[💬🎯]\s*/, "");
                                const qParts = rawContent.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <div
                                    key={lIdx}
                                    className="mt-1 font-semibold text-emerald-950 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/30 p-3 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-base shrink-0 leading-none mt-0.5">💬</span>
                                      <div className="text-[13px] leading-snug">
                                        {qParts.map((part, pIdx) =>
                                          part.startsWith("**") && part.endsWith("**") ? (
                                            <strong key={pIdx} className="font-bold text-emerald-950">
                                              {part.slice(2, -2)}
                                            </strong>
                                          ) : (
                                            part
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              if (isSectionHeader) {
                                const rawHeader = line.replace(/^📋\s*/, "");
                                const hParts = rawHeader.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <div key={lIdx} className="font-bold text-emerald-800 text-[11px] tracking-wider uppercase pt-1">
                                    {hParts.map((part, pIdx) =>
                                      part.startsWith("**") && part.endsWith("**") ? (
                                        <span key={pIdx}>{part.slice(2, -2)}</span>
                                      ) : (
                                        part
                                      )
                                    )}
                                  </div>
                                );
                              }

                              if (isBullet) {
                                const bulletText = line.trim().replace(/^[•\-]\s*/, "");
                                const bParts = bulletText.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <div key={lIdx} className="flex items-start gap-2 text-[12.5px] text-slate-700 pl-1">
                                    <span className="text-emerald-600 font-bold text-sm leading-none mt-0.5">•</span>
                                    <div className="leading-relaxed">
                                      {bParts.map((part, pIdx) =>
                                        part.startsWith("**") && part.endsWith("**") ? (
                                          <strong key={pIdx} className="font-bold text-slate-900">
                                            {part.slice(2, -2)}
                                          </strong>
                                        ) : (
                                          part
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              if (numMatch) {
                                const numIndex = numMatch[1];
                                const numText = numMatch[2];
                                const nParts = numText.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <div key={lIdx} className="flex items-start gap-2 text-[12.5px] text-slate-700 pl-1">
                                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100/80 px-1.5 py-0.5 rounded-md mt-0.5 shrink-0">
                                      {numIndex}
                                    </span>
                                    <div className="leading-relaxed">
                                      {nParts.map((part, pIdx) =>
                                        part.startsWith("**") && part.endsWith("**") ? (
                                          <strong key={pIdx} className="font-bold text-slate-900">
                                            {part.slice(2, -2)}
                                          </strong>
                                        ) : (
                                          part
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={lIdx} className="text-[12.5px] leading-relaxed text-slate-700">
                                  {parts.map((part, pIdx) =>
                                    part.startsWith("**") && part.endsWith("**") ? (
                                      <strong key={pIdx} className="font-bold text-slate-900">
                                        {part.slice(2, -2)}
                                      </strong>
                                    ) : (
                                      part
                                    )
                                  )}
                                </p>
                              );
                            })}
                          </div>
                        ) : (
                          <div>
                            <div>{msg.text}</div>
                            {/* Render attachments in user bubble */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {msg.attachments.map((att, aIdx) => (
                                  <a
                                    key={aIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 bg-white/90 border border-emerald-300 text-emerald-950 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-emerald-50 transition"
                                  >
                                    {att.type?.startsWith("image/") ? (
                                      <img src={att.url} alt={att.name} className="w-4 h-4 rounded object-cover" />
                                    ) : (
                                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                                    )}
                                    <span className="max-w-[130px] truncate">{att.name}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Matched Schemes Display */}
                      {msg.matched_schemes && msg.matched_schemes.length > 0 && (
                        <div className="mt-3 w-full space-y-3">
                          {msg.matched_schemes.map((scheme) => (
                            <div
                              key={scheme.scheme_id}
                              className="bg-gradient-to-b from-white to-emerald-50/20 p-4 rounded-2xl border border-emerald-200/90 shadow-xs text-left space-y-3 w-full transition hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                    {scheme.name}
                                  </h4>
                                  <div className="text-[11px] text-slate-600 mt-0.5">
                                    {scheme.match_reason || "Statutory concessional lending for SC beneficiaries"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0 border border-emerald-200">
                                  Best Match <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-y-2 text-[11px] text-slate-700 pt-1 border-t border-slate-100">
                                <div className="col-span-1 flex items-center gap-1 font-semibold text-slate-600">
                                  <User className="w-3 h-3 text-emerald-600" /> Loan Amount
                                </div>
                                <div className="col-span-2 font-bold text-slate-900">
                                  ₹{scheme.min_amount?.toLocaleString("en-IN") || "10,000"} - ₹{scheme.max_amount?.toLocaleString("en-IN")}
                                </div>

                                <div className="col-span-1 flex items-center gap-1 font-semibold text-slate-600">
                                  <Building2 className="w-3 h-3 text-emerald-600" /> Eligible Venture
                                </div>
                                <div className="col-span-2 font-semibold text-emerald-950 capitalize">
                                  {slots.purpose || (slots.project_type ? slots.project_type.replace(/_/g, " ") : "Micro-Enterprise & Retail")}
                                </div>

                                <div className="col-span-1 flex items-center gap-1 font-semibold text-slate-600">
                                  <TrendingUp className="w-3 h-3 text-emerald-600" /> Interest Rate
                                </div>
                                <div className="col-span-2 font-bold text-emerald-700">
                                  Concessional {scheme.interest_rate_min}% p.a. (Govt Subsidized)
                                </div>

                                <div className="col-span-1 flex items-center gap-1 font-semibold text-slate-600">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Repayment
                                </div>
                                <div className="col-span-2 font-medium text-slate-800">
                                  {scheme.moratorium_months?.[0] ? `${scheme.moratorium_months[0]} Months Moratorium (Grace Period)` : "1 to 6 Months Repayment Holiday"}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 space-y-1">
                                <strong className="text-[11px] text-slate-800 flex items-center gap-1 mb-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified Eligibility:
                                </strong>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>SC community quota verified & guaranteed</span>
                                </div>
                                {slots.amount && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>Required funding of ₹{slots.amount.toLocaleString("en-IN")} fully accommodated</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>Available in <strong>{slots.state || "All Indian States"}</strong> via district SCA offices & partner banks</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={() => sendMessage(`Show me required documents for ${scheme.name}`)}
                                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[10.5px] font-semibold text-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                                >
                                  <ExternalLink className="w-3 h-3 text-emerald-600" /> Required Documents
                                </button>
                                <button
                                  onClick={() => sendMessage(`Find nearest authorized center or bank branch in ${slots.state || "my state"}`)}
                                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-teal-50/80 border border-teal-200 rounded-xl text-[10.5px] font-semibold text-teal-800 hover:bg-teal-100 transition active:scale-95 cursor-pointer"
                                >
                                  <MapPin className="w-3 h-3 text-teal-600" /> Find Nearest Centre
                                </button>
                                <button
                                  onClick={() => sendMessage(`Calculate monthly EMI installment for ${scheme.name}`)}
                                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-50/80 border border-amber-200 rounded-xl text-[10.5px] font-semibold text-amber-900 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                                >
                                  <Calculator className="w-3 h-3 text-amber-700" /> EMI Calculator
                                </button>
                                <button
                                  onClick={() => sendMessage(`How to apply for ${scheme.name} step by step`)}
                                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-700 border border-emerald-800 rounded-xl text-[10.5px] font-bold text-white hover:bg-emerald-800 transition active:scale-95 shadow-xs cursor-pointer"
                                >
                                  <ArrowRight className="w-3 h-3 text-emerald-200" /> How to Apply
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Reply Pills */}
                    {msg.quick_replies && msg.quick_replies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5 max-w-[90%] self-start">
                        {msg.quick_replies.map((replyText, idx) => {
                          const isDoc = replyText.includes("Document");
                          const isEMI = replyText.includes("EMI") || replyText.includes("Calculate");
                          const isPartner = replyText.includes("Partner") || replyText.includes("Bank") || replyText.includes("Centre");
                          const isApply = replyText.includes("Apply") || replyText.includes("Step");
                          const isRestart = replyText.includes("Restart");

                          return (
                            <button
                              key={idx}
                              onClick={() => sendMessage(replyText)}
                              disabled={loading}
                              className="text-[11px] bg-white text-emerald-950 font-medium border border-emerald-200/90 px-3 py-1.5 rounded-full transition shadow-2xs hover:shadow-xs hover:bg-emerald-50/80 hover:border-emerald-400 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            >
                              {isDoc ? (
                                <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                              ) : isEMI ? (
                                <Calculator className="w-3 h-3 text-emerald-600 shrink-0" />
                              ) : isPartner ? (
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              ) : isApply ? (
                                <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                              ) : isRestart ? (
                                <RotateCcw className="w-3 h-3 text-amber-600 shrink-0" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                              )}
                              <span>{replyText}</span>
                            </button>
                          );
                        })}
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
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition ml-1 active:scale-95 cursor-pointer ${
                            speakingMessageId === msg.id
                              ? "text-emerald-600 bg-emerald-50 font-bold"
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
                    <span className="text-[11px]">AskArya is typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input Bar */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 w-full">
              {/* Attachment Preview Chips */}
              {(attachments.length > 0 || uploading) && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 mb-2 no-scrollbar">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-950 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 shadow-2xs"
                    >
                      {att.type.startsWith("image/") ? (
                        <img src={att.url} alt={att.name} className="w-5 h-5 rounded object-cover border border-emerald-300" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-700" />
                      )}
                      <span className="max-w-[110px] truncate">{att.name}</span>
                      {att.isLowConfidence ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          ⚠️ Low Clarity
                        </span>
                      ) : att.extractedText ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                          📄 OCR Text
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {uploading && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold animate-pulse shrink-0 shadow-2xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>{language === "hi" ? "दस्तावेज़ स्कैन हो रहा है..." : "Scanning & uploading image..."}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status & Error Feedback Banners */}
              {voiceError && (
                <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-semibold text-[11px] truncate">{voiceError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceError(null)}
                    className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-semibold text-[11px] truncate">{uploadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {voiceStatus && (
                <div className="mb-2 p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
                  <span className="font-bold text-[11px]">{voiceStatus}</span>
                </div>
              )}

              {isRecording ? (
                /* Active Voice Recording Mode with Live Waveform & Smooth Multi-Sentence Transcript */
                <div
                  id="ask-arya-recording-bar"
                  className="w-full flex flex-col gap-2 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-2 border-rose-400 rounded-2xl p-2.5 sm:p-3 text-rose-950 shadow-md animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-rose-200/80 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                      </div>
                      <span className="text-[11px] font-black tracking-wide text-rose-900 uppercase">
                        {language === "hi" ? "आवाज़ रिकॉर्डिंग चालू" : "Recording Live"}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                        {formatSeconds(recordingSeconds)}
                      </span>

                      {/* Language Switcher for Voice (English / Hindi) */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextLang = voiceLang === "hi-IN" ? "en-IN" : "hi-IN";
                          setVoiceLang(nextLang);
                          if (recognitionRef.current) {
                            try {
                              recognitionRef.current.lang = nextLang;
                            } catch {}
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 border border-rose-300 text-rose-800 hover:bg-rose-100 transition shadow-2xs cursor-pointer ml-1"
                        title="Switch speech language between English & Hindi"
                      >
                        {voiceLang === "hi-IN" ? "🇮🇳 हिंदी" : "🌐 English"}
                      </button>
                    </div>

                    {/* Waveform Sound Level Indicator */}
                    <div className="flex items-center gap-0.5 h-4 px-1.5 bg-rose-200/60 rounded-lg">
                      {[0.3, 0.6, 0.9, 1.0, 0.8, 0.5, 0.3].map((mul, bIdx) => {
                        const h = Math.max(20, Math.min(100, Math.round(audioLevel * mul * 1.6)));
                        return (
                          <div
                            key={bIdx}
                            className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                            style={{ height: `${h}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Streaming Speech Transcript (Expands smoothly for Long Multi-Sentence Inputs) */}
                  <div className="max-h-24 min-h-[36px] overflow-y-auto no-scrollbar p-2 text-xs font-semibold text-rose-950 leading-relaxed break-words bg-white/80 rounded-xl border border-rose-200/80 shadow-2xs">
                    {input ? (
                      input
                    ) : (
                      <span className="text-rose-400 font-normal italic">
                        {language === "hi"
                          ? `${bhashiniConfig.name} में बोलें... आप बिना किसी समय सीमा के बोल सकते हैं`
                          : `Speak in ${bhashiniConfig.name}... speak as long as you need`}
                      </span>
                    )}
                  </div>

                  {/* User Control Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[10px] text-rose-700 font-medium truncate">
                      {language === "hi"
                        ? "बोलना पूरा होने पर 'पूर्ण' या 'एडिट' दबाएं"
                        : "Tap 'Done' to send or 'Edit' to review"}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Cancel Recording Button */}
                      <button
                        type="button"
                        onClick={() => stopRecording(true)}
                        id="ask-arya-cancel-voice-btn"
                        className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                        title={language === "hi" ? "रद्द करें" : "Cancel"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Review / Keep Text in Input Box */}
                      <button
                        type="button"
                        onClick={() => stopRecording(false, false)}
                        id="ask-arya-review-voice-btn"
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                        title={language === "hi" ? "माइक बंद करें और टेक्स्ट एडिट करें" : "Stop mic & edit text"}
                      >
                        <Pencil className="w-3 h-3 text-rose-600" />
                        <span>{language === "hi" ? "एडिट करें" : "Edit"}</span>
                      </button>

                      {/* Done & Send Button */}
                      <button
                        type="button"
                        onClick={() => stopRecording(false, true)}
                        id="ask-arya-stop-voice-btn"
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        title={language === "hi" ? "पूर्ण और भेजें" : "Done & Send message"}
                      >
                        <Send className="w-3 h-3" />
                        <span>{language === "hi" ? "पूर्ण" : "Done"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Text, Camera & Attachment Input Mode */
                <div className="w-full flex items-center gap-1.5 sm:gap-2">
                  {/* Hidden Camera Input */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCameraSelect}
                  />

                  {/* Hidden File Input (Gallery / Documents) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />


                  {/* Attachment/Link Button with Both Options Popover */}
                  <div className="relative" ref={attachMenuRef}>
                    <button
                      type="button"
                      id="ask-arya-upload-btn"
                      onClick={() => setShowAttachMenu((prev) => !prev)}
                      disabled={loading || uploading}
                      className={`p-2 transition rounded-2xl shrink-0 border cursor-pointer shadow-2xs active:scale-95 disabled:opacity-40 ${
                        showAttachMenu
                          ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200"
                          : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-50 border-slate-200"
                      }`}
                      title={language === "hi" ? "फोटो या दस्तावेज जोड़ें" : "Attach Image or Document"}
                      aria-expanded={showAttachMenu}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {showAttachMenu && (
                      <div
                        id="ask-arya-attach-popover"
                        className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-emerald-100 p-1.5 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
                      >
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-0.5">
                          {language === "hi" ? "दस्तावेज़ / फ़ोटो चुनें" : "Attach Document / Image"}
                        </div>

                        {/* Option 1: Camera */}
                        <button
                          type="button"
                          id="ask-arya-menu-camera-btn"
                          onClick={() => {
                            setShowAttachMenu(false);
                            cameraInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold leading-tight">
                              {language === "hi" ? "कैमरा (फोटो खींचें)" : "Take Photo"}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-tight">
                              {language === "hi" ? "डिवाइस कैमरा का उपयोग करें" : "Use device camera"}
                            </span>
                          </div>
                        </button>

                        {/* Option 2: Upload Image/Files */}
                        <button
                          type="button"
                          id="ask-arya-menu-upload-btn"
                          onClick={() => {
                            setShowAttachMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold leading-tight">
                              {language === "hi" ? "गैलरी / फ़ाइल से चुनें" : "Upload Image / File"}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-tight">
                              {language === "hi" ? "PNG, JPG, WEBP, PDF" : "PNG, JPG, WEBP, PDF"}
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex-1 flex items-center bg-slate-50 rounded-2xl border border-slate-200 pr-1 pl-3 py-0.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200 transition-all min-w-0"
                  >
                    <input
                      type="text"
                      id="ask-arya-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        language === "hi"
                          ? "संदेश लिखें, दस्तावेज़ जोड़ें या बोलें..."
                          : "Type, take photo, attach, or click mic..."
                      }
                      disabled={loading}
                      className="flex-1 bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none py-2 min-w-0"
                    />

                    {input.trim() || attachments.length > 0 ? (
                      <button
                        type="submit"
                        disabled={loading || uploading}
                        id="ask-arya-submit"
                        className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shrink-0 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Send message"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={loading || uploading}
                        id="ask-arya-voice-btn"
                        className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                        title="Click to speak (Voice input via Bhashini)"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
