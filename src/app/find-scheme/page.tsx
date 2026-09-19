'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';

const DynamicGisMap = dynamic(
  () => import('@/components/GisPartnerMap').then((mod) => mod.GisPartnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-500 font-semibold text-xs animate-pulse">
        Loading GIS Partner Locator...
      </div>
    ),
  }
);

import {
  RecommendationResponse,
  RecommendationItem,
  RecommendationRequest,
  RecommendationPurpose,
  EmploymentStatus,
  AreaType,
  Scheme,
} from '@/lib/types';
import { SCHEMES, getSchemeByCode } from '@/lib/schemeData';
import { OFFICIAL_VENTURES } from '@/lib/ventureData';
import { INDIAN_STATES_AND_UTS } from '@/lib/locationData';
import {
  getLocalizedScheme,
  getLocalizedCardLabels,
  formatLocalizedLakh,
  getLocalizedDiscoveryUI,
} from '@/lib/i18n/localizationHelper';
import {
  Briefcase,
  GraduationCap,
  Leaf,
  Sprout,
  Truck,
  Compass,
  Search,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calculator,
  MapPin,
  Sparkles,
  User,
  FileText,
  Layers,
  ShieldCheck,
  Percent,
  Star,
  Building,
  Home,
  Calendar,
} from 'lucide-react';

