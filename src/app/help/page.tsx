'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import {
  CheckSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Compass,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const { t } = useI18n();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: t.help.faq1Q, a: t.help.faq1A },
    { q: t.help.faq2Q, a: t.help.faq2A },
    { q: t.help.faq3Q, a: t.help.faq3A },
    { q: t.help.faq4Q, a: t.help.faq4A },
    { q: t.help.faq5Q, a: t.help.faq5A },
  ];

  const steps = [
    { step: '1', title: t.help.step1Title, desc: t.help.step1Desc },
    { step: '2', title: t.help.step2Title, desc: t.help.step2Desc },
    { step: '3', title: t.help.step3Title, desc: t.help.step3Desc },
    { step: '4', title: t.help.step4Title, desc: t.help.step4Desc },
    { step: '5', title: t.help.step5Title, desc: t.help.step5Desc },
  ];

  const docs = [
    { title: t.help.doc1Title, sub: t.help.doc1Sub },
    { title: t.help.doc2Title, sub: t.help.doc2Sub },
    { title: t.help.doc3Title, sub: t.help.doc3Sub },
    { title: t.help.doc4Title, sub: t.help.doc4Sub },
    { title: t.help.doc5Title, sub: t.help.doc5Sub },
    { title: t.help.doc6Title, sub: t.help.doc6Sub },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.backToHome}</span>
        </Link>
      </div>

      {/* Title Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.help.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.help.subtitle}
        </p>
      </div>

      {/* 5-Step Application Guide */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          {t.help.stepsTitle}
        </h2>

        <div className="space-y-6">
          {steps.map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-sm">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {t.help.docsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {docs.map((doc, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">{doc.title}</span>
                <span className="text-[11px] text-slate-500">{doc.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <span>{t.help.faqTitle}</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Navigation */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href="/schemes"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>{t.help.exploreSchemes}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/partners"
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{t.help.locateSca}</span>
          </Link>
          <Link
            href="/find-scheme"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>{t.help.findScheme}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
