import type { BookFilters, BookSort } from '@contracts/book';
import type { BookPage } from '@contracts/desktop';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/features/books/api/query-keys';
import { desktop } from '@/shared/api/desktop';

export function useInfiniteBooks(
  options: { filters?: BookFilters; sort?: BookSort; pageSize?: number; enabled?: boolean } = {},
) {
  const {
    filters = {},
    sort = { field: 'created_at', order: 'desc' },
    pageSize = 60,
    enabled = true,
  } = options;
  return useInfiniteQuery<BookPage, Error>({
    queryKey: [...QUERY_KEYS.BOOKS, 'infinite', filters, sort, pageSize],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      desktop('list', { filters, sort, offset: Number(pageParam), limit: pageSize }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
  });
}