function FindSchemeContent() {
  const { language, t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const discUI = getLocalizedDiscoveryUI(language);

  // Toast notification for saved search
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Top Tabs Mode: 'GUIDE' (Dialogue Box) or 'DIRECT_LOOKUP' (Scheme Name Lookup)
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'DIRECT_LOOKUP'>('GUIDE');

  // GUIDE WIZARD STATE
  // Step 1: Gender (Female, Male, Other)
  // Step 2: Age (What is your age)
  // Step 3: Employment Status (Are you employed or not)
  // Step 4: State and Union Territories
  // Step 5: Rural or Urban area
  // Step 6: Purpose (5 loan categories)
  // Step 7: Project Cost
  // Step 8: Annual Family Income
  // Step 9: SC Certificate
  // Step 10: Course Type (Only for Education)
  const [step, setStep] = useState<number>(1);
  const [gender, setGender] = useState<'FEMALE' | 'MALE' | 'OTHER'>('FEMALE');
  const [age, setAge] = useState<number>(28);
  const [ageInputStr, setAgeInputStr] = useState<string>('28');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('UNEMPLOYED');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [areaType, setAreaType] = useState<AreaType>('RURAL');
  const [purpose, setPurpose] = useState<RecommendationPurpose>('BUSINESS');
  const [projectCost, setProjectCost] = useState<number>(250000);
  const [customCostInput, setCustomCostInput] = useState<string>('250000');
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState<number>(300000);
  const [scCertificate, setScCertificate] = useState<'YES' | 'IN_PROGRESS' | 'NO'>('YES');
  const [courseType, setCourseType] = useState<'FULL_TIME_PROFESSIONAL' | 'OTHER'>('FULL_TIME_PROFESSIONAL');


  // Loading & Result State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [focusedSchemeCode, setFocusedSchemeCode] = useState<string>('ALL');

  // DIRECT LOOKUP STATE
  const [directSearchQuery, setDirectSearchQuery] = useState<string>('');
  const [selectedDirectCode, setSelectedDirectCode] = useState<string>('AMY');

  // Question container ref for scrolling to top of question on mobile/desktop step change
  const questionContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const scrollToQuestionTop = () => {
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (questionContainerRef.current) {
          const headerOffset = 75; // accounts for sticky navigation header
          const elementPosition = questionContainerRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      }, 40);
    });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToQuestionTop();
  }, [step]);

  // Auto-load draft questionnaire state from localStorage on client mount (Fixes Con 6: mobile data loss on refresh)
  useEffect(() => {
    try {
      const savedDraft = typeof window !== 'undefined' ? localStorage.getItem('sahayak_wizard_draft') : null;
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.step && d.step > 1) setStep(d.step);
        if (d.gender) setGender(d.gender);
        if (d.age) { setAge(d.age); setAgeInputStr(String(d.age)); }
        if (d.employmentStatus) setEmploymentStatus(d.employmentStatus);
        if (d.state) setState(d.state);
        if (d.areaType) setAreaType(d.areaType);
        if (d.purpose) setPurpose(d.purpose);
        if (d.projectCost) { setProjectCost(d.projectCost); setCustomCostInput(String(d.projectCost)); }
        if (d.annualFamilyIncome) setAnnualFamilyIncome(d.annualFamilyIncome);
        if (d.scCertificate) setScCertificate(d.scCertificate);
        if (d.courseType) setCourseType(d.courseType);
      }
    } catch (e) {
      console.warn('Could not restore wizard draft', e);
    }
  }, []);

  // Auto-save draft on questionnaire changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const draft = {
          step,
          gender,
          age,
          employmentStatus,
          state,
          areaType,
          purpose,
          projectCost,
          annualFamilyIncome,
          scCertificate,
          courseType,
        };
        localStorage.setItem('sahayak_wizard_draft', JSON.stringify(draft));
      }
    } catch (e) {
      // ignore storage quota errors
    }
  }, [step, gender, age, employmentStatus, state, areaType, purpose, projectCost, annualFamilyIncome, scCertificate, courseType]);

  useEffect(() => {
    const p = searchParams.get('purpose');
    const mode = searchParams.get('mode');
    const schemeCode = searchParams.get('scheme');

    if (mode === 'direct' || schemeCode) {
      setActiveTab('DIRECT_LOOKUP');
      if (schemeCode) {
        setSelectedDirectCode(schemeCode.toUpperCase());
      }
    }

    if (p === 'EDUCATION') {
      setPurpose('EDUCATION');
      setProjectCost(1000000);
      setCustomCostInput('1000000');
    } else if (p === 'GREEN_BUSINESS') {
      setPurpose('GREEN_BUSINESS');
      setProjectCost(500000);
      setCustomCostInput('500000');
    } else if (p === 'AGRICULTURE') {
      setPurpose('AGRICULTURE');
      setProjectCost(500000);
      setCustomCostInput('500000');
    } else if (p === 'TRANSPORT') {
      setPurpose('TRANSPORT');
      setProjectCost(600000);
      setCustomCostInput('600000');
    } else if (p === 'BUSINESS') {
      setPurpose('BUSINESS');
      setProjectCost(250000);
      setCustomCostInput('250000');
    }
  }, [searchParams]);

  // When purpose changes in guide, reset sensible project cost defaults
  const handlePurposeChange = (newPurpose: RecommendationPurpose) => {
    setPurpose(newPurpose);
    let defaultCost = 250000;
    if (newPurpose === 'EDUCATION') defaultCost = 1000000;
    if (newPurpose === 'GREEN_BUSINESS') defaultCost = 300000;
    if (newPurpose === 'AGRICULTURE') defaultCost = 400000;
    if (newPurpose === 'TRANSPORT') defaultCost = 500000;
    setProjectCost(defaultCost);
    setCustomCostInput(defaultCost.toString());
  };

  const handleCostPreset = (val: number) => {
    setProjectCost(val);
    setCustomCostInput(val.toString());
  };

  const handleCustomCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomCostInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setProjectCost(num);
    }
  };

  const handleIncomePreset = (val: number) => {
    setAnnualFamilyIncome(val);
  };

  const totalSteps = purpose === 'EDUCATION' ? 10 : 9;

  const handleNext = () => {
    if (step === 9 && purpose === 'EDUCATION') {
      setStep(10); // Step 10: Course Type for education
    } else if ((step === 9 && purpose !== 'EDUCATION') || step === 10) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
    scrollToQuestionTop();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollToQuestionTop();
    }
  };

  const handleReset = () => {
    setRecommendationResult(null);
    setStep(1);
    setError(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sahayak_wizard_draft');
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload: RecommendationRequest = {
      gender,
      age,
      employmentStatus,
      state,
      areaType,
      purpose,
      projectCost: projectCost || 100000,
      annualFamilyIncome,
      scCertificate,
      courseType: purpose === 'EDUCATION' ? courseType : undefined,
    };

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate recommendation');
      }

      const data: RecommendationResponse = await res.json();
      setRecommendationResult(data);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Auto-save search record if user is logged in
      if (isAuthenticated && user?.id) {
        try {
          await fetch('/api/user/searches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              purpose,
              projectCost,
              annualIncome: annualFamilyIncome,
              scCertificate,
              courseType: purpose === 'EDUCATION' ? courseType : undefined,
              gender,
              age,
              employmentStatus,
              state,
              areaType,
              recommendedSchemeId: data.recommended?.schemeId ?? null,
              recommendedSchemeName: data.recommended?.schemeName ?? null,
              fitScore: data.recommended?.fitScore ?? null,
              matchedRule: data.recommended?.matchedRule ?? null,
              alternativesJson: JSON.stringify(data.alternatives ?? []),
            }),
          });
          setSaveToast(
            language === 'hi'
              ? 'खोज आपके AryaSaarthi इतिहास में सहेजी गई'
              : 'Search saved to your AryaSaarthi history'
          );
          setTimeout(() => setSaveToast(null), 4000);
        } catch {
          // Non-critical: silently ignore save failure
        }
      }

    } catch (err) {
      console.error(err);
      setError(
        language === 'hi'
          ? 'अनुशंसा गणना में त्रुटि आई। कृपया पुनः प्रयास करें।'
          : 'Calculation error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cost presets tailored to selected purpose
  const getCostPresetsForPurpose = () => {
    switch (purpose) {
      case 'EDUCATION':
        return [
          { label: '₹2.0 Lakh', value: 200000 },
          { label: '₹5.0 Lakh', value: 500000 },
          { label: '₹10.0 Lakh', value: 1000000 },
          { label: '₹20.0 Lakh', value: 2000000 },
          { label: '₹40.0 Lakh (Max)', value: 4000000 },
        ];
      case 'GREEN_BUSINESS':
        return [
          { label: '₹1.0 Lakh', value: 100000 },
          { label: '₹3.0 Lakh', value: 300000 },
          { label: '₹5.0 Lakh', value: 500000 },
          { label: '₹15.0 Lakh', value: 1500000 },
          { label: '₹30.0 Lakh (Max)', value: 3000000 },
        ];
      case 'AGRICULTURE':
        return [
          { label: '₹1.0 Lakh', value: 100000 },
          { label: '₹2.5 Lakh', value: 250000 },
          { label: '₹5.0 Lakh', value: 500000 },
          { label: '₹10.0 Lakh', value: 1000000 },
          { label: '₹25.0 Lakh', value: 2500000 },
        ];
      case 'TRANSPORT':
        return [
          { label: '₹1.5 Lakh', value: 150000 },
          { label: '₹3.0 Lakh', value: 300000 },
          { label: '₹6.0 Lakh', value: 600000 },
          { label: '₹15.0 Lakh', value: 1500000 },
          { label: '₹30.0 Lakh', value: 3000000 },
        ];
      case 'BUSINESS':
      default:
        return [
          { label: '₹50,000', value: 50000 },
          { label: '₹1.40 Lakh', value: 140000 },
          { label: '₹2.50 Lakh', value: 250000 },
          { label: '₹5.00 Lakh', value: 500000 },
          { label: '₹15.00 Lakh', value: 1500000 },
          { label: '₹50.00 Lakh (Max)', value: 5000000 },
        ];
    }
  };

  // Direct scheme lookup resolution
  const matchedDirectSchemes = SCHEMES.filter((s) => {
    if (!directSearchQuery.trim()) return true;
    const q = directSearchQuery.toLowerCase();
    const loc = getLocalizedScheme(s, language);
    return (
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      loc.name.toLowerCase().includes(q) ||
      loc.tagline.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const activeDirectScheme: Scheme =
    matchedDirectSchemes.find((s) => s.code === selectedDirectCode) ||
    matchedDirectSchemes[0] ||
    SCHEMES[0];

  const localizedDirectScheme = getLocalizedScheme(activeDirectScheme, language);
  const cardLabels = getLocalizedCardLabels(language);

  // Filter eligible ventures for direct scheme
  const eligibleVenturesForScheme = OFFICIAL_VENTURES.filter((v) =>
    v.suitable_schemes.includes(activeDirectScheme.code)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Top Breadcrumb Back Navigation */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.backToHome}</span>
        </Link>
        {recommendationResult && (
          <button
            onClick={() => setRecommendationResult(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.finder.btnBack}</span>
          </button>
        )}
      </div>

      {/* Page Title & Context */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.finder.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
          {t.finder.subtitle}
        </p>
      </div>

      {/* TOP TWO MODE OPTIONS / TABS (Placed cleanly before the dialogue box) */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('GUIDE')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
            activeTab === 'GUIDE'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/70 hover:text-slate-900'
          }`}
        >
          <Compass className={`w-4 h-4 ${activeTab === 'GUIDE' ? 'text-emerald-200' : 'text-emerald-700'}`} />
          <div className="text-left">
            <span className="block">{discUI.tabGuide}</span>
            <span className={`text-[10px] font-normal block ${activeTab === 'GUIDE' ? 'text-emerald-100' : 'text-slate-500'}`}>
              {discUI.tabGuideDesc}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DIRECT_LOOKUP')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
            activeTab === 'DIRECT_LOOKUP'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/70 hover:text-slate-900'
          }`}
        >
          <Search className={`w-4 h-4 ${activeTab === 'DIRECT_LOOKUP' ? 'text-emerald-200' : 'text-emerald-700'}`} />
          <div className="text-left">
            <span className="block">{discUI.tabDirect}</span>
            <span className={`text-[10px] font-normal block ${activeTab === 'DIRECT_LOOKUP' ? 'text-emerald-100' : 'text-slate-500'}`}>
              {discUI.tabDirectDesc}
            </span>
          </div>
        </button>
      </div>

      {/* TAB 1: GUIDE FOR YOUR SCHEME (Dialogue Box Wizard) */}
      {activeTab === 'GUIDE' && (
        <>
          {!recommendationResult ? (
            <div
              ref={questionContainerRef}
              id="question-container"
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 scroll-mt-20 sm:scroll-mt-24"
            >
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                  <span className="text-emerald-800 font-bold">
                    {language === 'hi' ? `चरण ${step} / ${totalSteps}` : `Step ${step} of ${totalSteps}`}
                  </span>
                  <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* QUESTION 1: CHOOSE YOUR GENDER */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 1 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {discUI.genderQuestion}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {discUI.genderSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* FEMALE */}
                    <button
                      type="button"
                      onClick={() => setGender('FEMALE')}
                      className={`touch-target p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        gender === 'FEMALE'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        {gender === 'FEMALE' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h3 className="font-extrabold text-base text-slate-900">
                            {discUI.genderFemale}
                          </h3>
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Special Concessions
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          0.5% interest rebate on Education Loans + Mahila Samriddhi Yojana access.
                        </p>
                      </div>
                    </button>

                    {/* MALE */}
                    <button
                      type="button"
                      onClick={() => setGender('MALE')}
                      className={`touch-target p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        gender === 'MALE'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        {gender === 'MALE' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 mb-1">
                          {discUI.genderMale}
                        </h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Standard NSFDC concessional lending schemes (TLS, MFS, UNY, ELS, GBS).
                        </p>
                      </div>
                    </button>

                    {/* OTHER */}
                    <button
                      type="button"
                      onClick={() => setGender('OTHER')}
                      className={`touch-target p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        gender === 'OTHER'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        {gender === 'OTHER' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 mb-1">
                          {discUI.genderOther}
                        </h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Full inclusive eligibility across NSFDC term loans, green ventures & education.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* QUESTION 2: WHAT IS YOUR AGE */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 2 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {language === 'hi' ? 'आपकी आयु क्या है?' : 'What is your Age?'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'hi'
                        ? 'सरकारी रियायती ऋण योजनाओं के लिए पात्रता आयु सीमा के आधार पर तय की जाती है।'
                        : 'Concessional credit and startup schemes apply criteria based on applicant age bracket.'}
                    </p>
                  </div>

                  {/* Direct Age Typing Card */}
                  <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label htmlFor="age-input" className="text-xs font-bold text-emerald-900 block mb-1">
                        {language === 'hi' ? 'अपनी आयु दर्ज करें (वर्ष में)' : 'Enter Your Age (in Years)'}
                      </label>
                      <span className="text-[11px] text-emerald-700">
                        {language === 'hi' ? 'सीधे टाइप करें या नीचे दिए गए विकल्पों में से चुनें' : 'Type exact age or select from quick age brackets below'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white border-2 border-emerald-500 rounded-2xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-600 self-start sm:self-auto">
                      <input
                        id="age-input"
                        type="number"
                        min="14"
                        max="120"
                        maxLength={3}
                        value={ageInputStr}
                        onKeyDown={(e) => {
                          if (
                            ['e', 'E', '+', '-', '.'].includes(e.key) ||
                            (/^\d$/.test(e.key) && e.currentTarget.value.length >= 3 && e.currentTarget.selectionStart === e.currentTarget.selectionEnd)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          if (e.currentTarget.value.length > 3) {
                            e.currentTarget.value = e.currentTarget.value.slice(0, 3);
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                          setAgeInputStr(val);
                          const num = parseInt(val, 10);
                          if (!isNaN(num) && num > 0) setAge(num);
                        }}
                        onBlur={() => {
                          const num = parseInt(ageInputStr, 10);
                          if (isNaN(num) || num < 14) {
                            setAge(18);
                            setAgeInputStr('18');
                          } else if (num > 120) {
                            setAge(120);
                            setAgeInputStr('120');
                          } else {
                            setAge(num);
                            setAgeInputStr(num.toString());
                          }
                        }}
                        className="w-20 font-extrabold text-2xl text-emerald-950 text-right bg-transparent focus:outline-none"
                        placeholder="28"
                      />
                      <span className="text-xs font-bold text-slate-500 select-none">
                        {language === 'hi' ? 'वर्ष' : 'Years'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Age Brackets */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      {language === 'hi' ? 'त्वरित आयु वर्ग (Quick Age Brackets):' : 'Quick Age Brackets:'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: language === 'hi' ? '< 18 (नाबालिग)' : '< 18 (Minor)', val: 17 },
                        { label: language === 'hi' ? '18 - 25 वर्ष (युवा)' : '18 - 25 Yrs (Youth)', val: 22 },
                        { label: language === 'hi' ? '26 - 35 वर्ष' : '26 - 35 Yrs', val: 28 },
                        { label: language === 'hi' ? '36 - 45 वर्ष' : '36 - 45 Yrs', val: 40 },
                        { label: language === 'hi' ? '46 - 55 वर्ष' : '46 - 55 Yrs', val: 50 },
                        { label: language === 'hi' ? '56+ वर्ष' : '56+ Yrs', val: 58 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setAge(item.val);
                            setAgeInputStr(item.val.toString());
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                            age === item.val
                              ? 'border-emerald-600 bg-emerald-700 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span>{item.label}</span>
                          {age === item.val && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age guideline banner */}
                  {age < 18 ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-red-900 mb-0.5">
                          {language === 'hi' ? 'कानूनी अनुबंध आयु सीमा' : 'Legal Majority Age Requirement'}
                        </span>
                        <span>
                          {language === 'hi'
                            ? 'ऋण स्वीकृति एवं बैंक अनुबंध हेतु आवेदक की न्यूनतम आयु 18 वर्ष होना अनिवार्य है। आप अपने माता-पिता या अभिभावक के नाम से भी आवेदन मार्गदर्शिका देख सकते हैं।'
                            : 'Bank loan sanctions and legal financial agreements require the applicant to be at least 18 years old. Education loans may be co-signed with an adult guardian.'}
                        </span>
                      </div>
                    </div>
                  ) : age <= 35 ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-emerald-900 mb-0.5">
                          {language === 'hi' ? 'युवा उद्यमिता प्राथमिकता श्रेणी' : 'Youth Entrepreneur Priority Bracket'}
                        </span>
                        <span>
                          {language === 'hi'
                            ? '18 से 35 वर्ष के युवाओं के लिए NSFDC स्वरोजगार, कौशल आधारित स्टार्टअप एवं रियायती तकनीकी योजनाओं में विशेष प्राथमिकता दी जाती है।'
                            : 'Beneficiaries aged 18 to 35 receive priority sanctioning under NSFDC term loans, vocational skill ventures, and micro-enterprises.'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        {language === 'hi'
                          ? 'आपकी आयु मानक ऋण योजनाओं के लिए पात्र है। चैनल पार्टनर ऋण अवधि को सक्रिय व्यावसायिक आय से जोड़ते हैं।'
                          : 'Your age qualifies across standard term lending and micro-credit programs, with repayment duration aligned to enterprise cash flow.'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* QUESTION 3: EMPLOYMENT STATUS (ARE YOU EMPLOYED OR NOT) */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 3 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {language === 'hi' ? 'क्या आप वर्तमान में कार्यरत / रोजगार में हैं?' : 'Are you Currently Employed or Not?'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'hi'
                        ? 'आपके रोजगार की प्रकृति के आधार पर स्वरोजगार, विस्तार या कौशल सहायता पहचानी जाएगी।'
                        : 'Helps pinpoint schemes designed for brand new enterprises, artisanal expansion, or education.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 'UNEMPLOYED',
                        title: language === 'hi' ? 'बेरोजगार / स्वरोजगार के इच्छुक' : 'Unemployed / Seeking Self-Employment',
                        desc: language === 'hi'
                          ? 'नया व्यवसाय, छोटी दुकान अथवा आजीविका इकाई स्थापित करने हेतु पूंजी की आवश्यकता है।'
                          : 'Looking for capital, technical training, and subsidy to set up a brand new small enterprise or shop.',
                        badge: language === 'hi' ? 'नया उद्यम प्राथमिकता' : 'New Venture Priority',
                        icon: <Briefcase className="w-5 h-5 text-emerald-700" />,
                      },
                      {
                        id: 'SELF_EMPLOYED',
                        title: language === 'hi' ? 'स्वरोजगार / छोटा व्यवसाय / कारीगर' : 'Self-Employed / Small Business / Artisan',
                        desc: language === 'hi'
                          ? 'वर्तमान में कोई छोटी दुकान, सेवा कार्य, हस्तशिल्प या पारंपरिक व्यवसाय चला रहे हैं और विस्तार चाहते हैं।'
                          : 'Already running a micro-enterprise, traditional craft, retail trade, or service unit seeking growth capital.',
                        badge: language === 'hi' ? 'MFS एवं मियादी ऋण' : 'MFS & Term Loan Fit',
                        icon: <Building className="w-5 h-5 text-amber-700" />,
                      },
                      {
                        id: 'DAILY_WAGE',
                        title: language === 'hi' ? 'दैनिक वेतनभोगी / खेतिहर मजदूर' : 'Daily Wage Worker / Agricultural Laborer',
                        desc: language === 'hi'
                          ? 'दैनिक मजदूरी अथवा कृषि श्रम में कार्यरत; उपकरण, पशुपालन (डेयरी/पोल्ट्री) हेतु सूक्ष्म ऋण की आवश्यकता।'
                          : 'Engaged in casual or farm labor; seeking micro-credit for productive tools, livestock, or machinery.',
                        badge: language === 'hi' ? 'सूक्ष्म वित्त पात्र' : 'Micro-Finance Eligible',
                        icon: <Sprout className="w-5 h-5 text-green-700" />,
                      },
                      {
                        id: 'STUDENT',
                        title: language === 'hi' ? 'विद्यार्थी / उच्च शिक्षा आकांक्षी' : 'Student / Higher Education Aspirant',
                        desc: language === 'hi'
                          ? 'मान्यता प्राप्त तकनीकी, व्यावसायिक, मेडिकल अथवा स्नातकोत्तर डिग्री में अध्ययनरत अथवा प्रवेशार्थी।'
                          : 'Pursuing or admitted into full-time technical, medical, management, or professional degree courses.',
                        badge: language === 'hi' ? 'शिक्षा ऋण (ELS)' : 'ELS Education Fit',
                        icon: <GraduationCap className="w-5 h-5 text-blue-700" />,
                      },
                      {
                        id: 'SALARIED',
                        title: language === 'hi' ? 'वेतनभोगी कर्मचारी / अनुबंध कर्मी' : 'Salaried Employee / Contractual Worker',
                        desc: language === 'hi'
                          ? 'असंगठित अथवा निजी क्षेत्र में कार्यरत; परिवार के सदस्यों के स्वरोजगार अथवा शिक्षा हेतु ऋण के इच्छुक।'
                          : 'Working in private or contractual services; seeking project finance for a family member or higher studies.',
                        badge: language === 'hi' ? 'पारिवारिक उद्यम' : 'Family Enterprise',
                        icon: <User className="w-5 h-5 text-purple-700" />,
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEmploymentStatus(item.id as EmploymentStatus)}
                        className={`touch-target w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-3 ${
                          employmentStatus === item.id
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            {item.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                        {employmentStatus === item.id && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUESTION 4: STATE AND UNION TERRITORIES */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 4 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {language === 'hi' ? 'अपना राज्य या केंद्र शासित प्रदेश चुनें' : 'Select your State or Union Territory'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'hi'
                        ? 'यह आपके स्थानीय राज्य चैनल एजेंसी (SCA) एवं निकटतम बैंक शाखाओं से संपर्क स्थापित करता है।'
                        : 'Maps your official State Channelizing Agency and regional banking network.'}
                    </p>
                  </div>

                  {/* Full 36 States & UTs Dropdown */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                    <label htmlFor="state-select" className="text-xs font-bold text-slate-800 block">
                      {language === 'hi' ? 'सभी २८ राज्य एवं ८ केंद्र शासित प्रदेश (All 36 Regions):' : 'All 28 States & 8 Union Territories:'}
                    </label>
                    <div className="relative">
                      <select
                        id="state-select"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 rounded-2xl p-3.5 text-sm font-bold text-slate-900 shadow-sm transition-all cursor-pointer"
                      >
                        <optgroup label={language === 'hi' ? 'राज्य (States)' : 'States'}>
                          {INDIAN_STATES_AND_UTS.filter(r => r.type === 'STATE').map((r) => (
                            <option key={r.code} value={r.name}>
                              {r.name} {language === 'hi' ? `(${r.nameHi})` : ''}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label={language === 'hi' ? 'केंद्र शासित प्रदेश (Union Territories)' : 'Union Territories'}>
                          {INDIAN_STATES_AND_UTS.filter(r => r.type === 'UT').map((r) => (
                            <option key={r.code} value={r.name}>
                              {r.name} {language === 'hi' ? `(${r.nameHi})` : ''}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* QUESTION 5: RURAL OR URBAN LOCALITY */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 5 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {language === 'hi' ? 'आप किस क्षेत्र से हैं? (ग्रामीण अथवा शहरी)' : 'Are you from a Rural or Urban Area?'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'hi'
                        ? 'ग्रामीण एवं शहरी क्षेत्रों के लिए विशेष ऋण वितरण नियम एवं प्राथमिकताएं लागू होती हैं।'
                        : 'Determines priority allocation through Regional Rural Banks or Urban commercial branches.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* RURAL */}
                    <button
                      type="button"
                      onClick={() => setAreaType('RURAL')}
                      className={`touch-target p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        areaType === 'RURAL'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-bold">
                            <Sprout className="w-5 h-5" />
                          </div>
                          {areaType === 'RURAL' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h3 className="font-extrabold text-base text-slate-900">
                            {language === 'hi' ? 'ग्रामीण (Rural)' : 'Rural Area'}
                          </h3>
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {language === 'hi' ? 'ग्राम्य प्राथमिकता' : 'Grassroots Focus'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {language === 'hi'
                            ? 'ग्राम पंचायत, कृषि, पशुपालन, डेयरी, ग्रामीण कारीगरी अथवा ग्रामीण हाट दुकान।'
                            : 'Village, Gram Panchayat, agriculture, dairy, poultry, village artisan, or local trade.'}
                        </p>
                      </div>
                    </button>

                    {/* URBAN */}
                    <button
                      type="button"
                      onClick={() => setAreaType('URBAN')}
                      className={`touch-target p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        areaType === 'URBAN'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                            <Building className="w-5 h-5" />
                          </div>
                          {areaType === 'URBAN' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h3 className="font-extrabold text-base text-slate-900">
                            {language === 'hi' ? 'शहरी (Urban)' : 'Urban Area'}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {language === 'hi' ? 'नगरीय गतिशीलता' : 'Urban Commerce'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {language === 'hi'
                            ? 'नगर निगम, शहर, मेट्रो, स्वच्छ गतिशीलता (ई-रिक्शा/वाहन), खुदरा व्यापार अथवा वाणिज्यिक सेवाएं।'
                            : 'Municipal Corporation, City, Metro area, retail business, services, e-mobility & commercial transport.'}
                        </p>
                      </div>
                    </button>

                    {/* SEMI-URBAN */}
                    <button
                      type="button"
                      onClick={() => setAreaType('SEMI_URBAN')}
                      className={`touch-target p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        areaType === 'SEMI_URBAN'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <Compass className="w-5 h-5" />
                          </div>
                          {areaType === 'SEMI_URBAN' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h3 className="font-extrabold text-base text-slate-900">
                            {language === 'hi' ? 'अर्ध-शहरी (Semi-Urban)' : 'Semi-Urban / Rurban'}
                          </h3>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {language === 'hi' ? 'कस्बा / ब्लॉक' : 'Block / Town'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {language === 'hi'
                            ? 'तहसील मुख्यालय, नगर पंचायत, विकासशील कस्बा या औद्योगिक उपनगरीय क्षेत्र।'
                            : 'Tehsil town, block headquarters, nagar panchayat, or suburban growth center.'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* QUESTION 6: LOAN PURPOSE / ALL NSFDC LOAN OPTIONS */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 6 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {discUI.purposeQuestion}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {discUI.purposeSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* 1. Small Business & Self Employment */}
                    <button
                      type="button"
                      onClick={() => handlePurposeChange('BUSINESS')}
                      className={`touch-target p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        purpose === 'BUSINESS'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        {purpose === 'BUSINESS' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">
                        {discUI.purposeBusiness}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {discUI.purposeBusinessDesc}
                      </p>
                    </button>

                    {/* 2. Higher & Technical Education */}
                    <button
                      type="button"
                      onClick={() => handlePurposeChange('EDUCATION')}
                      className={`touch-target p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        purpose === 'EDUCATION'
                          ? 'border-blue-600 bg-blue-50/60 shadow-md ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        {purpose === 'EDUCATION' && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">
                        {discUI.purposeEducation}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {discUI.purposeEducationDesc}
                      </p>
                    </button>

                    {/* 3. Green Business Scheme */}
                    <button
                      type="button"
                      onClick={() => handlePurposeChange('GREEN_BUSINESS')}
                      className={`touch-target p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        purpose === 'GREEN_BUSINESS'
                          ? 'border-teal-600 bg-teal-50/60 shadow-md ring-1 ring-teal-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                          <Leaf className="w-5 h-5" />
                        </div>
                        {purpose === 'GREEN_BUSINESS' && (
                          <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">
                        {discUI.purposeGreen}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {discUI.purposeGreenDesc}
                      </p>
                    </button>

                    {/* 4. Agriculture & Allied Activities */}
                    <button
                      type="button"
                      onClick={() => handlePurposeChange('AGRICULTURE')}
                      className={`touch-target p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        purpose === 'AGRICULTURE'
                          ? 'border-amber-600 bg-amber-50/60 shadow-md ring-1 ring-amber-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Sprout className="w-5 h-5" />
                        </div>
                        {purpose === 'AGRICULTURE' && (
                          <CheckCircle2 className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">
                        {discUI.purposeAgri}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {discUI.purposeAgriDesc}
                      </p>
                    </button>

                    {/* 5. Transport & Commercial Vehicles */}
                    <button
                      type="button"
                      onClick={() => handlePurposeChange('TRANSPORT')}
                      className={`touch-target sm:col-span-2 p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        purpose === 'TRANSPORT'
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                        {purpose === 'TRANSPORT' && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1">
                        {discUI.purposeTransport}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {discUI.purposeTransportDesc}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* QUESTION 7: PROJECT COST */}
              {step === 7 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 7 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {t.finder.step2Title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {t.finder.step2Desc}
                    </p>
                  </div>

                  {/* Purpose-tailored presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {getCostPresetsForPurpose().map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleCostPreset(preset.value)}
                        className={`touch-target py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                          projectCost === preset.value
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Field */}
                  <div className="pt-3">
                    <label htmlFor="custom-cost" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t.finder.customAmount}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                        ₹
                      </span>
                      <input
                        id="custom-cost"
                        type="text"
                        inputMode="numeric"
                        value={customCostInput}
                        onChange={handleCustomCostChange}
                        className="touch-target w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 font-bold text-slate-900 text-base"
                        placeholder="250000"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {language === 'hi'
                        ? `निर्धारित राशि: ₹${projectCost.toLocaleString('en-IN')}`
                        : `Entered Amount: ₹${projectCost.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              )}

              {/* QUESTION 8: ANNUAL FAMILY INCOME */}
              {step === 8 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 8 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {t.finder.step3Title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {t.finder.step3Desc}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {t.finder.incomePresets.map((preset) => {
                      const isSelected = annualFamilyIncome === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handleIncomePreset(preset.value)}
                          className={`touch-target w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-600'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span className="font-bold text-sm text-slate-900">
                            {preset.label}
                          </span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {annualFamilyIncome > 500000 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        {language === 'hi'
                          ? 'वार्षिक पारिवारिक आय ₹5 लाख से अधिक होने पर रियायती योजना शर्तें लागू नहीं हो सकती हैं।'
                          : 'Annual family income exceeding ₹5 Lakhs is currently above the NSFDC concessional loan ceiling.'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* QUESTION 9: SC CERTIFICATE */}
              {step === 9 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 9 of {totalSteps}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {t.finder.step4Title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {t.finder.step4Desc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setScCertificate('YES')}
                      className={`touch-target w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        scCertificate === 'YES'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          {t.finder.scYes}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {language === 'hi'
                            ? 'सक्षम प्राधिकारी द्वारा जारी मान्य अनुसूचित जाति प्रमाण पत्र'
                            : 'Valid certificate issued by authorized Revenue Officer / Tehsildar'}
                        </span>
                      </div>
                      {scCertificate === 'YES' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setScCertificate('IN_PROGRESS')}
                      className={`touch-target w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        scCertificate === 'IN_PROGRESS'
                          ? 'border-amber-600 bg-amber-50/60 shadow-sm ring-1 ring-amber-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          {t.finder.scInProgress}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {language === 'hi'
                            ? 'आवेदन किया है परंतु प्रमाण पत्र जारी होना बाकी है'
                            : 'Applied for certificate; pending issuance from revenue office'}
                        </span>
                      </div>
                      {scCertificate === 'IN_PROGRESS' && (
                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setScCertificate('NO')}
                      className={`touch-target w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        scCertificate === 'NO'
                          ? 'border-red-600 bg-red-50/60 shadow-sm ring-1 ring-red-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          {t.finder.scNo}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {language === 'hi'
                            ? 'मेरे पास जाति प्रमाण पत्र नहीं है'
                            : 'I do not hold an SC certificate or belong to another category'}
                        </span>
                      </div>
                      {scCertificate === 'NO' && <XCircle className="w-5 h-5 text-red-600" />}
                    </button>
                  </div>

                  {scCertificate === 'NO' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>
                        {language === 'hi'
                          ? 'NSFDC योजनाएं विशेष रूप से अनुसूचित जाति के नागरिकों के लिए हैं। बिना प्रमाण पत्र के आवेदन संभव नहीं है।'
                          : 'NSFDC schemes are strictly reserved for Scheduled Caste beneficiaries. Applications without SC certificate cannot proceed.'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* QUESTION 10: COURSE TYPE (EDUCATION ONLY) */}
              {step === 10 && purpose === 'EDUCATION' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question 10 of 10 (Education Confirmation)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {t.finder.courseTypeTitle}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'hi'
                        ? 'रियायती शिक्षा ऋण केवल मान्यता प्राप्त संस्थानों के पूर्णकालिक व्यावसायिक/तकनीकी डिग्री या डिप्लोमा के लिए मान्य है।'
                        : 'Concessional education loans are approved for recognized full-time professional or technical courses in India or abroad.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCourseType('FULL_TIME_PROFESSIONAL')}
                      className={`touch-target w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        courseType === 'FULL_TIME_PROFESSIONAL'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-900">
                        {t.finder.courseYes}
                      </span>
                      {courseType === 'FULL_TIME_PROFESSIONAL' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCourseType('OTHER')}
                      className={`touch-target w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        courseType === 'OTHER'
                          ? 'border-amber-600 bg-amber-50/60 shadow-sm ring-1 ring-amber-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-900">
                        {t.finder.courseNo}
                      </span>
                      {courseType === 'OTHER' && (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="touch-target px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.finder.btnBack}</span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="touch-target px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.common.backToHome}</span>
                  </Link>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleNext}
                  className="touch-target px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>
                    {loading
                      ? t.common.loading
                      : (step === 9 && purpose !== 'EDUCATION') || step === 10
                      ? t.finder.btnSubmit
                      : t.finder.btnNext}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* RECOMMENDATION RESULTS VIEW (GUIDE MODE) */
            <div className="space-y-6">
              <div className="bg-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">
                      {t.finder.resultsTitle}
                    </h2>
                    <p className="text-xs text-emerald-100 mt-1">
                      {t.finder.resultsSubtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    <button
                      onClick={() => setRecommendationResult(null)}
                      className="touch-target px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.finder.btnBack}</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="touch-target px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.finder.btnReset}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Toast Notification */}
              {saveToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveToast}
                </div>
              )}

              {/* Beneficiary Profile Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    {language === 'hi' ? 'आपका प्रोफ़ाइल:' : 'Your Profile:'}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                    {gender === 'FEMALE' ? (language === 'hi' ? 'महिला' : 'Female') : gender === 'MALE' ? (language === 'hi' ? 'पुरुष' : 'Male') : (language === 'hi' ? 'अन्य' : 'Other')} • {age} {language === 'hi' ? 'वर्ष' : 'Yrs'}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                    {employmentStatus === 'UNEMPLOYED'
                      ? (language === 'hi' ? 'बेरोजगार' : 'Unemployed')
                      : employmentStatus === 'SELF_EMPLOYED'
                      ? (language === 'hi' ? 'स्वरोजगार' : 'Self-Employed')
                      : employmentStatus === 'DAILY_WAGE'
                      ? (language === 'hi' ? 'दैनिक मजदूरी' : 'Daily Wage')
                      : employmentStatus === 'STUDENT'
                      ? (language === 'hi' ? 'विद्यार्थी' : 'Student')
                      : (language === 'hi' ? 'वेतनभोगी' : 'Salaried')}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                    {state} ({areaType === 'RURAL' ? (language === 'hi' ? 'ग्रामीण' : 'Rural') : areaType === 'URBAN' ? (language === 'hi' ? 'शहरी' : 'Urban') : (language === 'hi' ? 'अर्ध-शहरी' : 'Semi-Urban')})
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold">
                    SC: {scCertificate === 'YES' ? (language === 'hi' ? 'सत्यापित' : 'Verified') : scCertificate === 'IN_PROGRESS' ? (language === 'hi' ? 'प्रक्रियाधीन' : 'In-Progress') : (language === 'hi' ? 'नहीं' : 'No')}
                  </span>
                </div>
                <button
                  onClick={() => setRecommendationResult(null)}
                  className="touch-target text-xs font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0 self-start sm:self-auto"
                >
                  {t.finder.btnBack}
                </button>
              </div>

              {/* Task 2: Top Pick with matchedRule Banner Merged with Full Scheme Details */}
              {recommendationResult.recommended && (() => {
                const resultsList = Array.isArray(recommendationResult.results) ? recommendationResult.results : [];
                const topRecItem = resultsList.find(
                  (r) =>
                    (recommendationResult.recommended?.schemeId && r.scheme?.id === recommendationResult.recommended.schemeId) ||
                    (recommendationResult.recommended?.schemeCode && r.schemeCode === recommendationResult.recommended.schemeCode) ||
                    (recommendationResult.recommended?.schemeCode && r.scheme?.code === recommendationResult.recommended.schemeCode) ||
                    (recommendationResult.recommended?.schemeName && r.schemeName === recommendationResult.recommended.schemeName) ||
                    (recommendationResult.recommended?.schemeName && r.scheme?.name === recommendationResult.recommended.schemeName)
                ) || resultsList[0];

                const localizedScheme = topRecItem ? getLocalizedScheme(topRecItem.scheme, language) : null;
                const labels = getLocalizedCardLabels(language);
                const isMatch = topRecItem?.decision === 'LIKELY_MATCH';
                const isPossible = topRecItem?.decision === 'POSSIBLE_MATCH';

                return (
                  <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/80 space-y-5">
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {topRecItem && (
                          <>
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                isMatch
                                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                                  : isPossible
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                  : 'bg-white/10 text-slate-300'
                              }`}
                            >
                              {isMatch
                                ? t.finder.matchStrong
                                : isPossible
                                ? t.finder.matchPossible
                                : t.finder.matchNone}
                            </span>
                            <span className="text-xs font-bold text-slate-200 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded">
                              {topRecItem.schemeCode}
                            </span>
                            {gender === 'FEMALE' && (topRecItem.scheme.code === 'ELS' || topRecItem.scheme.code === 'AMY') && (
                              <span className="text-[10px] font-bold text-rose-200 bg-rose-500/20 border border-rose-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-rose-300" />
                                {topRecItem.scheme.code === 'ELS' ? '0.5% Female Rebate (6.0% Net)' : 'Mahila Priority'}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {topRecItem && (
                          <span className="text-xs font-bold text-emerald-200/90 bg-white/10 border border-white/10 px-3 py-1 rounded-xl">
                            {labels.projectCostLimit}:{' '}
                            {formatLocalizedLakh(topRecItem.scheme.project_cost_max, language)}
                          </span>
                        )}
                        <div className="text-xs font-black bg-white/10 px-3 py-1 rounded-xl text-emerald-300 border border-white/10">
                          Fit Score: {Math.round(recommendationResult.recommended.fitScore * 100)}%
                        </div>
                        {isAuthenticated && user?.id && (
                          <button
                            onClick={async () => {
                              const rec = recommendationResult.recommended!;
                              try {
                                await fetch('/api/user/saved-schemes', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: user.id,
                                    schemeId: rec.schemeId,
                                    schemeCode: rec.schemeCode || rec.schemeId,
                                    schemeName: rec.schemeName,
                                    fitScore: rec.fitScore,
                                  }),
                                });
                                setSaveToast(language === 'hi' ? 'योजना सहेजी गई ★' : 'Scheme saved to bookmarks ★');
                                setTimeout(() => setSaveToast(null), 3500);
                              } catch {
                                // silently ignore
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
                            title="Save scheme to dashboard"
                          >
                            <Star className="w-3.5 h-3.5" />
                            {language === 'hi' ? 'सहेजें' : 'Save'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scheme Title & Tagline */}
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        {localizedScheme ? localizedScheme.name : recommendationResult.recommended.schemeName}
                      </h3>
                      {localizedScheme?.tagline && (
                        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed font-normal">
                          {localizedScheme.tagline}
                        </p>
                      )}
                    </div>

                    {/* Matched Statutory Rule */}
                    <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs">
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block mb-1">
                        {language === 'hi' ? 'स्वीकृत वैधानिक नियम (Matched Rule):' : 'Matched Statutory Rule:'}
                      </span>
                      <p className="text-xs text-slate-100 font-medium leading-relaxed">
                        {recommendationResult.recommended.matchedRule}
                      </p>
                    </div>

                    {/* Why this scheme appeared (Reasons) */}
                    {topRecItem && topRecItem.reasons.length > 0 && (
                      <div className="p-4 bg-emerald-900/50 border border-emerald-400/30 rounded-2xl text-xs">
                        <span className="font-extrabold text-emerald-300 block mb-2 text-xs uppercase tracking-wide">
                          {t.finder.whyTitle}
                        </span>
                        <ul className="space-y-1.5 text-emerald-50">
                          {(language === 'hi' && topRecItem.reasonsHi ? topRecItem.reasonsHi : topRecItem.reasons).map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}



                    {/* Action CTAs for Top Recommended Scheme */}
                    {topRecItem && (
                      <div className="pt-4 border-t border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2.5">
                          <Link
                            href={`/calculator?amount=${Math.min(projectCost, topRecItem.scheme.max_loan_amount)}&rate=${topRecItem.scheme.beneficiary_interest_rate_min}&tenure=${topRecItem.scheme.repayment_period_months}&moratorium=${topRecItem.scheme.moratorium_months}`}
                            className="touch-target inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
                          >
                            <Calculator className="w-4 h-4" />
                            <span>{t.finder.btnCalculate}</span>
                          </Link>

                          <a
                            href="#gis-partner-locator"
                            onClick={() => setFocusedSchemeCode(topRecItem.schemeCode)}
                            className="touch-target inline-flex items-center gap-2 px-4 py-2.5 border border-emerald-400/40 bg-white/10 hover:bg-white/20 text-emerald-100 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-emerald-300" />
                            <span>{t.finder.btnFindPartner} (GIS)</span>
                          </a>
                        </div>

                        <Link
                          href={`/schemes/${topRecItem.scheme.slug}`}
                          className="text-xs sm:text-sm font-bold text-emerald-300 hover:text-white underline inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>{t.common.viewDetails}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Other Candidate Schemes Detailed Comparison (Excluding Top Pick already displayed above - showing top 4 total including best match) */}
              {(() => {
                const resultsList = Array.isArray(recommendationResult.results) ? recommendationResult.results : [];
                const remainingResults = recommendationResult.recommended
                  ? resultsList.filter(
                      (rec) =>
                        rec.scheme?.id !== recommendationResult.recommended?.schemeId &&
                        rec.schemeCode !== recommendationResult.recommended?.schemeCode &&
                        rec.scheme?.code !== recommendationResult.recommended?.schemeCode &&
                        rec.schemeName !== recommendationResult.recommended?.schemeName &&
                        rec.scheme?.name !== recommendationResult.recommended?.schemeName
                    )
                  : resultsList;

                // Show top 4 total matched schemes including the best match (1 best match + 3 candidates)
                const maxCandidateCount = recommendationResult.recommended ? 3 : 4;
                const topCandidateResults = (remainingResults || []).slice(0, maxCandidateCount);

                if (topCandidateResults.length === 0) return null;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        {language === 'hi' ? 'अन्य candidate योजनाएं (Other Candidate Schemes)' : 'Other Candidate Schemes'} ({topCandidateResults.length})
                      </h3>
                    </div>
                    {topCandidateResults.map((rec: RecommendationItem) => {
                      const isMatch = rec.decision === 'LIKELY_MATCH';
                      const isPossible = rec.decision === 'POSSIBLE_MATCH';
                      const localizedScheme = getLocalizedScheme(rec.scheme, language);
                      const labels = getLocalizedCardLabels(language);

                      return (
                        <div
                          key={rec.schemeCode}
                          className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${
                            isMatch
                              ? 'border-emerald-600 shadow-md'
                              : isPossible
                              ? 'border-amber-400'
                              : 'border-slate-200 opacity-75'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  isMatch
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : isPossible
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isMatch
                                  ? t.finder.matchStrong
                                  : isPossible
                                  ? t.finder.matchPossible
                                  : t.finder.matchNone}
                              </span>
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                                {rec.schemeCode}
                              </span>
                              {gender === 'FEMALE' && (rec.scheme.code === 'ELS' || rec.scheme.code === 'AMY') && (
                                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {rec.scheme.code === 'ELS' ? '0.5% Female Rebate (6.0% Net)' : 'Mahila Priority'}
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-bold text-slate-600">
                              {labels.projectCostLimit}:{' '}
                              {formatLocalizedLakh(rec.scheme.project_cost_max, language)}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {localizedScheme.name}
                          </h3>
                          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                            {localizedScheme.tagline}
                          </p>

                          {/* Reasons */}
                          {rec.reasons.length > 0 && (
                            <div className="mb-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                              <span className="font-bold text-emerald-900 block mb-1">
                                {t.finder.whyTitle}
                              </span>
                              <ul className="space-y-1 text-emerald-800">
                                {(language === 'hi' && rec.reasonsHi ? rec.reasonsHi : rec.reasons).map((r, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}



                          {/* Action CTAs */}
                          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/calculator?amount=${Math.min(projectCost, rec.scheme.max_loan_amount)}&rate=${rec.scheme.beneficiary_interest_rate_min}&tenure=${rec.scheme.repayment_period_months}&moratorium=${rec.scheme.moratorium_months}`}
                                className="touch-target inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                <Calculator className="w-3.5 h-3.5" />
                                <span>{t.finder.btnCalculate}</span>
                              </Link>

                              <a
                                href="#gis-partner-locator"
                                onClick={() => setFocusedSchemeCode(rec.schemeCode)}
                                className="touch-target inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{t.finder.btnFindPartner} (GIS)</span>
                              </a>
                            </div>

                            <Link
                              href={`/schemes/${rec.scheme.slug}`}
                              className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{t.common.viewDetails}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Interactive Post-Validation GIS Partner Locator Map */}
              <div id="gis-partner-locator" className="pt-6 scroll-mt-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>
                        {language === 'hi'
                          ? 'अनुशंसित योजना हेतु जीआईएस बैंक एवं चैनल लोकेटर'
                          : 'GIS Bank & Channel Partner Locator for Recommended Scheme'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {language === 'hi'
                        ? 'निकटतम अधिकृत बैंक शाखा अथवा राज्य चैनल निगम खोजें'
                        : 'Locate Nearest Authorized Bank Branch or State Channelizing Agency'}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {language === 'hi'
                        ? 'सत्यापित योजना के आधार पर सीधे निकटतम सेवा प्रदाता का चयन करें, दूरी जांचें और दिशा-निर्देश प्राप्त करें।'
                        : 'Directly view authorized institutions matching your validated scheme, check real GPS distance and get directions.'}
                    </p>
                  </div>
                </div>

                <DynamicGisMap
                  schemeCode={
                    focusedSchemeCode !== 'ALL'
                      ? focusedSchemeCode
                      : (recommendationResult.results || []).find((r) => r.decision === 'LIKELY_MATCH')?.schemeCode ||
                        recommendationResult.recommended?.schemeCode ||
                        'ALL'
                  }
                  schemeName={
                    (recommendationResult.results || []).find((r) => r.schemeCode === focusedSchemeCode)?.schemeName ||
                    recommendationResult.recommended?.schemeName
                  }
                  maxHeight="480px"
                  showFilters={true}
                />
              </div>

              {/* Results Bottom Navigation Bar */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setRecommendationResult(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-700" />
                  <span>{t.finder.btnBack}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleReset}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.finder.btnReset}</span>
                  </button>
                  <Link
                    href="/"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{t.common.backToHome}</span>
                  </Link>
                </div>
              </div>

              {/* Footnote with Rule Version */}
              <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-500">
                <span>{t.finder.sourceFootnote}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: ENTER YOUR SCHEME NAME HERE (Direct Lookup Mode) */}
      {activeTab === 'DIRECT_LOOKUP' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* Search Input */}
            <div className="mb-6">
              <label htmlFor="scheme-search-input" className="block text-sm font-extrabold text-slate-900 mb-2">
                {discUI.tabDirect}
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="scheme-search-input"
                  type="text"
                  value={directSearchQuery}
                  onChange={(e) => setDirectSearchQuery(e.target.value)}
                  placeholder={discUI.directSearchPlaceholder}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-slate-900 shadow-inner"
                />
                {directSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDirectSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Scheme Selector Chips */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                {discUI.quickTagsTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                {SCHEMES.map((scheme) => {
                  const isSelected = activeDirectScheme.code === scheme.code;
                  return (
                    <button
                      key={scheme.code}
                      type="button"
                      onClick={() => {
                        setSelectedDirectCode(scheme.code);
                        setDirectSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{scheme.code}</span>
                      <span className="text-[10px] opacity-80">
                        ({scheme.code === 'ELS' ? '6.0%' : scheme.code === 'MFS' ? '6.5%' : `${scheme.beneficiary_interest_rate_min}%`})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIRECT SCHEME PREVIEW CARD */}
            {activeDirectScheme ? (
              <div className="border-t border-slate-200 pt-6 space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="bg-emerald-800 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                        {activeDirectScheme.code}
                      </span>
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-2.5 py-0.5 rounded-md">
                        {activeDirectScheme.category.replace('_', ' ')}
                      </span>
                      {activeDirectScheme.code === 'ELS' && (
                        <span className="bg-rose-100 text-rose-800 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          0.5% Female Rebate
                        </span>
                      )}
                      {activeDirectScheme.code === 'AMY' && (
                        <span className="bg-rose-100 text-rose-800 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Women Micro-Credit
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {localizedDirectScheme.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {localizedDirectScheme.tagline}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/calculator?amount=${activeDirectScheme.max_loan_amount}&rate=${activeDirectScheme.beneficiary_interest_rate_min}&tenure=${activeDirectScheme.repayment_period_months}&moratorium=${activeDirectScheme.moratorium_months}`}
                      className="touch-target inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{t.finder.btnCalculate}</span>
                    </Link>
                    <Link
                      href={`/schemes/${activeDirectScheme.slug}`}
                      className="touch-target inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      <span>{t.common.viewDetails}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 4 Metrics Key Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-800 block mb-0.5">
                      {discUI.maxAssistance}
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-950">
                      {formatLocalizedLakh(activeDirectScheme.max_loan_amount, language)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">
                      Up to {activeDirectScheme.financing_percentage_max}% of project cost
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
                    <span className="text-[11px] font-semibold text-blue-800 block mb-0.5">
                      {discUI.interestRate}
                    </span>
                    <span className="text-base sm:text-lg font-black text-blue-950">
                      {activeDirectScheme.beneficiary_interest_rate_min === activeDirectScheme.beneficiary_interest_rate_max
                        ? `${activeDirectScheme.beneficiary_interest_rate_min}% p.a.`
                        : `${activeDirectScheme.beneficiary_interest_rate_min}% - ${activeDirectScheme.beneficiary_interest_rate_max}%`}
                    </span>
                    <span className="text-[10px] text-blue-700 block">
                      {activeDirectScheme.code === 'ELS'
                        ? '6.0% for female students'
                        : activeDirectScheme.rebate_women_pct
                        ? `${activeDirectScheme.rebate_women_pct}% rebate for women`
                        : 'Fixed concessional rate'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                    <span className="text-[11px] font-semibold text-amber-800 block mb-0.5">
                      {discUI.tenure}
                    </span>
                    <span className="text-base sm:text-lg font-black text-amber-950">
                      {Math.round(activeDirectScheme.repayment_period_months / 12)} Years
                    </span>
                    <span className="text-[10px] text-amber-700 block">
                      {activeDirectScheme.repayment_period_months} monthly installments
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
                    <span className="text-[11px] font-semibold text-purple-800 block mb-0.5">
                      {discUI.moratorium}
                    </span>
                    <span className="text-base sm:text-lg font-black text-purple-950">
                      {activeDirectScheme.code === 'ELS' ? 'Course + 1 Yr' : `${activeDirectScheme.moratorium_months} Months`}
                    </span>
                    <span className="text-[10px] text-purple-700 block">
                      Grace before EMI start
                    </span>
                  </div>
                </div>

                {/* Scheme Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">
                    {discUI.officialGuidelines}
                  </span>
                  <p>{localizedDirectScheme.description}</p>
                </div>

                {/* Eligible Ventures Section */}
                {eligibleVenturesForScheme.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span>{discUI.eligibleVenturesTitle} ({eligibleVenturesForScheme.length})</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {eligibleVenturesForScheme.slice(0, 6).map((v) => (
                        <div
                          key={v.id}
                          className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {language === 'hi' && v.nameHi ? v.nameHi : v.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {language === 'hi' && v.sectorNameHi ? v.sectorNameHi : v.sectorName}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            ₹{(v.cost_range_min / 100000).toFixed(1)}L - ₹{(v.cost_range_max / 100000).toFixed(1)}L
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mandatory Documents Checklist */}
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>{discUI.mandatoryDocsTitle}</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeDirectScheme.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {language === 'hi' && doc.nameHi ? doc.nameHi : doc.name}
                            </span>
                            {doc.mandatory && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 rounded">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {language === 'hi' && doc.descriptionHi ? doc.descriptionHi : doc.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GIS Partner Map embedded for this selected scheme */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{discUI.viewGisRoute}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {language === 'hi'
                        ? `${localizedDirectScheme.name} हेतु निकटतम बैंक एवं चैनल पार्टनर`
                        : `Authorized Partner Bank & Agency Branches for ${activeDirectScheme.name}`}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {language === 'hi'
                        ? 'इस योजना के लिए स्वीकृत वित्तीय संस्थानों को मानचित्र पर देखें और दिशा-निर्देश प्राप्त करें।'
                        : 'View channelizing institutions accepting applications for this scheme with GPS routing.'}
                    </p>
                  </div>

                  <DynamicGisMap
                    schemeCode={activeDirectScheme.code}
                    schemeName={activeDirectScheme.name}
                    maxHeight="440px"
                    showFilters={true}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl">
                {discUI.schemeNotFound}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FindSchemePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <FindSchemeContent />
    </Suspense>
  );
}
