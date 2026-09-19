'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, LanguageOption, SUPPORTED_LANGUAGES, getLanguageOption } from './languages';
import { Translations, getDictionary } from './dictionaries';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguageOption: LanguageOption;
  supportedLanguages: LanguageOption[];
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('hi'); // Default to Hindi

  useEffect(() => {
    const saved = localStorage.getItem('sahayak_lang') as LanguageCode;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setLanguageState(saved);
      const opt = getLanguageOption(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = opt.dir || 'ltr';
    } else {
      document.documentElement.lang = 'hi';
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('sahayak_lang', lang);
    const opt = getLanguageOption(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = opt.dir || 'ltr';
  };

  const currentLanguageOption = getLanguageOption(language);
  const t = getDictionary(language);
  const dir = currentLanguageOption.dir || 'ltr';

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageOption,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        dir,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
