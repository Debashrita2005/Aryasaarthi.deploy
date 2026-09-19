'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import {
  LanguageCode,
  IndianRegion,
  SUPPORTED_LANGUAGES,
  ALL_INDIAN_STATES_AND_UTS,
  StateUTMapping,
  getLanguageOption,
} from '@/lib/i18n/languages';
import { Globe, ChevronDown, Check, Search, X, MapPin, Sparkles, Building2 } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'nav' | 'compact' | 'footer' | 'drawer';
}

export function LanguageSelector({ variant = 'nav' }: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageOption, supportedLanguages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'BY_STATE' | 'REGIONS'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<IndianRegion | 'ALL'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter languages based on search query and region
  const filteredLanguages = supportedLanguages.filter((l) => {
    const q = searchQuery.toLowerCase().trim();

    // Region filter if on REGIONS tab
    if (activeTab === 'REGIONS' && selectedRegion !== 'ALL') {
      if (l.region !== selectedRegion) return false;
    }

    if (!q) return true;

    // Matches language name, native name, code, or any state/UT name
    const matchesName =
      l.nameEn.toLowerCase().includes(q) ||
      l.nameNative.toLowerCase().includes(q) ||
      l.displayText.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.primaryState.toLowerCase().includes(q);

    const matchesState = l.statesAndUTs.some((st) => st.toLowerCase().includes(q));

    return matchesName || matchesState;
  });

  // Filter States and UTs based on search query
  const filteredStates = ALL_INDIAN_STATES_AND_UTS.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name.toLowerCase().includes(q) ||
      st.nameHi.includes(q) ||
      st.primaryLang.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleStateClick = (mapping: StateUTMapping) => {
    handleSelect(mapping.primaryLang);
  };

  const regions: { id: IndianRegion; labelEn: string; labelHi: string }[] = [
    { id: 'North', labelEn: 'North India', labelHi: 'उत्तर भारत' },
    { id: 'South', labelEn: 'South India', labelHi: 'दक्षिण भारत' },
    { id: 'East', labelEn: 'East India', labelHi: 'पूर्वी भारत' },
    { id: 'West', labelEn: 'West India', labelHi: 'पश्चिम भारत' },
    { id: 'Northeast', labelEn: 'Northeast India', labelHi: 'पूर्वोत्तर भारत' },
    { id: 'Pan-India', labelEn: 'Pan-India / Heritage', labelHi: 'अखिल भारतीय' },
  ];

  // Render trigger button depending on variant
  const renderTrigger = () => {
    if (variant === 'footer') {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Select Regional Language"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm border border-emerald-500/40 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#25D366]"
        >
          <Globe className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>{currentLanguageOption.displayText}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      );
    }

    if (variant === 'drawer') {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{currentLanguageOption.displayText}</span>
          </span>
          <span className="text-[11px] text-emerald-800 bg-white px-2 py-0.5 rounded-md font-extrabold shadow-2xs">
            {language.toUpperCase()} ▾
          </span>
        </button>
      );
    }

    // Default 'nav' variant
    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Select Language / भाषा चुनें"
        className="touch-target flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-emerald-600/70 sm:border-2 sm:border-emerald-600 bg-white hover:bg-emerald-50 text-slate-900 font-bold text-xs sm:text-sm shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shrink-0"
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
        <span className="sm:hidden text-xs font-black uppercase text-emerald-900">
          {currentLanguageOption.code}
        </span>
        <span className="hidden sm:inline truncate max-w-[120px] md:max-w-[190px] text-left">
          {currentLanguageOption.displayText}
        </span>
        <ChevronDown
          className={`w-3 h-3 sm:w-4 sm:h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    );
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {renderTrigger()}

      {/* Modal / Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select Regional Language across Indian States and Union Territories"
            className="fixed inset-x-3 top-16 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 w-auto md:w-[480px] lg:w-[520px] max-h-[85vh] md:max-h-[600px] rounded-3xl bg-white shadow-2xl border-2 border-emerald-600 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header with Brand & Search */}
            <div className="p-3.5 sm:p-4 bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5 leading-tight">
                      <span>Select Language / क्षेत्रीय भाषा चुनें</span>
                    </h2>
                    <p className="text-[10px] text-emerald-200 font-medium">
                      28 States & 8 Union Territories • 22 Official Languages + English
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-emerald-200 hover:text-white p-1.5 rounded-xl hover:bg-emerald-700/50 transition-colors"
                  aria-label="Close language selector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search language or state (e.g. Tamil, Punjab, Maharashtra, বাংলা, केरल)..."
                  className="w-full pl-9 pr-8 py-2 bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Navigation Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-emerald-700/60 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ALL');
                    setSelectedRegion('ALL');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'ALL'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
                  }`}
                >
                  All 23 Languages (सभी भाषाएं)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('BY_STATE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTab === 'BY_STATE'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>By State / UT (राज्य व यूटी)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('REGIONS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'REGIONS'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
                  }`}
                >
                  By Region (क्षेत्र)
                </button>
              </div>
            </div>

            {/* Sub-bar for Regions */}
            {activeTab === 'REGIONS' && (
              <div className="p-2 bg-emerald-50/80 border-b border-emerald-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRegion('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedRegion === 'ALL'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-700 hover:bg-emerald-100'
                  }`}
                >
                  All Regions
                </button>
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      selectedRegion === reg.id
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-slate-700 hover:bg-emerald-100'
                    }`}
                  >
                    {reg.labelEn}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className="overflow-y-auto flex-1 p-2 sm:p-3 divide-y divide-slate-100">
              {/* TAB 1 & 3: Language List (All or Regional) */}
              {activeTab !== 'BY_STATE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(lang.code)}
                          className={`touch-target text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                              : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-extrabold text-slate-900 leading-tight">
                                {lang.nameNative}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                ({lang.nameEn})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md inline-flex max-w-full truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-700" />
                              <span className="truncate">{lang.primaryState}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-2 p-8 text-center text-xs sm:text-sm text-slate-500 font-medium">
                      No matching language or state found. Try searching by state name (e.g. "Punjab", "Kerala", "Assam") / कोई भाषा नहीं मिली।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: By State / UT Grid */}
              {activeTab === 'BY_STATE' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-600 flex items-center justify-between px-1">
                    <span>Select your State or UT (28 States & 8 Union Territories)</span>
                    <span className="text-[11px] text-emerald-700 font-extrabold">
                      {filteredStates.length} Results
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredStates.map((st) => {
                      const primaryOpt = getLanguageOption(st.primaryLang);
                      const isSelected = language === st.primaryLang;
                      return (
                        <button
                          key={st.name}
                          type="button"
                          onClick={() => handleStateClick(st)}
                          className={`touch-target text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                              : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-slate-900 leading-tight">
                                {st.name}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                st.type === 'UT' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {st.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {st.nameHi} • <strong className="text-emerald-800">{primaryOpt.nameNative} ({primaryOpt.nameEn})</strong>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Footnote */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-600 font-medium shrink-0 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>22 Constitutional Languages + English Supported</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
