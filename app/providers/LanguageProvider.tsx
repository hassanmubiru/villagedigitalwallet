'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, languageMetadata, type SupportedLanguages } from '../utils/translations'

interface LanguageContextType {
  language: SupportedLanguages
  setLanguage: (lang: SupportedLanguages) => void
  t: (key: string) => string
  isRTL: boolean
  availableLanguages: SupportedLanguages[]
  languageMetadata: typeof languageMetadata
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguages>('en')

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('village-wallet-language') as SupportedLanguages
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: SupportedLanguages) => {
    setLanguageState(lang)
    localStorage.setItem('village-wallet-language', lang)
    
    // Update document direction for RTL languages
    document.documentElement.dir = languageMetadata[lang]?.rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    // Fallback to English if translation is missing
    if (!value && language !== 'en') {
      let fallbackValue: any = translations.en
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k]
      }
      value = fallbackValue
    }
    
    return value || key
  }

  const isRTL = languageMetadata[language]?.rtl || false
  const availableLanguages = Object.keys(translations) as SupportedLanguages[]

  // Set initial document direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language, isRTL])

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isRTL, 
      availableLanguages,
      languageMetadata 
    }}>
      <div className={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
