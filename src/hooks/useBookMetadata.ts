import { useMemo } from 'react';
import type { Book } from '@/types/book';

/** 도서 목록에서 주제/구매처 메타데이터를 추출합니다. */
export function useBookMetadata(books: Book[] | undefined) {
  const topics = useMemo(() => {
    if (!books) return [];
    return [...new Set(books.map((book) => book.topic).filter(Boolean))].sort() as string[];
  }, [books]);

  const purchasePlaces = useMemo(() => {
    if (!books) return [];
    return [...new Set(books.map((book) => book.purchase_place).filter(Boolean))].sort() as string[];
  }, [books]);

  return { topics, purchasePlaces };
}
