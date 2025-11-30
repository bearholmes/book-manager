import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './constants';

/**
 * 도서 관련 모든 쿼리를 무효화
 * CRUD 작업 후 데이터 동기화를 위해 사용
 *
 * @param queryClient - TanStack Query의 QueryClient 인스턴스
 * @returns Promise<void[]> - 모든 invalidation이 완료될 때까지의 Promise
 *
 * @example
 * ```typescript
 * const { mutate } = useCreateBook();
 * mutate(bookData, {
 *   onSuccess: async () => {
 *     await invalidateBookQueries(queryClient);
 *     toast.success('도서가 추가되었습니다');
 *   }
 * });
 * ```
 */
export async function invalidateBookQueries(queryClient: QueryClient): Promise<void[]> {
  const keysToInvalidate = [
    QUERY_KEYS.BOOKS,
    QUERY_KEYS.BOOK_STATS,
    QUERY_KEYS.BOOK_TOPICS,
    QUERY_KEYS.BOOK_PLACES,
  ] as const;

  return Promise.all(
    keysToInvalidate.map((key) => queryClient.invalidateQueries({ queryKey: key as unknown as readonly string[] })),
  );
}

/**
 * 특정 도서만 무효화 (개별 조회 최적화)
 *
 * @param queryClient - QueryClient 인스턴스
 * @param bookId - 무효화할 도서 ID
 */
export function invalidateSingleBook(queryClient: QueryClient, bookId: string): void {
  queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.BOOKS, bookId] });
}

/**
 * 통계 쿼리만 무효화
 * 도서 데이터는 변경되지 않았지만 통계만 업데이트가 필요한 경우
 */
export function invalidateBookStats(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_STATS });
}
