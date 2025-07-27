// Comprehensive internationalization translations for Village Digital Wallet
export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    savings: 'Savings Groups',
    loans: 'Loans',
    wallet: 'Wallet',
    profile: 'Profile',
    analytics: 'Analytics',
    security: 'Security',
    settings: 'Settings',
    
    // Common
    connect: 'Connect',
    disconnect: 'Disconnect',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    amount: 'Amount',
    balance: 'Balance',
    total: 'Total',
    available: 'Available',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    yes: 'Yes',
    no: 'No',
    
    // Language Names
    english: 'English',
    swahili: 'Kiswahili',
    french: 'Français',
    spanish: 'Español',
    portuguese: 'Português',
    arabic: 'العربية',
    hausa: 'Hausa',
    yoruba: 'Yorùbá',
    igbo: 'Igbo',
    zulu: 'isiZulu',
    
    // Language Categories
    majorLanguages: 'Major Languages',
    africanLanguages: 'African Languages',
    selectLanguage: 'Select Language',
    
    // Wallet
    connectWallet: 'Connect Wallet',
    walletConnected: 'Wallet Connected',
    yourBalance: 'Your Balance',
    sendMoney: 'Send Money',
    receiveMoney: 'Receive Money',
    cashIn: 'Cash In',
    cashOut: 'Cash Out',
    
    // Profile
    personalInfo: 'Personal Information',
    verifyIdentity: 'Verify Identity',
    language: 'Language',
    notifications: 'Notifications',
    
    // Accessibility
    tapToSpeak: 'Tap to hear',
    simplifiedView: 'Simple View',
    highContrast: 'High Contrast',
  },
  
  sw: {
    // Navigation
    dashboard: 'Dashibodi',
    savings: 'Vikundi vya Akiba',
    loans: 'Mikopo',
    wallet: 'Mkoba',
    profile: 'Wasifu',
    analytics: 'Uchanganuzi',
    security: 'Usalama',
    settings: 'Mipangilio',
    
    // Common
    connect: 'Unganisha',
    disconnect: 'Tenganisha',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    confirm: 'Thibitisha',
    loading: 'Inapakia...',
    error: 'Hitilafu',
    success: 'Mafanikio',
    amount: 'Kiasi',
    balance: 'Salio',
    total: 'Jumla',
    available: 'Inapatikana',
    pending: 'Inasubiri',
    completed: 'Imekamilika',
    failed: 'Imeshindwa',
    yes: 'Ndio',
    no: 'Hapana',
    
    // Language Names
    english: 'Kiingereza',
    swahili: 'Kiswahili',
    french: 'Kifaransa',
    spanish: 'Kihispania',
    portuguese: 'Kireno',
    arabic: 'Kiarabu',
    hausa: 'Kihausa',
    yoruba: 'Kiyoruba',
    igbo: 'Kiigbo',
    zulu: 'Kizulu',
    
    // Language Categories
    majorLanguages: 'Lugha Kuu',
    africanLanguages: 'Lugha za Kiafrika',
    selectLanguage: 'Chagua Lugha',
    
    // Wallet
    connectWallet: 'Unganisha Mkoba',
    walletConnected: 'Mkoba Umeunganishwa',
    yourBalance: 'Salio Lako',
    sendMoney: 'Tuma Pesa',
    receiveMoney: 'Pokea Pesa',
    cashIn: 'Weka Pesa',
    cashOut: 'Toa Pesa',
    
    // Profile
    personalInfo: 'Taarifa za Kibinafsi',
    verifyIdentity: 'Thibitisha Utambulisho',
    language: 'Lugha',
    notifications: 'Arifa',
    
    // Accessibility
    tapToSpeak: 'Gusa kusikia',
    simplifiedView: 'Mwonekano Rahisi',
    highContrast: 'Mwanga Mkuu',
  }
}

// Language metadata
export const languageMetadata = {
  en: { name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', rtl: false, flag: '🇹🇿' }
}

export type SupportedLanguages = keyof typeof translations

export function getAvailableLanguages() {
  return Object.keys(translations) as SupportedLanguages[]
}
