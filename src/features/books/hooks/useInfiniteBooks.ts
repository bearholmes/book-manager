import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import type { Book, BookFilters, BookSort } from '@/types/book';

const DEFAULT_PAGE_SIZE = 60;

interface UseInfiniteBooksOptions {
  filters?: BookFilters;
  sort?: BookSort;
  pageSize?: number;
  enabled?: boolean;
}

interface InfiniteBooksPage {
  books: Book[];
  nextOffset: number;
  totalCount: number;
  hasMore: boolean;
}

/**
 * PostgREST 필터 문자열을 깨뜨릴 수 있는 특수문자를 제거/정규화합니다.
 * 검색 정확도보다 쿼리 안정성과 안전성을 우선합니다.
 */
function sanitizeSearchTerm(rawSearch: string): string {
  return rawSearch
    .trim()
    .replace(/[,%()"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

/** 필터/정렬 기준으로 도서 목록을 페이지 단위로 조회합니다. */
export function useInfiniteBooks(options: UseInfiniteBooksOptions = {}) {
  const {
    filters = {},
    sort = { field: 'created_at', order: 'desc' },
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
  } = options;

  return useInfiniteQuery<InfiniteBooksPage, Error>({
    queryKey: [...QUERY_KEYS.BOOKS, 'infinite', filters, sort, pageSize],
    enabled,
    initialPageParam: 0,
    placeholderData: (previousData) => previousData,
    queryFn: async ({ pageParam }): Promise<InfiniteBooksPage> => {
      const offset = Number(pageParam);
      const from = offset;
      const to = offset + pageSize - 1;

      let query = supabase.from('books').select('*', { count: 'exact' });

      if (filters.topic) {
        query = query.eq('topic', filters.topic);
      }
      if (filters.purchase_place) {
        query = query.eq('purchase_place', filters.purchase_place);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.search) {
        const safeSearch = sanitizeSearchTerm(filters.search);
        if (safeSearch) {
          query = query.or(
            `book_name.ilike.%${safeSearch}%,author.ilike.%${safeSearch}%,publisher.ilike.%${safeSearch}%`,
          );
        }
      }

      const { data, error, count } = await query
        .order(sort.field, { ascending: sort.order === 'asc' })
        .range(from, to);

      if (error) throw error;

      const books = (data as Book[]) || [];
      const totalCount = Number(count ?? 0);
      const nextOffset = offset + books.length;
      const hasMore = totalCount > 0 ? nextOffset < totalCount : books.length === pageSize;

      return {
        books,
        nextOffset,
        totalCount,
        hasMore,
      } as InfiniteBooksPage;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
  });
}
