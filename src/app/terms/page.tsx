'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { ExternalLink, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.termsPage.backToHome}</span>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.termsPage.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.termsPage.pageSubtitle}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            {t.termsPage.noGuarantee}
          </h2>
          <p>
            {t.termsPage.noGuaranteeDesc}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            {t.termsPage.indicativeFin}
          </h2>
          <p>
            {t.termsPage.indicativeFinDesc}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            {t.termsPage.dataResponsibility}
          </h2>
          <p>
            {t.termsPage.dataResponsibilityDesc}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            {t.termsPage.authoritativeVerif}
          </h2>
          <p>
            {t.termsPage.authoritativeVerifDesc}{' '}
            <a href="https://nsfdc.nic.in" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">
              <span>https://nsfdc.nic.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
