import { z } from 'zod';
import { REASONING_EFFORTS } from '../../contracts/book-lookup';
import { isCalendarDate } from '../../contracts/calendar-date';

export const settingsSchema = z
  .object({
    executable: z
      .string()
      .trim()
      .min(1)
      .max(4096)
      .refine((v) => v.startsWith('/'), 'Codex 실행 파일의 절대 경로를 입력해주세요.'),
    model: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/, '올바른 모델 ID를 입력해주세요.'),
    reasoningEffort: z.enum(REASONING_EFFORTS),
  })
  .strict();
const nullableText = z.string().max(2000).nullable();
const url = z.string().max(4096);
export const resultSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            title: z.string().min(1).max(500),
            author: nullableText,
            publisher: nullableText,
            publicationDate: nullableText,
            reportedIsbn: nullableText,
            sources: z.array(z.object({ label: z.string().max(200), url })).max(5),
            covers: z.array(z.object({ imageUrl: url, sourcePageUrl: url })).max(3),
            notes: z.array(z.string().max(1000)).max(3),
          })
          .strict(),
      )
      .max(3),
  })
  .strict();
export function webUrl(value: string) {
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function parseResult(value: unknown) {
  const result = resultSchema.parse(value);
  for (const c of result.candidates) {
    if (c.publicationDate && !isCalendarDate(c.publicationDate)) {
      c.notes.push(`출간일 원문: ${c.publicationDate}`);
      c.publicationDate = null;
    }
    c.sources = c.sources.filter((s) => webUrl(s.url));
    c.covers = c.covers.filter((s) => webUrl(s.imageUrl) && webUrl(s.sourcePageUrl));
  }
  return result;
}
const text = { type: 'string' };
const nullable = { type: ['string', 'null'] };
const object = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
export const outputSchema = object({
  candidates: {
    type: 'array',
    items: object({
      title: text,
      author: nullable,
      publisher: nullable,
      publicationDate: nullable,
      reportedIsbn: nullable,
      sources: { type: 'array', items: object({ label: text, url: text }) },
      covers: { type: 'array', items: object({ imageUrl: text, sourcePageUrl: text }) },
      notes: { type: 'array', items: text },
    }),
  },
});
