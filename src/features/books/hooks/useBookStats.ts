import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * 주제별 도서 통계
 */
export interface BookStatsByTopic {
  topic: string;
  count: number;
}

/**
 * 구매처별 도서 통계
 */
export interface BookStatsByPlace {
  purchase_place: string;
  count: number;
}

/**
 * 연도별 도서 통계
 */
export interface BookStatsByYear {
  year: number;
  count: number;
}

interface TopicStatRow {
  topic: string | null;
  book_count: number | null;
}

interface PlaceStatRow {
  purchase_place: string | null;
  book_count: number | null;
}

interface YearStatRow {
  year: number | null;
  book_count: number | null;
}

/**
 * 주제별 도서 통계 조회 훅
 *
 * Database View(book_stats_by_topic)를 사용하여
 * 주제별 도서 개수를 집계합니다.
 *
 * @returns UseQueryResult - 주제별 통계 배열 (개수 내림차순)
 *
 * @example
 * ```typescript
 * const { data: topicStats } = useBookStatsByTopic();
 * // [{ topic: '프로그래밍', count: 45 }, { topic: '소설', count: 23 }, ...]
 * ```
 */
export function useBookStatsByTopic() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'topic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_stats_by_topic')
        .select('*')
        .order('book_count', { ascending: false });

      if (error) throw error;
      const rows = (data || []) as TopicStatRow[];
      return rows.map((row) => ({
        topic: row.topic || '미분류',
        count: Number(row.book_count || 0),
      }));
    },
  });
}

/**
 * 구매처별 도서 통계 조회 훅
 *
 * Database View(book_stats_by_place)를 사용하여
 * 구매처별 도서 개수를 집계합니다.
 *
 * @returns UseQueryResult - 구매처별 통계 배열 (개수 내림차순)
 *
 * @example
 * ```typescript
 * const { data: placeStats } = useBookStatsByPlace();
 * // [{ purchase_place: '교보문고', count: 67 }, ...]
 * ```
 */
export function useBookStatsByPlace() {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOK_STATS, 'place'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_stats_by_place')
        .select('*')
        .order('book_count', { ascending: false });

      if (error) throw error;
      const rows = (data || []) as PlaceStatRow[];
      return rows.map((row) => ({
        purchase_place: row.purchase_place || '미분류',
        count: Number(row.book_count || 0),
      }));
    },
  });
}

/**
 * 연도별 도서 통계 조회 훅
 *
 * Database View(book_stats_by_year)를 사용하여
 * 구매 연도별 도서 개수를 집계합니다.
 *
 * @returns UseQueryResult - 연도별 통계 배열 (연도 오름차순)
 *
 * @example
 * ```typescript
 * const { data: yearStats } = useBookStatsByYear();
 * // [{ year: 2020, count: 12 }, { year: 2021, count: 34 }, ...]
 * ```
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
      const rows = (data || []) as YearStatRow[];
      return rows.map((row) => ({
        year: Number(row.year || 0),
        count: Number(row.book_count || 0),
      }));
    },
  });
}

/**
 * 이미지가 없는 도서 개수 조회 훅
 *
 * 표지 이미지(image_url)가 null이거나 빈 문자열인
 * 도서의 개수를 조회합니다.
 *
 * @returns UseQueryResult - 이미지 없는 도서 개수
 *
 * @example
 * ```typescript
 * const { data: imageNullCount } = useImageNullCount();
 * // 5 (이미지 없는 도서가 5권)
 * ```
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
