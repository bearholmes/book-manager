import { isCalendarDate } from '@contracts/calendar-date';
import { z } from 'zod';

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => !value || isCalendarDate(value),
    '날짜는 실제 존재하는 YYYY-MM-DD 형식으로 입력해주세요.',
  )
  .optional();

/**
 * 도서 등록/수정 폼 스키마
 */
export const bookSchema = z.object({
  book_name: z
    .string()
    .trim()
    .min(1, '도서명을 입력해주세요')
    .max(500, '도서명은 500자 이내로 입력해주세요'),
  isbn13: z.string().optional().or(z.literal('')),
  author: z.string().optional().or(z.literal('')),
  publisher: z.string().optional().or(z.literal('')),
  publication_date: optionalDate,
  condition: z.enum(['신품', '중고']).optional().or(z.literal('')),
  purchase_price: z
    .number()
    .min(0, '가격은 0 이상이어야 합니다')
    .optional()
    .or(z.nan())
    .transform((val) => (Number.isNaN(val) ? null : val)),
  currency: z.string().default('KRW'),
  purchase_price_sec: z
    .number()
    .min(0, '가격은 0 이상이어야 합니다')
    .optional()
    .or(z.nan())
    .transform((val) => (Number.isNaN(val) ? null : val)),
  currency_sec: z.string().optional().or(z.literal('')),
  purchase_date: optionalDate,
  purchase_place: z.string().optional().or(z.literal('')),
  topic: z.string().optional().or(z.literal('')),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  duplicated: z.boolean().default(false),
  comment: z.string().optional().or(z.literal('')),
});

export type BookFormData = z.infer<typeof bookSchema>;
