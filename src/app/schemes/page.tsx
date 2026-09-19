'use client';

import React, { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SCHEMES } from '@/lib/schemeData';
import { ALL_VERIFIED_SCHEMES, VerifiedSchemeData } from '@/lib/verifiedSchemesData';
import { SchemeCard } from '@/components/SchemeCard';
import {
  Search,
  Compass,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Filter,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  HeartHandshake,
  ShieldCheck,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function SchemesPage() {
  const { language, t } = useI18n();

  // State management
  const [activeTab, setActiveTab] = useState<'ALL' | 'CENTRAL' | 'STATE_UT' | 'CORE_NSFDC'>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique states from verified directory
  const availableStates = useMemo(() => {
    const statesSet = new Set<string>();
    ALL_VERIFIED_SCHEMES.forEach((s) => {
      if (s.state) statesSet.add(s.state);
    });
    return Array.from(statesSet).sort();
  }, []);

  // Filter verified directory schemes
  const filteredVerifiedSchemes = useMemo(() => {
    return ALL_VERIFIED_SCHEMES.filter((scheme) => {
      // Tab filter
      if (activeTab === 'CENTRAL' && scheme.level !== 'CENTRAL') return false;
      if (activeTab === 'STATE_UT' && scheme.level !== 'STATE_UT') return false;

      // State filter
      if (selectedState !== 'ALL') {
        if (scheme.level === 'STATE_UT' && scheme.state !== selectedState) return false;
        if (scheme.level === 'CENTRAL' && selectedState !== 'ALL') {
          // Keep central schemes unless user explicitly filters only states
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'EDUCATION' && !['SCHOLARSHIP', 'FELLOWSHIP', 'EDUCATION', 'HOSTEL', 'COACHING'].includes(scheme.category)) return false;
        if (selectedCategory === 'ENTERPRISE' && !['ENTERPRISE', 'GUARANTEE', 'LOAN', 'CORPORATION'].includes(scheme.category)) return false;
        if (selectedCategory === 'LIVELIHOOD' && !['LIVELIHOOD'].includes(scheme.category)) return false;
        if (selectedCategory === 'HOUSING' && !['HOUSING'].includes(scheme.category)) return false;
        if (selectedCategory === 'MARRIAGE_RELIEF' && !['MARRIAGE', 'RELIEF'].includes(scheme.category)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = scheme.name.toLowerCase().includes(q) || (scheme.nameHi && scheme.nameHi.toLowerCase().includes(q));
        const matchesCode = scheme.code.toLowerCase().includes(q);
        const matchesState = scheme.state ? scheme.state.toLowerCase().includes(q) : false;
        const matchesRoute = scheme.officialRoute.toLowerCase().includes(q);
        const matchesType = scheme.typeLabel.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesState || matchesRoute || matchesType;
      }

      return true;
    });
  }, [activeTab, selectedState, selectedCategory, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.backToHome}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.schemesPage.directoryBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t.schemesPage.directoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed mb-6">
            {t.schemesPage.directorySubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/find-scheme"
              className="touch-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t.schemesPage.matchMyScheme}</span>
            </Link>
            <Link
              href="/calculator"
              className="touch-target inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-500/40 transition-all"
            >
              <span>{t.schemesPage.calcRepayment}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Directory Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => { setActiveTab('ALL'); setSelectedState('ALL'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {t.schemesPage.tabAll}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('CENTRAL'); setSelectedState('ALL'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'CENTRAL'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t.schemesPage.tabCentral}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('STATE_UT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'STATE_UT'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t.schemesPage.tabState}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CORE_NSFDC')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'CORE_NSFDC'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.schemesPage.tabNsfdc}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      {activeTab !== 'CORE_NSFDC' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t.schemesPage.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 font-medium outline-none"
              />
            </div>

            {/* State Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 shrink-0 hidden sm:inline">
                {t.schemesPage.filterState}
              </span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  if (e.target.value !== 'ALL') setActiveTab('STATE_UT');
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="ALL">{t.schemesPage.allStatesOption}</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
            {[
              { id: 'ALL', label: t.schemesPage.catAll },
              { id: 'EDUCATION', label: t.schemesPage.catEducation, icon: GraduationCap },
              { id: 'ENTERPRISE', label: t.schemesPage.catEnterprise, icon: Briefcase },
              { id: 'LIVELIHOOD', label: t.schemesPage.catLivelihood },
              { id: 'HOUSING', label: t.schemesPage.catHousing, icon: Home },
              { id: 'MARRIAGE_RELIEF', label: t.schemesPage.catMarriage, icon: HeartHandshake },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CORE NSFDC LOANS TAB */}
      {activeTab === 'CORE_NSFDC' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {t.schemesPage.nsfdcHeading}
            </h2>
            <span className="text-xs text-slate-500">
              {SCHEMES.length} {t.schemesPage.schemesUnit}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCHEMES.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        </div>
      )}

      {/* DIRECTORY VERIFIED SCHEMES GRID */}
      {activeTab !== 'CORE_NSFDC' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              {t.schemesPage.showingSchemes}{' '}
              <strong className="text-slate-900">{filteredVerifiedSchemes.length}</strong>
              {selectedState !== 'ALL' ? ` in ${selectedState}` : ''}
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
              ✓ {t.schemesPage.portalVerified}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVerifiedSchemes.map((s) => (
              <article
                key={s.code}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Level & Code */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        s.level === 'CENTRAL'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {s.level === 'CENTRAL' ? 'Central Scheme' : s.state}
                    </span>

                    <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug mb-1">
                    {language === 'hi' && s.nameHi ? s.nameHi : s.name}
                  </h3>

                  {/* Type Label */}
                  <div className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-3">
                    {s.typeLabel}
                  </div>

                  {/* Eligibility summary */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {s.eligibility}
                  </p>

                  {/* Document Count Pill */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-xl mb-4 border border-slate-100">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{s.documents.length} {t.schemesPage.docsRequired}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 truncate">
                    <span>Route:</span>
                    <span className="font-bold text-slate-700 truncate">{s.officialRoute}</span>
                  </div>

                  <Link
                    href={`/schemes/${s.slug}`}
                    className="touch-target inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
                  >
                    <span>{t.schemesPage.viewDetails}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filteredVerifiedSchemes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <p className="text-slate-700 font-bold text-sm">
                {t.schemesPage.noMatching}
              </p>
              <p className="text-xs text-slate-500">
                {t.schemesPage.noMatchingSub}
              </p>
              <button
                type="button"
                onClick={() => { setSelectedState('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="mt-2 text-xs font-bold text-emerald-700 underline"
              >
                {t.schemesPage.resetFilters}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
