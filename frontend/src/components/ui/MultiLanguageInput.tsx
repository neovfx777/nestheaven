import React, { useState } from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';

interface MultiLanguageInputProps {
  label: string;
  languages: string[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  textarea?: boolean;
  error?: string;
}

export const MultiLanguageInput: React.FC<MultiLanguageInputProps> = ({
  label,
  languages,
  value,
  onChange,
  textarea = false,
  error
}) => {
  const [activeLang, setActiveLang] = useState(languages[0]);

  const handleChange = (lang: string, text: string) => {
    onChange({
      ...value,
      [lang]: text
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Language Tabs */}
      <div className="flex border-b border-gray-200">
        {languages.map((lang) => (
          <Button
            key={lang}
            type="button"
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 px-3 py-2 text-sm font-medium ${
              activeLang === lang
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveLang(lang)}
          >
            {lang.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Input for Active Language */}
      <div className="mt-2">
        {textarea ? (
          <Textarea
            value={value[activeLang] || ''}
            onChange={(e) => handleChange(activeLang, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} in ${activeLang.toUpperCase()}`}
            rows={4}
          />
        ) : (
          <Input
            value={value[activeLang] || ''}
            onChange={(e) => handleChange(activeLang, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} in ${activeLang.toUpperCase()}`}
          />
        )}
      </div>

      {/* Show all values */}
      <div className="mt-2 space-y-1">
        {languages.map((lang) => (
          <div key={lang} className="text-sm text-gray-600">
            <span className="font-medium">{lang.toUpperCase()}:</span>{' '}
            {value[lang] || <span className="text-gray-400">Not entered</span>}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};