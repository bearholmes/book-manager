import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './constants';

/** 도서 관련 캐시를 한 번에 무효화합니다. */
export async function invalidateBookQueries(queryClient: QueryClient) {
  const keysToInvalidate = [
    QUERY_KEYS.BOOKS,
    QUERY_KEYS.BOOK_STATS,
    QUERY_KEYS.BOOK_TOPICS,
    QUERY_KEYS.BOOK_PLACES,
  ] as const;

  // CRUD 이후 목록/통계/필터 소스가 모두 최신화되도록 관련 키를 함께 무효화합니다.
  return Promise.all(
    keysToInvalidate.map((key) => queryClient.invalidateQueries({ queryKey: key as unknown as readonly string[] })),
  );
}
