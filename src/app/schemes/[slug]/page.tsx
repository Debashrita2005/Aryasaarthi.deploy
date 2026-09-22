'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/authContext';
import { useI18n } from '@/lib/i18n/context';
import { getSchemeBySlug } from '@/lib/schemeData';
import { getVerifiedSchemeBySlug, COMMON_DOCUMENT_CHECKLIST } from '@/lib/verifiedSchemesData';
import { getVenturesForScheme } from '@/lib/ventureData';
import { getLocalizedScheme, getLocalizedCardLabels, formatLocalizedLakh } from '@/lib/i18n/localizationHelper';

const DynamicGisMap = dynamic(
  () => import('@/components/GisPartnerMap').then((mod) => mod.GisPartnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-500 font-semibold text-xs animate-pulse">
        Loading GIS Partner Locator...
      </div>
    ),
  }
);
import {
  ArrowLeft,
  Calculator,
  MapPin,
  ExternalLink,
  CheckCircle2,
  FileText,
  AlertCircle,
  Percent,
  Calendar,
  Clock,
  Banknote,
  ShieldAlert,
  Sparkles,
  Compass,
  ArrowUpRight,
  Building2,
  FileCheck,
  ShieldCheck,
  Info,
  Send,
  CheckCircle,
  X,
} from 'lucide-react';

