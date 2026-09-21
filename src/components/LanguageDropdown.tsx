'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n/languages';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

interface LanguageDropdownProps {
  className?: string;
}

export function LanguageDropdown({ className = '' }: LanguageDropdownProps) {
  const { language, setLanguage, currentLanguageOption } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside (attached on next tick to avoid bubbling race condition)
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      inputRef.current?.focus();
    }, 20);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.nameEn.toLowerCase().includes(q) ||
      lang.nameNative.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q) ||
      lang.primaryState.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button beside Login */}
      <button
        id="language-dropdown-trigger"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
        className={`touch-target flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer ${
          className.includes('w-full') ? 'w-full justify-between' : ''
        } ${
          isOpen
            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20'
            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-600 text-slate-800'
        }`}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
        <span className="max-w-[76px] sm:max-w-[120px] truncate">
          {currentLanguageOption.nameNative}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-700' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu: Centered Modal on Mobile, Aligned Below Trigger on Desktop */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs z-40 sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setSearch('');
            }}
            aria-hidden="true"
          />

          <div
            role="menu"
            aria-orientation="vertical"
            className="fixed left-1/2 -translate-x-1/2 top-16 z-50 w-[calc(100vw-32px)] max-w-sm sm:absolute sm:top-full sm:left-auto sm:right-0 sm:translate-x-0 sm:mt-1.5 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/90">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search language / भाषा खोजें..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Languages Scroll List */}
            <div
              className="max-h-[55vh] sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-50"
              tabIndex={-1}
            >
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(lang.code);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 font-black text-emerald-950 ring-1 ring-emerald-500/30'
                        : 'hover:bg-slate-100/80 text-slate-800 font-semibold'
                    }`}
                  >
                    <div className="flex items-baseline gap-1.5 truncate">
                      <span className="text-sm font-bold text-slate-900">{lang.nameNative}</span>
                      <span className="text-[11px] text-slate-500 font-normal">({lang.nameEn})</span>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 font-medium">
                No matching language found
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] font-semibold text-slate-500 flex items-center justify-between">
            <span>23 Regional Languages</span>
            <span className="text-emerald-700 font-bold">100% Free</span>
          </div>
        </div>
      </>
    )}
  </div>
);
}
