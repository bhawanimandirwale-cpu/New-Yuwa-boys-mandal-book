'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import mrDict from './mr.json';
import hiDict from './hi.json';
import enDict from './en.json';

export type Language = 'mr' | 'hi' | 'en';

type Dictionary = typeof mrDict;

const dictionaries: Record<Language, Dictionary> = {
  mr: mrDict,
  hi: hiDict,
  en: enDict,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Dictionary) => string;
  isMarathi: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('mr');

  useEffect(() => {
    const saved = localStorage.getItem('mandalbook_lang') as Language;
    if (saved && ['mr', 'hi', 'en'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mandalbook_lang', lang);
  };

  const t = (key: keyof Dictionary): string => {
    const dict = dictionaries[language] || dictionaries.mr;
    return dict[key] || mrDict[key] || (key as string);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isMarathi: language === 'mr',
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
