require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { completeI18n, hasAnyContent } = require('../src/utils/autoTranslateI18n');

const prisma = new PrismaClient();
const FIELDS = ['title', 'description', 'materials', 'infrastructureNote'];

function parseI18nField(rawValue) {
  if (rawValue == null) return null;

  if (typeof rawValue === 'string') {
    try {
      const parsed = JSON.parse(rawValue);
      if (parsed && typeof parsed === 'object') return parsed;
      return { uz: rawValue, ru: rawValue, en: rawValue };
    } catch {
      const text = rawValue.trim();
      if (!text) return null;
      return { uz: text, ru: text, en: text };
    }
  }

  if (typeof rawValue === 'object') return rawValue;
  return null;
}

function toStableJson(i18n) {
  return JSON.stringify({
    uz: typeof i18n?.uz === 'string' ? i18n.uz.trim() : '',
    ru: typeof i18n?.ru === 'string' ? i18n.ru.trim() : '',
    en: typeof i18n?.en === 'string' ? i18n.en.trim() : '',
  });
}

async function normalizeField(fieldName, rawValue) {
  const parsed = parseI18nField(rawValue);
  if (!parsed || !hasAnyContent(parsed)) {
    return {
      changed: false,
      value: rawValue,
    };
  }

  const completed = await completeI18n(parsed, { fieldName: `apartment.${fieldName}` });
  if (!completed || !hasAnyContent(completed)) {
    return {
      changed: false,
      value: rawValue,
    };
  }

  const nextJson = toStableJson(completed);
  return {
    changed: nextJson !== rawValue,
    value: nextJson,
  };
}

async function main() {
  const apartments = await prisma.apartment.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      materials: true,
      infrastructureNote: true,
    },
  });

  let updatedCount = 0;
  let touchedFields = 0;

  for (const apartment of apartments) {
    const updates = {};

    for (const field of FIELDS) {
      const currentValue = apartment[field];
      if (currentValue == null) continue;

      const result = await normalizeField(field, currentValue);
      if (result.changed) {
        updates[field] = result.value;
        touchedFields += 1;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.apartment.update({
        where: { id: apartment.id },
        data: updates,
      });
      updatedCount += 1;
      console.log(`Updated apartment ${apartment.id}: ${Object.keys(updates).join(', ')}`);
    }
  }

  console.log(
    `Backfill completed. Apartments scanned=${apartments.length}, updated=${updatedCount}, fieldUpdates=${touchedFields}`
  );
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
