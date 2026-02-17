import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'uz' | 'ru' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang: Language) => {
        set({ language: lang });
        // Store in localStorage for persistence
        localStorage.setItem('selected-language', lang);
      },
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);

// Initialize from localStorage on first load
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('selected-language') as Language;
  if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
    useLanguageStore.getState().setLanguage(savedLang);
  }
}
