import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'it', 'pt'];

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Extract the primary language code (e.g., 'en' from 'en-US')
  const primaryLang = browserLang.split('-')[0].toLowerCase();
  
  // Check if the detected language is supported
  if (supportedLanguages.includes(primaryLang as Language)) {
    return primaryLang as Language;
  }
  
  // Fall back to English
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('app-language');
    
    // If user has previously set a language, use that
    if (stored && supportedLanguages.includes(stored as Language)) {
      return stored as Language;
    }
    
    // Otherwise, detect from browser
    const detected = detectBrowserLanguage();
    localStorage.setItem('app-language', detected);
    return detected;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
