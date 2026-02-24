const { prisma } = require('../../config/db');
const env = require('../../config/env');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const METRO_TOKENS = ['metro', 'метро', 'subway', 'metropoliten'];
const PLACE_SYNONYMS = {
  school: ['school', 'maktab', 'школ', 'lice', 'litsey'],
  kindergarten: ['kindergarten', 'bogcha', 'садик', 'детсад'],
  hospital: ['hospital', 'klinika', 'shifoxona', 'больниц', 'поликлиник'],
  park: ['park', 'bog', 'сад', 'garden'],
  mall: ['mall', 'savdo', 'market', 'торгов', 'супермаркет'],
};
const SEARCH_STOPWORDS = new Set([
  'menga',
  'kerak',
  'uy',
  'kvartira',
  'top',
  'topib',
  'yaxshi',
  'yaqin',
  'bilan',
  'uchun',
  'and',
  'the',
  'please',
  'apartment',
  'flat',
  'house',
  'нужна',
  'квартира',
  'рядом',
]);

function parseJsonMaybe(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function pickLocalizedText(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const parsed = parseJsonMaybe(value, null);
    if (parsed && typeof parsed === 'object') {
      return parsed.uz || parsed.ru || parsed.en || '';
    }
    return value;
  }
  if (typeof value === 'object') {
    return value.uz || value.ru || value.en || '';
  }
  return '';
}

function toNumber(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value !== 'string') return undefined;

  const lowered = value.toLowerCase().trim();
  let multiplier = 1;
  if (/\b(k|ming|тыс)\b/.test(lowered)) multiplier = 1_000;
  if (/\b(mln|million|миллион)\b/.test(lowered)) multiplier = 1_000_000;

  const numeric = Number(lowered.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(numeric)) return undefined;
  return numeric * multiplier;
}

function normalizeNearbyPlaces(rawNearbyPlaces) {
  const parsed = parseJsonMaybe(rawNearbyPlaces, rawNearbyPlaces);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((place) => {
      if (!place || typeof place !== 'object') return null;
      const name = String(place.name || '').trim();
      if (!name) return null;

      const distanceMeters =
        place.distanceMeters != null
          ? Number(place.distanceMeters)
          : place.distanceKm != null
          ? Number(place.distanceKm) * 1000
          : null;

      return {
        name,
        type: String(place.type || '').trim().toLowerCase(),
        note: String(place.note || '').trim(),
        distanceMeters:
          distanceMeters != null && !Number.isNaN(distanceMeters)
            ? Math.round(distanceMeters)
            : null,
      };
    })
    .filter(Boolean);
}

function safeJsonParseFromContent(content) {
  if (!content || typeof content !== 'string') return null;
  const trimmed = content.trim();

  const direct = parseJsonMaybe(trimmed, null);
  if (direct && typeof direct === 'object') return direct;

  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  const fenceParsed = parseJsonMaybe(withoutFence, null);
  if (fenceParsed && typeof fenceParsed === 'object') return fenceParsed;

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const maybeObject = trimmed.slice(firstBrace, lastBrace + 1);
    const extracted = parseJsonMaybe(maybeObject, null);
    if (extracted && typeof extracted === 'object') return extracted;
  }

  return null;
}

function includesAny(text, words) {
  const lower = String(text || '').toLowerCase();
  return words.some((word) => lower.includes(word));
}

function sanitizeIntent(raw, fallbackMessage = '') {
  const intent = {
    minPrice: toNumber(raw?.minPrice),
    maxPrice: toNumber(raw?.maxPrice),
    minRooms: toNumber(raw?.minRooms),
    maxRooms: toNumber(raw?.maxRooms),
    minArea: toNumber(raw?.minArea),
    maxArea: toNumber(raw?.maxArea),
    city: typeof raw?.city === 'string' ? raw.city.trim() : '',
    complexName: typeof raw?.complexName === 'string' ? raw.complexName.trim() : '',
    nearMetro: Boolean(raw?.nearMetro),
    nearbyKeyword: typeof raw?.nearbyKeyword === 'string' ? raw.nearbyKeyword.trim().toLowerCase() : '',
    status:
      raw?.status === 'sold' || raw?.status === 'active'
        ? raw.status
        : undefined,
    freeText:
      typeof raw?.freeText === 'string'
        ? raw.freeText.trim()
        : typeof raw?.search === 'string'
        ? raw.search.trim()
        : '',
  };

  if (intent.minPrice != null && intent.maxPrice != null && intent.minPrice > intent.maxPrice) {
    const temp = intent.minPrice;
    intent.minPrice = intent.maxPrice;
    intent.maxPrice = temp;
  }
  if (intent.minRooms != null && intent.maxRooms != null && intent.minRooms > intent.maxRooms) {
    const temp = intent.minRooms;
    intent.minRooms = intent.maxRooms;
    intent.maxRooms = temp;
  }
  if (intent.minArea != null && intent.maxArea != null && intent.minArea > intent.maxArea) {
    const temp = intent.minArea;
    intent.minArea = intent.maxArea;
    intent.maxArea = temp;
  }

  if (!intent.nearMetro && includesAny(fallbackMessage, METRO_TOKENS)) {
    intent.nearMetro = true;
  }

  return intent;
}

