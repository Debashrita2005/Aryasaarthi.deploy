'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Percent, IndianRupee, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export interface SchemeRecommendation {
  scheme_id: string;
  name: string;
  category?: string;
  interest_rate_min?: number;
  interest_rate_max?: number;
  min_amount?: number;
  max_amount?: number;
  moratorium_months?: number[];
  cost_coverage_pct?: number;
  ranking_score?: number;
  match_reason?: string;
  description?: string;
}

interface SchemeRecommendationCardProps {
  scheme: SchemeRecommendation;
  rank?: number;
  language?: string;
}

export default function SchemeRecommendationCard({
  scheme,
  rank = 1,
  language = 'en',
}: SchemeRecommendationCardProps) {
  const isTopMatch = rank === 1;
  const maxMoratorium =
    Array.isArray(scheme.moratorium_months) && scheme.moratorium_months.length > 0
      ? Math.max(...scheme.moratorium_months)
      : 3;

  return (
    <div
      className={`rounded-xl p-4 my-2.5 transition-all duration-200 border ${
        isTopMatch
          ? 'bg-gradient-to-b from-brand-950/40 via-slate-900 to-slate-900/90 border-brand-500/40 shadow-lg shadow-brand-950/30'
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Header with Rank badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
              isTopMatch
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isTopMatch
              ? language === 'hi'
                ? '🥇 शीर्ष अनुशंसित योजना'
                : '🥇 Top Recommendation'
              : `${language === 'hi' ? 'विकल्प' : 'Option'} #${rank}`}
          </span>
          {scheme.category && (
            <span className="text-[10px] font-medium text-slate-400 capitalize">
              • {scheme.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {scheme.ranking_score !== undefined && (
          <span className="text-[11px] font-mono font-semibold text-brand-400">
            {Math.round(scheme.ranking_score * 100)}% Fit
          </span>
        )}
      </div>

      {/* Scheme Title */}
      <h4 className="text-sm font-bold text-white mb-2 leading-snug">
        {scheme.name}
      </h4>

      {/* Key Metric Highlights Grid */}
      <div className="grid grid-cols-3 gap-2 my-2.5 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-center">
        <div>
          <div className="flex items-center justify-center gap-0.5 text-[10px] text-slate-400 mb-0.5">
            <Percent className="w-3 h-3 text-brand-400" />
            <span>{language === 'hi' ? 'ब्याज दर' : 'Interest Rate'}</span>
          </div>
          <div className="text-xs font-bold text-brand-300">
            {scheme.interest_rate_min}%
            {scheme.interest_rate_max && scheme.interest_rate_max !== scheme.interest_rate_min
              ? `-${scheme.interest_rate_max}%`
              : ''}{' '}
            <span className="text-[9px] font-normal text-slate-400">p.a.</span>
          </div>
        </div>

        <div className="border-x border-slate-800">
          <div className="flex items-center justify-center gap-0.5 text-[10px] text-slate-400 mb-0.5">
            <IndianRupee className="w-3 h-3 text-amber-400" />
            <span>{language === 'hi' ? 'अधिकतम ऋण' : 'Max Loan'}</span>
          </div>
          <div className="text-xs font-bold text-amber-300">
            ₹{((scheme.max_amount || 0) / 100000).toFixed(1)}L
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-0.5 text-[10px] text-slate-400 mb-0.5">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{language === 'hi' ? 'छूट अवधि' : 'Moratorium'}</span>
          </div>
          <div className="text-xs font-bold text-blue-300">
            {maxMoratorium} {language === 'hi' ? 'महीने' : 'Months'}
          </div>
        </div>
      </div>

      {/* Anti-Hallucination Verified Reason Box */}
      {scheme.match_reason && (
        <div className="bg-slate-950/50 border-l-2 border-brand-500 rounded-r-md p-2 my-2 text-xs text-slate-300 flex items-start gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{scheme.match_reason}</span>
        </div>
      )}

      {/* Action Links */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/80">
        <Link
          href={`/schemes`}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {language === 'hi' ? 'विवरण देखें' : 'View Guidelines'}
        </Link>

        <Link
          href={`/find-scheme?mode=direct&scheme=${encodeURIComponent(scheme.scheme_id)}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <span>{language === 'hi' ? 'पात्रता सत्यापित करें' : 'Verify & Apply'}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
