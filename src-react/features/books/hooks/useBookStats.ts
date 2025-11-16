import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * 도서 통계 조회 훅 - 주제별
 */
export function useBookStatsByTopic() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'topic'],
    queryFn: async () => {
      const { data, error } = await supabase.from('book_stats_by_topic').select('*');

      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * 도서 통계 조회 훅 - 구매처별
 */
export function useBookStatsByPlace() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'place'],
    queryFn: async () => {
      const { data, error } = await supabase.from('book_stats_by_place').select('*');

      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * 도서 통계 조회 훅 - 연도별
 */
export function useBookStatsByYear() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'year'],
    queryFn: async () => {
      const { data, error } = await supabase.from('book_stats_by_year').select('*');

      if (error) throw error;
      return data || [];
    },
  });
}
