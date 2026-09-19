'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { TrustStrip } from '@/components/TrustStrip';
import { SchemeCard } from '@/components/SchemeCard';
import { SCHEMES } from '@/lib/schemeData';
import { getLocalizedHomeFeatured, getLocalizedQuickActions } from '@/lib/i18n/localizationHelper';
import {
  Compass,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Calculator,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export default function HomePage() {
  const { language, t } = useI18n();
  const featured = getLocalizedHomeFeatured(language);
  const quickActions = getLocalizedQuickActions(language);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with Tricolor Watercolor Banner */}
      <section
        className="relative overflow-hidden pt-12 pb-20 px-4 bg-cover bg-center bg-no-repeat border-b border-slate-200"
        style={{ backgroundImage: "url('/magnific_tricolor_bg.jpg')" }}
      >
        {/* Subtle light overlay to maintain vibrant gradient while ensuring text legibility */}
        <div className="absolute inset-0 bg-white/15 pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          {/* Official AryaSaarthi Brand Emblem with Sahi Vyakti. Sahi Yojna. Sahi Marg. */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 via-emerald-400/20 to-emerald-600/30 rounded-full blur-lg opacity-80 group-hover:opacity-100 transition-opacity" />
              <img
                src="/hero_emblem.png"
                alt="AryaSaarthi — Sahi Vyakti. Sahi Yojna. Sahi Marg."
                className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-contain shadow-2xl hover:scale-105 transition-transform duration-300 ring-4 ring-white/90"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-slate-900 drop-shadow-sm">
            {t.home.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            {t.home.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/find-scheme"
              className="touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Compass className="w-5 h-5 text-slate-950" />
              <span>{t.home.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <Link
              href="/schemes"
              className="touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-base shadow-md hover:shadow-lg border border-emerald-700 transition-colors"
            >
              <span>{t.home.ctaSecondary}</span>
            </Link>
          </div>

          {/* 3 Pillars of AryaSaarthi: Sahi Vyakti. Sahi Yojna. Sahi Marg. */}
          <div className="mt-12 pt-8 border-t border-slate-300/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  1
                </div>
                <h3 className="font-extrabold text-amber-950 text-sm">
                  {t.homePillars.vyaktiTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-800 font-bold leading-relaxed">
                {t.homePillars.vyaktiDesc}
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  2
                </div>
                <h3 className="font-extrabold text-emerald-950 text-sm">
                  {t.homePillars.yojnaTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-800 font-bold leading-relaxed">
                {t.homePillars.yojnaDesc}
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-blue-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  3
                </div>
                <h3 className="font-extrabold text-blue-950 text-sm">
                  {t.homePillars.margTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-800 font-bold leading-relaxed">
                {t.homePillars.margDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <TrustStrip />

      {/* Quick Action Tiles */}
      <section className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 text-center">
          {t.home.quickActionsTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/find-scheme?purpose=BUSINESS"
            className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {t.home.actionBusiness}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.home.actionBusinessDesc}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
              <span>{quickActions.explore}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/find-scheme?purpose=EDUCATION"
            className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-500 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {t.home.actionEducation}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.home.actionEducationDesc}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700">
              <span>{quickActions.educationLoan}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/calculator"
            className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-500 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {t.home.actionCalculate}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.home.actionCalculateDesc}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-700">
              <span>{quickActions.calculate}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/partners"
            className="group bg-white rounded-2xl border border-slate-200 hover:border-purple-500 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {t.home.actionPartner}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.home.actionPartnerDesc}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-700">
              <span>{quickActions.locate}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Schemes Grid */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {featured.title}
            </h2>
          </div>
          <Link
            href="/schemes"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{featured.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCHEMES.slice(0, 3).map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </section>

      {/* Why Sahayak Section */}
      <section className="bg-slate-100/80 py-12 px-4 border-y border-slate-200">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            {t.home.whySahayak.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t.home.whySahayak.p1Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.home.whySahayak.p1Desc}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t.home.whySahayak.p2Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.home.whySahayak.p2Desc}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t.home.whySahayak.p3Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.home.whySahayak.p3Desc}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t.home.whySahayak.p4Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.home.whySahayak.p4Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
