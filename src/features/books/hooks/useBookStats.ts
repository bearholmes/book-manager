import { QUERY_KEYS } from '@/features/books/api/query-keys';
import { desktop } from '@/shared/api/desktop';
import type { LibraryStats } from '@contracts/desktop';
import { useQuery } from '@tanstack/react-query';

export type BookStatsByTopic = LibraryStats['topics'][number];
export type BookStatsByPlace = LibraryStats['places'][number];
export type BookStatsByYear = LibraryStats['years'][number];

function useStats<T>(select: (stats: LibraryStats) => T) {
  return useQuery({ queryKey: QUERY_KEYS.BOOK_STATS, queryFn: () => desktop('stats', {}), select });
}
export const useBookStats = () => useStats((stats) => stats);
export const useBookStatsByTopic = () => useStats((stats) => stats.topics);
export const useBookStatsByPlace = () => useStats((stats) => stats.places);
export const useImageNullCount = () => useStats((stats) => stats.missingImages);
export const useBookTotalCount = () => useStats((stats) => stats.total);
