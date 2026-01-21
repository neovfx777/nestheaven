import { z } from 'zod';
import { ApartmentStatus } from '@prisma/client';

export const changeStatusSchema = z.object({
  status: z.nativeEnum(ApartmentStatus, {
    errorMap: () => ({ message: 'Status must be ACTIVE, HIDDEN, or SOLD' })
  }),
  reason: z.string().min(1, 'Reason is required').optional(),
  notes: z.string().optional(),
});

export const markAsSoldSchema = z.object({
  soldPrice: z.number().positive('Sold price must be positive').optional(),
  soldTo: z.string().min(1, 'Buyer name is required').optional(),
  soldNotes: z.string().optional(),
  soldAt: z.string().datetime().optional(), // ISO string
});

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type MarkAsSoldInput = z.infer<typeof markAsSoldSchema>;