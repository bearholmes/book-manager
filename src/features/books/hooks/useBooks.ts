import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import type { Book, BookFilters, BookSort } from '@/types/book';

interface UseBooksOptions {
  filters?: BookFilters;
  sort?: BookSort;
}

/**
 * 도서 목록 조회 훅
 */
export function useBooks(options: UseBooksOptions = {}) {
  const { filters = {}, sort = { field: 'created_at', order: 'desc' } } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKS, filters, sort],
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
        query = query.or(
          `book_name.ilike.%${filters.search}%,author.ilike.%${filters.search}%,publisher.ilike.%${filters.search}%`,
        );
      }

      // 정렬 적용
      query = query.order(sort.field, { ascending: sort.order === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      return (data as Book[]) || [];
    },
  });
}
