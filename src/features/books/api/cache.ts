import { QUERY_KEYS } from '@/features/books/api/query-keys';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

/** 도서 관련 캐시를 한 번에 무효화합니다. */
export async function invalidateBookQueries(queryClient: QueryClient) {
  const keysToInvalidate: readonly QueryKey[] = [QUERY_KEYS.BOOKS, QUERY_KEYS.BOOK_STATS];

  // CRUD 이후 목록/통계/필터 소스가 모두 최신화되도록 관련 키를 함께 무효화합니다.
  return Promise.all(
    keysToInvalidate.map((key) => queryClient.invalidateQueries({ queryKey: key })),
  );
}

export function clearBookQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: QUERY_KEYS.BOOKS });
  queryClient.removeQueries({ queryKey: QUERY_KEYS.BOOK_STATS });
}
