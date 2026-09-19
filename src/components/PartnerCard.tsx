'use client';

import React from 'react';
import { PartnerWithDistance } from '@/lib/partnerService';
import { useI18n } from '@/lib/i18n/context';
import { Phone, Mail, MapPin, Building2, Navigation } from 'lucide-react';

import { getLocalizedPartnerUI } from '@/lib/i18n/localizationHelper';

interface PartnerCardProps {
  partner: PartnerWithDistance;
  userCoords?: { lat: number; lng: number } | null;
}

export function PartnerCard({ partner, userCoords }: PartnerCardProps) {
  const { language, t } = useI18n();
  const partnerUI = getLocalizedPartnerUI(language);

  const name = language === 'hi' && partner.nameHi ? partner.nameHi : partner.name;
  const address = language === 'hi' && partner.addressHi ? partner.addressHi : partner.address;

  const pType = partner.partner_type === 'SCA'
    ? partnerUI.sca
    : partner.partner_type === 'RRB'
    ? partnerUI.rrb
    : partner.partner_type === 'PSB' || partner.partner_type === 'BANK'
    ? partnerUI.bank
    : partnerUI.other;

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
        partner.eligibilityStatus === 'restricted'
          ? 'bg-slate-50/80 border-amber-200 text-slate-800'
          : 'bg-white border-slate-200 hover:border-emerald-300'
      }`}
    >
      <div>
        {/* Header: Partner Type & Distance */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{pType}</span>
          </span>

          {partner.distanceKm !== undefined && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ~{partner.distanceKm} km {partnerUI.away}
            </span>
          )}
        </div>

        {/* Agency Name */}
        <h3 className="font-bold text-base text-slate-900 leading-snug mb-1">
          {name}
        </h3>

        {/* Address */}
        <p className="text-xs text-slate-600 mb-3 flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{address}</span>
        </p>

        {/* Supported Schemes */}
        <div className="mb-3">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            {t.partners.supportedSchemes}
          </span>
          <div className="flex flex-wrap gap-1">
            {partner.supported_scheme_codes.map((code) => (
              <span
                key={code}
                className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact & Map Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href={`tel:${partner.phone}`}
          className="touch-target inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex-1"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{t.partners.btnCall}</span>
        </a>

        <a
          href={
            userCoords
              ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoords.lat}%2C${userCoords.lng}%3B${partner.latitude}%2C${partner.longitude}`
              : `https://www.openstreetmap.org/?mlat=${partner.latitude}&mlon=${partner.longitude}#map=16/${partner.latitude}/${partner.longitude}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          aria-label={`Directions to ${name} on OpenStreetMap`}
          title={userCoords ? 'Live Driving Route on OpenStreetMap' : 'Open in OpenStreetMap'}
        >
          <Navigation className="w-3.5 h-3.5 text-slate-600" />
          <span>{userCoords ? 'View Route ↗' : t.partners.btnDirections}</span>
        </a>
      </div>
    </article>
  );
}
