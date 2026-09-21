'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useI18n } from '@/lib/i18n/context';
import {
  ShieldCheck,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  LogOut,
  UserCheck,
  HelpCircle,
  Building2,
  Compass,
  FileCheck,
  Calculator,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const { language, t } = useI18n();
  const router = useRouter();
  const { user, loginWithGoogle, sendMobileOtp, verifyMobileOtp, logout, isAuthenticated, isLiveFirebaseMode } = useAuth();

  // Auth Tab Mode: 'OTP' (Mobile) or 'GOOGLE'
  const [activeTab, setActiveTab] = useState<'OTP' | 'GOOGLE'>('OTP');

  // Mobile OTP States
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP input refs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Mobile Number Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]/.test(clean)) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)'
          : 'Please enter a valid 10-digit Indian mobile number (starting with 6-9).'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await sendMobileOtp(clean);
      if (res.success) {
        setOtpSent(true);
        setResendTimer(30);
        setSuccessMsg(
          language === 'hi'
            ? `ओटीपी आपके मोबाइल नंबर +91 ${clean} पर एसएमएस द्वारा भेजा गया है। कृपया अपने संदेश (Messages) देखें।`
            : `OTP sent via SMS to mobile number +91 ${clean}. Please check your messages.`
        );
        // Focus on first OTP input
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Digit Change
  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are entered
    if (char && index === 5 && newDigits.every((d) => d.length === 1)) {
      const fullCode = newDigits.join('');
      executeVerifyOtp(fullCode);
    }
  };

  // Handle Paste inside OTP boxes
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setOtpDigits(newDigits);
      executeVerifyOtp(pasted);
    }
  };

  // Handle Backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Execute OTP verification
  const executeVerifyOtp = async (code: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await verifyMobileOtp(phoneInput, code);
      if (res.success) {
        setSuccessMsg(
          language === 'hi'
            ? 'सत्यापन सफल! मुख्य पृष्ठ पर ले जाया जा रहा है...'
            : 'Verification successful! Redirecting to Home page...'
        );
        router.push('/');
      } else {
        setErrorMsg(res.error || 'Invalid OTP code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error during OTP verification');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login -> Navigate directly to Home Page
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const loggedInUser = await loginWithGoogle();
      if (loggedInUser) {
        setSuccessMsg(
          language === 'hi'
            ? 'गूगल लॉगिन सफल! मुख्य पृष्ठ पर ले जाया जा रहा है...'
            : 'Google Sign-in successful! Redirecting to Home page...'
        );
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors"
        >
          ← {t.common.backToHome}
        </Link>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <img
              src="/logo.png"
              alt="AryaSaarthi"
              className="w-14 h-14 rounded-full object-contain shadow-md mb-4 border border-emerald-500/20"
            />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAuthenticated
                ? (t.login.signedIn)
                : (t.login.title)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              {language === 'hi'
                ? 'व्यक्तिगत योजना मार्गदर्शन प्राप्त करें, अपनी अनुशंसाओं को ट्रैक करें, और सत्यापित सहायता चैनलों से जुड़ें।'
                : 'Access personalized scheme guidance, track your recommendations, and connect with verified support channels.'}
            </p>
          </div>

          {/* If already authenticated, show User Profile Card */}
          {isAuthenticated && user ? (
            <div className="space-y-6">
              <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-full border-2 border-emerald-600 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-black text-xl flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base truncate">
                        {user.name}
                      </h3>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t.login.verified}
                      </span>
                    </div>
                    {user.phone && (
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        📱 {user.phone}
                      </p>
                    )}
                    {user.email && (
                      <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate">
                        ✉️ {user.email}
                      </p>
                    )}
                    <p className="text-[11px] text-emerald-800 font-bold mt-1">
                      {t.login.method} {user.authMethod === 'google' ? 'Google OAuth' : 'Mobile OTP'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-200/80 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg text-slate-700 font-semibold border border-slate-200">
                    📍 {user.state || 'उत्तर प्रदेश'}, {user.district || 'लखनऊ'}
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg text-slate-700 font-semibold border border-slate-200">
                    🏷️ {t.login.role}
                  </span>
                </div>
              </div>

              {/* Quick Navigation Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/find-scheme"
                  className="p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-between gap-2 shadow-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    {t.login.findSchemeBtn}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/partners"
                  className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-between gap-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    {t.login.locateSca}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Logout Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.login.signOut}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Login Forms */
            <div className="space-y-6">
              {/* Login Method Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('OTP');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'OTP'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{t.login.mobileOtpTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('GOOGLE');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'GOOGLE'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {/* Official Google G Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t.login.googleTab}</span>
                </button>
              </div>

              {/* Alert Feedback Messages */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* TAB 1: Mobile Number OTP */}
              {activeTab === 'OTP' && (
                <div className="space-y-5">
                  {!otpSent ? (
                    /* Step 1: Phone Input */
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {t.login.mobileLabel}
                        </label>
                        <div className="relative flex rounded-2xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 bg-white overflow-hidden shadow-xs">
                          <div className="bg-slate-100 px-3.5 py-3 text-xs font-black text-slate-700 flex items-center gap-1.5 border-r border-slate-200 shrink-0 select-none">
                            <span className="text-base leading-none">🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            id="mobile-phone-input"
                            type="tel"
                            maxLength={14}
                            value={phoneInput}
                            onChange={(e) => {
                              // Strip non-digits and handle pasted +91 or leading 91
                              const raw = e.target.value.replace(/\D/g, '');
                              const trimmed = raw.startsWith('91') && raw.length > 10 ? raw.slice(2, 12) : raw.slice(0, 10);
                              setPhoneInput(trimmed);
                              if (errorMsg) setErrorMsg(null);
                            }}
                            placeholder="9876543210"
                            className="w-full px-4 py-3 text-sm font-bold tracking-wider text-slate-900 placeholder-slate-400 focus:outline-none"
                            autoComplete="tel"
                            autoFocus
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          {language === 'hi'
                            ? 'हम आपके मोबाइल पर एक 6-अंकीय सत्यापन कोड (OTP) भेजेंगे।'
                            : 'We will send a 6-digit verification code to verify your phone.'}
                        </p>
                      </div>

                      {/* Firebase Invisible reCAPTCHA Anchor */}
                      <div id="recaptcha-container" className="my-1"></div>

                      <button
                        id="btn-get-otp"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 text-white shadow-sm transition-all bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] cursor-pointer shadow-emerald-700/20"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>{t.login.getOtp}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: 6-Digit OTP Input */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpDigits(['', '', '', '', '', '']);
                          }}
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{t.login.prevStep}</span>
                        </button>
                        <span className="text-slate-500 font-medium">
                          +91 <strong className="text-slate-900">{phoneInput}</strong>
                        </span>
                      </div>

                      {/* Real Carrier SMS Notification Banner */}
                      <div className="p-3 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl flex items-center gap-2.5 shadow-xs">
                        <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs text-emerald-950 font-bold">
                          {language === 'hi'
                            ? `आपके संदेश इनबॉक्स में +91 ${phoneInput} पर 6-अंकीय ओटीपी भेजा गया है।`
                            : `6-digit verification code sent via SMS to +91 ${phoneInput}.`}
                        </span>
                      </div>

                      {/* 6 Digit Inputs */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">
                          {t.login.enterOtp}
                        </label>
                        <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpRefs.current[idx] = el;
                              }}
                              type="tel"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50 focus:bg-white transition-all"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Resend Timer & Verify Action */}
                      <div className="flex items-center justify-between pt-1">
                        {resendTimer > 0 ? (
                          <span className="text-xs text-slate-500 font-semibold">
                            {t.login.resendIn}{' '}
                            <span className="font-bold text-slate-800">{resendTimer}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{t.login.resendOtp}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => executeVerifyOtp(otpDigits.join(''))}
                          disabled={loading || otpDigits.some((d) => !d)}
                          className={`py-2.5 px-5 rounded-xl text-xs font-extrabold text-white transition-all ${
                            loading || otpDigits.some((d) => !d)
                              ? 'bg-slate-300 cursor-not-allowed'
                              : 'bg-emerald-700 hover:bg-emerald-800'
                          }`}
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span>{t.login.verify}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Sign In with Google */}
              {activeTab === 'GOOGLE' && (
                <div className="space-y-4 pt-2">
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      {language === 'hi'
                        ? 'अपने गूगल खाते से एक-क्लिक में सुरक्षित लॉगिन करें। कोई पासवर्ड याद रखने की आवश्यकता नहीं।'
                        : 'Sign in securely with your Google Account in one click. No password needed.'}
                    </p>
                  </div>

                  {/* Official Styled Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all group"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{t.login.continueGoogle}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {language === 'hi'
                        ? 'गूगल पहचान सेवा (Google Identity) द्वारा समर्थित'
                        : 'Powered by Google Identity Services'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Citizen Value & NSFDC Assistance Benefits */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {language === 'hi'
                ? 'आर्यसारथी खाता बनाने के क्या लाभ हैं?'
                : 'Why create an AryaSaarthi Citizen Account?'}
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <FileCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">
                    {t.login.saveEligibility}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'hi'
                      ? 'अपनी प्रोफाइल-आधारित अनुशंसाओं को सहेजें और कभी भी अपनी सहायता यात्रा जारी रखें।'
                      : 'Save your profile-based recommendations and continue your support journey anytime.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <Building2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">
                    {t.login.nearestSca}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'hi'
                      ? 'अधिकृत एजेंसियों और नजदीकी सहायता केंद्रों को निर्देशित नेविगेशन के साथ खोजें।'
                      : 'Locate authorized agencies and nearby assistance points with guided navigation.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <Calculator className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">
                    {t.login.emiSheet}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'hi'
                      ? 'सहेजे गए पुनर्भुगतान अनुमान, योगदान विवरण और वित्तीय मार्गदर्शन प्राप्त करें।'
                      : 'Access saved repayment estimates, contribution details, and financial guidance.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Helpline Advisory */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.login.tollfree}</span>
              </span>
              <a href="tel:1800110330" className="font-bold text-emerald-700 hover:underline">
                1800-11-0330
              </a>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {language === 'hi'
                ? 'आपकी जानकारी का उपयोग केवल व्यक्तिगत मार्गदर्शन प्रदान करने के लिए किया जाता है और इसे अनधिकृत तीसरे पक्षों के साथ साझा नहीं किया जाता है।'
                : 'Your information is used only to provide personalized guidance and is not shared with unauthorized third parties.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
