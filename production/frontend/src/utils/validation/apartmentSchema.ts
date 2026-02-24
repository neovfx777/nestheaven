import { z } from 'zod';

// Apartment validation schema
export const apartmentSchema = z.object({
  title: z.object({
    uz: z.string().min(1, 'Uzbek title is required'),
    ru: z.string().min(1, 'Russian title is required'),
    en: z.string().min(1, 'English title is required'),
  }),
  description: z
    .object({
      uz: z.string().min(1, 'Uzbek description is required'),
      ru: z.string().min(1, 'Russian description is required'),
      en: z.string().min(1, 'English description is required'),
    })
    .optional(),
  price: z.number().positive('Price must be positive'),
  rooms: z.number().int().positive('Rooms must be a positive integer'),
  area: z.number().positive('Area must be positive'),
  floor: z.number().int().min(0, 'Floor must be 0 or greater'),
  totalFloors: z.number().int().positive('Total floors must be positive').optional(),
  complexId: z.string().min(1, 'Complex is required'),
  paymentOptions: z
    .object({
      installments: z
        .object({
          available: z.boolean(),
          months: z.array(z.number()),
          downPayment: z.number().min(0).max(100),
        })
        .optional(),
      mortgage: z
        .object({
          available: z.boolean(),
          banks: z.array(z.string()),
          maxTerm: z.number(),
        })
        .optional(),
    })
    .optional(),
  features: z.array(z.string()).optional(),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;
