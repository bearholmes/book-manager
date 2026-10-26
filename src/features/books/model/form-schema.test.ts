import { describe, expect, it } from 'vitest';
import { bookSchema } from './form-schema';

describe('calendar dates', () => {
  it.each(['2024-02-29', '2000-02-29', '2026-10-26', '0001-01-01', '9999-12-31', ''])(
    'accepts %s',
    (date) => {
      expect(
        bookSchema.safeParse({
          book_name: '가상 도서',
          purchase_date: date,
          publication_date: date,
        }).success,
      ).toBe(true);
    },
  );
  it.each([
    '2026-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-13-01',
    '0000-01-01',
    '2026-01',
    '2026-01-01T12:00:00Z',
    'not-a-date',
  ])('rejects %s', (date) => {
    expect(bookSchema.safeParse({ book_name: '가상 도서', purchase_date: date }).success).toBe(
      false,
    );
    expect(bookSchema.safeParse({ book_name: '가상 도서', publication_date: date }).success).toBe(
      false,
    );
  });
});
