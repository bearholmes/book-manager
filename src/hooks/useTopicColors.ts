import { useMemo } from 'react';
import { assignTopicColors } from '@/utils/colors';
import type { Book } from '@/types/book';

/**
 * 도서 목록에서 주제를 추출하고 색상을 할당하는 훅
 */
export function useTopicColors(books: Book[] | undefined) {
  return useMemo(() => {
    if (!books || books.length === 0) {
      return {};
    }

    const topics = [...new Set(books.map((book) => book.topic).filter(Boolean))].sort();

    return assignTopicColors(topics as string[]);
  }, [books]);
}
