import { FilterParams } from '../api/apartments';

export interface VoiceAiFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  developerName?: string;
  complexName?: string;
  sortBy?: FilterParams['sortBy'];
  sortOrder?: FilterParams['sortOrder'];
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;

  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    let multiplier = 1;

    if (lowered.includes('ming') || lowered.includes('тыс') || lowered.includes('thousand') || /\b\d+\s*k\b/.test(lowered)) {
      multiplier = 1000;
    } else if (lowered.includes('mln') || lowered.includes('million') || lowered.includes('миллион') || lowered.includes('млн')) {
      multiplier = 1_000_000;
    }

    const numeric = Number(lowered.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(numeric)) return numeric * multiplier;
  }

  return undefined;
};

const toSortBy = (value: unknown): FilterParams['sortBy'] | undefined => {
  if (value === 'price' || value === 'area' || value === 'rooms' || value === 'createdAt' || value === 'updatedAt') {
    return value;
  }
  return undefined;
};

const toSortOrder = (value: unknown): FilterParams['sortOrder'] | undefined => {
  if (value === 'asc' || value === 'desc') {
    return value;
  }
  return undefined;
};

export const isVoiceAiConfigured = () => Boolean(import.meta.env.VITE_OPENROUTER_API_KEY);

export const interpretVoiceQuery = async (query: string): Promise<VoiceAiFilters> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing');
  }

  const model = import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/auto';
  const referer = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': referer,
      'X-Title': 'NestHeaven Voice Search'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: [
            "Siz ko'p xonadon e'lonlarini filtrlash uchun ovozli buyruqlarni tahlil qilasiz.",
            'Foydalanuvchi Uzbek, Rus yoki Ingliz tilida gapirishi mumkin.',
            'Har doim faqat JSON obyektini qaytaring (hech qanday qo\'shimcha matn emas).',
            'JSON maydonlari: search (string yoki null), minPrice, maxPrice, minRooms, maxRooms, minArea, maxArea (son yoki null), developerName (string yoki null), sortBy ("price" | "area" | "rooms" | "createdAt" | "updatedAt" | null), sortOrder ("asc" | "desc" | null).',
            'complexName maydoni: agar foydalanuvchi aniq turar-joy majmuasi nomini aytsa, shu nomni string ko\'rinishida qaytaring, aks holda null.',
            'Agar faqat bitta xona soni aytilsa (masalan "2 xonali"), minRooms va maxRooms ni shu songa teng qiling.',
            'Agar narx aytilsa, AQSH dollarida sonni qaytaring (200 ming -> 200000).',
            "Agar maydon mavjud bo'lmasa, null bilan to'ldiring.",
            "Nimadir topilmagan bo'lsa, taxminiy matnni search maydoniga qo'shing (shahar, tuman yoki kalit so'z).",
            "Ovozda '1 xonali' yoki '2 xona' deyilgan bo'lsa rooms maydonini shu songa qo'ying."
          ].join(' ')
        },
        { role: 'user', content: query }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI javobi bo'sh");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error('AI javobi JSON formatida emas');
  }

  const result: VoiceAiFilters = {
    search: typeof parsed.search === 'string' ? parsed.search : undefined,
    minPrice: toNumber(parsed.minPrice),
    maxPrice: toNumber(parsed.maxPrice),
    minRooms: toNumber(parsed.minRooms ?? parsed.rooms),
    maxRooms: toNumber(parsed.maxRooms ?? parsed.rooms),
    minArea: toNumber(parsed.minArea),
    maxArea: toNumber(parsed.maxArea),
    developerName: typeof parsed.developerName === 'string' ? parsed.developerName : undefined,
    complexName: typeof parsed.complexName === 'string' ? parsed.complexName : undefined,
    sortBy: toSortBy(parsed.sortBy),
    sortOrder: toSortOrder(parsed.sortOrder)
  };

  return result;
};
