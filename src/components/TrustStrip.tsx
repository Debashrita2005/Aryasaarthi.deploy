'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ShieldCheck, Ban, Sparkles, Globe } from 'lucide-react';

export function TrustStrip() {
  const { t } = useI18n();

  const trustItems = [
    {
      icon: ShieldCheck,
      text: t.home.trustStrip.officialSource,
      accent: 'text-emerald-700 bg-emerald-100/70',
    },
    {
      icon: Ban,
      text: t.home.trustStrip.noApproval,
      accent: 'text-rose-700 bg-rose-100/70',
    },
    {
      icon: Sparkles,
      text: t.home.trustStrip.freeService,
      accent: 'text-amber-700 bg-amber-100/70',
    },
    {
      icon: Globe,
      text: t.home.trustStrip.multilingual,
      accent: 'text-purple-700 bg-purple-100/70',
    },
  ];

  return (
    <section className="bg-white border-y border-slate-200 py-4 shadow-sm" aria-label="Trust Indicators">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg">
                <div className={`w-8 h-8 rounded-lg ${item.accent} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
