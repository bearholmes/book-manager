import { z } from 'zod';
import { isCalendarDate } from '../../contracts/calendar-date';

const nullableText = z
  .string()
  .max(10000)
  .nullable()
  .optional()
  .transform((v) => v?.trim() || null);
const nullablePrice = z
  .number()
  .finite()
  .nonnegative()
  .nullable()
  .optional()
  .transform((v) => v ?? null);
const nullableDate = nullableText.refine(
  (value) => value === null || isCalendarDate(value),
  '날짜는 실제 존재하는 YYYY-MM-DD 형식으로 입력해주세요.',
);
export const storedBookSchema = z.object({
  id: z.string().min(1).max(200).optional(),
  book_name: z.string().trim().min(1, '도서명을 입력해주세요.').max(500),
  isbn13: nullableText,
  author: nullableText,
  publisher: nullableText,
  publication_date: nullableDate,
  condition: z
    .enum(['신품', '중고'])
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((v) => v || null),
  purchase_price: nullablePrice,
  currency: z.string().trim().min(1).max(10).default('KRW'),
  purchase_price_sec: nullablePrice,
  currency_sec: nullableText,
  purchase_date: nullableDate,
  purchase_place: nullableText,
  topic: nullableText,
  image_url: z
    .string()
    .url()
    .max(10000)
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((v) => v || null),
  duplicated: z.boolean().default(false),
  comment: nullableText,
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
});
