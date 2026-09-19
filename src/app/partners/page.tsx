'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { PartnerWithDistance } from '@/lib/partnerService';
import { STATES_LIST, STATES_ONLY, UT_ONLY } from '@/lib/partnerData';
import { SCHEMES } from '@/lib/schemeData';
import { PartnerCard } from '@/components/PartnerCard';

const DynamicGisMap = dynamic(
  () => import('@/components/GisPartnerMap').then((mod) => mod.GisPartnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-500 font-semibold text-xs animate-pulse">
        Loading GIS Interactive Map...
      </div>
    ),
  }
);
import Link from 'next/link';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  PhoneCall,
  AlertTriangle,
  Building2,
  Layers,
  Info,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

function PartnersContent() {
  const { language, t } = useI18n();
  const searchParams = useSearchParams();

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedScheme, setSelectedScheme] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  const [partners, setPartners] = useState<PartnerWithDistance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locating, setLocating] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pincode, setPincode] = useState<string>('');

  useEffect(() => {
    const schemeParam = searchParams.get('scheme');
    if (schemeParam) setSelectedScheme(schemeParam);

    const stateParam = searchParams.get('state');
    if (stateParam) setSelectedState(stateParam);
  }, [searchParams]);

  useEffect(() => {
    fetchPartners();
  }, [selectedState, selectedScheme, userCoords]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      let url = '/api/partners?';
      if (selectedState !== 'ALL') url += `state=${encodeURIComponent(selectedState)}&`;
      if (selectedScheme !== 'ALL') url += `scheme=${encodeURIComponent(selectedScheme)}&`;
      if (userCoords) url += `lat=${userCoords.lat}&lng=${userCoords.lng}&radiusKm=1000&`;

      const res = await fetch(url);
      const data = await res.json();
      setPartners(data.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert(t.common.error);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or error:', err);
        setLocating(false);
        alert(t.common.error);
      },
      { timeout: 10000 }
    );
  };

  const handlePincodeSearch = async () => {
    if (!pincode || pincode.length < 6) {
      alert(t.common.error);
      return;
    }
    setLocating(true);
    try {
      const res = await fetch(`/api/geocode-pincode?pincode=${encodeURIComponent(pincode)}`);
      const data = await res.json();
      if (res.ok && data.success && data.lat && data.lng) {
        setUserCoords({
          lat: data.lat,
          lng: data.lng,
        });
      } else {
        alert(data.error || t.common.error);
      }
    } catch (err) {
      console.error('Pincode fetch error:', err);
      alert(t.common.error);
    } finally {
      setLocating(false);
    }
  };

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
        <Link
          href="/find-scheme"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
        >
          <span>{t.help.findScheme}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.partners.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.partners.subtitle}
        </p>
      </div>


      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* State Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.partners.filterState}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="touch-target w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">{t.common.allStates}</option>
              <optgroup label="States">
                {STATES_ONLY.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Union Territories">
                {UT_ONLY.map((ut) => (
                  <option key={ut} value={ut}>
                    {ut}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Scheme Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.partners.filterScheme}
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="touch-target w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">{t.common.allSchemes}</option>
              {SCHEMES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {language === 'hi' && s.nameHi ? s.nameHi : s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.common.pincodeSearch || 'Enter your pincode'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder={t.common.pincodeSearch}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handlePincodeSearch()}
              />
              <button
                type="button"
                onClick={handlePincodeSearch}
                disabled={locating}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                title={t.partners.btnSearch}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Geolocation Button */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locating}
              className="touch-target w-full px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{locating ? t.common.loading : t.partners.btnUseLocation}</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex flex-col justify-end">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  viewMode === 'LIST' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                {t.common.listView}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('MAP')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  viewMode === 'MAP' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                {t.common.mapView}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-base text-slate-900">
            {t.partners.resultsFound} ({partners.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-xs font-semibold text-slate-500">{t.common.loading}</p>
          </div>
        ) : viewMode === 'MAP' ? (
          /* Interactive OpenStreetMap & GIS Locator */
          <DynamicGisMap
            schemeCode={selectedScheme}
            showFilters={true}
            maxHeight="620px"
            initialUserCoords={userCoords}
            initialPincode={pincode}
            onUserCoordsChange={(coords, pin) => {
              setUserCoords(coords);
              if (pin) setPincode(pin);
            }}
          />
        ) : (
          /* List View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} userCoords={userCoords} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading partners...</div>}>
      <PartnersContent />
    </Suspense>
  );
}

