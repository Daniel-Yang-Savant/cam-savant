'use client'

import { useState, useEffect } from 'react'

export type Lang = 'zh' | 'en'

export const translations = {
  zh: {
    home: '首頁',
    about: '關於',
    readMore: '閱讀文章',
    allPosts: '所有文章',
    navSportsMedicine: '運動醫學',
    navFunctionalMedicine: '功能醫學',
    navFsm: 'FSM',
    navPerioperativeRehab: '術後復健',
    consultTitle: '有問題想諮詢？',
    consultDesc:
      '歡迎留下您想了解的復健或醫療相關問題，醫療團隊將於門診時間內回覆。',
    consultName: '姓名',
    consultNameOptional: '（選填）',
    consultContent: '想了解的內容',
    consultContact: '聯絡方式（電話或 Email）',
    consultRequired: '（必填）',
    consultNamePlaceholder: '您的稱呼',
    consultContentPlaceholder: '請描述您的症狀、疑問或想了解的復健主題…',
    consultContactPlaceholder: '0912-345-678 或 example@email.com',
    consultSubmit: '送出諮詢',
    consultSubmitting: '送出中…',
    consultSuccess: '感謝您的留言，我們將盡快回覆。',
    consultSuccessNote: '醫療團隊將於門診時間內透過您留下的聯絡方式與您聯繫。',
    consultRef: '參考文章：',
    errorContent: '請填寫您想了解的內容。',
    errorContact: '請填寫聯絡方式（電話或 Email）。',
    errorNetwork: '送出失敗，請稍後再試或直接致電診所。',
    disclaimer: '本表單僅供衛教諮詢，不構成個別診療建議。',
    searchPlaceholder: '搜尋文章...',
    searchNoResults: '找不到相關文章',
    printButton: '列印復健計劃',
    printHint: '建議使用瀏覽器列印功能儲存為 PDF',
    tocTitle: '文章目錄',
  },
  en: {
    home: 'Home',
    about: 'About',
    readMore: 'Read Article',
    allPosts: 'All Articles',
    navSportsMedicine: 'Sports Medicine',
    navFunctionalMedicine: 'Functional Medicine',
    navFsm: 'FSM',
    navPerioperativeRehab: 'Perioperative Rehab',
    consultTitle: 'Have a Question?',
    consultDesc:
      'Leave your rehabilitation or medical questions and our team will reply during clinic hours.',
    consultName: 'Name',
    consultNameOptional: '(optional)',
    consultContent: 'Your Question',
    consultContact: 'Contact (Phone or Email)',
    consultRequired: '(required)',
    consultNamePlaceholder: 'Your name',
    consultContentPlaceholder:
      'Describe your symptoms, concerns, or rehabilitation topic...',
    consultContactPlaceholder: 'Phone number or email address',
    consultSubmit: 'Submit',
    consultSubmitting: 'Submitting...',
    consultSuccess: 'Thank you! We will get back to you soon.',
    consultSuccessNote: 'Our team will contact you during clinic hours.',
    consultRef: 'Reference article: ',
    errorContent: 'Please describe your question.',
    errorContact: 'Please provide your contact information.',
    errorNetwork:
      'Submission failed. Please try again or call the clinic directly.',
    disclaimer:
      'This form is for educational purposes only and does not constitute individual medical advice.',
    searchPlaceholder: 'Search articles...',
    searchNoResults: 'No matching articles found',
    printButton: 'Print Rehab Plan',
    printHint: "Use your browser's print function to save as PDF",
    tocTitle: 'Contents',
  },
} as const

export type TranslationKey = keyof (typeof translations)['zh']

// ── useLang hook ───────────────────────────────────────────────────────────
// Initialises with 'zh' (matches server render), then reads localStorage
// after hydration — avoids hydration mismatch while supporting persistence.

export function useLang() {
  const [lang, setLang] = useState<Lang>('zh')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'zh') setLang(stored)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const t = (key: TranslationKey): string => translations[lang][key]

  return { lang, toggleLang, t }
}
