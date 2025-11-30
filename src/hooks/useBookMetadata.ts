import { useMemo } from 'react';
import type { Book } from '@/types/book';

/**
 * 도서 메타데이터 추출 훅
 *
 * 도서 목록에서 주제와 구매처 목록을 추출합니다.
 * 중복을 제거하고 정렬된 배열을 반환합니다.
 *
 * @param books - 도서 목록
 * @returns 주제 및 구매처 목록
 *
 * @example
 * ```typescript
 * const { data: books } = useBooks();
 * const { topics, purchasePlaces } = useBookMetadata(books);
 *
 * // topics: ['과학', '소설', '프로그래밍']
 * // purchasePlaces: ['교보문고', '알라딘', '예스24']
 * ```
 */
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
