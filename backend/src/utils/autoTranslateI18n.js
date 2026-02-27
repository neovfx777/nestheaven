const env = require('../config/env');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeI18nValue(value) {
  if (value == null) return null;

  if (typeof value === 'string') {
    const text = cleanText(value);
    if (!text) return null;
    return { uz: text, ru: text, en: text };
  }

  if (typeof value !== 'object') return null;

  return {
    uz: cleanText(value.uz),
    ru: cleanText(value.ru),
    en: cleanText(value.en),
  };
}

function hasAnyContent(i18n) {
  if (!i18n || typeof i18n !== 'object') return false;
  return SUPPORTED_LANGUAGES.some((lang) => cleanText(i18n[lang]).length > 0);
}

function getMissingLanguages(i18n) {
  return SUPPORTED_LANGUAGES.filter((lang) => !cleanText(i18n[lang]));
}

function getSourceLanguage(i18n) {
  const scored = SUPPORTED_LANGUAGES
    .map((lang) => ({ lang, text: cleanText(i18n[lang]), len: cleanText(i18n[lang]).length }))
    .filter((item) => item.len > 0)
    .sort((a, b) => b.len - a.len);

  return scored[0]?.lang || null;
}

function parseJsonObject(content) {
  if (!content || typeof content !== 'string') return null;

  const trimmed = content.trim();
  if (!trimmed) return null;

  const direct = tryParseJson(trimmed);
  if (direct && typeof direct === 'object') return direct;

  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  const fenceParsed = tryParseJson(withoutFence);
  if (fenceParsed && typeof fenceParsed === 'object') return fenceParsed;

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const extracted = trimmed.slice(firstBrace, lastBrace + 1);
    const parsed = tryParseJson(extracted);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  return null;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function translateWithOpenRouter({ text, sourceLanguage, targetLanguages }) {
  if (!env.OPENROUTER_API_KEY) return null;
  if (!text || !targetLanguages.length) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': env.OPENROUTER_SITE_URL || 'http://localhost:5173',
        'X-Title': env.OPENROUTER_APP_NAME || 'NestHeaven Apartment Assistant',
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: [
              'You are a translator for real-estate listings.',
              'Return only a JSON object.',
              `Allowed keys: ${SUPPORTED_LANGUAGES.join(', ')}`,
              'Keep numbers, currency, and proper nouns intact.',
              'Do not add explanations.',
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              `Source language: ${sourceLanguage}`,
              `Target languages: ${targetLanguages.join(', ')}`,
              'Translate this text:',
              text,
            ].join('\n'),
          },
        ],
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`OpenRouter translation failed (${response.status})`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = parseJsonObject(content);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('OpenRouter returned invalid translation payload');
  }

  const result = {};
  targetLanguages.forEach((lang) => {
    const translated = cleanText(parsed[lang]);
    if (translated) result[lang] = translated;
  });

  return result;
}

async function completeI18n(value, { fieldName = 'field' } = {}) {
  const normalized = normalizeI18nValue(value);
  if (!normalized || !hasAnyContent(normalized)) return normalized;

  const missingLanguages = getMissingLanguages(normalized);
  if (!missingLanguages.length) return normalized;

  const sourceLanguage = getSourceLanguage(normalized);
  if (!sourceLanguage) return normalized;

  const sourceText = cleanText(normalized[sourceLanguage]);
  if (!sourceText) return normalized;

  let translations = null;
  try {
    translations = await translateWithOpenRouter({
      text: sourceText,
      sourceLanguage,
      targetLanguages: missingLanguages,
    });
  } catch (error) {
    console.error(`[i18n] Auto-translate failed for ${fieldName}: ${error.message}`);
  }

  missingLanguages.forEach((lang) => {
    normalized[lang] = cleanText(translations?.[lang]) || sourceText;
  });

  return normalized;
}

module.exports = {
  completeI18n,
  normalizeI18nValue,
  hasAnyContent,
  SUPPORTED_LANGUAGES,
};
