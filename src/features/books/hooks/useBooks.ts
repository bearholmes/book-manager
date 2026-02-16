import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import type { Book, BookFilters, BookSort } from '@/types/book';

/**
 * 도서 목록 조회 옵션
 */
interface UseBooksOptions {
  /** 필터 조건 (주제, 구매처, 상태, 검색어) */
  filters?: BookFilters;
  /** 정렬 조건 (기본: 최신순) */
  sort?: BookSort;
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

/**
 * 도서 목록 조회 훅
 *
 * 필터와 정렬 조건에 따라 도서 목록을 조회합니다.
 * 검색, 주제별/구매처별 필터링, 다양한 정렬 옵션을 지원합니다.
 *
 * @param options - 필터 및 정렬 옵션
 * @returns UseQueryResult - TanStack Query 쿼리 객체
 *
 * @example
 * ```typescript
 * // 기본 사용 (전체 도서, 최신순)
 * const { data: books, isLoading } = useBooks();
 *
 * // 검색어로 필터링
 * const { data: searchResults } = useBooks({
 *   filters: { search: 'React' }
 * });
 *
 * // 주제별 필터링 + 이름순 정렬
 * const { data: filteredBooks } = useBooks({
 *   filters: { topic: '프로그래밍' },
 *   sort: { field: 'book_name', order: 'asc' }
 * });
 * ```
 */
export function useBooks(options: UseBooksOptions = {}) {
  const { filters = {}, sort = { field: 'created_at', order: 'desc' } } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKS, filters, sort],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      let query = supabase.from('books').select('*');

      // 필터 적용
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

      // 정렬 적용
      query = query.order(sort.field, { ascending: sort.order === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      return (data as Book[]) || [];
    },
  });
}
