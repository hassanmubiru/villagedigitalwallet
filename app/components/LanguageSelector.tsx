'use client'

import React, { useState } from 'react'
import { useLanguage } from '../providers/LanguageProvider'
import type { SupportedLanguages } from '../utils/translations'

export default function LanguageSelector() {
  const { language, setLanguage, t, availableLanguages, languageMetadata } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLanguage: SupportedLanguages) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  const currentLanguageData = languageMetadata[language]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('language')}
      >
        <span className="text-lg">{currentLanguageData?.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguageData?.nativeName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
              {t('language')}
            </div>
            {availableLanguages.map((lang) => {
              const langData = languageMetadata[lang]
              const isSelected = lang === language
              
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{langData?.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {langData?.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {langData?.name}
                    </div>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Language Categories */}
          <div className="border-t border-gray-200 dark:border-gray-600 p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
              {t('majorLanguages')}: English, Français, Español, العربية
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
              {t('africanLanguages')}: Kiswahili, Hausa, Yorùbá, Igbo, IsiZulu
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Compact version for mobile navigation
export function CompactLanguageSelector() {
  const { language, setLanguage, availableLanguages, languageMetadata } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLanguage: SupportedLanguages) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  const currentLanguageData = languageMetadata[language]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Change language"
      >
        <span className="text-base">{currentLanguageData?.flag}</span>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
          {language}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-1">
            {availableLanguages.map((lang) => {
              const langData = languageMetadata[lang]
              const isSelected = lang === language
              
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-sm">{langData?.flag}</span>
                  <span className="text-xs font-medium truncate">
                    {langData?.nativeName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
