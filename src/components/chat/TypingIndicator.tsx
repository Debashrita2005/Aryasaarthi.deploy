'use client';

import React from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  language?: string;
}

export default function TypingIndicator({ language = 'en' }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-2.5 my-2">
      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">
          {language === 'hi' ? 'आर्या सोच रही है...' : 'Arya is analyzing...'}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
