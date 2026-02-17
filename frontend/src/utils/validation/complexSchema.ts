import { z } from 'zod';

// Complex validation schema
export const complexSchema = z.object({
  title: z.object({
    uz: z.string().min(1, 'Uzbek title is required'),
    ru: z.string().min(1, 'Russian title is required'),
    en: z.string().min(1, 'English title is required'),
  }),
  description: z.object({
    uz: z.string().min(1, 'Uzbek description is required'),
    ru: z.string().min(1, 'Russian description is required'),
    en: z.string().min(1, 'English description is required'),
  }),
  developer: z.string().min(1, 'Developer name is required'),
  city: z.string().min(1, 'City is required'),
  blockCount: z.number().int().min(1, 'Block count must be at least 1'),
  amenities: z.array(z.string()).optional(),
  nearby: z
    .array(
      z.object({
        type: z.string().min(1),
        name: z.string().min(1),
        distanceMeters: z.number().positive(),
        note: z.string().optional(),
      })
    )
    .optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.object({
      uz: z.string().min(1, 'Uzbek address is required'),
      ru: z.string().min(1, 'Russian address is required'),
      en: z.string().min(1, 'English address is required'),
    }),
  }),
  walkability: z.number().min(0).max(10).optional(),
  airQuality: z.number().min(0).max(10).optional(),
  allowedSellers: z.array(z.string()).optional(),
});

export type ComplexFormData = z.infer<typeof complexSchema>;
