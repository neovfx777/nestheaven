import { Language, useLanguageStore } from '../stores/languageStore';
import enTranslations from '../locales/en.json';
import uzTranslations from '../locales/uz.json';
import ruTranslations from '../locales/ru.json';

type TranslationKey = keyof typeof enTranslations;
type NestedKey<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKey<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKeys = NestedKey<typeof enTranslations>;

const translations = {
  en: enTranslations,
  uz: uzTranslations,
  ru: ruTranslations,
};

export function t(key: TranslationKeys, lang?: Language): string {
  const currentLang = lang || useLanguageStore.getState().language;
  const keys = key.split('.');
  let value: any = translations[currentLang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}

// Helper to get localized value from JSON object (for user content)
export function getLocalizedContent(
  content: { uz?: string; ru?: string; en?: string } | string | null | undefined,
  lang?: Language
): string {
  if (!content) return '';
  
  const currentLang = lang || useLanguageStore.getState().language;
  
  if (typeof content === 'string') {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[currentLang] || parsed.en || parsed.uz || parsed.ru || '';
      }
    } catch {
      // Not JSON, return as is
      return content;
    }
  }
  
  if (typeof content === 'object') {
    return content[currentLang] || content.en || content.uz || content.ru || '';
  }
  
  return '';
}
