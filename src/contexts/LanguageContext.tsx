
import React, { createContext, useContext, useState, useEffect } from 'react';
import { commonTranslations } from '@/constants/common';

type Language = 'ar' | 'en';
type TranslationSource = {
  [key: string]: string | TranslationSource;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  isAr: boolean;
  t: (key: string, pageConstants?: TranslationSource) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('medexa-lang') as Language) || 'ar';
    }
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medexa-lang', lang);
    }
  };

  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);
  }, [language, dir]);

  const t = (key: string, pageConstants?: TranslationSource): string => {
    const searchKey = key.startsWith('common.') ? key.substring(7) : key
    const parts = searchKey.split('.')
    let current: any = pageConstants?.[language] || (commonTranslations as any)[language]
    
    for (const part of parts) {
      if (!current || current[part] === undefined) {
        if (pageConstants) {
          return t(searchKey) 
        }
        return key
      }
      current = current[part]
    }
    return typeof current === 'string' ? current : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, isAr, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