function fallbackIntent(message, history = []) {
  const recentUserHistory = history
    .filter((item) => item?.role === 'user')
    .slice(-3)
    .map((item) => item.content)
    .join(' ');

  const text = `${recentUserHistory} ${message}`.trim();
  const lower = text.toLowerCase();

  const roomMatch = lower.match(/(\d+)\s*xona/);
  const minPriceMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(ming|k|mln|million|тыс|миллион)?\s*(gacha|до|up to|max)/);
  const maxPriceMatch = lower.match(/(dan|from|от)\s*(\d+(?:[.,]\d+)?)\s*(ming|k|mln|million|тыс|миллион)?/);
  const minAreaMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²|kv|kvadrat|кв)/);

  let nearbyKeyword = '';
  Object.entries(PLACE_SYNONYMS).forEach(([key, terms]) => {
    if (!nearbyKeyword && includesAny(lower, terms)) {
      nearbyKeyword = key;
    }
  });

  const intent = {
    minPrice: maxPriceMatch ? toNumber(`${maxPriceMatch[2]} ${maxPriceMatch[3] || ''}`) : undefined,
    maxPrice: minPriceMatch ? toNumber(`${minPriceMatch[1]} ${minPriceMatch[2] || ''}`) : undefined,
    minRooms: roomMatch ? Number(roomMatch[1]) : undefined,
    maxRooms: roomMatch ? Number(roomMatch[1]) : undefined,
    minArea: minAreaMatch ? toNumber(minAreaMatch[1]) : undefined,
    maxArea: undefined,
    city: '',
    complexName: '',
    nearMetro: includesAny(lower, METRO_TOKENS),
    nearbyKeyword,
    status: undefined,
    freeText: message,
  };

  return sanitizeIntent(intent, message);
}

function mergeIntent(baseIntent, aiIntent) {
  const merged = { ...baseIntent };
  Object.entries(aiIntent || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      merged[key] = value;
    }
  });
  return sanitizeIntent(merged, merged.freeText || '');
}

async function resolveIntentWithOpenRouter({ message, history, language }) {
  if (!env.OPENROUTER_API_KEY) return null;

  const conversationContext = (history || [])
    .slice(-8)
    .map((item) => `${item.role}: ${item.content}`)
    .join('\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

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
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: [
              'You are an intent parser for apartment search.',
              'Return ONLY a JSON object.',
              'Extract these fields:',
              'minPrice, maxPrice, minRooms, maxRooms, minArea, maxArea, city, complexName, nearMetro, nearbyKeyword, status, freeText.',
              'nearbyKeyword should be one short term like school, kindergarten, hospital, park, mall.',
              'status can be active or sold or null.',
              'If a field is missing, set it to null.',
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              `Language: ${language || 'uz'}`,
              conversationContext ? `Conversation:\n${conversationContext}` : '',
              `Latest message: ${message}`,
            ]
              .filter(Boolean)
              .join('\n\n'),
          },
        ],
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`OpenRouter intent parse failed (${response.status})`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = safeJsonParseFromContent(content);

  if (!parsed) {
    throw new Error('OpenRouter returned non-JSON intent payload');
  }

  return sanitizeIntent(parsed, message);
}

