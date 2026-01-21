import { z } from 'zod';

export const complexCreateSchema = z.object({
  name: z.string().min(1, 'Complex name is required').max(200, 'Name too long'),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
});

export const complexUpdateSchema = complexCreateSchema.partial();

export const complexQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  withApartments: z.enum(['true', 'false']).default('false'),
  apartmentStatus: z.enum(['ACTIVE', 'HIDDEN', 'SOLD']).optional(),
});

export const otherApartmentsQuerySchema = z.object({
  excludeApartmentId: z.string().min(1, 'Apartment ID to exclude is required'),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  status: z.enum(['ACTIVE', 'SOLD']).default('ACTIVE'),
});

export type ComplexCreateInput = z.infer<typeof complexCreateSchema>;
export type ComplexUpdateInput = z.infer<typeof complexUpdateSchema>;
export type ComplexQueryInput = z.infer<typeof complexQuerySchema>;
export type OtherApartmentsQueryInput = z.infer<typeof otherApartmentsQuerySchema>;