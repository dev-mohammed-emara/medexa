
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

  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  // Cross-tab Synchronization
  useEffect(() => {
    const channel = new BroadcastChannel('medexa_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'LANGUAGE_UPDATE') {
        setLanguageState(event.data.language);
      }
    };
    return () => channel.close();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medexa-lang', lang);
      // Sync across tabs
      const channel = new BroadcastChannel('medexa_sync');
      channel.postMessage({ type: 'LANGUAGE_UPDATE', language: lang });
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);

    // SEO / Helmet Management
    const titles = {
      ar: "ميديكسا - نظام الإدارة الطبية المتكامل",
      en: "Medexa - Integrated Medical Management System"
    };
    const descriptions = {
      ar: "ميديكسا هو نظام إدارة طبية متطور يوفر حلولاً مبتكرة لإدارة العيادات والمراكز الطبية بكفاءة واحترافية.",
      en: "Medexa is an advanced medical management system providing innovative solutions for clinics and medical centers."
    };

    document.title = titles[language];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descriptions[language]);
    
    // OG Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', titles[language]);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', descriptions[language]);

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
