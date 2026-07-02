import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from './config';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ja');

  useEffect(() => {
    // 初期化時にローカルストレージから言語を取得
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('reol-language') as Language | null;
      if (stored && (stored === 'ja' || stored === 'en')) {
        setLanguageState(stored);
        i18n.changeLanguage(stored);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reol-language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
