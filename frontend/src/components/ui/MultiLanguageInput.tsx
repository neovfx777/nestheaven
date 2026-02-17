import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Globe, ChevronRight, Check, AlertCircle } from 'lucide-react';

interface LanguageContent {
  uz: string;
  ru: string;
  en: string;
}

interface MultiLanguageInputProps {
  descriptionValue: LanguageContent;
  titleValue: LanguageContent;
  onDescriptionChange: (value: LanguageContent) => void;
  onTitleChange: (value: LanguageContent) => void;
  descriptionPlaceholder?: LanguageContent;
  titlePlaceholder?: LanguageContent;
  required?: boolean;
  className?: string;
  showValidation?: boolean;
}

export const MultiLanguageInput: React.FC<MultiLanguageInputProps> = ({
  descriptionValue,
  titleValue,
  onDescriptionChange,
  onTitleChange,
  descriptionPlaceholder = { uz: '', ru: '', en: '' },
  titlePlaceholder = { uz: '', ru: '', en: '' },
  required = false,
  className = '',
  showValidation = true,
}) => {
  const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('en');
  const [descriptionCharCount, setDescriptionCharCount] = useState<Record<string, number>>({
    uz: descriptionValue?.uz?.length || 0,
    ru: descriptionValue?.ru?.length || 0,
    en: descriptionValue?.en?.length || 0,
  });
  const [titleCharCount, setTitleCharCount] = useState<Record<string, number>>({
    uz: titleValue?.uz?.length || 0,
    ru: titleValue?.ru?.length || 0,
    en: titleValue?.en?.length || 0,
  });

  const languages = [
    { code: 'uz' as const, label: 'Uzbek', flag: '🇺🇿' },
    { code: 'ru' as const, label: 'Russian', flag: '🇷🇺' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
  ];

  const handleDescriptionChange = (lang: 'uz' | 'ru' | 'en', newValue: string) => {
    const updatedValue = {
      ...descriptionValue,
      [lang]: newValue,
    };
    
    // Update character count
    setDescriptionCharCount(prev => ({
      ...prev,
      [lang]: newValue.length
    }));
    
    onDescriptionChange(updatedValue);
  };

  const handleTitleChange = (lang: 'uz' | 'ru' | 'en', newValue: string) => {
    const updatedValue = {
      ...titleValue,
      [lang]: newValue,
    };
    
    // Update character count
    setTitleCharCount(prev => ({
      ...prev,
      [lang]: newValue.length
    }));
    
    onTitleChange(updatedValue);
  };

  // Initialize character counts on mount
  useEffect(() => {
    const descCounts = {
      uz: descriptionValue?.uz?.length || 0,
      ru: descriptionValue?.ru?.length || 0,
      en: descriptionValue?.en?.length || 0,
    };
    setDescriptionCharCount(descCounts);

    const titleCounts = {
      uz: titleValue?.uz?.length || 0,
      ru: titleValue?.ru?.length || 0,
      en: titleValue?.en?.length || 0,
    };
    setTitleCharCount(titleCounts);
  }, [descriptionValue, titleValue]);

  const getDescriptionStatus = (lang: 'uz' | 'ru' | 'en') => {
    const text = descriptionValue?.[lang] || '';
    if (!text.trim()) return 'empty';
    if (text.length < 30) return 'short';
    if (text.length > 180) return 'long';
    return 'good';
  };

  const getTitleStatus = (lang: 'uz' | 'ru' | 'en') => {
    const text = titleValue?.[lang] || '';
    if (!text.trim()) return 'empty';
    if (text.length < 5) return 'short';
    if (text.length > 80) return 'long';
    return 'good';
  };

  const statusColors = {
    empty: 'bg-gray-100 text-gray-600',
    short: 'bg-yellow-100 text-yellow-800',
    long: 'bg-orange-100 text-orange-800',
    good: 'bg-green-100 text-green-800',
  };

  const statusIcons = {
    empty: <div className="w-2 h-2 rounded-full bg-gray-400"></div>,
    short: <AlertCircle className="w-4 h-4" />,
    long: <AlertCircle className="w-4 h-4" />,
    good: <Check className="w-4 h-4" />,
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Globe className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Multi-Language Content</h3>
              <p className="text-sm text-gray-600">
                Edit title and description in Uzbek, Russian, and English
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Select language to edit
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Language Navigation */}
        <div className="w-1/4 border-r border-gray-200 bg-gray-50">
          <nav className="py-4 space-y-1">
            {languages.map(({ code, label: langLabel, flag }) => {
              const descStatus = getDescriptionStatus(code);
              const titleStatus = getTitleStatus(code);
              const isActive = activeLang === code;
              const descCount = descriptionCharCount[code] || 0;
              const titleCount = titleCharCount[code] || 0;
              
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveLang(code)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-sm font-medium
                    transition-colors relative
                    ${isActive 
                      ? 'bg-white text-primary-700 border-r-2 border-primary-500' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{langLabel}</div>
                      <div className="text-xs text-gray-500">
                        Title: {titleCount}/80 • Desc: {descCount}/200
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <div className={`px-2 py-1 rounded-full text-xs ${statusColors[titleStatus]}`}>
                      <div className="flex items-center space-x-1">
                        {statusIcons[titleStatus]}
                        <span className="text-xs">Title</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${statusColors[descStatus]}`}>
                      <div className="flex items-center space-x-1">
                        {statusIcons[descStatus]}
                        <span className="text-xs">Desc</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Summary */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Title Completion:</span>
                <span className="font-medium">
                  {Object.values(titleValue || {}).filter(v => v?.trim()).length}/3
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(Object.values(titleValue || {}).filter(v => v?.trim()).length / 3) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mb-1">
                <span>Description Completion:</span>
                <span className="font-medium">
                  {Object.values(descriptionValue || {}).filter(v => v?.trim()).length}/3
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(Object.values(descriptionValue || {}).filter(v => v?.trim()).length / 3) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area - Title FIRST, then Description */}
        <div className="flex-1 p-6">
          {languages.map(({ code, label: langLabel, flag }) => (
            <div
              key={code}
              className={`${activeLang === code ? 'block' : 'hidden'}`}
              style={{ animation: activeLang === code ? 'fadeIn 0.2s ease-out' : 'none' }}
            >
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">{flag}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {langLabel} Content
                    </h4>
                    <p className="text-sm text-gray-600">
                      Edit title and description in {langLabel.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* TITLE (Input) - ON TOP */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    value={titleValue?.[code] || ''}
                    onChange={(e) => handleTitleChange(code, e.target.value)}
                    placeholder={titlePlaceholder?.[code] || `Enter title in ${langLabel}`}
                    className="w-full"
                  />
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>Keep titles concise and descriptive</span>
                    <span>{titleCharCount[code] || 0}/80</span>
                  </div>
                </div>

                {/* DESCRIPTION (Textarea) - BELOW TITLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Textarea
                    value={descriptionValue?.[code] || ''}
                    onChange={(e) => handleDescriptionChange(code, e.target.value)}
                    placeholder={descriptionPlaceholder?.[code] || `Enter description in ${langLabel}`}
                    rows={6}
                    className="w-full resize-none min-h-[200px]"
                  />
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <div>
                      {descriptionCharCount[code] < 30 && (
                        <span className="text-yellow-600">Add more details for better conversion</span>
                      )}
                      {descriptionCharCount[code] >= 30 && descriptionCharCount[code] < 100 && (
                        <span className="text-green-600">Good length for descriptions</span>
                      )}
                      {descriptionCharCount[code] >= 100 && (
                        <span className="text-orange-600">Consider making it more concise</span>
                      )}
                    </div>
                    <span>{descriptionCharCount[code] || 0}/200</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Language Switch (Mobile/Alternative) */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 lg:hidden">
        <div className="flex justify-between">
          {languages.map(({ code, label: langLabel, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLang(code)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-colors
                ${activeLang === code 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xl mb-1">{flag}</span>
              <span className="text-xs font-medium">{langLabel.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add keyframe animation to global scope via style tag */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};