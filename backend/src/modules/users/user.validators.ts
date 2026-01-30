import { z } from 'zod';

export const saveFavoriteSchema = z.object({
  apartmentId: z.string().cuid(),
});

export const saveSearchSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  filters: z.record(z.string(), z.any()).optional(),
});

export const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

export type SaveFavoriteInput = z.infer<typeof saveFavoriteSchema>;
export type SaveSearchInput = z.infer<typeof saveSearchSchema>;
export type UpdateSavedSearchInput = z.infer<typeof updateSavedSearchSchema>;