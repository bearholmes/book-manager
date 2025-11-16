import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';

export interface BookStatsByTopic {
  topic: string;
  count: number;
}

export interface BookStatsByPlace {
  purchase_place: string;
  count: number;
}

export interface BookStatsByYear {
  year: number;
  count: number;
}

/**
 * 도서 통계 조회 훅 - 주제별
 */
export function useBookStatsByTopic() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'topic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_stats_by_topic')
        .select('*')
        .order('count', { ascending: false });

      if (error) throw error;
      return (data || []) as BookStatsByTopic[];
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
      const { data, error } = await supabase
        .from('book_stats_by_place')
        .select('*')
        .order('count', { ascending: false });

      if (error) throw error;
      return (data || []) as BookStatsByPlace[];
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
      const { data, error } = await supabase
        .from('book_stats_by_year')
        .select('*')
        .order('year', { ascending: true });

      if (error) throw error;
      return (data || []) as BookStatsByYear[];
    },
  });
}

/**
 * 이미지가 없는 도서 개수 조회
 */
export function useImageNullCount() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'image-null'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .or('image_url.is.null,image_url.eq.');

      if (error) throw error;
      return count || 0;
    },
  });
}