function getNearestPlaceDistance(nearbyPlaces, keywords) {
  let minDistance = null;
  nearbyPlaces.forEach((place) => {
    const combined = `${place.name} ${place.type} ${place.note}`.toLowerCase();
    if (keywords.some((word) => combined.includes(word))) {
      if (place.distanceMeters != null && (minDistance == null || place.distanceMeters < minDistance)) {
        minDistance = place.distanceMeters;
      }
    }
  });
  return minDistance;
}

function getNearbyMatches(nearbyPlaces, keyword) {
  if (!keyword) return [];
  const synonyms = PLACE_SYNONYMS[keyword] || [keyword];
  return nearbyPlaces.filter((place) => {
    const combined = `${place.name} ${place.type} ${place.note}`.toLowerCase();
    return synonyms.some((word) => combined.includes(word));
  });
}

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function buildSearchBlob(apartment) {
  const title = pickLocalizedText(apartment.title);
  const description = pickLocalizedText(apartment.description);
  const complexName = pickLocalizedText(apartment.complex?.name);
  const complexAddress = pickLocalizedText(apartment.complex?.address);
  const locationText = apartment.complex?.locationText || '';
  const nearbyPlaces = normalizeNearbyPlaces(apartment.complex?.nearbyPlaces)
    .map((place) => `${place.name} ${place.type} ${place.note}`)
    .join(' ');

  return [title, description, complexName, complexAddress, locationText, nearbyPlaces]
    .join(' ')
    .toLowerCase();
}

function normalizeToken(token) {
  return token
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim();
}

function buildApartmentView(apartment, score = 0) {
  const nearbyPlaces = normalizeNearbyPlaces(apartment.complex?.nearbyPlaces);
  const metroDistanceMeters = getNearestPlaceDistance(nearbyPlaces, METRO_TOKENS);

  return {
    id: apartment.id,
    title: pickLocalizedText(apartment.title) || 'Apartment',
    price: apartment.price,
    rooms: apartment.rooms,
    area: apartment.area,
    floor: apartment.floor,
    status: apartment.status,
    coverImage: apartment.images?.[0]?.url || null,
    complexName: pickLocalizedText(apartment.complex?.name) || '',
    city: apartment.complex?.city || '',
    locationText: apartment.complex?.locationText || pickLocalizedText(apartment.complex?.address),
    metroDistanceMeters,
    score,
    url: `/apartments/${apartment.id}`,
  };
}

function composeAssistantReply(matches, intent) {
  if (!matches.length) {
    return [
      "Siz so'ragan shartlarga mos e'lon topilmadi.",
      "Shartlarni biroz yumshatib ko'ring (masalan narx oralig'ini kengaytirish yoki xonani kamaytirish).",
    ].join(' ');
  }

  const lines = [`Topildi: ${matches.length} ta mos variant.`];
  matches.forEach((item, index) => {
    const location = item.locationText || item.city || "Joylashuv ko'rsatilmagan";
    const metroPart =
      item.metroDistanceMeters != null
        ? `, metro ~${item.metroDistanceMeters}m`
        : intent.nearMetro
        ? ', metro masofasi ko`rsatilmagan'
        : '';

    lines.push(
      `${index + 1}) ${item.title} - ${formatUsd(item.price)}, ${item.rooms} xona, ${item.area}m2, ${location}${metroPart}`
    );
  });

  lines.push("Xohlasangiz, filtrlarga qo'llab beraman yoki budjet/xona bo'yicha toraytiraman.");
  return lines.join('\n');
}

function buildFilterPatch(intent) {
  const patch = {};
  if (intent.minPrice != null) patch.minPrice = String(Math.round(intent.minPrice));
  if (intent.maxPrice != null) patch.maxPrice = String(Math.round(intent.maxPrice));
  if (intent.minRooms != null) patch.minRooms = String(Math.round(intent.minRooms));
  if (intent.maxRooms != null) patch.maxRooms = String(Math.round(intent.maxRooms));
  if (intent.minArea != null) patch.minArea = String(Math.round(intent.minArea));
  if (intent.maxArea != null) patch.maxArea = String(Math.round(intent.maxArea));
  if (intent.status) patch.status = intent.status;

  if (intent.freeText) patch.search = intent.freeText;
  else if (intent.nearMetro) patch.search = 'metro';
  else if (intent.nearbyKeyword) patch.search = intent.nearbyKeyword;

  return patch;
}

