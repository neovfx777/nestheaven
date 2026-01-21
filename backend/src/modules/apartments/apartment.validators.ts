import { z } from 'zod';
import { ApartmentStatus } from '@prisma/client';

// Infrastructure schema (structured booleans/distances)
export const infrastructureSchema = z.object({
  parking: z.boolean().optional(),
  security: z.boolean().optional(),
  elevator: z.boolean().optional(),
  schoolDistance: z.number().min(0).optional(), // in meters
  metroDistance: z.number().min(0).optional(), // in meters
  marketDistance: z.number().min(0).optional(), // in meters
  playground: z.boolean().optional(),
  gym: z.boolean().optional(),
  pool: z.boolean().optional(),
}).optional();

// Installment option schema
export const installmentOptionSchema = z.object({
  bankName: z.string().min(1),
  years: z.number().min(1).max(30),
  interestRate: z.number().min(0),
  downPayment: z.number().min(0),
  monthlyPayment: z.number().min(0),
  totalAmount: z.number().min(0),
}).optional();

// Multi-language field schema
export const multiLanguageFieldSchema = z.object({
  uz: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
});

// Main apartment creation/update schema
export const apartmentCreateSchema = z.object({
  // Multi-language content
  title: z.object({
    uz: z.string().min(1, 'Title in Uzbek is required'),
    ru: z.string().min(1, 'Title in Russian is required'),
    en: z.string().min(1, 'Title in English is required'),
  }),
  description: z.object({
    uz: z.string().optional(),
    ru: z.string().optional(),
    en: z.string().optional(),
  }).optional(),
  materials: multiLanguageFieldSchema.optional(),
  infrastructureNote: multiLanguageFieldSchema.optional(),
  investmentGrowthNote: multiLanguageFieldSchema.optional(),

  // Basic info
  price: z.number().positive('Price must be positive'),
  rooms: z.number().int().min(1, 'At least 1 room required'),
  area: z.number().positive('Area must be positive'),
  floor: z.number().int().min(0, 'Floor cannot be negative'),

  // Location
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Developer
  developerName: z.string().min(1, 'Developer name is required'),
  developerId: z.string().optional(),

  // Complex relation
  complexId: z.string().optional(),

  // Quality & environment
  airQualityIndex: z.number().min(1).max(100).optional(),
  airQualitySource: z.string().optional(),

  // Infrastructure
  infrastructure: infrastructureSchema,

  // Investment info
  investmentGrowthPercent: z.number().min(0).max(100).optional(),

  // Contact info
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactTelegram: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactEmail: z.string().email().optional(),

  // Installment options
  installmentOptions: z.array(installmentOptionSchema).optional(),

  // Images (handled separately in upload middleware)
});

export const apartmentUpdateSchema = apartmentCreateSchema.partial();

export const apartmentQuerySchema = z.object({
  status: z.nativeEnum(ApartmentStatus).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRooms: z.coerce.number().int().min(1).optional(),
  maxRooms: z.coerce.number().int().min(1).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  complexId: z.string().optional(),
  developerName: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['price', 'area', 'rooms', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ApartmentCreateInput = z.infer<typeof apartmentCreateSchema>;
export type ApartmentUpdateInput = z.infer<typeof apartmentUpdateSchema>;
export type ApartmentQueryInput = z.infer<typeof apartmentQuerySchema>;