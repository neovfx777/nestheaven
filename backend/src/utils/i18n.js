const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];

/**
 * Get localized value from i18n JSON object
 * @param {Object} obj - { uz, ru, en } or similar
 * @param {string} lang - uz, ru, en
 * @param {string} fallback - fallback language
 * @returns {string}
 */
function getLocalized(obj, lang = 'uz', fallback = 'uz') {
  if (!obj || typeof obj !== 'object') return '';
  const safeLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : fallback;
  return obj[safeLang] || obj[fallback] || obj.uz || obj.ru || obj.en || '';
}

/**
 * Validate i18n object has at least one language
 * @param {Object} obj
 * @returns {boolean}
 */
function isValidI18n(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return SUPPORTED_LANGUAGES.some((lang) => obj[lang] && typeof obj[lang] === 'string');
}

module.exports = {
  SUPPORTED_LANGUAGES,
  getLocalized,
  isValidI18n,
};