function scoreApartment(apartment, intent) {
  let score = 0;
  const nearbyPlaces = normalizeNearbyPlaces(apartment.complex?.nearbyPlaces);
  const metroDistance = getNearestPlaceDistance(nearbyPlaces, METRO_TOKENS);
  const complexName = pickLocalizedText(apartment.complex?.name).toLowerCase();
  const city = String(apartment.complex?.city || '').toLowerCase();

  if (intent.nearMetro) {
    if (metroDistance == null) return Number.NEGATIVE_INFINITY;
    score += Math.max(0, 10_000 - metroDistance);
  }

  if (intent.nearbyKeyword) {
    const nearbyMatches = getNearbyMatches(nearbyPlaces, intent.nearbyKeyword);
    if (!nearbyMatches.length) return Number.NEGATIVE_INFINITY;
    score += 2_000 * nearbyMatches.length;
  }

  if (intent.city && !city.includes(intent.city.toLowerCase())) {
    return Number.NEGATIVE_INFINITY;
  }

  if (intent.complexName && !complexName.includes(intent.complexName.toLowerCase())) {
    return Number.NEGATIVE_INFINITY;
  }

  if (intent.freeText) {
    const blob = buildSearchBlob(apartment);
    const queryTerms = intent.freeText
      .toLowerCase()
      .split(/\s+/)
      .map(normalizeToken)
      .filter((term) => term.length >= 3 && !SEARCH_STOPWORDS.has(term));

    if (queryTerms.length) {
      const matched = queryTerms.filter((term) => blob.includes(term)).length;
      if (
        matched === 0 &&
        !intent.nearMetro &&
        !intent.nearbyKeyword &&
        !intent.city &&
        !intent.complexName
      ) {
        return Number.NEGATIVE_INFINITY;
      }
      score += matched * 250;
    }
  }

  score += Math.max(0, 1_000_000 - apartment.price) / 50_000;
  return score;
}

async function queryCandidates(intent, limit) {
  const where = {};

  if (intent.minPrice != null || intent.maxPrice != null) {
    where.price = {};
    if (intent.minPrice != null) where.price.gte = intent.minPrice;
    if (intent.maxPrice != null) where.price.lte = intent.maxPrice;
  }

  if (intent.minRooms != null || intent.maxRooms != null) {
    where.rooms = {};
    if (intent.minRooms != null) where.rooms.gte = Math.round(intent.minRooms);
    if (intent.maxRooms != null) where.rooms.lte = Math.round(intent.maxRooms);
  }

  if (intent.minArea != null || intent.maxArea != null) {
    where.area = {};
    if (intent.minArea != null) where.area.gte = intent.minArea;
    if (intent.maxArea != null) where.area.lte = intent.maxArea;
  }

  if (intent.status === 'sold') {
    where.status = 'sold';
  } else {
    where.status = 'active';
  }

  const candidateLimit = Math.min(Math.max(limit * 30, 60), 400);
  return prisma.apartment.findMany({
    where,
    take: candidateLimit,
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
      complex: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          locationText: true,
          nearbyPlaces: true,
        },
      },
    },
  });
}

async function apartmentsAssistant(data) {
  const { message, history = [], language = 'uz', limit = 5 } = data;
  const safeLimit = Math.max(1, Math.min(Number(limit) || 5, 10));

  const fallback = fallbackIntent(message, history);

  let intent = fallback;
  try {
    const aiIntent = await resolveIntentWithOpenRouter({ message, history, language });
    if (aiIntent) {
      intent = mergeIntent(fallback, aiIntent);
    }
  } catch (error) {
    console.error('Chat intent parsing fallback used:', error.message);
  }

  const candidates = await queryCandidates(intent, safeLimit);
  const ranked = candidates
    .map((apartment) => ({ apartment, score: scoreApartment(apartment, intent) }))
    .filter((item) => item.score > Number.NEGATIVE_INFINITY)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.apartment.price - b.apartment.price;
    })
    .slice(0, safeLimit)
    .map((item) => buildApartmentView(item.apartment, item.score));

  const reply = composeAssistantReply(ranked, intent);

  return {
    reply,
    matches: ranked,
    appliedFilters: buildFilterPatch(intent),
    source: 'database_only',
    totalCandidatesChecked: candidates.length,
  };
}

module.exports = {
  apartmentsAssistant,
};
