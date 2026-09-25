'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickReplyChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export default function QuickReplyChips({ chips, onSelect, disabled = false }: QuickReplyChipsProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap my-2 pl-10 animate-fade-in">
      {chips.map((chip, idx) => (
        <button
          key={`${chip}-${idx}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-brand-900/60 text-slate-200 hover:text-brand-300 border border-slate-700 hover:border-brand-700/80 rounded-full text-xs font-medium transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-3 h-3 text-brand-400 shrink-0" />
          <span>{chip}</span>
        </button>
      ))}
    </div>
  );
}
