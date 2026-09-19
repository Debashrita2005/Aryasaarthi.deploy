'use client';

import React from 'react';
import Link from 'next/link';
import { Scheme } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ArrowRight } from 'lucide-react';
import {
  getLocalizedScheme,
  getLocalizedCategory,
  getLocalizedCardLabels,
  formatLocalizedLakh,
} from '@/lib/i18n/localizationHelper';

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const { language, t } = useI18n();

  const localizedScheme = getLocalizedScheme(scheme, language);
  const localizedCat = getLocalizedCategory(scheme.category, language);
  const labels = getLocalizedCardLabels(language);

  return (
    <article className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${localizedCat.color}`}>
            {localizedCat.label}
          </span>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {scheme.code}
          </span>
        </div>

        <h3 className="font-bold text-lg text-slate-900 leading-snug mb-1">
          {localizedScheme.name}
        </h3>
        <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {localizedScheme.tagline}
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl mb-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">{labels.projectCostLimit}</span>
            <span className="font-bold text-slate-900 flex items-center">
              {formatLocalizedLakh(scheme.project_cost_max, language)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">{labels.interestRate}</span>
            <span className="font-bold text-emerald-700 flex items-center">
              {scheme.beneficiary_interest_rate_min}%
              {scheme.beneficiary_interest_rate_max !== scheme.beneficiary_interest_rate_min ? ` – ${scheme.beneficiary_interest_rate_max}%` : ''} {labels.pa}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">{labels.tenure}</span>
            <span className="font-semibold text-slate-800">
              {Math.round(scheme.repayment_period_months / 12)} {labels.years}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">{labels.moratorium}</span>
            <span className="font-semibold text-slate-800">
              {scheme.moratorium_months} {labels.months}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/schemes/${scheme.slug}`}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
        >
          <span>{t.common.viewDetails || labels.viewDetails}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/calculator?amount=${Math.min(scheme.max_loan_amount, 200000)}&rate=${scheme.beneficiary_interest_rate_min}&tenure=${scheme.repayment_period_months}&moratorium=${scheme.moratorium_months}`}
          className="text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          {labels.calculate}
        </Link>
      </div>
    </article>
  );
}
