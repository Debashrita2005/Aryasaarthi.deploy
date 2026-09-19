'use client';

import React, { useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { Globe, ChevronLeft, ChevronRight } from 'lucide-react';

interface LanguageBarProps {
  className?: string;
  variant?: 'topbar' | 'drawer';
}

export function LanguageBar({ className = '', variant = 'topbar' }: LanguageBarProps) {
  const { language, setLanguage } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the active language into view smoothly
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      const btn = activeBtnRef.current;
      const container = scrollRef.current;
      const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [language]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`w-full bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-1 px-3 sm:px-4 select-none ${className}`}
      role="region"
      aria-label="Language selection toggle bar"
    >
      <div className="container mx-auto flex items-center gap-2">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 shrink-0">
          <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span className="hidden sm:inline">भाषा / Language:</span>
        </div>

        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll languages left"
          className="hidden md:flex p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Single Row of All Languages in One Line */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth flex-1 py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SUPPORTED_LANGUAGES.map((lang, idx) => {
            const isSelected = language === lang.code;
            return (
              <React.Fragment key={lang.code}>
                <button
                  ref={isSelected ? activeBtnRef : undefined}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  aria-pressed={isSelected}
                  aria-label={`Switch language to ${lang.nameEn} (${lang.nameNative})`}
                  title={`${lang.nameEn} (${lang.nameNative}) — ${lang.primaryState}`}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs ring-1 ring-emerald-400 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {lang.nameNative}
                </button>
                {idx < SUPPORTED_LANGUAGES.length - 1 && (
                  <span className="text-slate-700 select-none text-[10px]">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll languages right"
          className="hidden md:flex p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
