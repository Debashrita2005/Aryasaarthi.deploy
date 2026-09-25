'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  slots: {
    sc_status?: string | null;
    income?: number | null;
    purpose?: string | null;
    amount?: number | null;
    gender?: string | null;
    state?: string | null;
  };
  language?: string;
}

export default function ProgressIndicator({ slots, language = 'en' }: ProgressIndicatorProps) {
  const steps = [
    {
      id: 'sc_status',
      label: language === 'hi' ? 'श्रेणी' : 'Category',
      isFilled: Boolean(slots.sc_status),
    },
    {
      id: 'gender',
      label: language === 'hi' ? 'लिंग' : 'Gender',
      isFilled: Boolean(slots.gender),
    },
    {
      id: 'income',
      label: language === 'hi' ? 'आय' : 'Income',
      isFilled: slots.income !== null && slots.income !== undefined,
    },
    {
      id: 'purpose',
      label: language === 'hi' ? 'उद्देश्य' : 'Purpose',
      isFilled: Boolean(slots.purpose),
    },
    {
      id: 'amount',
      label: language === 'hi' ? 'राशि' : 'Amount',
      isFilled: slots.amount !== null && slots.amount !== undefined,
    },
  ];

  const completedCount = steps.filter((s) => s.isFilled).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2.5 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-slate-300">
          {language === 'hi' ? 'पात्रता प्रोफ़ाइल प्रगति' : 'Eligibility Profile Completion'}
        </span>
        <span className="font-semibold text-brand-400">{progressPercent}%</span>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
        <div
          className="bg-brand-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              step.isFilled
                ? 'bg-brand-950/80 text-brand-300 border border-brand-800/60'
                : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            {step.isFilled ? (
              <CheckCircle2 className="w-3 h-3 text-brand-400 shrink-0" />
            ) : (
              <Circle className="w-3 h-3 text-slate-500 shrink-0" />
            )}
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