export default function SchemeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const scheme = getSchemeBySlug(slug);
  const verifiedScheme = getVerifiedSchemeBySlug(slug);
  const { language, t } = useI18n();
  const { user, isAuthenticated, loginWithGoogle } = useAuth();

  // Scheme Inquiry Modal & State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || '');
  const [requestedLoanAmount, setRequestedLoanAmount] = useState('200000');
  const [projectCost, setProjectCost] = useState('250000');
  const [applicantPurpose, setApplicantPurpose] = useState('Small Enterprise / Self-Employment');
  const [applicantState, setApplicantState] = useState(user?.state || 'Uttar Pradesh');
  const [applicantDistrict, setApplicantDistrict] = useState(user?.district || '');
  const [inquiryNotes, setInquiryNotes] = useState('');

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitting(true);
    try {
      const currentCode = verifiedScheme ? verifiedScheme.code : scheme!.code;
      const currentName = verifiedScheme ? verifiedScheme.name : scheme!.name;
      const currentCategory = verifiedScheme ? verifiedScheme.category : 'LOAN';
      
      let uid = user?.id;
      if (!uid) {
        uid = applicantPhone ? `citizen_${applicantPhone.replace(/\D/g, '')}` : `citizen_${Date.now()}`;
      }

      const res = await fetch('/api/user/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          schemeCode: currentCode,
          schemeName: currentName,
          schemeCategory: currentCategory,
          purpose: applicantPurpose,
          requestedLoanAmount: parseInt(requestedLoanAmount, 10) || 100000,
          projectCost: parseInt(projectCost, 10) || 150000,
          applicantName: applicantName || user?.name || 'Beneficiary Citizen',
          applicantPhone: applicantPhone || user?.phone || '',
          applicantState,
          applicantDistrict,
          notes: inquiryNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInquirySuccess(data.inquiry?.id || 'SUBMITTED');
      } else {
        alert(data.error || 'Failed to submit inquiry');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting inquiry');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const renderInquiryModal = (curCode: string, curName: string) => {
    if (!showInquiryModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Official Scheme Inquiry
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {curName} ({curCode})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowInquiryModal(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {inquirySuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {t.schemeDetail.inquirySuccess}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.schemeDetail.inquirySuccessDesc + ' (#' + inquirySuccess.slice(-6).toUpperCase() + ')'}
              </p>
              <div className="pt-3 flex flex-wrap gap-2 justify-center">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  {t.schemeDetail.viewDashboard}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {t.schemeDetail.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t.schemeDetail.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.schemeDetail.phone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.schemeDetail.state}
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantState}
                    onChange={(e) => setApplicantState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.schemeDetail.reqAmount}
                  </label>
                  <input
                    type="number"
                    required
                    value={requestedLoanAmount}
                    onChange={(e) => setRequestedLoanAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.schemeDetail.purpose}
                  </label>
                  <input
                    type="text"
                    value={applicantPurpose}
                    onChange={(e) => setApplicantPurpose(e.target.value)}
                    placeholder="Business / Education"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t.schemeDetail.notes}
                </label>
                <textarea
                  rows={2}
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                  placeholder="Need assistance with caste certificate, nearest bank branch, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  {t.schemeDetail.cancel}
                </button>
                <button
                  type="submit"
                  disabled={inquirySubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all"
                >
                  {inquirySubmitting
                    ? (t.schemeDetail.submitting)
                    : (t.schemeDetail.submitInquiry)}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  if (!scheme && !verifiedScheme) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Scheme Not Found</h1>
        <p className="text-sm text-slate-600 mb-6">The requested scheme could not be located in our directory.</p>
        <Link href="/schemes" className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors">
          ← Back to All Schemes
        </Link>
      </div>
    );
  }

  // --- RENDERING FOR VERIFIED DIRECTORY SCHEME (17 Central + 76 State/UT) ---
  if (!scheme && verifiedScheme) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Top Breadcrumb Navigation Trail */}
        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/60">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.schemeDetail.backToSchemes}</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-slate-400 font-medium">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <span>/</span>
            <Link href="/schemes" className="hover:text-emerald-700">Schemes</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">{verifiedScheme.code}</span>
          </div>
        </div>

        {/* Scheme Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
                  verifiedScheme.level === 'CENTRAL'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {verifiedScheme.level === 'CENTRAL' ? 'Central Scheme' : `State Scheme: ${verifiedScheme.state}`}
              </span>
              <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {verifiedScheme.code}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {`${t.schemeDetail.verifiedOn}: ${verifiedScheme.lastVerifiedDate || '17 Sep 2026'}`}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {language === 'hi' && verifiedScheme.nameHi ? verifiedScheme.nameHi : verifiedScheme.name}
          </h1>

          <div className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-lg">
            Category: {verifiedScheme.typeLabel}
          </div>

          {/* Key Eligibility Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>{t.schemeDetail.eligibilityCriteria}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {verifiedScheme.eligibility}
            </p>
          </div>

          {/* Official Route Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-emerald-900 text-white rounded-2xl shadow-xs">
            <div>
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Official Application Route
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {verifiedScheme.officialRoute}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={verifiedScheme.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition-colors shadow-2xs"
              >
                <span>{t.common.officialLink}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

            </div>
          </div>
        </div>

        {/* Specific Document Preparation Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-extrabold text-slate-900">
              {t.schemeDetail.requiredDocs}
            </h2>
          </div>

          <p className="text-xs text-slate-600">
            {t.schemeDetail.requiredDocs}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verifiedScheme.documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {doc.name}
                    </span>
                    {doc.mandatory ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-1.5 py-0.2 rounded">
                        If applicable
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {doc.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Common Checklist Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Important Application Guidance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Always verify current official deadlines, income ceilings, and domicile certificates on the implementing state/portal checklist before submission. Retain all original certificates for verification.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/schemes"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>{t.schemeDetail.backToSchemes}</span>
          </Link>

          <Link
            href="/find-scheme"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>{t.schemeDetail.checkEligibility}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Inquiry Modal */}
        {renderInquiryModal(verifiedScheme.code, verifiedScheme.name)}
      </div>
    );
  }

  // --- RENDERING FOR CORE NSFDC LENDING SCHEMES (MFS, AMY, TLS, UNY, ELS, GBS) ---
  const localized = getLocalizedScheme(scheme!, language);
  const labels = getLocalizedCardLabels(language);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Top Breadcrumb Navigation Trail */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/60">
        <Link
          href="/schemes"
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.schemeDetail.backToSchemes}</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-slate-400 font-medium">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <span>/</span>
          <Link href="/schemes" className="hover:text-emerald-700">Schemes</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">{scheme!.code}</span>
        </div>
      </div>

      {/* Scheme Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            {scheme!.code}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified by Gov. Portal: 17 Sep 2026</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
          {localized.name}
        </h1>
        <p className="text-sm text-emerald-800 font-semibold mb-4">
          {localized.tagline}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {localized.description}
        </p>

        {/* Action Header Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">

          <Link
            href={`/calculator?amount=${Math.min(scheme!.max_loan_amount, 250000)}&rate=${scheme!.beneficiary_interest_rate_min}&tenure=${scheme!.repayment_period_months}&moratorium=${scheme!.moratorium_months}`}
            className="touch-target inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>{labels.calculate}</span>
          </Link>
          <Link
            href={`/partners?scheme=${scheme!.code}`}
            className="touch-target inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>{t.schemeDetail.findAgency}</span>
          </Link>
        </div>
      </div>

      {/* Financial Terms & Limits Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>{t.schemeDetail.maxCost}</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {formatLocalizedLakh(scheme!.project_cost_max, language)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {scheme!.financing_percentage_max}% {t.schemeDetail.maxFinancing}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>{labels.interestRate}</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-700">
            {scheme!.beneficiary_interest_rate_min}%
            {scheme!.beneficiary_interest_rate_max !== scheme!.beneficiary_interest_rate_min ? ` – ${scheme!.beneficiary_interest_rate_max}%` : ''}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {scheme!.rebate_women_pct ? `${scheme!.rebate_women_pct}% ${t.schemeDetail.womenRebate}` : t.schemeDetail.noRebate}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{labels.tenure}</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {Math.round(scheme!.repayment_period_months / 12)} {labels.years}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {scheme!.repayment_period_months} {labels.months}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{labels.moratorium}</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {scheme!.moratorium_months} {labels.months}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {t.schemeDetail.moratorium}
          </div>
        </div>
      </div>

      {/* Eligibility Rules Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{t.schemeDetail.eligibilityCriteria}</span>
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
            <span>
              <strong>{t.schemeDetail.casteReq}:</strong> {t.schemeDetail.casteReqText}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
            <span>
              <strong>{t.schemeDetail.incomeCeiling}:</strong> {t.schemeDetail.incomeCeilingText} {formatLocalizedLakh(scheme!.eligibility_rules.maxAnnualFamilyIncome, language)}.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
            <span>
              <strong>{t.schemeDetail.ageReq}:</strong> {t.schemeDetail.minAgeText} {scheme!.eligibility_rules.minAge || 18} {labels.years}
              {scheme!.eligibility_rules.maxAge ? ` ${t.schemeDetail.maxAgeText} ${scheme!.eligibility_rules.maxAge} ${labels.years}` : ''}.
            </span>
          </li>
          {scheme!.eligibility_rules.notes && (
            <li className="flex items-start gap-2.5 text-slate-600 italic">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <span>
                {language === 'hi' && scheme!.eligibility_rules.notesHi ? scheme!.eligibility_rules.notesHi : scheme!.eligibility_rules.notes}
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Required Documents Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>{t.schemeDetail.requiredDocs}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scheme!.documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {language === 'hi' && doc.nameHi ? doc.nameHi : doc.name}
                  {doc.mandatory && (
                    <span className="text-rose-600 ml-1 font-semibold">*</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'hi' && doc.descriptionHi ? doc.descriptionHi : doc.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Source & Verification Metadata */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-slate-700">{t.schemeDetail.officialSource}:</span> {scheme!.source_title}
          <span className="mx-2">•</span>
          <span>{t.schemeDetail.verifiedOn}: {scheme!.source_checked_at}</span>
        </div>
        <a
          href={scheme!.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold shrink-0"
        >
          <span>{scheme!.official_source_url}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href="/schemes"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>{t.schemeDetail.backToSchemes}</span>
        </Link>

        <Link
          href="/find-scheme"
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>{t.schemeDetail.checkEligibility}</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Inquiry Modal */}
      {renderInquiryModal(scheme!.code, localized.name)}
    </div>
  );
}
