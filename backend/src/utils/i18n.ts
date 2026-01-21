export type LanguageCode = 'uz' | 'ru' | 'en';

export interface TranslatableFields {
  title: string;
  description?: string;
  materials?: string;
  infrastructureNote?: string;
  investmentGrowthNote?: string;
}

export interface MultiLanguageContent {
  uz: TranslatableFields;
  ru: TranslatableFields;
  en: TranslatableFields;
}

// Helper to extract content for a specific language
export const getContentForLanguage = (
  content: MultiLanguageContent,
  language: LanguageCode
): TranslatableFields => {
  return content[language];
};

// Helper to create database record from multi-language input
export const createMultiLanguageRecord = (input: MultiLanguageContent) => {
  return {
    titleUz: input.uz.title,
    titleRu: input.ru.title,
    titleEn: input.en.title,
    descriptionUz: input.uz.description,
    descriptionRu: input.ru.description,
    descriptionEn: input.en.description,
    materialsUz: input.uz.materials,
    materialsRu: input.ru.materials,
    materialsEn: input.en.materials,
    infrastructureNoteUz: input.uz.infrastructureNote,
    infrastructureNoteRu: input.ru.infrastructureNote,
    infrastructureNoteEn: input.en.infrastructureNote,
    investmentGrowthNoteUz: input.uz.investmentGrowthNote,
    investmentGrowthNoteRu: input.ru.investmentGrowthNote,
    investmentGrowthNoteEn: input.en.investmentGrowthNote,
  };
};

// Helper to format multi-language response
export const formatMultiLanguageResponse = (dbRecord: any): MultiLanguageContent => {
  return {
    uz: {
      title: dbRecord.titleUz,
      description: dbRecord.descriptionUz,
      materials: dbRecord.materialsUz,
      infrastructureNote: dbRecord.infrastructureNoteUz,
      investmentGrowthNote: dbRecord.investmentGrowthNoteUz,
    },
    ru: {
      title: dbRecord.titleRu,
      description: dbRecord.descriptionRu,
      materials: dbRecord.materialsRu,
      infrastructureNote: dbRecord.infrastructureNoteRu,
      investmentGrowthNote: dbRecord.investmentGrowthNoteRu,
    },
    en: {
      title: dbRecord.titleEn,
      description: dbRecord.descriptionEn,
      materials: dbRecord.materialsEn,
      infrastructureNote: dbRecord.infrastructureNoteEn,
      investmentGrowthNote: dbRecord.investmentGrowthNoteEn,
    },
  };
};

// Validate that all required languages are provided
export const validateMultiLanguageInput = (input: MultiLanguageContent): boolean => {
  const requiredLanguages: LanguageCode[] = ['uz', 'ru', 'en'];
  
  return requiredLanguages.every(lang => 
    input[lang] && 
    input[lang].title && 
    input[lang].title.trim().length > 0
  );
};