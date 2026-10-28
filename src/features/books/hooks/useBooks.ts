import type { BookFilters, BookSort } from '@contracts/book';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/features/books/api/query-keys';
import { desktop } from '@/shared/api/desktop';

export function useBooks(options: { filters?: BookFilters; sort?: BookSort } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKS, options],
    queryFn: async () => (await desktop('list', { ...options, limit: 5000 })).books,
  });
}
