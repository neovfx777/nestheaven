export function getLocalizedText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const anyVal = value as { uz?: string; ru?: string; en?: string };
    return anyVal.uz || anyVal.en || anyVal.ru || '';
  }
  return '';
}

export function getDisplayText(...values: unknown[]): string {
  for (const value of values) {
    const text = getLocalizedText(value);
    if (text) return text;
  }
  return '';
}
