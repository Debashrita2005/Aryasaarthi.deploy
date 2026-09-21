'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useI18n } from '@/lib/i18n/context';
import { INDIAN_STATES_AND_UTS, DISTRICTS_BY_STATE } from '@/lib/locationData';
import {
  UserCheck,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

export function OnboardingModal() {
  const { user, isAuthenticated, completeUserProfile } = useAuth();
  const { language, t } = useI18n();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER'>('MALE');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Lucknow');
  const [customDistrict, setCustomDistrict] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize values from user profile if available
  useEffect(() => {
    if (user) {
      if (user.name && !user.name.startsWith('नागरिक (Citizen)')) {
        setName(user.name);
      }
      if (user.state) {
        setState(user.state);
      }
      if (user.district) {
        setDistrict(user.district);
      }
      if (user.gender) {
        setGender(user.gender as any);
      }
    }
  }, [user]);

  // Update district options when state changes
  useEffect(() => {
    const districts = DISTRICTS_BY_STATE[state];
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    } else {
      setDistrict('Other');
    }
  }, [state]);

  // Only show if user is logged in but has not completed their profile onboarding.
  // Also skip if user already has a real name (not the placeholder) AND a state set —
  // this handles returning users from localStorage who pre-date the profileCompleted flag.
  const hasRealName = user?.name && !user.name.startsWith('नागरिक (Citizen)') && user.name.length > 1;
  const hasLocation = user?.state && user?.district;
  const alreadyComplete = user?.profileCompleted || (hasRealName && hasLocation);

  if (!isAuthenticated || !user || alreadyComplete) {
    return null;
  }

  const availableDistricts = DISTRICTS_BY_STATE[state] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg(t.onboarding.errName);
      return;
    }

    const finalDistrict = district === 'Other' ? customDistrict.trim() : district;
    if (!finalDistrict) {
      setErrorMsg(t.onboarding.errDistrict);
      return;
    }

    setIsSubmitting(true);
    try {
      await completeUserProfile({
        name: cleanName,
        gender,
        state,
        district: finalDistrict,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-100 my-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center mx-auto shadow-md">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.onboarding.firstTimeBadge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.onboarding.title}
          </h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            {t.onboarding.subtitle}
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Full Name */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              {t.onboarding.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar / सुनीता देवी"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 outline-none transition-all"
            />
          </div>

          {/* 2. Gender Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              {t.onboarding.genderLabel}
              <span className="text-emerald-700 font-normal ml-1">
                ({t.onboarding.womenRebateNote})
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MALE', label: t.onboarding.male },
                { id: 'FEMALE', label: t.onboarding.female },
                { id: 'TRANSGENDER', label: t.onboarding.other },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as any)}
                  className={`py-2.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    gender === g.id
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. State / UT Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.onboarding.stateLabel}</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 outline-none transition-all"
            >
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st.code} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. District Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.onboarding.districtLabel}</span>
            </label>

            {availableDistricts.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 outline-none transition-all"
                >
                  {availableDistricts.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                  <option value="Other">
                    + {t.onboarding.customDistrictLabel}
                  </option>
                </select>

                {district === 'Other' && (
                  <input
                    type="text"
                    required
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder={t.onboarding.customDistrictLabel}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 bg-white text-xs font-semibold outline-none"
                    autoFocus
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                required
                value={district === 'Other' ? customDistrict : district}
                onChange={(e) => {
                  setDistrict('Other');
                  setCustomDistrict(e.target.value);
                }}
                placeholder={t.onboarding.customDistrictLabel}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white text-xs font-semibold outline-none"
              />
            )}
          </div>

          {/* Privacy & Statutory SC Note */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2 text-[11px] text-emerald-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              {t.common.disclaimer}
            </span>
          </div>

          {/* Submit Action & Skip Option */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {t.onboarding.saveProfile}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                await completeUserProfile({
                  name: user?.name || 'Citizen User',
                  gender: 'MALE',
                  state: 'Uttar Pradesh',
                  district: 'Lucknow',
                });
              }}
              className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'अभी छोड़ें (Skip for now)' : 'Skip for now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
