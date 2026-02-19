import { z } from 'zod';

// Multi-language schema
const multiLanguageSchema = z.object({
  uz: z.string().min(1, 'Uzbek text is required'),
  ru: z.string().min(1, 'Russian text is required'),
  en: z.string().min(1, 'English text is required'),
});

// Nearby place schema
const nearbyPlaceSchema = z.object({
  type: z.string().min(1).optional().default('other'),
  name: z.string().min(1, 'Place name is required'),
  distanceMeters: z.number().positive('Distance must be positive'),
  note: z.string().optional(),
});

// Location schema
const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: multiLanguageSchema,
});

// Complex validation schema
export const complexSchema = z.object({
  title: multiLanguageSchema,
  description: multiLanguageSchema.optional(),
  developer: z.string().min(1, 'Developer name is required'),
  city: z.string().min(1, 'City is required'),
  blockCount: z.number().int().min(1, 'Block count must be at least 1'),
  amenities: z.array(z.string()).optional(),
  nearby: z.array(nearbyPlaceSchema).optional(),
  location: locationSchema,
  walkability: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().min(0).max(10).optional()
  ),
  airQuality: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().min(0).max(10).optional()
  ),
  allowedSellers: z.array(z.string()).optional(),
});

export type ComplexFormData = z.infer<typeof complexSchema>;