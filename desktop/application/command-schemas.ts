import { z } from 'zod';

export const objectSchema = z.object({});
export const idSchema = z.object({ id: z.string().min(1).max(200) });
export const listSchema = z.object({
  filters: z
    .object({
      topic: z.string().optional(),
      purchase_place: z.string().optional(),
      condition: z.enum(['신품', '중고']).optional(),
      search: z.string().max(500).optional(),
    })
    .optional(),
  sort: z
    .object({
      field: z.enum(['created_at', 'book_name', 'purchase_date']),
      order: z.enum(['asc', 'desc']),
    })
    .optional(),
  offset: z.number().int().nonnegative().optional(),
  limit: z.number().int().min(1).max(5000).optional(),
});
