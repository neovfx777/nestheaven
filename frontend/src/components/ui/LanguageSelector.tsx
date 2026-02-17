import { Globe } from 'lucide-react';
import { useLanguageStore, Language } from '../../stores/languageStore';
import { t } from '../../utils/translations';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: t('common.uzbek'), flag: '🇺🇿' },
    { code: 'ru', label: t('common.russian'), flag: '🇷🇺' },
    { code: 'en', label: t('common.english'), flag: '🇺🇸' },
  ];

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Globe className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {languages.find((l) => l.code === language)?.flag} {languages.find((l) => l.code === language)?.label}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                language === lang.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
              {language === lang.code && (
                <span className="ml-auto text-primary-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
