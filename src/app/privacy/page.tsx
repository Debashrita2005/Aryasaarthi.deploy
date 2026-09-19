'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Lock, EyeOff, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

export default function PrivacyPage() {
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
          <span>{t.privacyPage.backToHome}</span>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.privacyPage.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.privacyPage.pageSubtitle}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <span>{t.privacyPage.zeroCollection}</span>
          </h2>
          <p>
            {t.privacyPage.zeroCollectionDesc}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>{t.privacyPage.noUploads}</span>
          </h2>
          <p>
            {t.privacyPage.noUploadsDesc}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>{t.privacyPage.locationPrivacy}</span>
          </h2>
          <p>
            {t.privacyPage.locationPrivacyDesc}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t.privacyPage.explainableAi}</span>
          </h2>
          <p>
            {t.privacyPage.explainableAiDesc}
          </p>
        </section>
      </div>
    </div>
  );
}
